from motor.motor_asyncio import AsyncIOMotorCollection

from app.shared.db.base import database
from app.web.domain.repositories.initial_settings_repository import (
    InitialSettingsRepository,
)

collection: AsyncIOMotorCollection = database.get_collection("initial_settings")


class InitialSettingsRepositoryImpl(InitialSettingsRepository):
    def __init__(self):
        self.collection = collection

    async def get(self):
        document = await self.collection.find_one()
        if not document:
            return None
        return document
