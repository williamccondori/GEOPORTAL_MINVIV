from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.layer import Layer
from app.admin.domain.repositories.layer_repository import LayerRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("layers")


class LayerRepositoryImpl(BaseRepository, LayerRepository):
    def __init__(self):
        super().__init__(collection, Layer)
