from datetime import datetime

from app.shared.domain.entities.base import Base


class Role(Base):
    name: str

    def update(self, name: str, user_updated: str):
        self.name = name
        self.user_updated = user_updated
        self.updated_at = datetime.now()
        return self
