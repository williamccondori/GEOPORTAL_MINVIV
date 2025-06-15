from typing import Optional

from app.admin.application.dtos.base_dto import BaseDTO


class LayerDTO(BaseDTO):
    id: str
    category_name: str
    code: str
    name: str
    is_visible: bool


class LayerFormDTO(BaseDTO):
    id: Optional[str] = None
    categoryId: str
    code: str
    name: str
    description: str
    shape_file_name: str


class RegisteredLayerDTO(BaseDTO):
    layer_information_name: str
    schema_name: str
    table_name: str
    view_name: str
