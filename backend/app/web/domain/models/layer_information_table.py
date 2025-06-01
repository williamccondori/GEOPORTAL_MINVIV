from pydantic import BaseModel


class LayerInformationOption(BaseModel):
    id: str
    label: str


class LayerInformationFilter(BaseModel):
    name: str
    options: list[LayerInformationOption] = []


class LayerInformationTable(BaseModel):
    columns: list[str] = []
    data: list[dict] = []
    filters: list[LayerInformationFilter]
