import pandas as pd
import joblib
import json
import os
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score

# 1. Crear carpeta de resultados si no existe
os.makedirs("models_test/saved", exist_ok=True)

# 2. Cargar datos
df = pd.read_csv("../Data/Data_Seattle.csv")

# 3. Procesar columna 'date'
df["date"] = pd.to_datetime(df["date"], format="%Y%m%dT%H%M%S", errors="coerce")
df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month
df["day"] = df["date"].dt.day
df = df.drop("date", axis=1)

# 4. Separar variables 
X = df.drop("price", axis=1)
y = df["price"]

# 5. Dividir en train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 6. Definir modelo base
gb = GradientBoostingRegressor(random_state=42)

# 7. Definir hiperparámetros 
param_grid = {
    "n_estimators": [100, 200, 300],
    "learning_rate": [0.05, 0.1, 0.2],
    "max_depth": [3, 5],
    "min_samples_split": [2, 5],
    "min_samples_leaf": [1, 2]
}

# 8. GridSearchCV
grid_search = GridSearchCV(
    estimator=gb,
    param_grid=param_grid,
    cv=3,
    scoring="neg_root_mean_squared_error",
    n_jobs=-1,
    verbose=2
)

grid_search.fit(X_train, y_train)

# 9. Mejor modelo
best_gb = grid_search.best_estimator_
y_pred_best = best_gb.predict(X_test)

rmse_best = mean_squared_error(y_test, y_pred_best)
r2_best = r2_score(y_test, y_pred_best)

print("Mejores parámetros:", grid_search.best_params_)
print("Gradient Boosting optimizado -> RMSE:", rmse_best, "R²:", r2_best)

# 10. Guardar modelo
joblib.dump(best_gb, "models_test/saved/gradient_boosting_gridsearch.pkl")

# 11. Guardar parámetros y métricas 
results = {
    "model": "GradientBoosting_GridSearch",
    "params": grid_search.best_params_,
    "metrics": {
        "RMSE": rmse_best,
        "R²": r2_best
    }
}

with open("models_test/saved/gradient_boosting_gridsearch_results.json", "w") as f:
    json.dump(results, f, indent=4)
