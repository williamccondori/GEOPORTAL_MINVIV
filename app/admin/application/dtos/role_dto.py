from app.admin.application.dtos.base_dto import BaseDTO


class RoleDTO(BaseDTO):
    id: str
    name: str


class RoleCreateDTO(BaseDTO):
    name: str
