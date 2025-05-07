from typing import List

from app.admin.domain.models.base_layer import BaseLayer
from app.admin.domain.models.wms_layer import WmsLayer
from app.shared.domain.entities.base import Base


class InitialSettings(Base):
    def __init__(
            self,
            latLng: str,
            zoom: int,
            has_attribution: bool,
            base_layers: List[BaseLayer],
            default_base_layer_id: str,
            wms_layers: List[WmsLayer],
            default_wms_layer_ids: List[str],
    ):
        self.latLng = latLng
        self.zoom = zoom
        self.has_attribution = has_attribution
        self.base_layers = base_layers
        self.default_base_layer_id = default_base_layer_id
        self.wms_layers = wms_layers
        self.default_wms_layer_ids = default_wms_layer_ids
