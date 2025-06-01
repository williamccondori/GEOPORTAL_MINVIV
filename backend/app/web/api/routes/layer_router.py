from fastapi import APIRouter, Depends

from app.shared.models.response import Response
from app.web.api.dependencies import get_layer_service
from app.web.application.dtos.layer_dto import LayerSearchDTO, LayerDTO

layer_router = APIRouter()


@layer_router.get("/", response_model=Response[list[LayerDTO]])
async def get_all(
        layer_search_dto: LayerSearchDTO = Depends(LayerSearchDTO),
        service=Depends(get_layer_service)
) -> Response[list[LayerDTO]]:
    return Response.correct(await service.get_all(layer_search_dto))
