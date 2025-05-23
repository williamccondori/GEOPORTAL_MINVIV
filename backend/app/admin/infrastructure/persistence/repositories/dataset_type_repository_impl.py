from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.dataset_type import DatasetType
from app.admin.domain.repositories.dataset_type_repository import DatasetTypeRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("dataset_types")


class DatasetTypeRepositoryImpl(BaseRepository, DatasetTypeRepository):
    def __init__(self):
        super().__init__(collection, DatasetType)
