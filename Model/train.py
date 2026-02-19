import pandas as pd
from sklearn.model_selection import GridSearchCV, train_test_split
from xgboost import XGBRegressor
import joblib
import json
import mlflow
import mlflow.sklearn

# Cargar datos
data = pd.read_csv("../Data/Data_Seattle.csv")

# Definir columnas relevantes (excluyendo id, date, price)
features = [
    "bedrooms","bathrooms","sqft_living","sqft_lot","floors",
    "waterfront","view","condition","grade","sqft_above","sqft_basement",
    "yr_built","yr_renovated","zipcode","lat","long","sqft_living15","sqft_lot15"
]

X = data[features]
y = data["price"]

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Definir modelo y parámetros para GridSearch
xgb = XGBRegressor(objective="reg:squarederror", random_state=42)
param_grid = {
    "n_estimators": [100, 200],
    "max_depth": [3, 5],
    "learning_rate": [0.05, 0.1]
}

grid = GridSearchCV(xgb, param_grid, cv=3, scoring="neg_mean_squared_error", verbose=1)

# Iniciar experimento en MLflow
mlflow.set_experiment("housing_price_xgb")

with mlflow.start_run():
    grid.fit(X_train, y_train)

    # Guardar mejor modelo
    best_model = grid.best_estimator_
    joblib.dump(best_model, "xgb_model.pkl")

    # Guardar parámetros y métricas en config.json
    config = {
        "features": features,  
        "best_params": grid.best_params_,
        "best_score": grid.best_score_
    }
    with open("config.json", "w") as f:
        json.dump(config, f, indent=4)

    # Log en MLflow
    mlflow.log_params(grid.best_params_)
    mlflow.log_metric("best_score", grid.best_score_)
    mlflow.sklearn.log_model(best_model, "model")

print("Modelo entrenado, guardado en model/xgb_model.pkl y registrado en MLflow")

