from datetime import datetime

from app.admin.application.dtos.base_layer_dto import BaseLayerDTO
from app.admin.application.dtos.initial_settings_dto import InitialSettingsDTO
from app.admin.domain.models.initial_settings import InitialSettings
from app.admin.domain.repositories.initial_settings_repository import InitialSettingsRepository


class InitialSettingsService:
    def __init__(self, initial_settings_repository: InitialSettingsRepository):
        self.initial_settings_repository = initial_settings_repository

    def update(self, initial_settings_dto: InitialSettingsDTO):
        initial_settings = self.initial_settings_repository.get_unique()
        if not initial_settings:
        #     base_layer = BaseLayer(
        #         name=base_layer_dto.name,
        #         url=base_layer_dto.url,
        #         attribution=base_layer_dto.attribution,
        #         status=True,
        #         user_created=self.user_authenticated,
        #         created_at=datetime.now()
        #     )
        #
        # base_layer = await self.base_layer_repository.save(base_layer)

            initial_settings = InitialSettings(
                lat_long=initial_settings_dto.lat_long,
                zoom=initial_settings_dto.zoom,
                has_attribution=initial_settings_dto.has_attribution,
                default_base_layer_id=initial_settings_dto.default_base_layer_id,
                default_wms_layer_ids=initial_settings_dto.default_wms_layer_ids,
                user_created=self.user_authenticated,
                created_at=datetime.now(),
            )

            initial_settings = self.initial_settings_repository.create(

            )
        else:
            initial_settings = initial_settings_dto


