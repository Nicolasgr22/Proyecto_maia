# import joblib
# import pandas as pd

# # Cargar modelo
# model = joblib.load("xgb_model.pkl")

# # Ejemplo de entrada 
# X_new = pd.DataFrame([{
#     "bedrooms": 3,
#     "bathrooms": 1,
#     "sqft_living": 1180,
#     "sqft_lot": 5650,
#     "floors": 1,
#     "waterfront": 0,
#     "view": 0,
#     "condition": 3,
#     "grade": 7,
#     "sqft_above": 1180,
#     "sqft_basement": 0,
#     "yr_built": 1955,
#     "yr_renovated": 0,
#     "zipcode": 98178,
#     "lat": 47.5112,
#     "long": -122.257,
#     "sqft_living15": 1340,
#     "sqft_lot15": 5650
# }])


# # Predicción
# prediction = model.predict(X_new)
# print("Predicción del precio:", prediction[0])


import typing as t

import numpy as np
import pandas as pd

from model import __version__ as _version
from model.config.core import config
from model.processing.data_manager import load_pipeline, get_attribute_from_config_json
from model.processing.validation import validate_inputs

pipeline_file_name = f"{config.app_config.pipeline_save_file}{_version}.pkl"
_avaluo_pipe = load_pipeline(file_name=pipeline_file_name)


def make_prediction(
    *,
    input_data: t.Union[pd.DataFrame, dict],
) -> dict:
    """Make a prediction using a saved model pipeline."""

    data = pd.DataFrame(input_data)
    validated_data, errors = validate_inputs(input_data=data)
    results = {"predictions": None, "version": _version, "errors": errors}
    confidence_pct = get_attribute_from_config_json("r2")
    print("R2 from config.json:", confidence_pct)
    if not errors:
        X = validated_data[config.model_configuration.features]
        predictions = _avaluo_pipe.predict(X=X)
        print("R2",confidence_pct)

        preds_float = [float(pred) for pred in predictions]
        confidence_label = None
        # Clasificación literal de confianza, siempre string
        if confidence_pct is not None:
            if confidence_pct is None:
                confidence_label = "Desconocida"
            elif confidence_pct > 0.84:
                confidence_label = "Alta"
            elif confidence_pct <= 0.84 and confidence_pct >= 0.70:
                confidence_label = "Media"  
            else:
                confidence_label = "Baja"   
        else:
            confidence_label = ["Desconocida"] * len(preds_float)
        results = {
            "predictions": preds_float,
            "confidence_pct": confidence_pct,
            "confidence_label": confidence_label,
            "version": _version,
            "errors": errors,
        }

    return results

