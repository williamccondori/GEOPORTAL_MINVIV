from fastapi import Depends

from app.web.application.services.base_layer_service import BaseLayerService
from app.web.application.services.chat_service import ChatService
from app.web.application.services.initial_settings_service import InitialSettingsService
from app.web.application.services.location_service import LocationService
from app.web.application.services.wms_layer_service import WmsLayerService
from app.web.domain.repositories.base_layer_repository import BaseLayerRepository
from app.web.domain.repositories.initial_settings_repository import InitialSettingsRepository
from app.web.infrastructure.persistence.repository.base_layer_repository_impl import BaseLayerRepositoryImpl
from app.web.infrastructure.persistence.repository.initial_settings_repository_impl import InitialSettingsRepositoryImpl


def get_base_layer_service(
        base_layer_repository: BaseLayerRepository = Depends(BaseLayerRepositoryImpl)
):
    return BaseLayerService(base_layer_repository)


def get_wms_layer_service():
    return WmsLayerService()


def get_location_service():
    return LocationService()


def get_initial_settings_service(
        initial_settings_repository: InitialSettingsRepository = Depends(InitialSettingsRepositoryImpl),
        base_layer_repository: BaseLayerRepository = Depends(BaseLayerRepositoryImpl)
):
    return InitialSettingsService(initial_settings_repository, base_layer_repository)


def get_chat_service():
    return ChatService()
