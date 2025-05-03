from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.wms_layer import WmsLayer
from app.admin.domain.repositories.wms_layer_repository import WmsLayerRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("wms_layers")


class WmsLayerRepositoryImpl(BaseRepository, WmsLayerRepository):
    def __init__(self):
        super().__init__(collection, WmsLayer)
