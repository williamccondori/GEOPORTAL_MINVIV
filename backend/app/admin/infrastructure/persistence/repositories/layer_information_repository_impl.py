from motor.motor_asyncio import AsyncIOMotorCollection

from app.admin.domain.repositories.layer_information_repository import LayerInformationRepository
from app.shared.db.base import database


class LayerInformationRepositoryImpl(LayerInformationRepository):
    async def save(self, collection_name: str, dictionaries: list[dict]) -> str:
        collection: AsyncIOMotorCollection = database.get_collection(collection_name)
        if dictionaries:
            await collection.insert_many(dictionaries)
        return collection_name

    async def save_columns(self, code: str, columns: list[str], columns_with_prefix: list[str], columns_status: list[bool]) -> None:
        collection: AsyncIOMotorCollection = database.get_collection("layer_columns")
        await collection.insert_one({
            "code": code,
            "columns": columns,
            "columns_with_prefix": columns_with_prefix,
            "columns_status": columns_status
        })
