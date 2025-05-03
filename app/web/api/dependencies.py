from fastapi import Depends

from app.web.application.services.base_layer_service import BaseLayerService
from app.web.application.services.wms_layer_service import WmsLayerService
from app.web.domain.repositories.base_layer_repository import BaseLayerRepository
from app.web.infrastructure.persistence.repository.base_layer_repository_impl import BaseLayerRepositoryImpl


def get_base_layer_service(
        base_layer_repository: BaseLayerRepository = Depends(BaseLayerRepositoryImpl)
):
    return BaseLayerService(base_layer_repository)


def get_wms_layer_service():
    return WmsLayerService()
