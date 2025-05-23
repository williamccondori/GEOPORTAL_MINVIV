from typing import Optional

from app.admin.application.dtos.base_dto import BaseDTO


class InitialSettingsDTO(BaseDTO):
    id: Optional[str]
    latitude: float
    longitude: float
    zoom: int
    has_attribution: bool
    default_base_layer_id: Optional[str]
    wms_layer_ids: list[str]
