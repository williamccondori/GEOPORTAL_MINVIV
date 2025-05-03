from datetime import datetime
from typing import List

from app.admin.application.dtos.publication_dto import PublicationCreateDTO, PublicationDTO
from app.admin.domain.exceptions.already_exists_exception import AlreadyExistsException
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.publication import Publication
from app.admin.domain.repositories.publication_repository import PublicationRepository


class PublicationUseCase:
    def __init__(self, publication_repository: PublicationRepository, user_authenticated: str):
        self.publication_repository = publication_repository
        self.user_authenticated = user_authenticated

    async def create(self, publication_dto: PublicationCreateDTO) -> str:
        exists = await self.publication_repository.exists({
            "$or": [
                {"name": publication_dto.name}
            ],
            "status": True
        })
        if exists:
            raise AlreadyExistsException()

        publication = Publication(
            name=publication_dto.name,
            description=publication_dto.description,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        publication = await self.publication_repository.save(publication)
        return publication.id

    async def get_all(self) -> List[PublicationDTO]:
        publication = await self.publication_repository.get_all()
        result = []
        for x in publication:
            result.append(PublicationDTO(
                id=x.id,
                name=x.name,
                description=x.description
            ))
        return result

    async def get_by_id(self, publication_id: str) -> PublicationDTO:
        publication = await self.publication_repository.get(publication_id)
        if not publication:
            raise NotFoundException("conjunto de datos")
        return PublicationDTO(
            id=publication.id,
            name=publication.name,
            description=publication.description
        )

    async def update(self, publication_id: str, publication_dto: PublicationCreateDTO) -> str:
        publication: Publication = await self.publication_repository.get(publication_id)
        if not publication:
            raise NotFoundException("conjunto de datos")

        publication.update(
            name=publication_dto.name,
            description=publication_dto.description,
            user_updated=self.user_authenticated
        )

        publication = await self.publication_repository.save(publication)
        return publication.id

    async def delete(self, publication_id: str) -> str:
        publication: Publication = await self.publication_repository.get(publication_id)
        if not publication:
            raise NotFoundException("conjunto de datos")
        publication.delete(self.user_authenticated)
        publication = await self.publication_repository.save(publication)
        return publication.id
