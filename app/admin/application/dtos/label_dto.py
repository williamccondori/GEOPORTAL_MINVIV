from app.admin.application.dtos.base_dto import BaseDTO


class LabelDTO(BaseDTO):
    id: str
    name: str
    description: str


class LabelCreateDTO(BaseDTO):
    name: str
    description: str
