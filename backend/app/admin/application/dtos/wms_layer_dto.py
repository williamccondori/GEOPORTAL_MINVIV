from app.admin.application.dtos.base_dto import BaseDTO


class WmsLayerDTO(BaseDTO):
    id: str
    name: str
    url: str
    attribution: str


class WmsLayerCreateDTO(BaseDTO):
    name: str
    url: str
    attribution: str
