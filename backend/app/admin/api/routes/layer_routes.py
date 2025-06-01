from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_layer_service
from app.admin.application.dtos.layer_dto import LayerDTO, LayerFormDTO
from app.shared.models.response import Response

layer_router = APIRouter()


@layer_router.get("/", response_model=Response[list[LayerDTO]])
async def get_all(service=Depends(get_layer_service)) -> Response[list[LayerDTO]]:
    return Response.correct(await service.get_all())


@layer_router.post("/", response_model=Response[str])
async def create(layer_form_dto: LayerFormDTO, service=Depends(get_layer_service)) -> Response[str]:
    return Response.correct(await service.create(layer_form_dto))


@layer_router.get("/{layer_id}", response_model=Response[LayerFormDTO])
async def get_by_id(layer_id: str, service=Depends(get_layer_service)) -> Response[LayerFormDTO]:
    return Response.correct(await service.get_by_id(layer_id))


@layer_router.put("/{layer_id}", response_model=Response[str])
async def update(layer_id: str, layer_form_dto: LayerFormDTO, service=Depends(get_layer_service)) -> \
        Response[str]:
    return Response.correct(await service.update(layer_id, layer_form_dto))


@layer_router.delete("/{layer_id}", response_model=Response[str])
async def delete(layer_id: str, service=Depends(get_layer_service)) -> Response[str]:
    return Response.correct(await service.delete(layer_id))
