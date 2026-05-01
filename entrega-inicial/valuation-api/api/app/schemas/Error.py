from typing import List, Optional
from pydantic import BaseModel

class Error(BaseModel):
    codigo: str
    mensaje: str
    detalle: Optional[List[str]] = None
