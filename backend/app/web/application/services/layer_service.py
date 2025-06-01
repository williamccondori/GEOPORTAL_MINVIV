from app.web.application.dtos.layer_dto import LayerSearchDTO, LayerDTO
from app.web.domain.models.layer import Layer
from app.web.domain.models.wms_layer import WmsLayer
from app.web.domain.repositories.category_repository import CategoryRepository
from app.web.domain.repositories.layer_repository import LayerRepository
from app.web.domain.repositories.wms_layer_repository import WmsLayerRepository


class LayerService:
    def __init__(self, layer_repository: LayerRepository, wms_layer_repository: WmsLayerRepository,
                 category_repository: CategoryRepository):
        self.layer_repository = layer_repository
        self.wms_layer_repository = wms_layer_repository
        self.category_repository = category_repository

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
                name=layer.code,
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
                    description=wms_layer.description,
                    url=wms_layer.url
                ))

        return result
