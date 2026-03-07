import json
from typing import Any

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder
from loguru import logger
from model import __version__ as model_version
from model.predict import make_prediction

from app import __version__, schemas
from app.config import settings
import uuid

api_router = APIRouter()

# Ruta para verificar que la API se esté ejecutando correctamente
@api_router.get("/health", response_model=schemas.Health, status_code=200)
def health() -> dict:
    """
    Root Get
    """
    health = schemas.Health(
        name=settings.PROJECT_NAME, api_version=__version__, model_version=model_version
    )

    return health.dict()

# Ruta para realizar las predicciones
@api_router.post("/valuations", response_model=schemas.ValuationResponse, status_code=200)
async def predict(input_data: schemas.PropertyInput) -> Any:
    """
    Prediccion usando el modelo de avaluo
    """

    input_df = pd.DataFrame([input_data.model_dump()])
    logger.info(f"Making prediction on inputs: {input_data.model_dump()}")
    precio_estimado = make_prediction(input_data=input_df.replace({np.nan: None}))
    if precio_estimado["errors"] is not None:
        logger.warning(f"Prediction validation error: {precio_estimado.get('errors')}")
        raise HTTPException(status_code=400, detail=json.loads(precio_estimado["errors"]))

    logger.info(f"Prediction results: {precio_estimado.get('predictions')}")

    market_summary = schemas.MarketSummary(
    estado = np.random.choice(["FRIO", "EQUILIBRADO", "CALIENTE"]),  # FRIO, EQUILIBRADO, CALIENTE
    precio_medio_zona = float(np.random.uniform(100000, 1000000)),
    tendencia_anual_pct = float(np.random.uniform(-10, 10)),
    descripcion = "Resumen del mercado inmobiliario"
    )
    

    results = schemas.ValuationResponse(
        id=str(uuid.uuid4()),
        precio_estimado=float(precio_estimado.get("predictions")[0]) if isinstance(precio_estimado.get("predictions"), list) else float(precio_estimado.get("predictions")),
        confianza=np.random.choice(["ALTA", "MEDIA", "BAJA"]),
        margen_error_pct=float(np.random.uniform(0, 1)),
        mercado=market_summary,
        nota=None,
        inmueble=input_data,
        creado_en=pd.Timestamp.now().isoformat()
    )
    return results
