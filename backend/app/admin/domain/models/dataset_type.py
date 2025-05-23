from datetime import datetime
from typing import Optional

from app.shared.domain.entities.base import Base


class DatasetType(Base):
    name: str
    description: str
    file_path: Optional[str]

    def update(self, name: str, description: str, file_path: Optional[str], user_updated: str):
        self.name = name
        self.description = description
        if file_path:
            self.file_path = file_path
        self.user_updated = user_updated
        self.updated_at = datetime.now()
        return self
