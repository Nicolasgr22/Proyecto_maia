from pydantic import BaseModel

class MarketSummary(BaseModel):
    estado: str  # FRIO, EQUILIBRADO, CALIENTE
    precio_medio_zona: float
    tendencia_anual_pct: float
    descripcion: str
