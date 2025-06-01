from typing import Optional

from app.shared.domain.entities.base import Base


class WmsLayer(Base):
    id: Optional[str] = None
    category_id: str
    code: str
    name: str
    url: str
    attribution: str
    is_visible: bool = True
