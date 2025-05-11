from typing import Optional

from app.admin.application.dtos.base_dto import BaseDTO


class InitialSettingsDTO(BaseDTO):
    lat_long: list[float]
    zoom: int
    has_attribution: bool
    base_layer_ids: list[str]
    default_base_layer_id: Optional[str]
    wms_layer_ids: list[str]
    default_wms_layer_ids: list[str]
