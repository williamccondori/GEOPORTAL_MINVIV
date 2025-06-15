from typing import Optional

from app.shared.domain.exceptions.application_exception import ApplicationException
from app.web.application.dtos.layer_dto import LayerSearchDTO, LayerDTO
from app.web.application.dtos.layer_information_dto import LayerInformationTableDTO, LayerInformationFilterDTO, \
    LayerInformationOptionDTO
from app.web.domain.models.layer import Layer
from app.web.domain.models.layer_information_table import LayerInformationTable
from app.web.domain.models.wms_layer import WmsLayer
from app.web.domain.repositories.category_repository import CategoryRepository
from app.web.domain.repositories.layer_information_repository import LayerInformationRepository
from app.web.domain.repositories.layer_repository import LayerRepository
from app.web.domain.repositories.wms_layer_repository import WmsLayerRepository


class LayerService:
    def __init__(self, layer_repository: LayerRepository, wms_layer_repository: WmsLayerRepository,
                 category_repository: CategoryRepository, layer_information_repository: LayerInformationRepository):
        self.layer_repository = layer_repository
        self.wms_layer_repository = wms_layer_repository
        self.category_repository = category_repository
        self.layer_information_repository = layer_information_repository

    async def get_by_id(self, layer_id: str) -> LayerDTO:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        category = await self.category_repository.get(layer.category_id)
        if category:
            category_name = category.name
        else:
            category_name = "Sin categoría"

        return LayerDTO(
            id=layer.id,
            category_name=category_name,
            name=layer.code,
            title=layer.name,
            description=layer.description,
            url=layer.wms_url,
            download_url=layer.wfs_url
        )

    async def get_all(self, layer_search_dto: LayerSearchDTO) -> list[LayerDTO]:
        result: list[LayerDTO] = []

        layers: list[Layer] = await self.layer_repository.get_all({
            "category_id": layer_search_dto.category_id,
            "is_visible": True
        })

        for layer in layers:
            category = await self.category_repository.get(layer.category_id)
            if category:
                category_name = category.name
            else:
                category_name = "Sin categoría"

            result.append(LayerDTO(
                id=layer.id,
                category_name=category_name,
                name=layer.view_name,
                title=layer.name,
                description=layer.description,
                url=layer.wms_url,
                download_url=layer.wfs_url
            ))

        if layer_search_dto.include_wms_layers:
            wms_layers: list[WmsLayer] = await self.wms_layer_repository.get_all({
                "category_id": layer_search_dto.category_id,
                "is_visible": True
            })
            for wms_layer in wms_layers:
                category = await self.category_repository.get(wms_layer.category_id)
                if category:
                    category_name = category.name
                else:
                    category_name = "Sin categoría"

                result.append(LayerDTO(
                    id=wms_layer.id,
                    category_name=category_name,
                    name=wms_layer.code,
                    title=wms_layer.name,
                    description="WMS",
                    url=wms_layer.url
                ))

        return result

    async def get_geojson(self, layer_id: str, row_id: str) -> dict:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        geojson = await self.layer_information_repository.get_geojson(layer.layer_information_name, row_id)
        if not geojson:
            raise ApplicationException("No se ha encontrado información geográfica para la capa solicitada")

        return geojson

    async def get_table(self, layer_id: str) -> LayerInformationTableDTO:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        table_information: Optional[LayerInformationTable] = await self.layer_information_repository.get_table(
            layer.layer_information_name)
        if not table_information:
            raise ApplicationException("No se ha encontrado información tabular para la capa solicitada")

        return LayerInformationTableDTO(
            columns=table_information.columns,
            data=table_information.data,
            filters=[
                LayerInformationFilterDTO(
                    name=x.name,
                    options=[LayerInformationOptionDTO(id=label.id, label=label.label) for label in x.options]
                )
                for x in table_information.filters
            ]
        )

    async def filter_table(self, layer_id: str, filter_columns: dict) -> dict:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        results = await self.layer_information_repository.get_geometry_and_table(
            layer.layer_information_name, filter_columns)

        return results
