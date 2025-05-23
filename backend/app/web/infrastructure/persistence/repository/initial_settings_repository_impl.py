from datetime import datetime
from typing import Optional, Dict, Any

from motor.motor_asyncio import AsyncIOMotorCollection

from app.shared.db.base import database
from app.web.domain.models.initial_settings import InitialSettings
from app.web.domain.repositories.initial_settings_repository import (
    InitialSettingsRepository,
)

collection: AsyncIOMotorCollection = database.get_collection("initial_settings")


class InitialSettingsRepositoryImpl(InitialSettingsRepository):
    def __init__(self):
        self.collection = collection

    async def get_unique(self) -> InitialSettings:
        initial_settings: Optional[Dict[str, Any]] = await self.collection.find_one({})
        if not initial_settings:
            return InitialSettings(
                id=None,
                lat_long=[0.0, 0.0],
                zoom=1,
                has_attribution=False,
                default_base_layer_id=None,
                default_wms_layer_ids=[],
                status=True,
                user_created="SYSTEM",
                created_at=datetime.now()
            )
        initial_settings["id"] = str(initial_settings.pop("_id"))
        return InitialSettings(**initial_settings)
