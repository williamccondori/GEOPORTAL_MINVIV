from fastapi import APIRouter, Depends

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


@layer_router.get("/{layer_id}/tables/", response_model=Response[LayerInformationTableDTO])
async def get_table(
        layer_id: str,
        service=Depends(get_layer_service)
) -> Response[LayerInformationTableDTO]:
    return Response.correct(await service.get_table(layer_id))
