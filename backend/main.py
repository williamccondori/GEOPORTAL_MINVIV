import os
import traceback
from typing import Any, Callable

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette import status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.admin.api.routes.auth_routes import auth_router
from app.admin.api.routes.base_layer_routes import base_layer_router
from app.admin.api.routes.category_routes import category_router
from app.admin.api.routes.file_router import file_router
from app.admin.api.routes.initial_settings_routes import initial_settings_router
from app.admin.api.routes.layer_routes import layer_router
from app.admin.api.routes.role_routes import role_router
from app.admin.api.routes.user_routes import user_router
from app.admin.api.routes.wms_layer_routes import wms_layer_router
from app.admin.domain.exceptions.not_authenticated_exception import (
    NotAuthenticatedException,
)
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.config import settings
from app.shared.models.response import Response
from app.web.api.routes.base_layer_routes import (
    base_layer_router as public_base_layer_router,
)
from app.web.api.routes.initial_settings_routes import (
    initial_settings_router as public_initial_settings_routes,
)
from app.web.api.routes.location_routes import location_router as public_location_router
from app.web.api.routes.wms_layer_routes import (
    wms_layer_router as public_wms_layer_router,
)


class CatchAllMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Any:
        try:
            return await call_next(request)
        except Exception as e:
            if isinstance(e, NotAuthenticatedException):
                status_code = status.HTTP_401_UNAUTHORIZED
                content = Response.error(e.message).dict()
            elif isinstance(e, NotFoundException):
                status_code = status.HTTP_404_NOT_FOUND
                content = Response.error(e.message).dict()
            else:
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
                trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
                content = Response.error(
                    f"app.internal_server_error:{str(e)}", trace
                ).dict()

            # Crear respuesta manual con CORS
            response = JSONResponse(status_code=status_code, content=content)
            response.headers["Access-Control-Allow-Origin"] = "http://localhost:4200"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response


def create_app():
    # Configuracion de la zona horaria.

    os.environ["TZ"] = "America/Lima"

    # Configuracion de CORS.

    ALLOW_METHODS_AND_HEADERS = ["*"]

    ORIGINS = settings.ALLOWED_ORIGINS.split(",")

    application = FastAPI(
        title="MINISTERIO DE VIVIENDA - PNVR API",
        description="API para acceso a datos abiertos del PNVR",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Add CORS middleware first
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:4200"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Then add the catch-all middleware
    application.add_middleware(CatchAllMiddleware)

    # application.mount("/static", StaticFiles(directory="static"), name="static")

    api_prefix = settings.API_V1_STR

    application.include_router(
        role_router, prefix=f"{api_prefix}/admin/roles", tags=["roles"]
    )
    application.include_router(
        user_router, prefix=f"{api_prefix}/admin/users", tags=["users"]
    )
    application.include_router(
        base_layer_router,
        prefix=f"{api_prefix}/admin/base-layers",
        tags=["base-layers"],
    )
    application.include_router(
        wms_layer_router, prefix=f"{api_prefix}/admin/wms-layers", tags=["wms-layers"]
    )

    # Auth routes
    application.include_router(auth_router, prefix=f"{api_prefix}/auth", tags=["auth"])

    application.include_router(
        initial_settings_router,
        prefix=f"{api_prefix}/admin/initial-settings",
        tags=["initial-settings"],
    )

    application.include_router(
        category_router,
        prefix=f"{api_prefix}/admin/categories",
        tags=["categories"]
    )

    application.include_router(
        file_router,
        prefix=f"{api_prefix}/admin/files",
        tags=["files"]
    )

    application.include_router(
        layer_router,
        prefix=f"{api_prefix}/admin/layers",
        tags=["layers"]
    )

    # PUBLIC ROUTES

    application.include_router(
        public_base_layer_router,
        prefix=f"{api_prefix}/base-layers",
        tags=["public-base-layers"],
    )

    application.include_router(
        public_wms_layer_router,
        prefix=f"{api_prefix}/wms-layers",
        tags=["public-wms-layers"],
    )

    application.include_router(
        public_location_router,
        prefix=f"{api_prefix}/locations",
        tags=["public-locations"],
    )

    application.include_router(
        public_initial_settings_routes,
        prefix=f"{api_prefix}/initial-settings",
        tags=["public-initial-settings"],
    )

    return application


app = create_app()
