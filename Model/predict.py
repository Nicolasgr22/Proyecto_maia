import joblib
import pandas as pd

# Cargar modelo
model = joblib.load("xgb_model.pkl")

# Ejemplo de entrada (puede ser un CSV o dict)
X_new = pd.DataFrame([{
    "rooms": 3,
    "bathrooms": 2,
    "area": 120,
    "location_score": 8
}])

# Predicción
prediction = model.predict(X_new)
print("Predicción del precio:", prediction[0])
