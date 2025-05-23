from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.user import User
from app.admin.domain.repositories.user_repository import UserRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("users")


class UserRepositoryImpl(BaseRepository, UserRepository):
    def __init__(self):
        super().__init__(collection, User)
