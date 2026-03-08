# Changelog

Todos los cambios relevantes del proyecto Maia - Modelo de Avalúo Inmobiliario.

---

## [Semana 2026-03-05 → 2026-03-08]

### 2026-03-08

#### Modelo (`package-src`)
- **Reducción de predictores**: Se ajustó el número de columnas del modelo, limitando los predictores a los estrictamente necesarios para la valuación.
- **Actualización de versión del modelo**: Se incrementó la versión del paquete del modelo (`model_avaluo`).
- **Mejora en validación de datos**: La validación ya no descarta filas completas; ahora filtra únicamente las columnas requeridas, preservando más registros en la inferencia.
- Archivos afectados: `package-src/config.json`, `package-src/README.md`, artefactos MLflow (`MLmodel`, `model.pkl`, `requirements.txt`).

---

### 2026-03-07

#### API (`valuation-api`)
- **Contenerización**: Se agregó `Dockerfile` para desplegar la API de valuación en contenedores Docker.
- **Documentación del API**: Se amplió `valuation-api/api/README.md` con instrucciones de uso, endpoints disponibles y ejemplos.
- **Nuevo endpoint de filtrado**: Se implementó el endpoint para filtrar precios promedio por ubicación y rango de fechas (`avg_price_by_location`).
- **Cambios en el modelo para el frontend**: Se actualizó el paquete del modelo para exponer información adicional requerida por el frontend (distribución de precios, resumen de mercado).

#### Repositorio
- Se eliminó la carpeta `dist/` del control de versiones (archivos `.whl` y `.tar.gz` compilados).
- Se agregó `dist/` al `.gitignore` para evitar que artefactos de build sean rastreados en el futuro.

---

### 2026-03-06

#### API + Modelo (`api`, `package-src`)
- **Corrección del empaquetado del modelo**: Se corrigió el `MANIFEST.in` del paquete `model_avaluo` para incluir correctamente todos los archivos del modelo MLflow, permitiendo su instalación exitosa desde la API.
- **Primera operación `valuations`**: Se implementó el endpoint inicial de valuación (`POST /valuations`) que recibe datos del inmueble y retorna el precio estimado.
- Se añadió la estructura base del módulo `api/app/` (`__init__.py`, `api.py`, `config.py`, `main.py`).

---

### 2026-03-05

#### Inicio del API y empaquetado (`api`, `package-src`, `frontend`)
- **Empaquetado del modelo**: Se creó la carpeta `package-src/` con la estructura de paquete Python (`MANIFEST.in`, `setup.py`/`config.json`) para distribuir el modelo de avalúo como librería instalable (`model_avaluo`).
- **Estructura inicial del API**: Se definieron los primeros esquemas, configuración y clases de servicio para el API de valuación.
- **Limpieza de datos de prueba**: Se eliminaron archivos de datos grandes del repositorio (`Data/Data_Seattle.csv`, `Model/config.json`, `Model/predict.py`) que estaban siendo rastreados innecesariamente.
- Se integraron cambios del frontend junto con los del API.

---

## Componentes modificados esta semana

| Componente       | Cambios principales                                              |
|------------------|------------------------------------------------------------------|
| `package-src`    | Empaquetado, ajuste de predictores, versión del modelo           |
| `valuation-api`  | Dockerización, documentación, nuevos endpoints                   |
| `api`            | Estructura base, endpoint `/valuations`, filtrado por ubicación  |
| `frontend`       | Integración con nuevos datos del modelo                          |
| `.gitignore`     | Exclusión de `dist/`                                             |
