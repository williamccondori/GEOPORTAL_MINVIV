from typing import List

from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_category_service
from app.admin.application.dtos.category_dto import CategoryDTO, CategoryCreateDTO, CategoryNodeDTO
from app.shared.models.response import Response

category_router = APIRouter()


@category_router.get("/structure", response_model=Response[List[CategoryNodeDTO]])
async def get_all(service=Depends(get_category_service)) -> Response[List[CategoryNodeDTO]]:
    return Response.correct(await service.get_structure())


@category_router.post("/", response_model=Response[str])
async def create(category_dto: CategoryCreateDTO, service=Depends(get_category_service)) -> Response[str]:
    return Response.correct(await service.create(category_dto))


@category_router.get("/{category_id}", response_model=Response[CategoryDTO])
async def get_by_id(category_id: str, service=Depends(get_category_service)) -> Response[CategoryDTO]:
    return Response.correct(await service.get_by_id(category_id))


@category_router.put("/{category_id}", response_model=Response[str])
async def update(category_id: str, category_dto: CategoryCreateDTO, service=Depends(get_category_service)) -> \
        Response[str]:
    return Response.correct(await service.update(category_id, category_dto))


@category_router.delete("/{category_id}", response_model=Response[str])
async def delete(category_id: str, service=Depends(get_category_service)) -> Response[str]:
    return Response.correct(await service.delete(category_id))
