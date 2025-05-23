from app.admin.application.dtos.initial_settings_dto import InitialSettingsDTO
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.initial_settings import InitialSettings
from app.admin.domain.repositories.initial_settings_repository import InitialSettingsRepository


class InitialSettingsService:
    def __init__(self, initial_settings_repository: InitialSettingsRepository, user_authenticated: str):
        self.initial_settings_repository = initial_settings_repository
        self.user_authenticated = user_authenticated

    async def get(self) -> InitialSettingsDTO:
        initial_settings: InitialSettings = await self.initial_settings_repository.get_unique()
        return InitialSettingsDTO(
            id=initial_settings.id,
            latitude=initial_settings.lat_long[0],
            longitude=initial_settings.lat_long[1],
            zoom=initial_settings.zoom,
            has_attribution=initial_settings.has_attribution,
            default_base_layer_id=initial_settings.default_base_layer_id,
            wms_layer_ids=initial_settings.default_wms_layer_ids
        )

    async def update(self, initial_settings_dto: InitialSettingsDTO) -> str:
        initial_settings: InitialSettings = await self.initial_settings_repository.get_unique()
        if not initial_settings:
            raise NotFoundException("configuraciones iniciales")
        initial_settings.update(
            lat_long=[initial_settings_dto.latitude, initial_settings_dto.longitude],
            zoom=initial_settings_dto.zoom,
            has_attribution=initial_settings_dto.has_attribution,
            default_base_layer_id=initial_settings_dto.default_base_layer_id,
            default_wms_layer_ids=initial_settings_dto.wms_layer_ids,
            user_updated=self.user_authenticated
        )
        initial_settings = await self.initial_settings_repository.save(initial_settings)

        return initial_settings.id
