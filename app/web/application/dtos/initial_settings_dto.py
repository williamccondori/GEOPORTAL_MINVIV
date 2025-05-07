from typing import Optional

from app.admin.application.dtos.base_dto import BaseDTO
from app.admin.application.dtos.base_layer_dto import BaseLayerDTO
from app.admin.application.dtos.wms_layer_dto import WmsLayerDTO


class InitialSettingsDTO(BaseDTO):
    lat_long: list[float]
    zoom: int
    has_attribution: bool
    base_layers: list[BaseLayerDTO]
    default_base_layer_id: Optional[str]
    wms_layers: list[WmsLayerDTO]
    default_wms_layer_ids: list[str]
