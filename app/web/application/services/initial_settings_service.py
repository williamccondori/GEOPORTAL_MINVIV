from datetime import datetime

from app.web.application.dtos.base_layer_dto import BaseLayerDTO
from app.web.application.dtos.initial_settings_dto import InitialSettingsDTO
from app.web.domain.models.base_layer import BaseLayer
from app.web.domain.models.initial_settings import InitialSettings
from app.web.domain.repositories.base_layer_repository import BaseLayerRepository
from app.web.domain.repositories.initial_settings_repository import InitialSettingsRepository


class InitialSettingsService:
    def __init__(self,
                 initial_settings_repository: InitialSettingsRepository,
                 base_layer_repository: BaseLayerRepository,
                 ):
        self.initial_settings_repository = initial_settings_repository
        self.base_layer_repository = base_layer_repository

    async def get(self) -> InitialSettingsDTO:
        initial_settings: InitialSettings = await self.initial_settings_repository.get_unique()
        if initial_settings is None:
            initial_settings = InitialSettings(
                id=None,
                lat_long=[0.0, 0.0],
                zoom=1,
                has_attribution=False,
                default_base_layer_id=None,
                default_wms_layer_ids=[],
                status=True,
                user_created="SYSTEM",
                created_at=datetime.now()
            )
        base_layers_dto: list[BaseLayerDTO] = []
        base_layers: list[BaseLayer] = await self.base_layer_repository.get_all()
        for base_layer in base_layers:
            base_layers_dto.append(BaseLayerDTO(
                id=base_layer.id,
                name=base_layer.name,
                url=base_layer.url,
                attribution=base_layer.attribution
            ))

        wms_layers_dto = []
        # for wms_layer in initial_settings.wms_layers:
        #     pass

        return InitialSettingsDTO(
            lat_long=initial_settings.lat_long,
            zoom=initial_settings.zoom,
            has_attribution=initial_settings.has_attribution,
            base_layers=base_layers_dto,
            default_base_layer_id=initial_settings.default_base_layer_id,
            wms_layers=wms_layers_dto,
            default_wms_layer_ids=initial_settings.default_wms_layer_ids,
        )
