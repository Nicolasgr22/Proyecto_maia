import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score,root_mean_squared_error

# 1. Cargar datos
df = pd.read_csv("Data/Data_Seattle.csv")

# 2. Procesar columna 'date'
df["date"] = pd.to_datetime(df["date"], format="%Y%m%dT%H%M%S", errors="coerce")
df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month
df["day"] = df["date"].dt.day
df = df.drop("date", axis=1)  # eliminamos la columna original

# 3. Separar variables (X) y target (y)
X = df.drop("price", axis=1)
y = df["price"]

# 4. Dividir en train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 5. Entrenar modelo
model = LinearRegression()
model.fit(X_train, y_train)

# 6. Predicciones
y_pred = model.predict(X_test)

# 7. Métricas
rmse = mean_squared_error(y_test, y_pred, squared=False)
r2 = r2_score(y_test, y_pred)

print("RMSE:", rmse)
print("R²:", r2)
