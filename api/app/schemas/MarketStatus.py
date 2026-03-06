from pydantic import BaseModel
from .Ubicacion import Ubicacion

class MarketStatus(BaseModel):
    zona: Ubicacion
    estado: str  # FRIO, EQUILIBRADO, CALIENTE
    indice_demanda: float
    tiempo_medio_venta_dias: int
    ratio_oferta_demanda: float
    descripcion: str
