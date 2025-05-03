from datetime import datetime

from app.shared.domain.entities.base import Base


class Label(Base):
    name: str
    description: str

    def update(self, name: str, description: str, user_updated: str):
        self.name = name
        self.description = description
        self.user_updated = user_updated
        self.updated_at = datetime.now()
        return self
