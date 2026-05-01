# MAIA · Frontend 2 — React

Aplicación React de valoración inmobiliaria. Se conecta con el API de MAIA para obtener estimaciones de precio y datos de mercado.

---

## Configuración del endpoint del API

El frontend se conecta al API a través de la variable de entorno `VITE_API_BASE_URL`.

**Valor por defecto:** `http://localhost:8001`

### Cambiar la URL del API

1. Crea un archivo `.env` en la raíz del proyecto `frontend/`:
   ```
   VITE_API_BASE_URL=http://tu-servidor:8001
   ```
2. O bien, edita directamente el archivo `src/config.js`:
   ```js
   export const API_BASE = 'http://tu-servidor:8001';
   ```

> **Importante:** `VITE_API_BASE_URL` es una variable de *build time* (Vite la embebe en el bundle estático). Si cambias la URL después del build, debes reconstruir la imagen o la aplicación.

---

## Ejecución local (sin Docker)

### Requisitos
- Node.js 18+

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) Configurar URL del API
cp .env.example .env
# Edita .env y ajusta VITE_API_BASE_URL

# 3. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`.

### Build de producción local

```bash
npm run build
npm run serve
```

---

## Empaquetar en imagen Docker

### Build de la imagen

```bash
# Con URL por defecto (localhost:8001)
docker build -t maia-frontend2 .

# Con URL personalizada del API
docker build \
  --build-arg VITE_API_BASE_URL=http://api.mi-servidor.com:8001 \
  -t maia-frontend2 .
```

### Ejecutar el contenedor

```bash
docker run -d -p 3000:3000 --name maia-frontend2 maia-frontend2
```

La app estará disponible en `http://localhost:3000`.

### Usando Docker Compose (ejemplo)

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend2
      args:
        VITE_API_BASE_URL: http://valuation-api:8001
    ports:
      - "3000:3000"
    depends_on:
      - valuation-api

  valuation-api:
    build: ./valuation-api
    ports:
      - "8001:8001"
```

---

## Endpoints del API utilizados

| Endpoint       | Método | Descripción                          |
|----------------|--------|--------------------------------------|
| `/valuations`  | POST   | Obtiene la valoración del inmueble   |
| `/prices`      | POST   | Obtiene datos históricos de precios  |

### Ejemplo de payload para `/valuations`

```json
{
  "bedrooms": 3,
  "bathrooms": 2.0,
  "sqft_living": 1500.0,
  "sqft_lot": 5000.0,
  "floors": 1.0,
  "waterfront": null,
  "view": null,
  "condition": 3,
  "grade": 7,
  "sqft_above": 1500.0,
  "sqft_basement": null,
  "yr_built": 1995,
  "yr_renovated": null,
  "zipcode": null,
  "lat": 47.5112,
  "long": -122.2571,
  "sqft_living15": null,
  "sqft_lot15": null
}
```

---

## Estructura del proyecto

```
frontend2/
├── src/
│   ├── App.jsx                    # Lógica principal, estado y llamadas al API
│   ├── config.js                  # URL del API (configurable)
│   ├── index.css                  # Estilos globales (Material Design 3)
│   ├── main.jsx                   # Punto de entrada React
│   └── components/
│       ├── TopNav.jsx             # Barra de navegación superior
│       ├── Counter.jsx            # Componente contador +/-
│       ├── MapPicker.jsx          # Mapa King County (react-leaflet)
│       ├── Step1PropertyForm.jsx  # Pantalla 1: Datos del Inmueble
│       ├── Step2Valuation.jsx     # Pantalla 2: Tu Valoración
│       ├── Step3Analysis.jsx      # Pantalla 3: Análisis de Mercado
│       ├── LoadingOverlay.jsx     # Overlay de carga
│       └── Toast.jsx              # Notificaciones toast
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile
├── .env.example
└── README.md
```
