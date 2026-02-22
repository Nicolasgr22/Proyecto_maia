import mlflow
import mlflow.sklearn
import joblib
import json

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error

def log_model(model, data, experiment):
    # Log GB Gridsearch
    with mlflow.start_run(run_name=data["model"], experiment_id=experiment.experiment_id):

        for param, value in data['params'].items():
            # Registre los parámetros
            mlflow.log_param(param, value)

        # Registre el modelo
        mlflow.sklearn.log_model(model, name=data["model"])

        # Cree y registre la métrica de interés
        mlflow.log_metric("mse", data["metrics"]["RMSE"])
        mlflow.log_metric("r2_score", data["metrics"]["R²"])

def main():

    models = ('models_test/saved/xgboost_gridsearch.pkl', "models_test/saved/gradient_boosting_gridsearch.pkl", "models_test/saved/random_forest_gridsearch.pkl","models_test/saved/svm_gridsearch.pkl","models_test/saved/svm_gridsearch_date.pkl")
    configs = ("models_test/saved/xgboost_gridsearch_results.json", "models_test/saved/gradient_boosting_gridsearch_results.json", "models_test/saved/random_forest_gridsearch_results.json", "models_test/saved/svm_gridsearch_results.json", "models_test/saved/svm_gridsearch_results_date.json")
    experiment = mlflow.set_experiment("housing_price")

    for model_path, config_path in zip(models, configs):

        with open(config_path) as json_file:
            data = json.load(json_file)  # Error: No JSON object could be decoded

        model = joblib.load(model_path)

        log_model(model, data, experiment)

    # Modelo seleccionado

    model_path = "../Model/xgb_model.pkl"
    config_path = "../Model/config.json"

    model = joblib.load(model_path)

    with open(config_path) as json_file:
        data = json.load(json_file)

    with mlflow.start_run(run_name=data["model"], experiment_id=experiment.experiment_id):

        for param, value in data['best_params'].items():
            # Registre los parámetros
            mlflow.log_param(param, value)

        # Registre el modelo
        mlflow.sklearn.log_model(model, name="Modelo Seleccionado XGBoost")

        # Cree y registre la métrica de interés
        mlflow.log_metric("mse", (data["rmse"])**2)
        mlflow.log_metric("r2_score", data["r2"])

if __name__ == "__main__":
    main()