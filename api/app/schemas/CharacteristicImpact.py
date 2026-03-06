from typing import Optional
from pydantic import BaseModel

class CharacteristicImpact(BaseModel):
    caracteristica: str
    impacto_pct: float
    impacto_absoluto: Optional[float]
    descripcion: str
