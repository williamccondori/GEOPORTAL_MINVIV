from typing import List

from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_wms_layer_service
from app.shared.models.response import Response
from app.admin.application.dtos.wms_layer_dto import WmsLayerDTO, WmsLayerCreateDTO

# noinspection DuplicatedCode
wms_layer_router = APIRouter(
    dependencies=[Depends(get_wms_layer_service)]
)


@wms_layer_router.get("/", response_model=Response[List[WmsLayerDTO]])
async def get_all(service=Depends(get_wms_layer_service)) -> Response[List[WmsLayerDTO]]:
    return Response.correct(await service.get_all())


@wms_layer_router.post("/", response_model=Response[str])
async def create(wms_layer_dto: WmsLayerCreateDTO, service=Depends(get_wms_layer_service)) -> Response[str]:
    return Response.correct(await service.create(wms_layer_dto))


@wms_layer_router.get("/{wms_layer_id}", response_model=Response[WmsLayerDTO])
async def get_by_id(wms_layer_id: str, service=Depends(get_wms_layer_service)) -> Response[WmsLayerDTO]:
    return Response.correct(await service.get_by_id(wms_layer_id))


@wms_layer_router.put("/{wms_layer_id}", response_model=Response[str])
async def update(wms_layer_id: str, wms_layer_dto: WmsLayerCreateDTO, service=Depends(get_wms_layer_service)) -> \
        Response[str]:
    return Response.correct(await service.update(wms_layer_id, wms_layer_dto))


@wms_layer_router.delete("/{wms_layer_id}", response_model=Response[str])
async def delete(wms_layer_id: str, service=Depends(get_wms_layer_service)) -> Response[str]:
    return Response.correct(await service.delete(wms_layer_id))
