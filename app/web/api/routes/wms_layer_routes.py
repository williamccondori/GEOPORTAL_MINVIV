from fastapi import APIRouter, Depends

from app.shared.models.response import Response
from app.web.api.dependencies import get_wms_layer_service
from app.web.application.dtos.wms_layer_dto import WebMapServiceResponseDTO, WebMapServiceFeatureRequestDTO, \
    WebMapServiceRequestDTO, FeatureWebMapServiceResponseDTO

# noinspection DuplicatedCode
wms_layer_router = APIRouter(
    dependencies=[Depends(get_wms_layer_service)]
)


@wms_layer_router.get("/", response_model=Response[WebMapServiceResponseDTO])
async def get_information(
        request: WebMapServiceRequestDTO = Depends(),
        service=Depends(get_wms_layer_service)) -> Response[WebMapServiceResponseDTO]:
    return Response.correct(await service.get_information(request))


@wms_layer_router.get("/features/", response_model=Response[list[FeatureWebMapServiceResponseDTO]])
async def get_features(
        request: WebMapServiceFeatureRequestDTO = Depends(), service=Depends(get_wms_layer_service)) -> Response[list[
    FeatureWebMapServiceResponseDTO]]:
    return Response.correct(await service.get_features(request))
