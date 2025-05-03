from datetime import datetime

from app.shared.domain.entities.base import Base


class WmsLayer(Base):
    name: str
    url: str
    attribution: str

    def update(self, name: str, url: str, attribution: str, user_updated: str):
        self.name = name
        self.url = url
        self.attribution = attribution
        self.user_updated = user_updated
        self.updated_at = datetime.now()
        return self
