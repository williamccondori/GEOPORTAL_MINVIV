from abc import abstractmethod, ABC
from typing import Optional

from app.web.domain.models.layer_information_table import LayerInformationTable


class LayerInformationRepository(ABC):
    @abstractmethod
    async def get_table(self, collection_name) -> Optional[LayerInformationTable]:
        pass

    @abstractmethod
    async def get_geometry_and_table(self, collection_name, filters) -> dict:
        pass

    async def get_geojson(self, layer_name: str, row_id: str):
        pass

    async def get_columns(self, layer_information_name) -> Optional[dict]:
        pass