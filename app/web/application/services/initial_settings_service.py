from app.admin.application.dtos.base_layer_dto import BaseLayerDTO
from app.admin.application.dtos.wms_layer_dto import WmsLayerDTO
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.web.application.dtos.initial_settings_dto import InitialSettingsDTO
from app.web.domain.repositories.initial_settings_repository import InitialSettingsRepository


class InitialSettingsService:
    def __init__(self, initial_settings_repository: InitialSettingsRepository):
        self.initial_settings_repository = initial_settings_repository

    async def get(self) -> InitialSettingsDTO:
        initial_settings = await self.initial_settings_repository.get()
        if initial_settings is None:
            raise NotFoundException("Configuración inicial")

        base_layers_dto = []
        for base_layer in initial_settings.base_layers:
            base_layers_dto.append(
                BaseLayerDTO(
                    id=base_layer.id,
                    name=base_layer.name,
                    url=base_layer.url,
                    attribution=base_layer.attribution,
                )
            )

        wms_layers_dto = []
        for wms_layer in initial_settings.wms_layers:
            wms_layers_dto.append(
                WmsLayerDTO(
                    id=wms_layer.id,
                    name=wms_layer.name,
                    url=wms_layer.url,
                    attribution=wms_layer.attribution
                )
            )

        return InitialSettingsDTO(
            latLng=initial_settings.latLng,
            zoom=initial_settings.zoom,
            has_attribution=initial_settings.has_attribution,
            base_layers=base_layers_dto,
            default_base_layer_id=initial_settings.default_base_layer_id,
            wms_layers=wms_layers_dto,
            default_wms_layer_ids=initial_settings.default_wms_layer_ids,
        )
