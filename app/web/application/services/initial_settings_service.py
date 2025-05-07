from datetime import datetime

from app.admin.application.dtos.base_layer_dto import BaseLayerDTO
from app.admin.application.dtos.wms_layer_dto import WmsLayerDTO
from app.web.application.dtos.initial_settings_dto import InitialSettingsDTO
from app.web.domain.models.initial_settings import InitialSettings
from app.web.domain.repositories.initial_settings_repository import InitialSettingsRepository


class InitialSettingsService:
    def __init__(self, initial_settings_repository: InitialSettingsRepository):
        self.initial_settings_repository = initial_settings_repository

    async def get(self) -> InitialSettingsDTO:
        initial_settings = await self.initial_settings_repository.get()
        if initial_settings is None:
            initial_settings = InitialSettings(
                lat_long=[0, 0],
                zoom=0,
                has_attribution=False,
                base_layers=[],
                default_base_layer_id=None,
                wms_layers=[],
                default_wms_layer_ids=[],
                user_created="SYSTEM",
                status=True,
                created_at=datetime.now(),
            )

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
            lat_long=initial_settings.lat_long,
            zoom=initial_settings.zoom,
            has_attribution=initial_settings.has_attribution,
            base_layers=base_layers_dto,
            default_base_layer_id=initial_settings.default_base_layer_id,
            wms_layers=wms_layers_dto,
            default_wms_layer_ids=initial_settings.default_wms_layer_ids,
        )
