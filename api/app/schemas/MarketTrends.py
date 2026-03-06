from typing import List
from pydantic import BaseModel
from .Ubicacion import Ubicacion
from .PriceDataPoint import PriceDataPoint

class MarketTrends(BaseModel):
    zona: Ubicacion
    radio_km: float
    precio_actual_m2: float
    variacion_anual_pct: float
    serie_historica: List[PriceDataPoint]
