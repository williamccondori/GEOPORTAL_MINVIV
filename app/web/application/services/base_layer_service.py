from typing import List

from app.web.application.dtos.base_layer_dto import BaseLayerDTO
from app.web.domain.repositories.base_layer_repository import BaseLayerRepository


class BaseLayerService:
    def __init__(self, base_layer_repository: BaseLayerRepository):
        self.base_layer_repository = base_layer_repository

    async def get_all(self) -> List[BaseLayerDTO]:
        base_layer = await self.base_layer_repository.get_all()
        result = []
        for x in base_layer:
            result.append(BaseLayerDTO(
                id=x.id,
                name=x.name,
                url=x.url,
                attribution=x.attribution
            ))
        return result
