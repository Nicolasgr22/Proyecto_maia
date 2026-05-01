import pandas as pd
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor
import joblib
import json
# import mlflow
# import mlflow.sklearn
import numpy as np
from sklearn.preprocessing import FunctionTransformer
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator, TransformerMixin

# Cargar datos
X = pd.read_csv("../package-src/model/datasets/data_seattle.csv")
# X_test = pd.read_csv("../package-src/model/datasets/data_seattle_test.csv")

# Definir columnas relevantes (excluyendo id, date, price)
features1 = [
    "bedrooms","bathrooms","sqft_living","sqft_lot","floors",
    "waterfront","view","condition","grade","sqft_above"
]

features2 = [
    "bedrooms","bathrooms","sqft_living","sqft_lot","floors",
    "waterfront","view","condition","grade","sqft_above",
    "yr_built"
]

features3 = [
    "bedrooms","bathrooms","sqft_living","sqft_lot","floors",
    "waterfront","view","condition","grade","sqft_above","sqft_basement",
    "yr_built","lat","long"
]

features4 = [
    "bedrooms","bathrooms","sqft_living","sqft_lot","floors",
    "waterfront","view","condition","grade","sqft_above","sqft_basement",
    "yr_built","yr_renovated","zipcode","lat","long"
]

y = X["price"]
# y_test = X_test["price"]
# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# def preprocess(features, X):
#     return X[features]


class Preprocessing(BaseEstimator, TransformerMixin):
    def __init__(self, features): # All parameters must have default values
        self.features = features

    def fit(self, X, y=None):
        # Fit logic here (e.g., calculate mean/std of X if not using simple scale_factor)
        # For this simple example, fit does nothing
        return self

    def transform(self, X):
        # Transformation logic
        return X[self.features]

# Definir modelo y parámetros para GridSearch
xgb = XGBRegressor(objective="reg:squarederror", random_state=42)
param_grid = {
    "preprocess__features": [features1, features2, features3, features4],
    "xgb__n_estimators": [100, 200],
    "xgb__max_depth": [3, 5],
    "xgb__learning_rate": [0.05, 0.1]
}

pipeline = Pipeline(steps=[('preprocess', Preprocessing(features1)),('xgb', xgb)])

grid = GridSearchCV(pipeline, param_grid, cv=3, scoring="neg_mean_squared_error", verbose=1)

grid.fit(X_train, y_train)

# 9. Mejor modelo
best_model = grid.best_estimator_
y_pred_best = best_model.predict(X_test)

rmse_best = mean_squared_error(y_test, y_pred_best)
r2_best = r2_score(y_test, y_pred_best)

print("Mejores parámetros:", grid.best_params_)
print("XGBoost optimizado -> RMSE:", rmse_best, "R²:", r2_best)

# 10. Guardar modelo
joblib.dump(best_model, "models_test/saved/xgboost_features_gridsearch_results.pkl")

# 11. Guardar parámetros y métricas
results = {
    "model": "XGBoost_wFeatures_GridSearch",
    "params": grid.best_params_,
    "metrics": {
        "RMSE": rmse_best,
        "R²": r2_best
    }
}

with open("models_test/saved/xgboost_features_gridsearch_results.json", "w") as f:
    json.dump(results, f, indent=4)
