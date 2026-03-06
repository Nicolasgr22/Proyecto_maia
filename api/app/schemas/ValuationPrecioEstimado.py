from pydantic import BaseModel

class ValuationPrecioEstimado(BaseModel):
    minimo: float
    maximo: float
    punto_medio: float
    moneda: str
