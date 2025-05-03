from typing import List

from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_category_use_case
from app.shared.models.response import Response
from app.admin.application.dtos.category_dto import CategoryDTO, CategoryCreateDTO

# noinspection DuplicatedCode
category_router = APIRouter(
    dependencies=[Depends(get_category_use_case)]
)


@category_router.get("/", response_model=Response[List[CategoryDTO]])
async def get_all(use_case=Depends(get_category_use_case)) -> Response[List[CategoryDTO]]:
    return Response.correct(await use_case.get_all())


@category_router.post("/", response_model=Response[str])
async def create(category_dto: CategoryCreateDTO, use_case=Depends(get_category_use_case)) -> Response[str]:
    return Response.correct(await use_case.create(category_dto))


@category_router.get("/{category_id}", response_model=Response[CategoryDTO])
async def get_by_id(category_id: str, use_case=Depends(get_category_use_case)) -> Response[CategoryDTO]:
    return Response.correct(await use_case.get_by_id(category_id))


@category_router.put("/{category_id}", response_model=Response[str])
async def update(category_id: str, category_dto: CategoryCreateDTO, use_case=Depends(get_category_use_case)) -> \
        Response[str]:
    return Response.correct(await use_case.update(category_id, category_dto))


@category_router.delete("/{category_id}", response_model=Response[str])
async def delete(category_id: str, use_case=Depends(get_category_use_case)) -> Response[str]:
    return Response.correct(await use_case.delete(category_id))
