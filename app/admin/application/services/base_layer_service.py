from datetime import datetime
from typing import List

from app.admin.application.dtos.base_layer_dto import BaseLayerCreateDTO, BaseLayerDTO
from app.admin.domain.exceptions.already_exists_exception import AlreadyExistsException
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.base_layer import BaseLayer
from app.admin.domain.repositories.base_layer_repository import BaseLayerRepository


class BaseLayerService:
    def __init__(self, base_layer_repository: BaseLayerRepository, user_authenticated: str):
        self.base_layer_repository = base_layer_repository
        self.user_authenticated = user_authenticated

    async def create(self, base_layer_dto: BaseLayerCreateDTO) -> str:
        exists = await self.base_layer_repository.exists({
            "$or": [
                {"name": base_layer_dto.name},
                {"url": base_layer_dto.url}
            ],
            "status": True
        })
        if exists:
            raise AlreadyExistsException()

        base_layer = BaseLayer(
            name=base_layer_dto.name,
            url=base_layer_dto.url,
            attribution=base_layer_dto.attribution,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        base_layer = await self.base_layer_repository.save(base_layer)
        return base_layer.id

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

    async def get_by_id(self, base_layer_id: str) -> BaseLayerDTO:
        base_layer = await self.base_layer_repository.get(base_layer_id)
        if not base_layer:
            raise NotFoundException("capa base")
        return BaseLayerDTO(
            id=base_layer.id,
            name=base_layer.name,
            url=base_layer.url,
            attribution=base_layer.attribution
        )

    async def update(self, base_layer_id: str, base_layer_dto: BaseLayerCreateDTO) -> str:
        base_layer: BaseLayer = await self.base_layer_repository.get(base_layer_id)
        if not base_layer:
            raise NotFoundException("capa base")

        base_layer.update(
            name=base_layer_dto.name,
            attribution=base_layer_dto.attribution,
            url=base_layer_dto.url,
            user_updated=self.user_authenticated
        )

        base_layer = await self.base_layer_repository.save(base_layer)
        return base_layer.id

    async def delete(self, base_layer_id: str) -> str:
        base_layer: BaseLayer = await self.base_layer_repository.get(base_layer_id)
        if not base_layer:
            raise NotFoundException("capa base")
        base_layer.delete(self.user_authenticated)
        base_layer = await self.base_layer_repository.save(base_layer)
        return base_layer.id
