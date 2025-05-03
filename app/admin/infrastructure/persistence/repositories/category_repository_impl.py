from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.category import Category
from app.admin.domain.repositories.category_repository import CategoryRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("categories")


class CategoryRepositoryImpl(BaseRepository, CategoryRepository):
    def __init__(self):
        super().__init__(collection, Category)
