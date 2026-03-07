import pandas as pd
from typing import Optional
from model.processing.data_manager import load_dataset
from model.config.core import config
from app.schemas.PriceDataPoint import PriceDataPoint
from app.schemas import PriceFilter

def get_price_data_points(input_data: PriceFilter) -> list:
    print("Input data for price data points:", input_data)
    df = load_dataset(file_name=config.app_config.data_file)

    if input_data.date_from is not None:
        df = df[df['date'].str[:7] >= input_data.date_from]
    if input_data.date_to is not None:
        df = df[df['date'].str[:7] <= input_data.date_to]
    if input_data.zipcode is not None:
        df = df[df['zipcode'] == input_data.zipcode]
    if input_data.bedrooms is not None:
        df = df[df['bedrooms'] == input_data.bedrooms]
    if input_data.price_min is not None:
        df = df[df['price'] >= input_data.price_min]
    if input_data.price_max is not None:
        df = df[df['price'] <= input_data.price_max]
    if input_data.grade_min is not None:
        df = df[df['grade'] >= input_data.grade_min]
    if input_data.waterfront is not None:
        df = df[df['waterfront'] == int(input_data.waterfront)]

    df['mes'] = df['date'].str[:7]
    grouped = df.groupby('mes')['price'].mean().reset_index()
    return [PriceDataPoint(mes=row['mes'], precio_m2=row['price']) for _, row in grouped.iterrows()]

