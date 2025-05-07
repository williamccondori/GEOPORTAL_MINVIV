from fastapi import APIRouter, Depends

from app.shared.models.response import Response
from app.web.api.dependencies import get_initial_settings_service
from app.web.application.dtos.initial_settings_dto import InitialSettingsDTO

initial_settings_router = APIRouter()


@initial_settings_router.get("/", response_model=Response[InitialSettingsDTO])
async def get(
        service=Depends(get_initial_settings_service),
) -> Response[InitialSettingsDTO]:
    return Response.correct(await service.get())
