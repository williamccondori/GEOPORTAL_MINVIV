from typing import List

from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_user_service, get_user_administrator_service
from app.admin.application.dtos.user_dto import UserDTO, UserCreateDTO
from app.shared.models.response import Response

# noinspection DuplicatedCode
user_router = APIRouter()


@user_router.get("/", response_model=Response[List[UserDTO]])
async def get_all(service=Depends(get_user_service)) -> Response[List[UserDTO]]:
    return Response.correct(await service.get_all())


@user_router.post("/administrator", response_model=Response[str])
async def create(service=Depends(get_user_administrator_service)) -> Response[str]:
    return Response.correct(await service.generate_administrator())


@user_router.post("/", response_model=Response[str])
async def create(user_dto: UserCreateDTO, service=Depends(get_user_service)) -> Response[str]:
    return Response.correct(await service.create(user_dto))


@user_router.get("/{user_id}", response_model=Response[UserDTO])
async def get_by_id(user_id: str, service=Depends(get_user_service)) -> Response[UserDTO]:
    return Response.correct(await service.get_by_id(user_id))


@user_router.put("/{user_id}", response_model=Response[str])
async def update(user_id: str, user_dto: UserCreateDTO, service=Depends(get_user_service)) -> \
        Response[str]:
    return Response.correct(await service.update(user_id, user_dto))


@user_router.delete("/{user_id}", response_model=Response[str])
async def delete(user_id: str, service=Depends(get_user_service)) -> Response[str]:
    return Response.correct(await service.delete(user_id))
