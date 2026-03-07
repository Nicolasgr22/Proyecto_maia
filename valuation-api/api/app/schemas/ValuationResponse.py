from typing import Optional
from pydantic import BaseModel
from .MarketSummary import MarketSummary
from .PropertyInput import PropertyInput

class ValuationResponse(BaseModel):
    id: str
    precio_estimado: float
    confianza: str  # ALTA, MEDIA, BAJA
    confianza_pct: float
    mercado: MarketSummary
    nota: Optional[str]
    inmueble: Optional[PropertyInput]
    creado_en: str  # datetime
