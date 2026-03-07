import numpy as np
from math import radians, cos, sin, asin, sqrt

from model.processing.data_manager import load_dataset
from model.config.core import config
from app.schemas.MarketSummary import MarketSummary

# Haversine formula to calculate distance between two lat/long points in feet
def haversine(lat1, lon1, lat2, lon2):
    # Radius of earth in feet
    R = 20925524.9  # 6371 km in feet
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

# Calcula la tendencia anual de precio de la zona (variación porcentual promedio por año)
def annual_price_trend(df, radius_ft):
    mask = (df['distance'] <= radius_ft) & (df['distance'] > 0)
    neighbors = df[mask]
    if neighbors.empty or 'yr_built' not in neighbors.columns or 'price' not in neighbors.columns:
        return 0.0
    yearly = neighbors.groupby('yr_built')['price'].mean().sort_index()
    if len(yearly) < 2:
        return 0.0
    x = yearly.index.values
    y = yearly.values
    slope = np.polyfit(x, y, 1)[0]
    pct_trend = (slope / np.mean(y)) * 100 if np.mean(y) != 0 else 0.0
    return pct_trend

# Calcula el promedio de precio en un radio dado usando la columna 'distance' ya calculada
def avg_price_in_radius(df, radius_ft):
    mask = (df['distance'] <= radius_ft) & (df['distance'] > 0)
    neighbors = df[mask]
    return neighbors['price'].mean() if not neighbors.empty else np.nan

# Determina el estado del mercado según la tendencia anual
def market_status_from_trend(tendencia_anual, threshold_cold=-2.0, threshold_hot=2.0):
    """
    Devuelve el estado del mercado:
    - 'frio' si la tendencia anual es menor a threshold_cold
    - 'equilibrado' si está entre threshold_cold y threshold_hot
    - 'caliente' si es mayor o igual a threshold_hot
    Los umbrales pueden ajustarse según criterios de negocio.
    """
    if tendencia_anual < threshold_cold:
        return "FRIO", "El mercado esta mas frio que el polo norte, comprar es una ganga!"
    elif tendencia_anual >= threshold_hot:
        return "CALIENTE", "El mercado esta mas caliente que el sol, vender es una oportunidad!"
    else:
        return "EQUILIBRADO", "El mercado esta equilibrado, ni fu ni fa, comprar o vender depende de tus necesidades!"
def build_market_summary(lat, lon, radius_ft=100000):
    
    df = load_dataset(file_name=config.app_config.data_file)
    df = df.dropna(subset=['lat', 'long', 'price'])
    # Calcular la distancia una sola vez
    df = df.copy()
    df['distance'] = df.apply(lambda r: haversine(lat, lon, r['lat'], r['long']), axis=1)
    print(df['distance'].describe())
    precio_medio_zona = avg_price_in_radius(df, radius_ft)
    tendencia_anual = annual_price_trend(df, radius_ft)
    estado, descripcion = market_status_from_trend(tendencia_anual)
    return MarketSummary(
        estado=estado,
        precio_medio_zona=precio_medio_zona,
        tendencia_anual_pct=tendencia_anual,
        descripcion=descripcion
    )

# Ejemplo de uso:
if __name__ == "__main__":
    lat, lon = 47.522, -122.149
    summary = build_market_summary(lat, lon, 100000)
    print(summary)

