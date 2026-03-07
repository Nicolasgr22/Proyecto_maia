# Endpoint que devuelve un listado de PriceDataPoint
from typing import List
import json
from typing import Any, Optional

from avg_price_by_location import build_market_summary
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
from app.services.model_service import get_price_data_points

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

    confianza_pct = precio_estimado.get("confidence_pct") if precio_estimado.get("confidence_pct") else None
    confianza_label = precio_estimado.get("confidence_label") if precio_estimado.get("confidence_label") else None
    
    logger.info(f"Confianza results: pct={confianza_pct}, label={confianza_label}")
    market_summary = build_market_summary(lat = input_data.lat, lon = input_data.long, radius_ft=100000)
    

    results = schemas.ValuationResponse(
        id=str(uuid.uuid4()),
        precio_estimado=float(precio_estimado.get("predictions")[0]) if isinstance(precio_estimado.get("predictions"), list) else float(precio_estimado.get("predictions")),
        confianza=confianza_label,
        confianza_pct=confianza_pct,
        mercado=market_summary,
        nota=f"Predicción generada usando modelo versión {model_version}",
        inmueble=input_data,
        creado_en=pd.Timestamp.now().isoformat()
    )
    logger.info(f"Prediction results: {results}")
    return results


@api_router.post("/prices", response_model=List[schemas.PriceDataPoint], status_code=200)
async def get_prices(input_data: Optional[schemas.PriceFilter] = None) -> list:
    """
    Devuelve un listado de PriceDataPoint filtrado
    """
    print("Received input for price data points:", input_data)
    prices = get_price_data_points(input_data) if input_data else get_price_data_points(schemas.PriceFilter())
    return prices
