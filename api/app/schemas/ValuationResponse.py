from typing import Optional
from pydantic import BaseModel
from .ValuationPrecioEstimado import ValuationPrecioEstimado
from .MarketSummary import MarketSummary
from .PropertyInput import PropertyInput

class ValuationResponse(BaseModel):
    id: str
    precio_estimado: ValuationPrecioEstimado
    confianza: str  # ALTA, MEDIA, BAJA
    margen_error_pct: float
    mercado: MarketSummary
    nota: Optional[str]
    inmueble: Optional[PropertyInput]
    creado_en: str  # datetime
