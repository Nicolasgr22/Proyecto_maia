FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# xgboost en linux suele necesitar libgomp1 (OpenMP).
# build-essential ayuda si alguna dep compila.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
 && rm -rf /var/lib/apt/lists/*

# Instala tus dependencias
COPY Model/requirements.txt /app/Model/requirements.txt
RUN pip install --no-cache-dir -r /app/Model/requirements.txt

# Copia el código (aunque luego lo montas con volumes)
COPY Model /app/Model
COPY Data /app/Data