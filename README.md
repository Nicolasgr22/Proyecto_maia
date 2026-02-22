# Proyecto_maia

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)


## Descripción del Proyecto

**Desarrollo y despliegue de un modelo de estimación de precios de vivienda**

Este proyecto tiene como objetivo construir, evaluar y desplegar un modelo predictivo de regresión capaz de estimar el precio de venta de una vivienda a partir de sus características físicas y variables de ubicación. La solución busca ofrecer una valoración inicial objetiva y reproducible que sirva como guía para procesos de compra o venta, reduciendo la dependencia de juicios subjetivos.

El modelo se desarrolla utilizando el dataset **House Sales in King County, USA** disponible en Kaggle, el cual contiene registros históricos de transacciones inmobiliarias en el condado de King (incluye Seattle). La variable objetivo es `price`, y las variables predictoras incluyen atributos estructurales (habitaciones, baños, área construida, calidad, estado, antigüedad) y factores espaciales (código postal, latitud, longitud y métricas del entorno).

El alcance técnico del proyecto incluye:

* Exploración y análisis descriptivo de datos.
* Limpieza, transformación y construcción de variables.
* Entrenamiento y evaluación comparativa de modelos de regresión.
* Selección del mejor modelo con base en métricas de error.
* Versionamiento de código y datos mediante Git y DVC.
* Integración con almacenamiento remoto en AWS S3.
* Despliegue del modelo a través de una API y/o interfaz de visualización para consulta de predicciones.

La arquitectura está diseñada para ser reproducible y trazable, permitiendo la migración futura a datos más recientes sin modificar la lógica metodológica. El sistema no pretende reemplazar una tasación profesional ni realizar inferencias causales del mercado inmobiliario; su propósito es proporcionar una herramienta predictiva funcional, transparente y basada en datos históricos.

---

## Instalación y ambiente virtual

Este proyecto recomienda el uso de un ambiente virtual para aislar dependencias. Se utiliza [uv](https://github.com/astral-sh/uv) para la gestión de paquetes y ambientes.

### Requisitos previos
- Tener instalado Python 3.8 o superior.

### Instalación de uv
En macOS, puedes instalar uv usando Homebrew:

```bash
brew install uv
```

---

## Estructura de carpetas

La organización del proyecto es la siguiente:

```text
Proyecto_maia/
├── Data/
│   └── Data_Seattle.csv         # Dataset principal
├── Model/
│   ├── config.json              # Configuración del modelo
│   ├── predict.py               # Script para predicción
│   ├── requirements.txt         # Dependencias del modelo
│   ├── train.py                 # Script de entrenamiento
│   └── xgb_model.pkl            # Modelo XGBoost guardado
├── models_test/
│   ├── SVM_regression.ipynb     # Notebook de pruebas SVM
│   ├── train_gb_gridsearch.py   # Script GridSearch Gradient Boosting
│   ├── train_rf_gridsearch.py   # Script GridSearch Random Forest
│   ├── train_xgboost_gridsearch.py # Script GridSearch XGBoost
│   └── models_test/
│       └── saved/
│           ├── svm_gridsearch.pkl         # Modelo SVM guardado
│           └── svm_gridsearch_results.json # Resultados GridSearch SVM
├── .gitignore                  # Exclusiones de git
├── README.md                   # Documentación principal
└── ...                         # Otros archivos y carpetas
```

Cada carpeta contiene scripts, datos o resultados relacionados con el entrenamiento, pruebas y despliegue de modelos de regresión para estimación de precios de vivienda.

O directamente con pip:

```bash
pip install uv
```

### Crear un ambiente virtual

```bash
uv venv .venv
source .venv/bin/activate
```

### Instalar dependencias

```bash
uv pip install -r Model/requirements.txt
```

---

## Ejecutar el frontend en localhost

El frontend es una aplicación web simple ubicada en la carpeta `frontend/`.

### Requisitos
- Tener instalado Python (para un simple servidor) o Node.js (opcional).

### Opción 1: Usar Python (recomendado para pruebas rápidas)

Desde la raíz del proyecto o dentro de la carpeta `frontend/`, ejecuta:

```bash
cd frontend
python3 -m http.server 8080
```

Luego abre tu navegador y accede a:

```
http://localhost:8080
```

### Opción 2: Usar Node.js (si tienes instalado)

Puedes instalar un servidor estático como `serve`:

```bash
npm install -g serve
cd frontend
serve -l 8080
```

Y acceder igualmente a:

```
http://localhost:8080
```

Esto cargará la interfaz web para consultar el modelo.

# Ejecución de ML Flow con Docker Compose

Este proyecto puede correr una infraestructura que usa MLFlow empaquetado.
MLFlow, a su vez usa una imagen de Postgres para guardar los experimentos, y una
alternativa local a S3 llamada Minio que se alojan en el contenedor.

Para correr el contenedor con todo sigue los siguientes comandos:

## Ejecutar el stack con Docker Compose (MLflow + Postgres + MinIO + App)

Este proyecto incluye un stack local para tracking de experimentos con **MLflow**, persistencia de metadata en **Postgres** y almacenamiento de artefactos (modelos, plots, etc.) en **MinIO** (compatible con S3). Además, el servicio **app** ejecuta el entrenamiento (`Model/train.py`) y registra runs en MLflow.

### Requisitos
- Docker Desktop instalado
- Docker Compose (incluido en Docker Desktop)

### Levantar los contenedores

Desde la raíz del repositorio (donde está `docker-compose.yml`):

```bash
docker compose up --build
```
### Levantarlo en un segundo plano
```bash
docker compose up --build -d
```

### Ver logs
```bash
docker compose logs -f
```


### Ver logs de un servicio específico
```bash
docker compose logs -f mlflow
```


### Puertos de cada componente
| Componente                      | Servicio   | Host/URL                                       | Puerto Host | Puerto Interno |
| ------------------------------- | ---------- | ---------------------------------------------- | ----------- | -------------- |
| MLflow Tracking UI/API          | `mlflow`   | [http://localhost:5001](http://localhost:5001) | 5001        | 5001           |
| Postgres (backend store MLflow) | `postgres` | localhost:5433                                 | 5433        | 5432           |
| MinIO S3 API (artifacts)        | `minio`    | [http://localhost:9000](http://localhost:9000) | 9000        | 9000           |
| MinIO Console (UI)              | `minio`    | [http://localhost:9001](http://localhost:9001) | 9001        | 9001           |

### Credenciales por defecto (desarrollo)

**Postgres**

* DB: mlflow

* User: mlflow

* Password: mlflow

**MinIO Console**

* User: minio

* Password: minio123456

### Persistencia de datos

Los datos se mantienen aunque se detenga y se reinicie el stack con docker compose down / up porque se usan volúmenes Docker:

* pgdata (Postgres: metadata de experimentos/runs)

* miniodata (MinIO: artefactos como modelos, gráficos, etc.)

Solo se borran si se ejecuta docker compose down -v o eliminas los volúmenes manualmente.