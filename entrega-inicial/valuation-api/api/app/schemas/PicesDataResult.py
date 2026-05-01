from typing import Any, List, Optional


from pydantic import BaseModel
from .PriceDataPoint import PriceDataPoint

class MultiplePrices(BaseModel): 
    output: List[PriceDataPoint]