from collections import Counter
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorCollection

from app.shared.db.base import database
from app.web.domain.models.layer_information_table import LayerInformationTable, LayerInformationFilter, \
    LayerInformationOption
from app.web.domain.repositories.layer_information_repository import LayerInformationRepository


class LayerInformationRepositoryImpl(LayerInformationRepository):
    async def get_table(self, collection_name) -> Optional[LayerInformationTable]:
        collection: AsyncIOMotorCollection = database.get_collection(collection_name)

        doc = await collection.find_one()
        if not doc:
            return None

        exclude_columns = ['geometry']
        columns = [k for k in doc.keys() if k not in exclude_columns]

        cursor = collection.find({})
        data = []
        all_docs = []
        async for doc in cursor:
            row = {
                k: (str(doc[k]) if k == "_id" else doc[k])
                for k in columns
            }
            data.append(row)
            all_docs.append(doc)

        filters: list[LayerInformationFilter] = []
        for col in columns:
            values = [str(doc.get(col)) for doc in all_docs if isinstance(doc.get(col), str)]
            if not values:
                continue
            counter = Counter(values)
            if any(count >= 10 for count in counter.values()):
                unique_values = sorted(set(values))
                options = [LayerInformationOption(id=val, label=val) for val in unique_values]
                filters.append(LayerInformationFilter(name=col, options=options))

        return LayerInformationTable(columns=columns, data=data, filters=filters)

    @staticmethod
    def __build_case_insensitive_filter(filters: dict) -> dict:
        return {
            key: {"$regex": f".*{value}.*", "$options": "i"}
            for key, value in filters.items()
            if value
        }

    async def get_geometry_and_table(self, collection_name: str, filters: dict) -> dict:
        collection: AsyncIOMotorCollection = database.get_collection(collection_name)
        mongo_filter = self.__build_case_insensitive_filter(filters)

        cursor = collection.find(mongo_filter)
        features = []

        async for doc in cursor:
            geometry = doc.get("geometry")
            if not geometry or not isinstance(geometry, dict):
                continue

            properties = {
                k: (str(v) if k == "_id" else v)
                for k, v in doc.items()
                if k != "geometry"
            }

            features.append({
                "type": "Feature",
                "geometry": geometry,
                "properties": properties
            })

        return {
            "type": "FeatureCollection",
            "features": features
        }
