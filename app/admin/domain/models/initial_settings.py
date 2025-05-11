from datetime import datetime
from typing import List, Optional

from app.shared.domain.entities.base import Base


class InitialSettings(Base):
    lat_long: List[float]
    zoom: int
    has_attribution: bool
    default_base_layer_id: Optional[str]
    default_wms_layer_ids: List[str]

    def update(self,
               lat_long: List[float],
               zoom: int,
               has_attribution: bool,
               default_base_layer_id: Optional[str],
               default_wms_layer_ids: List[str],
               user_updated: str):
        self.lat_long = lat_long
        self.zoom = zoom
        self.has_attribution = has_attribution
        self.default_base_layer_id = default_base_layer_id
        self.default_wms_layer_ids = default_wms_layer_ids
        self.user_updated = user_updated
        self.updated_at = datetime.now()
        return self