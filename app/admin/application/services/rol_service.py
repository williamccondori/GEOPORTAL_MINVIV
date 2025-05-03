from datetime import datetime
from typing import List

from app.admin.application.dtos.role_dto import RoleCreateDTO, RoleDTO
from app.admin.domain.exceptions.already_exists_exception import AlreadyExistsException
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.role import Role
from app.admin.domain.repositories.role_repository import RoleRepository


class RoleService:
    def __init__(self, role_repository: RoleRepository, user_authenticated: str):
        self.role_repository = role_repository
        self.user_authenticated = user_authenticated

    async def create(self, role_dto: RoleCreateDTO) -> str:
        exists = await self.role_repository.exists({
            "$or": [
                {"name": role_dto.name}
            ],
            "status": True
        })
        if exists:
            raise AlreadyExistsException()

        role = Role(
            name=role_dto.name,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        role = await self.role_repository.save(role)
        return role.id

    async def get_all(self) -> List[RoleDTO]:
        role = await self.role_repository.get_all()
        result = []
        for x in role:
            result.append(RoleDTO(
                id=x.id,
                name=x.name
            ))
        return result

    async def get_by_id(self, role_id: str) -> RoleDTO:
        role = await self.role_repository.get(role_id)
        if not role:
            raise NotFoundException("role")
        return RoleDTO(
            id=role.id,
            name=role.name
        )

    async def update(self, role_id: str, role_dto: RoleCreateDTO) -> str:
        role: Role = await self.role_repository.get(role_id)
        if not role:
            raise NotFoundException("role")

        role.update(
            name=role_dto.name,
            user_updated=self.user_authenticated
        )

        role = await self.role_repository.save(role)
        return role.id

    async def delete(self, role_id: str) -> str:
        role: Role = await self.role_repository.get(role_id)
        if not role:
            raise NotFoundException("role")
        role.delete(self.user_authenticated)
        role = await self.role_repository.save(role)
        return role.id
