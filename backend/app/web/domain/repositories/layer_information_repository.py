from abc import abstractmethod, ABC
from typing import Optional

from app.web.domain.models.layer_information_table import LayerInformationTable


class LayerInformationRepository(ABC):
    @abstractmethod
    async def get_table(self, collection_name) -> Optional[LayerInformationTable]:
        pass
