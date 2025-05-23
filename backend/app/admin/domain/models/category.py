from datetime import datetime
from typing import Optional

from app.shared.domain.entities.base import Base


class Category(Base):
    name: str
    description: str
    category_id: Optional[str] = None

    def update(self, name: str, description: str, category_id: str, user_updated: str):
        self.name = name
        self.description = description
        self.category_id = category_id
        self.user_updated = user_updated
        self.updated_at = datetime.now()
        return self
