from pydantic import BaseModel
from .Ubicacion import Ubicacion

class ComparableProperty(BaseModel):
    id: str
    superficie: float
    habitaciones: int
    banos: int
    planta: str  # BAJO, BAJA_MEDIA, MEDIA_ALTA, ATICO
    estado_conservacion: str  # A_REFORMAR, REFORMADO, A_ESTRENAR
    precio_venta: float
    precio_m2: float
    fecha_venta: str  # date
    distancia_m: float
    ubicacion: Ubicacion
