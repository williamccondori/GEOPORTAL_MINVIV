from app.admin.application.dtos.base_dto import BaseDTO


class CategoryDTO(BaseDTO):
    id: str
    name: str
    description: str


class CategoryCreateDTO(BaseDTO):
    name: str
    description: str
