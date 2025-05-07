from typing import List, Optional

from app.admin.domain.models.base_layer import BaseLayer
from app.admin.domain.models.wms_layer import WmsLayer
from app.shared.domain.entities.base import Base


class InitialSettings(Base):
    lat_long: List[float]
    zoom: int
    has_attribution: bool
    base_layers: List[BaseLayer]
    default_base_layer_id: Optional[str]
    wms_layers: List[WmsLayer]
    default_wms_layer_ids: List[str]
