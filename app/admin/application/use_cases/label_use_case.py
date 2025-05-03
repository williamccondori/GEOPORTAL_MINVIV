from datetime import datetime
from typing import List

from app.admin.application.dtos.label_dto import LabelCreateDTO, LabelDTO
from app.admin.domain.exceptions.already_exists_exception import AlreadyExistsException
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.label import Label
from app.admin.domain.repositories.label_repository import LabelRepository


class LabelUseCase:
    def __init__(self, label_repository: LabelRepository, user_authenticated: str):
        self.label_repository = label_repository
        self.user_authenticated = user_authenticated

    async def create(self, label_dto: LabelCreateDTO) -> str:
        exists = await self.label_repository.exists({
            "$or": [
                {"name": label_dto.name}
            ],
            "status": True
        })
        if exists:
            raise AlreadyExistsException()

        label = Label(
            name=label_dto.name,
            description=label_dto.description,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        label = await self.label_repository.save(label)
        return label.id

    async def get_all(self) -> List[LabelDTO]:
        label = await self.label_repository.get_all()
        result = []
        for x in label:
            result.append(LabelDTO(
                id=x.id,
                name=x.name,
                description=x.description
            ))
        return result

    async def get_by_id(self, label_id: str) -> LabelDTO:
        label = await self.label_repository.get(label_id)
        if not label:
            raise NotFoundException("conjunto de datos")
        return LabelDTO(
            id=label.id,
            name=label.name,
            description=label.description
        )

    async def update(self, label_id: str, label_dto: LabelCreateDTO) -> str:
        label: Label = await self.label_repository.get(label_id)
        if not label:
            raise NotFoundException("conjunto de datos")

        label.update(
            name=label_dto.name,
            description=label_dto.description,
            user_updated=self.user_authenticated
        )

        label = await self.label_repository.save(label)
        return label.id

    async def delete(self, label_id: str) -> str:
        label: Label = await self.label_repository.get(label_id)
        if not label:
            raise NotFoundException("conjunto de datos")
        label.delete(self.user_authenticated)
        label = await self.label_repository.save(label)
        return label.id
