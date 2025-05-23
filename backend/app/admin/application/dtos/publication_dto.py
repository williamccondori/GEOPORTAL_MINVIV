from app.admin.application.dtos.base_dto import BaseDTO


class PublicationDTO(BaseDTO):
    id: str
    name: str
    description: str


class PublicationCreateDTO(BaseDTO):
    name: str
    description: str
