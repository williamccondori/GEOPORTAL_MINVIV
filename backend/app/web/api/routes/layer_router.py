from fastapi import APIRouter, Depends, Body

from app.shared.models.response import Response
from app.web.api.dependencies import get_layer_service
from app.web.application.dtos.layer_dto import LayerSearchDTO, LayerDTO
from app.web.application.dtos.layer_information_dto import LayerInformationTableDTO

layer_router = APIRouter()


@layer_router.get("/", response_model=Response[list[LayerDTO]])
async def get_all(
        layer_search_dto: LayerSearchDTO = Depends(LayerSearchDTO),
        service=Depends(get_layer_service)
) -> Response[list[LayerDTO]]:
    return Response.correct(await service.get_all(layer_search_dto))


@layer_router.get("/{layer_id}/", response_model=Response[LayerDTO])
async def get_by_id(
        layer_id: str,
        service=Depends(get_layer_service)
) -> Response[LayerDTO]:
    return Response.correct(await service.get_by_id(layer_id))


@layer_router.get("/{layer_id}/tables/", response_model=Response[LayerInformationTableDTO])
async def get_table(
        layer_id: str,
        service=Depends(get_layer_service)
) -> Response[LayerInformationTableDTO]:
    return Response.correct(await service.get_table(layer_id))


@layer_router.post("/{layer_id}/filter/", response_model=Response[dict])
async def filter_table(
        layer_id: str,
        filter_columns: dict = Body(...),
        service=Depends(get_layer_service)
) -> Response[LayerInformationTableDTO]:
    return Response.correct(await service.filter_table(layer_id, filter_columns))


@layer_router.get("/{layer_id}/geojson/{row_id}", response_model=Response[dict])
async def get_geojson(
        layer_id: str,
        row_id: str,
        service=Depends(get_layer_service)
) -> Response[dict]:
    return Response.correct(await service.get_geojson(layer_id, row_id))


@layer_router.get("/{layer_id}/summary/", response_model=Response[dict])
async def get_summary(
        layer_id: str,
        service=Depends(get_layer_service)
) -> Response[dict]:
    return Response.correct(await service.get_summary(layer_id))


@layer_router.get("/{layer_id}/graphs/", response_model=Response[dict])
async def get_graphs(
        layer_id: str,
        service=Depends(get_layer_service)
) -> Response[dict]:
    return Response.correct(await service.get_graphs(layer_id))


@layer_router.get("/{layer_id}/tendencies/", response_model=Response[dict])
async def get_tendencies(
        layer_id: str,
        service=Depends(get_layer_service)
) -> Response[dict]:
    return Response.correct(await service.get_tendencies(layer_id))
