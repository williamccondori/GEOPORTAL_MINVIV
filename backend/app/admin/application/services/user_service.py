from datetime import datetime
from typing import List, Optional

from passlib.context import CryptContext

from app.admin.application.dtos.user_dto import UserDTO, UserCreateDTO, UserToValidateDTO
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.user import User
from app.admin.domain.repositories.user_repository import UserRepository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def encrypt_password(password: str) -> str:
    return pwd_context.hash(str(password))


class UserService:
    def __init__(self, user_repository: UserRepository, user_authenticated: str = None):
        self.user_repository = user_repository
        self.user_authenticated = user_authenticated

    async def generate_administrator(self) -> str:
        exists = await self.user_repository.exists({"username": "admin"})
        if exists:
            return "admin"

        user = User(
            name="admin",
            last_name="admin",
            email="admin@admin.com",
            username="admin",
            password_hash=encrypt_password("ficticio"),
            is_active=True,
            status=True,
            user_created="ADMIN",
            created_at=datetime.now()
        )
        user = await self.user_repository.save(user)
        return user.id

    async def create(self, user_dto: UserCreateDTO) -> str:
        exists = await self.user_repository.exists({
            "$or": [
                {"email": user_dto.email},
                {"username": user_dto.username}
            ]
        })
        if exists:
            raise Exception("User already exists")

        user = User(
            name=user_dto.name,
            last_name=user_dto.last_name,
            email=user_dto.email,
            username=user_dto.username,
            password_hash=encrypt_password(user_dto.password),
            is_active=user_dto.is_active,
            status=True,
            user_created="ADMIN",
            created_at=datetime.now()
        )

        user = await self.user_repository.save(user)
        return user.id

    async def get_all(self) -> List[UserDTO]:
        user = await self.user_repository.get_all()
        result = []
        for u in user:
            result.append(UserDTO(
                id=u.id,
                name=u.name,
                last_name=u.last_name,
                email=u.email,
                username=u.username,
                is_active=u.is_active
            ))
        return result

    async def get_by_id(self, user_id: str) -> UserDTO:
        user = await self.user_repository.get(user_id)
        if not user:
            raise NotFoundException("usuario")
        return UserDTO(
            id=user.id,
            name=user.name,
            last_name=user.last_name,
            email=user.email,
            username=user.username,
            is_active=user.is_active
        )

    async def get_by_username(self, username: str) -> Optional[UserToValidateDTO]:
        user = await self.user_repository.find({"username": username})
        if not user:
            return None
        return UserToValidateDTO(
            username=user.username,
            password_hash=user.password_hash,
            is_active=user.is_active
        )
