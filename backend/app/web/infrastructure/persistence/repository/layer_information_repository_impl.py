from typing import Counter, Optional

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
        exclude_set = set(exclude_columns) if exclude_columns else set()
        columns = [x for x in doc.keys() if x not in exclude_set]

        cursor = collection.find({})
        data = []
        all_docs = []
        async for doc in cursor:
            row = {}
            for col in columns:
                value = doc.get(col)
                if col == "_id" and value is not None:
                    value = str(value)
                row[col] = value
            data.append(row)
            all_docs.append(doc)

        # Filtros.
        filters: list[LayerInformationFilter] = []
        for col in columns:
            values = [str(doc.get(col)) for doc in all_docs if isinstance(doc.get(col), str)]
            if not values:
                continue
            counter = Counter(values)

            # Si algún valor se repite al menos 10 veces, agregamos el filtro.
            if any(count >= 10 for count in counter.values()):
                unique_values = sorted(set(values))
                options = [LayerInformationOption(
                    id=val,
                    label=val
                ) for val in unique_values]
                filters.append(LayerInformationFilter(
                    name=col,
                    options=options
                ))

        return LayerInformationTable(
            columns=columns,
            data=data,
            filters=filters
        )

    @staticmethod
    def __build_case_insensitive_filter(filters: dict) -> dict:
        mongo_filter = {}
        for key, value in filters.items():
            if value:
                # Coincidencia parcial insensible a mayúsculas/minúsculas
                mongo_filter[key] = {"$regex": f".*{value}.*", "$options": "i"}
        return mongo_filter

    async def get_geometry_and_table(self, collection_name: str, filters: dict) -> dict:
        collection: AsyncIOMotorCollection = database.get_collection(collection_name)
        mongo_filter = self.__build_case_insensitive_filter(filters)

        cursor = collection.find(mongo_filter)
        features = []

        async for doc in cursor:
            geometry = doc.get("geometry")
            if not geometry:
                continue

            # Eliminar _id u otras claves no deseadas
            properties = {k: v for k, v in doc.items() if k != "geometry"}
            if "_id" in properties:
                properties["_id"] = str(properties["_id"])

            feature = {
                "type": "Feature",
                "geometry": geometry,
                "properties": properties
            }
            features.append(feature)

        return {
            "type": "FeatureCollection",
            "features": features
        }
