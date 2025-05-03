from motor.motor_asyncio import AsyncIOMotorCollection

from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository
from app.web.domain.models.base_layer import BaseLayer
from app.web.domain.repositories.base_layer_repository import BaseLayerRepository

collection: AsyncIOMotorCollection = database.get_collection("base_layers")


class BaseLayerRepositoryImpl(BaseRepository, BaseLayerRepository):
    def __init__(self):
        super().__init__(collection, BaseLayer)
