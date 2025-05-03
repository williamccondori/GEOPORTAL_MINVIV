from fastapi import APIRouter, Depends

from app.shared.models.response import Response
from app.web.api.dependencies import get_location_service
from app.web.application.dtos.location_dto import CoordinatesRequestDTO, CoordinatesResponseDTO, LocationRequestDTO, \
    LocationResponseDTO

location_router = APIRouter()


@location_router.get("/coordinates/", response_model=Response[CoordinatesResponseDTO])
async def get_coordinate(
        request: CoordinatesRequestDTO = Depends(),
        service=Depends(get_location_service)) -> Response[CoordinatesResponseDTO]:
    return Response.correct(await service.get_coordinate(request))


@location_router.get("/", response_model=Response[list[LocationResponseDTO]])
async def get_all_locations(
        request: LocationRequestDTO = Depends(),
        service=Depends(get_location_service)) -> Response[list[LocationResponseDTO]]:
    return Response.correct(await service.get_all_locations(request))
