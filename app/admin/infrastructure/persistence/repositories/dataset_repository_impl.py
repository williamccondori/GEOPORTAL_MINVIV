from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.dataset import Dataset
from app.admin.domain.repositories.dataset_repository import DatasetRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("datasets")


class DatasetRepositoryImpl(BaseRepository, DatasetRepository):
    def __init__(self):
        super().__init__(collection, Dataset)
