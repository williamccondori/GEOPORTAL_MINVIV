from datetime import datetime
from typing import List

from app.admin.application.dtos.wms_layer_dto import WmsLayerCreateDTO, WmsLayerDTO
from app.admin.domain.exceptions.already_exists_exception import AlreadyExistsException
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.wms_layer import WmsLayer
from app.admin.domain.repositories.wms_layer_repository import WmsLayerRepository


class WmsLayerService:
    def __init__(self, wms_layer_repository: WmsLayerRepository, user_authenticated: str):
        self.wms_layer_repository = wms_layer_repository
        self.user_authenticated = user_authenticated

    async def create(self, wms_layer_dto: WmsLayerCreateDTO) -> str:
        exists = await self.wms_layer_repository.exists({
            "$or": [
                {"name": wms_layer_dto.name},
                {"url": wms_layer_dto.url}
            ],
            "status": True
        })
        if exists:
            raise AlreadyExistsException()

        wms_layer = WmsLayer(
            name=wms_layer_dto.name,
            url=wms_layer_dto.url,
            attribution=wms_layer_dto.attribution,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        wms_layer = await self.wms_layer_repository.save(wms_layer)
        return wms_layer.id

    async def get_all(self) -> List[WmsLayerDTO]:
        wms_layer = await self.wms_layer_repository.get_all()
        result = []
        for x in wms_layer:
            result.append(WmsLayerDTO(
                id=x.id,
                name=x.name,
                url=x.url,
                attribution=x.attribution
            ))
        return result

    async def get_by_id(self, wms_layer_id: str) -> WmsLayerDTO:
        wms_layer = await self.wms_layer_repository.get(wms_layer_id)
        if not wms_layer:
            raise NotFoundException("capa base")
        return WmsLayerDTO(
            id=wms_layer.id,
            name=wms_layer.name,
            url=wms_layer.url,
            attribution=wms_layer.attribution
        )

    async def update(self, wms_layer_id: str, wms_layer_dto: WmsLayerCreateDTO) -> str:
        wms_layer: WmsLayer = await self.wms_layer_repository.get(wms_layer_id)
        if not wms_layer:
            raise NotFoundException("capa base")

        wms_layer.update(
            name=wms_layer_dto.name,
            attribution=wms_layer_dto.attribution,
            url=wms_layer_dto.url,
            user_updated=self.user_authenticated
        )

        wms_layer = await self.wms_layer_repository.save(wms_layer)
        return wms_layer.id

    async def delete(self, wms_layer_id: str) -> str:
        wms_layer: WmsLayer = await self.wms_layer_repository.get(wms_layer_id)
        if not wms_layer:
            raise NotFoundException("capa base")
        wms_layer.delete(self.user_authenticated)
        wms_layer = await self.wms_layer_repository.save(wms_layer)
        return wms_layer.id
