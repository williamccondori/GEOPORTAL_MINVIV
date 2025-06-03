from fastapi import Depends

from app.web.application.services.base_layer_service import BaseLayerService
from app.web.application.services.category_service import CategoryService
from app.web.application.services.chat_service import ChatService
from app.web.application.services.initial_settings_service import InitialSettingsService
from app.web.application.services.layer_service import LayerService
from app.web.application.services.location_service import LocationService
from app.web.application.services.wms_layer_service import WmsLayerService
from app.web.domain.repositories.base_layer_repository import BaseLayerRepository
from app.web.domain.repositories.category_repository import CategoryRepository
from app.web.domain.repositories.initial_settings_repository import InitialSettingsRepository
from app.web.domain.repositories.layer_information_repository import LayerInformationRepository
from app.web.domain.repositories.layer_repository import LayerRepository
from app.web.domain.repositories.wms_layer_repository import WmsLayerRepository
from app.web.infrastructure.persistence.repository.base_layer_repository_impl import BaseLayerRepositoryImpl
from app.web.infrastructure.persistence.repository.category_repository import CategoryRepositoryImpl
from app.web.infrastructure.persistence.repository.initial_settings_repository_impl import InitialSettingsRepositoryImpl
from app.web.infrastructure.persistence.repository.layer_information_repository_impl import \
    LayerInformationRepositoryImpl
from app.web.infrastructure.persistence.repository.layer_repository_impl import LayerRepositoryImpl
from app.web.infrastructure.persistence.repository.wms_layer_repository_impl import WmsLayerRepositoryImpl


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


def get_chat_service(
        layer_repository: LayerRepository = Depends(LayerRepositoryImpl),
        layer_information_repository: LayerInformationRepository = Depends(LayerInformationRepositoryImpl)
):
    return ChatService(
        layer_repository=layer_repository,
        layer_information_repository=layer_information_repository
    )


def get_category_service(
        category_repository: CategoryRepository = Depends(CategoryRepositoryImpl),
):
    return CategoryService(category_repository)


def get_layer_service(
        layer_repository: LayerRepository = Depends(LayerRepositoryImpl),
        wms_layer_repository: WmsLayerRepository = Depends(WmsLayerRepositoryImpl),
        category_repository: CategoryRepository = Depends(CategoryRepositoryImpl),
        layer_information_repository: LayerInformationRepository = Depends(LayerInformationRepositoryImpl)
):
    return LayerService(layer_repository, wms_layer_repository, category_repository, layer_information_repository)
