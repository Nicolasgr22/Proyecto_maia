from typing import List, Optional, Tuple

import numpy as np
import pandas as pd
from pydantic import BaseModel, ValidationError

from model.config.core import config


def drop_na_inputs(*, input_data: pd.DataFrame) -> pd.DataFrame:
    """Check model inputs for na values and filter."""
    validated_data = input_data.copy()
    new_vars_with_na = [
        var
        for var in config.model_configuration.features
        if validated_data[var].isnull().sum() > 0
    ]
    # validated_data.dropna(subset=new_vars_with_na, inplace=True)
    validated_data.drop(columns=new_vars_with_na, inplace=True)

    return validated_data


def validate_inputs(*, input_data: pd.DataFrame) -> Tuple[pd.DataFrame, Optional[dict]]:
    """Check model inputs for unprocessable values."""
    relevant_data = input_data[config.model_configuration.features].copy()
    validated_data = drop_na_inputs(input_data=relevant_data)
    print(validated_data.head())
    errors = None

    try:
        # replace numpy nans so that pydantic can validate
        MultipleDataInputs(
            inputs=validated_data.replace({np.nan: None}).to_dict(orient="records")
        )
    except ValidationError as error:
        print("Validation error:", error)
        errors = error.json()

    return validated_data, errors



class DataInputSchema(BaseModel):
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

class MultipleDataInputs(BaseModel):
    inputs: List[DataInputSchema]

