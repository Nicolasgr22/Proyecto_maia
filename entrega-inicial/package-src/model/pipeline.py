from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestClassifier

from model.config.core import config
from model.processing import features as pp
from xgboost import XGBRegressor

avaluo_pipe = Pipeline(
    [
        # XGBRegressor 
        ("xgb",
            XGBRegressor(objective=config.model_configuration.objective, random_state=config.model_configuration.random_state),
        ),
    ]
)
