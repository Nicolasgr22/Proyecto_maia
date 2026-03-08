# Proyecto Maia

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/api-FastAPI-green?logo=fastapi)
![React](https://img.shields.io/badge/frontend-React-blue?logo=react)

## Tabla de Contenido

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Ambientes](#ambientes)
   - [Ambiente Local](#ambiente-local)
   - [Ambiente AWS Academy (Productivo)](#ambiente-aws-academy-productivo)

---

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
* Despliegue del modelo a través de una API y una interfaz web para consulta de predicciones.

La arquitectura está diseñada para ser reproducible y trazable, permitiendo la migración futura a datos más recientes sin modificar la lógica metodológica. El sistema no pretende reemplazar una tasación profesional ni realizar inferencias causales del mercado inmobiliario; su propósito es proporcionar una herramienta predictiva funcional, transparente y basada en datos históricos.

---

## Estructura de Carpetas

Este repositorio es un **monorepo** organizado en tres grandes módulos que representan las etapas del ciclo de vida del producto:

| Módulo | Carpeta | Descripción |
|---|---|---|
| Modelado y entrenamiento | `package-src/` | Scripts, configuraciones y artefactos para entrenar y versionar el modelo. El modelo empaquetado se exporta como `.whl`. |
| API de predicción | `valuation-api/` | Backend FastAPI que expone el modelo como servicio REST. Consume el `.whl` de `package-src/`. |
| Frontend | `frontend/` | Aplicación React que permite a los usuarios interactuar con la API de predicción. |

El flujo de trabajo es: **entrena y exporta el modelo en `package-src/`** → **sírvelo vía API en `valuation-api/`** → **consúmelo desde el navegador en `frontend/`**.

```text
Proyecto_maia/
├── package-src/                # Modelado y entrenamiento
│   ├── model/
│   │   ├── config/             # Configuración del modelo (config.json, core.py)
│   │   ├── datasets/           # Dataset fuente (data_seattle.csv)
│   │   ├── processing/         # Ingeniería de features
│   │   ├── pipeline.py         # Pipeline sklearn
│   │   ├── train.py            # Script de entrenamiento con MLflow
│   │   └── train_pipeline.py   # Script alternativo de entrenamiento
│   ├── tests/                  # Pruebas del paquete del modelo
│   ├── requirements/           # requirements.txt, test_requirements.txt
│   ├── pyproject.toml          # Empaquetado como .whl
│   └── tox.ini
│
├── valuation-api/              # API FastAPI
│   ├── api/
│   │   ├── app/                # Código fuente (main.py, api.py, schemas/, services/)
│   │   ├── model-pkg/          # Archivo .whl del modelo
│   │   ├── requirements.txt
│   │   ├── tox.ini
│   │   └── run.sh
│   └── Dockerfile
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── App.jsx
│   │   ├── config.js
│   │   └── components/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── docker-compose.yml          # Orquestación local completa
├── Dockerfile.mlflow           # Imagen del servidor MLflow
├── Dockerfile.app              # Imagen del job de entrenamiento
└── README.md
```

---

## Ambientes

El proyecto se ejecuta en dos ambientes:

| Ambiente | Descripción |
|---|---|
| **Local** | Desarrollo y experimentación en la máquina del desarrollador. Usa Docker Compose para levantar todos los servicios. |
| **AWS Academy (Productivo)** | Despliegue en Amazon ECS (Fargate) con imágenes publicadas en Amazon ECR. |

---

## Ambiente Local

### Prerequisitos generales

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- Python 3.10+
- Node.js 18+

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/Nicolasgr22/Proyecto_maia.git
cd Proyecto_maia
```

---

### 2. Configuración de Python y ambientes virtuales

Se utiliza [uv](https://github.com/astral-sh/uv) para la gestión de paquetes y entornos virtuales Python. Aplica tanto para `package-src/` como para `valuation-api/api/`.

#### Instalar uv

```bash
# macOS con Homebrew
brew install uv

# O directamente con pip
pip install uv
```

#### Crear y activar el ambiente virtual

```bash
# Dentro de cada subcarpeta Python (package-src/ o valuation-api/api/)
uv venv .venv
source .venv/bin/activate      # macOS / Linux
# .venv\Scripts\activate       # Windows
```

---

### 3. Subrepo: `package-src/` — Modelado y Entrenamiento

#### Instalación de dependencias

```bash
cd package-src
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements/requirements.txt
```

#### Entrenar el modelo localmente

```bash
tox run -e train
```

#### Ejecutar pruebas

```bash
tox -e test_package
```


#### Empaquetar el modelo como `.whl`

```bash
pip install build
python -m build
# El artefacto queda en dist/model_avaluo-*.whl
# Cópialo a valuation-api/api/model-pkg/ para que la API lo consuma
```

---

### 4. Subrepo: `valuation-api/` — API de Predicción

#### Prerequisitos

- Python >= 3.10
- `tox` versión 4+

#### Instalación de dependencias

```bash
cd valuation-api/api
uv venv .venv
source .venv/bin/activate
pip install tox

# Instalar el modelo empaquetado (si lo actualizaste)
pip install model-pkg/model_avaluo-0.1.0-py3-none-any.whl

# O instalar todas las dependencias
uv pip install -r requirements.txt
```

#### Ejecutar pruebas

```bash
tox -e test_app -- -s
```

#### Levantar la API localmente (sin Docker)

```bash
tox run -e run
```

La API quedará disponible en `http://localhost:8001`.

---

### 5. Subrepo: `frontend/` — Aplicación React

#### Prerequisitos

- Node.js 18+

#### Instalación de dependencias

```bash
cd frontend
npm install
```

#### Configurar la URL del API

```bash
cp .env.example .env
# Edita .env y ajusta VITE_API_BASE_URL si es necesario
# Por defecto: VITE_API_BASE_URL=http://localhost:8001
```

#### Levantar el servidor de desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`.

#### Build de producción local

```bash
npm run build
npm run serve
```

---

### 6. Arquitectura Local con Docker Compose

El `docker-compose.yml` en la raíz del proyecto levanta el stack completo:

```text
  Host (tu máquina)
  ┌──────────────────────────────────────────────────────────────┐
  │  ┌──────────────────────────┐  ┌───────────────────────────┐ │
  │  │        Navegador         │  │       Desarrollador       │ │
  │  │  http://localhost:3000   │  │  MLflow UI                │ │
  │  └─────────────┬────────────┘  │  http://localhost:5001    │ │
  │                │               └─────────────┬─────────────┘ │
  └────────────────│─────────────────────────────│───────────────┘
                   │ HTTP :3000                  │ HTTP :5001
                   ▼                             ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ Docker Compose – Proyecto Maia                                         │
  │                                                                        │
  │  ┌──────────────────────┐  VITE_API_BASE_URL    ┌──────────────────┐  │
  │  │    maia-frontend     │──────────────────────►│maia-valuation-api│  │
  │  │    Node/serve :3000  │  http://localhost:8001 │  FastAPI :8001   │  │
  │  └──────────────────────┘                       └──────────────────┘  │
  │                                                                        │
  │  ┌──────────────────────┐◄── Registra runs ─────┌──────────────────┐  │
  │  │     maia-mlflow      │                        │    maia-app      │  │
  │  │   MLflow Server      │                        │ Job entrenamiento│  │
  │  │       :5001          │                        │   (train.py)     │  │
  │  └───────┬──────────────┘                        └────────┬─────────┘  │
  │          │ Metadata                             Artefactos│            │
  │          │           ┌────────────────────────────────────┘            │
  │          │           │                                                 │
  │  ┌───────▼───────────▼─────────────────────────────────────────────┐  │
  │  │ Infraestructura de datos                                         │  │
  │  │                                                                  │  │
  │  │  ┌────────────────────────┐    ┌───────────────────────────┐    │  │
  │  │  │     maia-postgres      │    │        maia-minio         │    │  │
  │  │  │     Postgres 16        │    │     MinIO S3-compat       │    │  │
  │  │  │    :5433 → :5432       │    │     :9000 / :9001         │    │  │
  │  │  └────────────────────────┘    └──────────────┬────────────┘    │  │
  │  │                                               ▲                 │  │
  │  │                               ┌───────────────┘ Inicializa      │  │
  │  │                               │                 bucket          │  │
  │  │                  ┌────────────┴────────────────────────────┐    │  │
  │  │                  │          maia-minio-init                │    │  │
  │  │                  │       Crea bucket mlflow                │    │  │
  │  │                  │           (job único)                   │    │  │
  │  │                  └─────────────────────────────────────────┘    │  │
  │  └──────────────────────────────────────────────────────────────────┘  │
  └────────────────────────────────────────────────────────────────────────┘
```

#### Tabla de puertos

| Servicio | Contenedor | URL / Host | Puerto Host | Puerto Interno |
|---|---|---|---|---|
| Frontend (React) | `maia-frontend` | http://localhost:3000 | 3000 | 3000 |
| API (FastAPI) | `maia-valuation-api` | http://localhost:8001 | 8001 | 8001 |
| MLflow UI | `maia-mlflow` | http://localhost:5001 | 5001 | 5001 |
| Postgres (MLflow backend) | `maia-postgres` | localhost:5433 | 5433 | 5432 |
| MinIO S3 API | `maia-minio` | http://localhost:9000 | 9000 | 9000 |
| MinIO Console (UI) | `maia-minio` | http://localhost:9001 | 9001 | 9001 |

#### Credenciales por defecto (solo desarrollo)

**Postgres**
- DB: `mlflow` | User: `mlflow` | Password: `mlflow`

**MinIO Console**
- User: `minio` | Password: `minio123456`

---

### 7. Cómo correr el stack local con Docker Compose

Desde la raíz del repositorio:

```bash
# Levantar todos los servicios (con build)
docker compose up --build

# En segundo plano
docker compose up --build -d

# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f valuation-api
docker compose logs -f frontend
docker compose logs -f mlflow

# Detener el stack (conserva volúmenes)
docker compose down

# Detener y eliminar volúmenes (borra datos de Postgres y MinIO)
docker compose down -v
```

> **Nota sobre el frontend:** `VITE_API_BASE_URL` es una variable de **build time**. Si cambias la URL del API después del build, debes reconstruir la imagen (`docker compose up --build frontend`).

#### Persistencia de datos

Los datos persisten entre reinicios gracias a volúmenes Docker:
- `pgdata` → metadata de experimentos/runs de MLflow
- `miniodata` → artefactos del modelo (pkl, gráficos, etc.)

Solo se borran al ejecutar `docker compose down -v`.

---

## Ambiente AWS Academy (Productivo)

El ambiente productivo se despliega en **Amazon ECS con Fargate** en la cuenta de AWS Academy. Las imágenes Docker se almacenan en **Amazon ECR**.

### Arquitectura AWS

```text
  ┌───────────────────────────────────────────┐
  │ Internet                                  │
  │  ┌─────────────────────────────────────┐  │
  │  │      Usuario Final / Navegador      │  │
  │  └─────────────────┬───────────────────┘  │
  └───────────────────────────────────────────┘
                        │ HTTP :3000
                        ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │ AWS Academy – us-east-1 (cuenta: 526537081285)                        │
  │                                                                       │
  │  ┌─── Amazon ECR ──────────────────────────────────────────────────┐  │
  │  │  ┌────────────────────────────┐  ┌──────────────────────────┐  │  │
  │  │  │    maia-proyecto-final     │  │      maia-frontend       │  │  │
  │  │  │       (imagen API)         │  │   (imagen Frontend)      │  │  │
  │  │  └─────────────┬──────────────┘  └────────────┬─────────────┘  │  │
  │  └────────────────│──────────────────────────────│────────────────┘  │
  │                   │ pull                          │ pull              │
  │                   ▼                              ▼                   │
  │  ┌─── Amazon ECS Cluster: maia-proyecto-final-ecs ─────────────────┐ │
  │  │                                                                  │ │
  │  │  ┌─── Servicio API: maia-proyecto-final-service ─────────────┐  │ │
  │  │  │  Task Def: maia-proyecto-final-task                       │  │ │
  │  │  │  ┌──────────────────────────────────────────────────┐    │  │ │
  │  │  │  │  maia-proyecto-final-cnt  │  FastAPI :8001        │    │  │ │
  │  │  │  └──────────────────────────────────────────────────┘    │  │ │
  │  │  └───────────────────────────────────────────────────────────┘  │ │
  │  │                              ▲ HTTP :8001                        │ │
  │  │  ┌─── Servicio Frontend: maia-frontend-service ──────────────┐  │ │
  │  │  │  Task Def: maia-proyecto-final-frontend-task              │  │ │
  │  │  │  ┌──────────────────────────────────────────────────┐     │  │ │
  │  │  │  │ maia-proyecto-final-frontend-cnt                 │     │  │ │
  │  │  │  │ React/serve :3000                                │     │  │ │
  │  │  │  └──────────────────────────────────────────────────┘     │  │ │
  │  │  └───────────────────────────────────────────────────────────┘  │ │
  │  └──────────────────────────────────────────────────────────────────┘ │
  └───────────────────────────────────────────────────────────────────────┘
```

#### Recursos AWS nombrados

| Recurso | API | Frontend |
|---|---|---|
| ECR Repository | `maia-proyecto-final` | `maia-frontend` |
| ECS Cluster | `maia-proyecto-final-ecs` | `maia-proyecto-final-ecs` |
| Task Definition | `maia-proyecto-final-task` | `maia-proyecto-final-frontend-task` |
| Contenedor | `maia-proyecto-final-cnt` | `maia-proyecto-final-frontend-cnt` |
| Servicio ECS | `maia-proyecto-final-service` | `maia-proyecto-final-frontend-service` |

---

### Conexión a AWS Academy

#### 1. Instalar AWS CLI

```bash
# Verifica si ya está instalado
aws --version
# Esperado: aws-cli/2.x.x Python/3.x Darwin/... exe/arm64
```

Si no está instalado, sigue las [instrucciones oficiales](https://docs.aws.amazon.com/es_es/cli/latest/userguide/getting-started-install.html).

#### 2. Configurar credenciales

Las credenciales de AWS Academy se renuevan en cada sesión. Obténlas desde el panel de AWS Academy → **AWS Details** → **AWS CLI**.

```bash
aws configure
```

Ingresa los datos solicitados:
- **AWS Access Key ID** (desde AWS Academy)
- **AWS Secret Access Key** (desde AWS Academy)
- **AWS Session Token** (desde AWS Academy — requerido en Academy)
- **Default region:** `us-east-1`
- **Default output format:** (Enter para omitir)

> **Alternativa rápida:** copia el bloque de variables de entorno desde AWS Academy → **AWS Details** y pégalo directamente en tu terminal:
> ```bash
> export AWS_ACCESS_KEY_ID=...
> export AWS_SECRET_ACCESS_KEY=...
> export AWS_SESSION_TOKEN=...
> ```

#### 3. Verificar la conexión

```bash
aws iam list-users
# Respuesta esperada: {"Users": []}
```

---

### Preparación y Despliegue en AWS — API (`valuation-api/`)

#### Prerequisitos

- [x] Docker Desktop instalado y corriendo
- [x] AWS CLI configurado con credenciales válidas
- [x] Repositorio ECR `maia-proyecto-final` creado
- [x] Cluster ECS `maia-proyecto-final-ecs` creado
- [x] Task definition `maia-proyecto-final-task` definida con contenedor `maia-proyecto-final-cnt`
- [x] Task definition `maia-proyecto-final-frontend-task` definida con contenedor `maia-proyecto-final-frontend-cnt`
- [x] Servicio ECS `maia-proyecto-final-service` creado
- [x] Servicio ECS `maia-proyecto-final-frontend-service` creado

#### Validar existencia del repositorio ECR

```bash
aws ecr describe-repositories --repository-names maia-proyecto-final >/dev/null 2>&1 && echo "Existe" || echo "No existe"
```

#### Build de la imagen Docker

```bash
cd valuation-api
docker build -t valuation-api:latest .
```

#### Publicar en ECR

```bash
# 1. Autenticarse en ECR
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin \
    526537081285.dkr.ecr.us-east-1.amazonaws.com

# 2. Taggear la imagen
docker tag valuation-api:latest \
  526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final:latest

# 3. Publicar
docker push 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final:latest
```

**Alternativa: build y push en un solo paso (multi-plataforma)**

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final:latest \
  --push .
```

#### Forzar nuevo despliegue en ECS

```bash
aws ecs update-service \
  --cluster maia-proyecto-final-ecs \
  --service maia-proyecto-final-service \
  --force-new-deployment
```

---

### Preparación y Despliegue en AWS — Frontend (`frontend/`)

#### Prerequisitos

- Repositorio ECR `maia-proyecto-final-frontend` creado
- Task definition `maia-proyecto-final-frontend-task` definida con contenedor `maia-proyecto-final-frontend-cnt`
- Servicio ECS `maia-proyecto-final-frontend-service` creado
- La **URL pública de la API** debe conocerse antes del build (es una variable de build time)

#### Validar existencia del repositorio ECR

```bash
aws ecr describe-repositories --repository-names maia-proyecto-final-frontend >/dev/null 2>&1 && echo "Existe" || echo "No existe"
```

#### Build de la imagen Docker

Reemplaza `<URL_PUBLICA_API>` con la IP o DNS público del servicio de la API en ECS:

```bash
cd frontend

docker build \
  --build-arg VITE_API_BASE_URL=http://<URL_PUBLICA_API>:8001 \
  -t maia-proyecto-final-frontend:latest .
```

#### Publicar en ECR

```bash
# 1. Autenticarse en ECR
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin \
    526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final-frontend

# 2. Taggear la imagen
docker tag maia-frontend:latest \
  526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final-frontend

# 3. Publicar
docker push 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final-frontend
```

**Alternativa: build y push en un solo paso**

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg VITE_API_BASE_URL=http://<URL_PUBLICA_API>:8001 \
  -t 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final-frontend:latest \
  --push .
```

```bash
docker buildx build \     
  --platform linux/amd64,linux/arm64 \
  --build-arg VITE_API_BASE_URL=http://35.153.161.232:8001 \
  -t 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final-frontend:latest \
  --push .
```
#### Forzar nuevo despliegue en ECS

```bash
aws ecs update-service \
  --cluster maia-proyecto-final-ecs \
  --service maia-proyecto-final-frontend-service \
  --force-new-deployment
```

---

### Ejecución de MLflow con Docker Compose (solo local)

El stack de MLflow (tracking + Postgres + MinIO) está disponible únicamente en el ambiente local a través de Docker Compose. Consulta la sección [Cómo correr el stack local con Docker Compose](#7-cómo-correr-el-stack-local-con-docker-compose) para los comandos de operación.
