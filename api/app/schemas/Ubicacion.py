from pydantic import BaseModel, Field
from typing import Optional

class Location(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    postal_code: Optional[str] = Field(None, regex=r'^\d{5}$')
    city: Optional[str]
    province: Optional[str]
