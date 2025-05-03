from app.admin.application.dtos.base_dto import BaseDTO


class BaseLayerDTO(BaseDTO):
    id: str
    name: str
    url: str
    attribution: str


class BaseLayerCreateDTO(BaseDTO):
    name: str
    url: str
    attribution: str
