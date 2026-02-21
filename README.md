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

