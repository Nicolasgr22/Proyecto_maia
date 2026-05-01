from pydantic import BaseModel

class PriceDataPoint(BaseModel):
    mes: str  # formato YYYY-MM
    precio_m2: float
