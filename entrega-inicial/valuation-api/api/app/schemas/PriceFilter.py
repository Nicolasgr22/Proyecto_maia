from typing import List, Optional
from pydantic import BaseModel

class PriceFilter(BaseModel):
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    zipcode: Optional[int] = None
    bedrooms: Optional[int] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    grade_min: Optional[int] = None
    waterfront: Optional[bool] = None