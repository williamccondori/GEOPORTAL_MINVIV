from typing import List

from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_label_use_case
from app.shared.models.response import Response
from app.admin.application.dtos.label_dto import LabelDTO, LabelCreateDTO

# noinspection DuplicatedCode
label_router = APIRouter(
    dependencies=[Depends(get_label_use_case)]
)


@label_router.get("/", response_model=Response[List[LabelDTO]])
async def get_all(use_case=Depends(get_label_use_case)) -> Response[List[LabelDTO]]:
    return Response.correct(await use_case.get_all())


@label_router.post("/", response_model=Response[str])
async def create(label_dto: LabelCreateDTO, use_case=Depends(get_label_use_case)) -> Response[str]:
    return Response.correct(await use_case.create(label_dto))


@label_router.get("/{label_id}", response_model=Response[LabelDTO])
async def get_by_id(label_id: str, use_case=Depends(get_label_use_case)) -> Response[LabelDTO]:
    return Response.correct(await use_case.get_by_id(label_id))


@label_router.put("/{label_id}", response_model=Response[str])
async def update(label_id: str, label_dto: LabelCreateDTO, use_case=Depends(get_label_use_case)) -> \
        Response[str]:
    return Response.correct(await use_case.update(label_id, label_dto))


@label_router.delete("/{label_id}", response_model=Response[str])
async def delete(label_id: str, use_case=Depends(get_label_use_case)) -> Response[str]:
    return Response.correct(await use_case.delete(label_id))
