from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile
from fastapi.params import File, Form

from app.admin.api.dependencies import get_dataset_use_case
from app.shared.models.response import Response
from app.admin.application.dtos.dataset_dto import DatasetDTO, DatasetCreateDTO

# noinspection DuplicatedCode
dataset_router = APIRouter(
    dependencies=[Depends(get_dataset_use_case)]
)


@dataset_router.get("/", response_model=Response[List[DatasetDTO]])
async def get_all(use_case=Depends(get_dataset_use_case)) -> Response[List[DatasetDTO]]:
    return Response.correct(await use_case.get_all())


@dataset_router.post("/", response_model=Response[str])
async def create(
        name: str = Form(...),
        description: Optional[str] = Form(None),
        file: Optional[UploadFile] = File(None),
        dataset_type_id: str = Form(...),
        category_id: Optional[str] = Form(None),
        label_ids: List[str] = Form([]),
        use_case=Depends(get_dataset_use_case)
) -> Response[str]:
    dataset_dto = DatasetCreateDTO(
        name=name,
        description=description,
        file=file,
        dataset_type_id=dataset_type_id,
        category_id=category_id,
        label_ids=label_ids
    )
    result = await use_case.create(dataset_dto)
    return Response.correct(result)


@dataset_router.get("/{dataset_id}", response_model=Response[DatasetDTO])
async def get_by_id(dataset_id: str, use_case=Depends(get_dataset_use_case)) -> Response[DatasetDTO]:
    return Response.correct(await use_case.get_by_id(dataset_id))


@dataset_router.put("/{dataset_id}", response_model=Response[str])
async def update(dataset_id: str,
                 name: str = Form(...),
                 description: Optional[str] = Form(None),
                 file: Optional[UploadFile] = File(None),
                 dataset_type_id: str = Form(...),
                 category_id: Optional[str] = Form(None),
                 label_ids: List[str] = Form([]),
                 use_case=Depends(get_dataset_use_case)
                 ) -> Response[str]:
    dataset_dto = DatasetCreateDTO(
        name=name,
        description=description,
        file=file,
        dataset_type_id=dataset_type_id,
        category_id=category_id,
        label_ids=label_ids
    )
    return Response.correct(await use_case.update(dataset_id, dataset_dto))


@dataset_router.delete("/{dataset_id}", response_model=Response[str])
async def delete(dataset_id: str, use_case=Depends(get_dataset_use_case)) -> Response[str]:
    return Response.correct(await use_case.delete(dataset_id))
