from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Base(BaseModel):
    id: Optional[str] = None
    status: bool
    user_created: str
    user_updated: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    def delete(self, user_deleted: str):
        self.status = False
        self.user_updated = user_deleted
        self.updated_at = datetime.now()
        return self
