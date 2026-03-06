from typing import List, Optional
from pydantic import BaseModel
from .Ubicacion import Location

class PropertyInput(BaseModel):
    sqft_living: float  # Built area in square meters
    sqft_lot: Optional[float] = None  # Lot area in square meters
    sqft_basement: Optional[float] = None  # Basement area in square meters
    rooms: int  # Number of rooms
    bathrooms: int  # Number of bathrooms (includes half-baths)
    floor: float  # Number of floors within the property
    condition: Optional[int] = None  # Overall condition of the property (1-5)
    grade: int  # Construction quality, 1-13
    lot_area: Optional[float] = None  # Lot area in sqft (applies to single-family homes)
    year_built: Optional[int] = None  # Year the property was built
    year_renovated: Optional[int] = None  # Year of last major renovation
    location: Location
