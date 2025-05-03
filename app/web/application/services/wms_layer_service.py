from app.shared.infrastructure.utils.wms import get_wms_info, get_wms_feature_info, WebMapServiceInfoModel, \
    FeatureInfoResultModel
from app.web.application.dtos.wms_layer_dto import WebMapServiceResponseDTO, WebMapServiceRequestDTO, \
    FeatureWebMapServiceResponseDTO, FeatureWebMapServiceInformationResponseDTO, WebMapServiceFeatureRequestDTO, \
    LayerResponseDTO, StyleResponseDTO, ExportResponseDTO


class WmsLayerService:
    def __init__(self):
        pass

    async def get_information(
            self, request: WebMapServiceRequestDTO
    ) -> WebMapServiceResponseDTO:
        result: WebMapServiceInfoModel = get_wms_info(request.url, request.filters)
        return self.____map_web_map_service_information(result)

    async def get_features(
            self, request: WebMapServiceFeatureRequestDTO
    ) -> list[FeatureWebMapServiceResponseDTO]:
        results: list[FeatureInfoResultModel] = get_wms_feature_info(
            request.url,
            request.x,
            request.y,
            request.width,
            request.height,
            request.bounding_box,
            request.layers,
            request.filters
        )
        return self.__map_features_web_map_service_information(results)

    @staticmethod
    def ____map_web_map_service_information(result: WebMapServiceInfoModel) -> WebMapServiceResponseDTO:
        return WebMapServiceResponseDTO(
            url=result.url,
            name=result.name,
            title=result.title,
            version=result.version,
            description=result.description,
            keywords=[],
            operations=result.operations,
            layers=[
                LayerResponseDTO(
                    name=layer.name,
                    title=layer.title,
                    abstract=layer.abstract,
                    keywords=layer.keywords,
                    bounding_box=layer.bounding_box,
                    thumbnail=layer.thumbnail,
                    styles=[
                        StyleResponseDTO(**style.model_dump()) for style in layer.styles
                    ],
                    exports=[
                        ExportResponseDTO(**export.model_dump()) for export in layer.export_urls
                    ]
                )
                for layer in result.layers
            ]
        )

    @staticmethod
    def __map_features_web_map_service_information(results: list[FeatureInfoResultModel]) -> list[
        FeatureWebMapServiceResponseDTO]:
        return [
            FeatureWebMapServiceResponseDTO(
                information=[
                    FeatureWebMapServiceInformationResponseDTO(
                        key=feature.key,
                        value=feature.value,
                    )
                    for feature in result.informacion
                ]
            )
            for result in results
        ]
