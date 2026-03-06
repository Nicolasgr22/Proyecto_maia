from typing import List, Optional
from pydantic import BaseModel
from .CharacteristicImpact import CharacteristicImpact

class MarketAnalysis(BaseModel):
    valoracion_id: str
    estimacion_actual: dict
    alerta_mercado: Optional[dict]
    evolucion_precio_m2: Optional[dict]
    impacto_caracteristicas: Optional[List[CharacteristicImpact]]
    comparativa_barrio: Optional[dict]
