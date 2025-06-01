from motor.motor_asyncio import AsyncIOMotorCollection

from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository
from app.web.domain.models.wms_layer import WmsLayer
from app.web.domain.repositories.wms_layer_repository import WmsLayerRepository

collection: AsyncIOMotorCollection = database.get_collection("wms_layers")


class WmsLayerRepositoryImpl(BaseRepository, WmsLayerRepository):
    def __init__(self):
        super().__init__(collection, WmsLayer)
