from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.label import Label
from app.admin.domain.repositories.label_repository import LabelRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("labels")


class LabelRepositoryImpl(BaseRepository, LabelRepository):
    def __init__(self):
        super().__init__(collection, Label)
