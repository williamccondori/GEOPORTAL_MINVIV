from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.role import Role
from app.admin.domain.repositories.role_repository import RoleRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("roles")


class RoleRepositoryImpl(BaseRepository, RoleRepository):
    def __init__(self):
        super().__init__(collection, Role)
