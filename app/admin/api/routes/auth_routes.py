from datetime import timedelta, datetime, timezone

import jwt
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext

from app.shared.models.response import Response
from app.admin.application.dtos.token_dto import TokenDTO
from app.admin.application.dtos.user_dto import UserToValidateDTO
from app.admin.application.services.user_service import UserService
from app.admin.domain.exceptions.not_authenticated_exception import NotAuthenticatedException
from app.admin.infrastructure.persistence.repositories.user_repository_impl import UserRepositoryImpl

auth_router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

user_use_case = UserService(
    user_repository=UserRepositoryImpl()
)

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3600


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@auth_router.post("/", response_model=Response[TokenDTO])
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Response[TokenDTO]:
    user: UserToValidateDTO = await user_use_case.get_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise NotAuthenticatedException(False)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    token_dto = TokenDTO(access_token=access_token, token_type="bearer")
    return Response.correct(token_dto)
