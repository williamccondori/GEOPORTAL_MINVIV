from typing import List

from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_base_layer_service
from app.shared.models.response import Response
from app.admin.application.dtos.base_layer_dto import BaseLayerDTO, BaseLayerCreateDTO

# noinspection DuplicatedCode
base_layer_router = APIRouter(
    dependencies=[Depends(get_base_layer_service)]
)


@base_layer_router.get("/", response_model=Response[List[BaseLayerDTO]])
async def get_all(service=Depends(get_base_layer_service)) -> Response[List[BaseLayerDTO]]:
    return Response.correct(await service.get_all())


@base_layer_router.post("/", response_model=Response[str])
async def create(base_layer_dto: BaseLayerCreateDTO, service=Depends(get_base_layer_service)) -> Response[str]:
    return Response.correct(await service.create(base_layer_dto))


@base_layer_router.get("/{base_layer_id}", response_model=Response[BaseLayerDTO])
async def get_by_id(base_layer_id: str, service=Depends(get_base_layer_service)) -> Response[BaseLayerDTO]:
    return Response.correct(await service.get_by_id(base_layer_id))


@base_layer_router.put("/{base_layer_id}", response_model=Response[str])
async def update(base_layer_id: str, base_layer_dto: BaseLayerCreateDTO, service=Depends(get_base_layer_service)) -> \
        Response[str]:
    return Response.correct(await service.update(base_layer_id, base_layer_dto))


@base_layer_router.delete("/{base_layer_id}", response_model=Response[str])
async def delete(base_layer_id: str, service=Depends(get_base_layer_service)) -> Response[str]:
    return Response.correct(await service.delete(base_layer_id))
