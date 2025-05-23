from datetime import datetime

from pydantic import EmailStr

from app.shared.domain.entities.base import Base


class User(Base):
    name: str
    last_name: str
    email: EmailStr
    username: str
    password_hash: str
    is_active: bool

    def update(
            self, name: str, last_name: str, email: EmailStr, username: str, password_hash: str, is_active: bool,
            user_updated: str
    ):
        self.name = name
        self.last_name = last_name
        self.email = email
        self.username = username
        self.password_hash = password_hash
        self.is_active = is_active
        self.user_updated = user_updated
        self.updated_at = datetime.now()
        return self
