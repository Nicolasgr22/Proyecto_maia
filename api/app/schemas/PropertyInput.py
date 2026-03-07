from typing import List, Optional
from pydantic import BaseModel
from .Ubicacion import Location

class PropertyInput(BaseModel):
    bedrooms: Optional[int] = None  # Number of rooms
    bathrooms: Optional[float] = None  # Number of bathrooms (includes half-baths)
    sqft_living: Optional[float] = None  # Built area in square meters
    sqft_lot: Optional[float] = None  # Lot area in square meters
    floors: Optional[float] = None  # Number of floors within the property
    waterfront: Optional[int] = None  # 1 if the property has a waterfront view, 0 otherwise
    view: Optional[int] = None  # 1 if the property has a waterfront view, 0 otherwise
    condition: Optional[int] = None  # Overall condition of the property (1-5)
    grade: Optional[int] = None  # Construction quality, 1-13
    sqft_above: Optional[float] = None  # Lot area in square meters
    sqft_basement: Optional[float] = None  # Basement area in square meters
    yr_built: Optional[int] = None  # Year the property was built
    yr_renovated: Optional[int] = None  # Year of last major renovation
    zipcode: Optional[int] = None  # Zip code of the property
    lat:Optional[float] = None  # Latitude of the property
    long: Optional[float] = None  # Longitude of the property
    sqft_living15: Optional[float] = None  # Built area in square meters of the nearest 15 neighbors
    sqft_lot15: Optional[float] = None  # Lot area in square meters of the nearest 15 neighbors