from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.models.publication import Publication
from app.admin.domain.repositories.publication_repository import PublicationRepository
from app.shared.db.base import database
from app.shared.infrastructure.persistence.repository.base_repository import BaseRepository

collection: AsyncIOMotorCollection = database.get_collection("publications")


class PublicationRepositoryImpl(BaseRepository, PublicationRepository):
    def __init__(self):
        super().__init__(collection, Publication)
