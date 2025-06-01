from typing import Optional

from app.admin.application.dtos.base_dto import BaseDTO


class LayerSearchDTO(BaseDTO):
    category_id: str
    include_wms_layers: bool = False


class LayerDTO(BaseDTO):
    id: str
    category_name: str
    name: str
    title: str
    description: str
    url: str
    download_url: Optional[str] = None
