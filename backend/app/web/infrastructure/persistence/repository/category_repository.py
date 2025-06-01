from motor.motor_asyncio import AsyncIOMotorCollection

from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository
from app.web.domain.models.category import Category
from app.web.domain.repositories.category_repository import CategoryRepository

collection: AsyncIOMotorCollection = database.get_collection("categories")


class CategoryRepositoryImpl(BaseRepository, CategoryRepository):
    def __init__(self):
        super().__init__(collection, Category)
