
import math

import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
from app.schemas import PropertyInput


def test_make_prediction(client: TestClient, test_data: pd.DataFrame) -> None:
    # Given
    # Selecciona un solo registro aleatorio de test_data
    random_record = test_data.sample(n=1, random_state=42)
    payload = random_record.replace({np.nan: None}).to_dict(orient="records")
    payload = [PropertyInput(**item).model_dump() for item in payload]
    print("Payload for prediction:", payload)
    
    
    # When
    response = client.post(
        "http://localhost:8001/api/v1/valuations",
        json=payload[0],  # Enviar solo un objeto, no una lista
    )

    # Then
    
    assert response.status_code == 200
    prediction_data = response.json()
    print("Prediction response:", response)
    assert prediction_data["precio_estimado"]
    assert math.isclose(prediction_data["precio_estimado"], 392916, rel_tol=100)

def test_get_prices(client: TestClient) -> None:
    """Testea el endpoint /prices y valida el formato de respuesta."""
    response = client.post("http://localhost:8001/api/v1/prices")
    assert response.status_code == 200
    prices = response.json()
    assert isinstance(prices, list)
    assert len(prices) > 0
    print("Prices response length", len(prices))
    for item in prices:
        assert "mes" in item
        assert "precio_m2" in item