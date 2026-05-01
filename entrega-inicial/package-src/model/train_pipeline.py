import numpy as np
from model.config.core import config
from pipeline import avaluo_pipe
from processing.data_manager import load_dataset, save_pipeline
from sklearn.model_selection import train_test_split,GridSearchCV
import mlflow
import mlflow.sklearn
import joblib
import json
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

def run_training() -> None:
    """Train the model."""

    # read training data
    data = load_dataset(file_name=config.app_config.data_file)

    # divide train and test
    X_train, X_test, y_train, y_test = train_test_split(
        data[config.model_configuration.features],  # predictors
        data[config.model_configuration.target],
        test_size=config.model_configuration.test_size,
        # we are setting the random seed here
        # for reproducibility
        random_state=config.model_configuration.random_state,
    )

    
    param_grid = {
        "xgb__n_estimators": config.model_configuration.n_estimators,
        "xgb__max_depth": config.model_configuration.max_depth,
        "xgb__learning_rate": config.model_configuration.learning_rate
    }
    grid = GridSearchCV(avaluo_pipe, param_grid, cv=3, scoring="neg_mean_squared_error", verbose=1)
    # fit model
    grid.fit(X_train, y_train)

    # Iniciar experimento en MLflow
    mlflow.set_experiment("housing_price_xgb")

    with mlflow.start_run():
        grid.fit(X_train, y_train)

        # Guardar mejor modelo
        best_model = grid.best_estimator_
        
        # Evaluar en conjunto de prueba
        y_pred = best_model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        print("RMSE:", rmse)
        print("MAE:", mae)
        print("R²:", r2)

        # Guardar parámetros y métricas en config.json
        config_dict = {
            "features": config.model_configuration.features,
            "best_params": grid.best_params_,
            "best_score": grid.best_score_,  # sigue siendo neg MSE de cross-validation
            "rmse": rmse,
            "mae": mae,
            "r2": r2
        }
        with open("config.json", "w") as f:
            json.dump(config_dict, f, indent=4)

        # Log en MLflow
        mlflow.log_params(grid.best_params_)
        mlflow.log_metric("best_score", grid.best_score_)
        mlflow.log_metric("rmse", rmse)
        mlflow.log_metric("mae", mae)
        mlflow.log_metric("r2", r2)
        mlflow.sklearn.log_model(best_model, "model")

        # persist trained model
        save_pipeline(pipeline_to_persist=best_model)

if __name__ == "__main__":
    run_training()
