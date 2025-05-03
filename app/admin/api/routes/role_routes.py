from typing import List

from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_role_service
from app.shared.models.response import Response
from app.admin.application.dtos.role_dto import RoleDTO, RoleCreateDTO

# noinspection DuplicatedCode
role_router = APIRouter(
    dependencies=[Depends(get_role_service)]
)


@role_router.get("/", response_model=Response[List[RoleDTO]])
async def get_all(service=Depends(get_role_service)) -> Response[List[RoleDTO]]:
    return Response.correct(await service.get_all())


@role_router.post("/", response_model=Response[str])
async def create(role_dto: RoleCreateDTO, service=Depends(get_role_service)) -> Response[str]:
    return Response.correct(await service.create(role_dto))


@role_router.get("/{role_id}", response_model=Response[RoleDTO])
async def get_by_id(role_id: str, service=Depends(get_role_service)) -> Response[RoleDTO]:
    return Response.correct(await service.get_by_id(role_id))


@role_router.put("/{role_id}", response_model=Response[str])
async def update(role_id: str, role_dto: RoleCreateDTO, service=Depends(get_role_service)) -> \
        Response[str]:
    return Response.correct(await service.update(role_id, role_dto))


@role_router.delete("/{role_id}", response_model=Response[str])
async def delete(role_id: str, service=Depends(get_role_service)) -> Response[str]:
    return Response.correct(await service.delete(role_id))
