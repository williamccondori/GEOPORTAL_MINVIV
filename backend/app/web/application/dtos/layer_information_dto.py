from app.web.application.dtos.base_dto import BaseDTO


class LayerInformationOptionDTO(BaseDTO):
    id: str
    label: str


class LayerInformationFilterDTO(BaseDTO):
    name: str
    options: list[LayerInformationOptionDTO] = []


class LayerInformationTableDTO(BaseDTO):
    columns: list[str] = []
    data: list[dict] = []
    filters: list[LayerInformationFilterDTO]
