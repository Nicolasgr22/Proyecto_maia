import pandas as pd
import joblib
import json
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import os

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
rf = RandomForestRegressor(random_state=42, n_jobs=-1)

# 7. Definir hiperparámetros 
param_grid = {
    "n_estimators": [100, 200],
    "max_depth": [None, 10, 20],
    "min_samples_split": [2, 5],
    "min_samples_leaf": [1, 2]
}

# 8. GridSearchCV
grid_search = GridSearchCV(
    estimator=rf,
    param_grid=param_grid,
    cv=3,
    scoring="neg_root_mean_squared_error",
    n_jobs=-1,
    verbose=2
)

grid_search.fit(X_train, y_train)

# 9. Mejor modelo
best_rf = grid_search.best_estimator_
y_pred_best = best_rf.predict(X_test)

rmse_best = mean_squared_error(y_test, y_pred_best)
r2_best = r2_score(y_test, y_pred_best)

print("Mejores parámetros:", grid_search.best_params_)
print("Random Forest optimizado -> RMSE:", rmse_best, "R²:", r2_best)

# 10. Guardar modelo 
joblib.dump(best_rf, "models_test/saved/random_forest_gridsearch.pkl")

# 11. Guardar parámetros y métricas 
results = {
    "model": "RandomForest_GridSearch",
    "params": grid_search.best_params_,
    "metrics": {
        "RMSE": rmse_best,
        "R²": r2_best
    }
}

with open("models_test/saved/random_forest_gridsearch_results.json", "w") as f:
    json.dump(results, f, indent=4)
