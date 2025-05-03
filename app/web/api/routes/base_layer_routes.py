from typing import List

from fastapi import APIRouter, Depends

from app.shared.models.response import Response
from app.web.api.dependencies import get_base_layer_service
from app.web.application.dtos.base_layer_dto import BaseLayerDTO

# noinspection DuplicatedCode
base_layer_router = APIRouter(
    dependencies=[Depends(get_base_layer_service)]
)


@base_layer_router.get("/", response_model=Response[List[BaseLayerDTO]])
async def get_all(service=Depends(get_base_layer_service)) -> Response[List[BaseLayerDTO]]:
    return Response.correct(await service.get_all())
