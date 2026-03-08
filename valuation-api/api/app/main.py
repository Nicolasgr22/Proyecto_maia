from typing import Any

from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from loguru import logger

from app.api import api_router
from app.config import settings, setup_app_logging

# setup logging as early as possible
setup_app_logging(config=settings)


app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

root_router = APIRouter()

# Cuerpo de la respuesta en la raíz
@root_router.get("/")
def index(request: Request) -> Any:
    """Basic HTML response."""
    body = (
        "<html>"
        "<body style='padding: 10px;'>"
        "<h1>Welcome to the API</h1>"
        "<div>"
        "Check the docs: <a href='/docs'>here</a>"
        "</div>"
        "</body>"
        "</html>"
    )

    return HTMLResponse(content=body)

@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={"Access-Control-Allow-Origin": "*"},
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(root_router)
# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

if __name__ == "__main__":
    # Use this for debugging purposes only
    logger.warning("Running in development mode. Do not run like this in production.")
    import uvicorn

    # ejecución del servidor - host para ejecutar en servidor 
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="debug")
