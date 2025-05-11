from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_initial_settings_service
from app.admin.application.dtos.initial_settings_dto import InitialSettingsDTO
from app.shared.models.response import Response

initial_settings_router = APIRouter()


@initial_settings_router.get("/", response_model=Response[InitialSettingsDTO])
async def get(
        service=Depends(get_initial_settings_service),
) -> Response[InitialSettingsDTO]:
    return Response.correct(await service.get())

@initial_settings_router.put("/", response_model=Response[str])
async def update(
        initial_settings_dto: InitialSettingsDTO,
        service=Depends(get_initial_settings_service),
) -> Response[str]:
    return Response.correct(await service.update(initial_settings_dto))