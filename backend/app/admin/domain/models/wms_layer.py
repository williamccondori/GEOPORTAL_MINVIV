from datetime import datetime
from typing import Optional

from app.shared.domain.entities.base import Base


class WmsLayer(Base):
    id: Optional[str] = None
    category_id: str = None
    code: str = None
    name: str
    url: str
    attribution: str
    is_visible: bool = True

    def update(self, name: str, url: str, attribution: str, user_updated: str):
        self.name = name
        self.url = url
        self.attribution = attribution
        self.user_updated = user_updated
        self.updated_at = datetime.now()
        return self
