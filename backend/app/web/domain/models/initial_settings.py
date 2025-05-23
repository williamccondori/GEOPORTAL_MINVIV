from typing import Optional

from app.shared.domain.entities.base import Base


class InitialSettings(Base):
    lat_long: list[float]
    zoom: int
    has_attribution: bool
    default_base_layer_id: Optional[str]
    default_wms_layer_ids: list[str]
