from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.base_layer import BaseLayer
from app.admin.domain.repositories.base_layer_repository import BaseLayerRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("base_layers")


class BaseLayerRepositoryImpl(BaseRepository, BaseLayerRepository):
    def __init__(self):
        super().__init__(collection, BaseLayer)
