from typing import List, Optional, Dict, Any, Type, TypeVar

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class BaseRepository:
    def __init__(self, collection: AsyncIOMotorCollection, model: Type[T]):
        self.collection = collection
        self.model = model

    async def get_all(self, filters: Optional[dict] = None) -> List[T]:
        result = []
        filters = filters or {}
        filters['status'] = True
        async for document in self.collection.find(filters):
            document["id"] = str(document.pop("_id"))
            result.append(self.model(**document))
        return result

    async def get(self, document_id: str) -> Optional[T]:
        document: Optional[Dict[str, Any]] = await self.collection.find_one({"_id": ObjectId(document_id)})
        if not document:
            return None
        document["id"] = str(document.pop("_id"))
        return self.model(**document)

    async def save(self, document: T) -> T:
        document_dict = document.model_dump()
        document_id = document.id

        if document_id:
            document_dict.pop("id", None)
            await self.collection.update_one({"_id": ObjectId(document.id)}, {"$set": document_dict})
            return document
        else:
            document.id = str((await self.collection.insert_one(document_dict)).inserted_id)
            return document

    async def find(self, param: dict) -> Optional[T]:
        document: Optional[Dict[str, Any]] = await self.collection.find_one(param)
        if not document:
            return None
        document["id"] = str(document.pop("_id"))
        return self.model(**document)

    async def exists(self, filters: Optional[dict] = None) -> bool:
        return await self.collection.count_documents(filters) > 0
