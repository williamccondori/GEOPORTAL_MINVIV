from typing import List

from fastapi import APIRouter, Depends

from app.admin.api.dependencies import get_publication_use_case
from app.admin.application.dtos.publication_dto import PublicationDTO, PublicationCreateDTO
from app.shared.models.response import Response

# noinspection DuplicatedCode
publication_router = APIRouter(
    dependencies=[Depends(get_publication_use_case)]
)


@publication_router.get("/", response_model=Response[List[PublicationDTO]])
async def get_all(use_case=Depends(get_publication_use_case)) -> Response[List[PublicationDTO]]:
    return Response.correct(await use_case.get_all())


@publication_router.post("/", response_model=Response[str])
async def create(publication_dto: PublicationCreateDTO, use_case=Depends(get_publication_use_case)) -> Response[str]:
    return Response.correct(await use_case.create(publication_dto))


@publication_router.get("/{publication_id}", response_model=Response[PublicationDTO])
async def get_by_id(publication_id: str, use_case=Depends(get_publication_use_case)) -> Response[PublicationDTO]:
    return Response.correct(await use_case.get_by_id(publication_id))


@publication_router.put("/{publication_id}", response_model=Response[str])
async def update(publication_id: str, publication_dto: PublicationCreateDTO,
                 use_case=Depends(get_publication_use_case)) -> \
        Response[str]:
    return Response.correct(await use_case.update(publication_id, publication_dto))


@publication_router.delete("/{publication_id}", response_model=Response[str])
async def delete(publication_id: str, use_case=Depends(get_publication_use_case)) -> Response[str]:
    return Response.correct(await use_case.delete(publication_id))
