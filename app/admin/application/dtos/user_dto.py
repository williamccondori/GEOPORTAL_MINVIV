from pydantic import EmailStr, BaseModel

from app.admin.application.dtos.base_dto import BaseDTO


class UserCreateDTO(BaseDTO):
    name: str
    last_name: str
    email: EmailStr
    username: str
    password: str
    is_active: bool


class UserDTO(BaseDTO):
    id: str
    name: str
    last_name: str
    email: EmailStr
    username: str
    is_active: bool


class UserToValidateDTO(BaseModel):
    username: str
    password_hash: str
    is_active: bool
