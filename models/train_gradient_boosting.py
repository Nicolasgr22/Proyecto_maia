import pandas as pd
import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score

# 1. Crear carpeta 'models/saved' si no existe
os.makedirs("models/saved", exist_ok=True)

# 2. Cargar datos
df = pd.read_csv("Data/Data_Seattle.csv")

# 3. Procesar columna 'date'
df["date"] = pd.to_datetime(df["date"], format="%Y%m%dT%H%M%S", errors="coerce")
df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month
df["day"] = df["date"].dt.day
df = df.drop("date", axis=1)

# 4. Separar variables (X) y target (y)
X = df.drop("price", axis=1)
y = df["price"]

# 5. Dividir en train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 6. Entrenar Gradient Boosting
gb = GradientBoostingRegressor(
    n_estimators=200,   # número de árboles
    learning_rate=0.1,  # tasa de aprendizaje
    max_depth=3,        # profundidad de cada árbol
    random_state=42
)
gb.fit(X_train, y_train)

# 7. Predicciones
y_pred = gb.predict(X_test)

# 8. Métricas
rmse = mean_squared_error(y_test, y_pred, squared=False)
r2 = r2_score(y_test, y_pred)

print("Gradient Boosting -> RMSE:", rmse, "R²:", r2)

# 9. Guardar modelo
joblib.dump(gb, "models/saved/gradient_boosting.pkl")

# 10. Guardar parámetros y métricas en JSON
results = {
    "model": "GradientBoosting",
    "params": {
        "n_estimators": 200,
        "learning_rate": 0.1,
        "max_depth": 3
    },
    "metrics": {
        "RMSE": rmse,
        "R²": r2
    }
}

with open("models/saved/gradient_boosting_results.json", "w") as f:
    json.dump(results, f, indent=4)
