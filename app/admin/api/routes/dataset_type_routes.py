from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile
from fastapi.params import File, Form

from app.admin.api.dependencies import get_dataset_type_use_case
from app.admin.application.dtos.dataset_type_dto import DatasetTypeDTO, DatasetTypeCreateDTO
from app.shared.models.response import Response

# noinspection DuplicatedCode
dataset_type_router = APIRouter(
    dependencies=[Depends(get_dataset_type_use_case)]
)


@dataset_type_router.get("/", response_model=Response[List[DatasetTypeDTO]])
async def get_all(use_case=Depends(get_dataset_type_use_case)) -> Response[List[DatasetTypeDTO]]:
    return Response.correct(await use_case.get_all())


@dataset_type_router.post("/", response_model=Response[str])
async def create(
        name: str = Form(...),
        description: Optional[str] = Form(None),
        file: Optional[UploadFile] = File(None),
        use_case=Depends(get_dataset_type_use_case)
) -> Response[str]:
    dataset_type_dto = DatasetTypeCreateDTO(
        name=name,
        description=description,
        file=file
    )
    result = await use_case.create(dataset_type_dto)
    return Response.correct(result)


@dataset_type_router.get("/{dataset_type_id}", response_model=Response[DatasetTypeDTO])
async def get_by_id(dataset_type_id: str, use_case=Depends(get_dataset_type_use_case)) -> Response[DatasetTypeDTO]:
    return Response.correct(await use_case.get_by_id(dataset_type_id))


@dataset_type_router.put("/{dataset_type_id}", response_model=Response[str])
async def update(dataset_type_id: str,
                 name: str = Form(...),
                 description: Optional[str] = Form(None),
                 file: Optional[UploadFile] = File(None),
                 use_case=Depends(get_dataset_type_use_case)
                 ) -> Response[str]:
    dataset_type_dto = DatasetTypeCreateDTO(
        name=name,
        description=description,
        file=file
    )
    return Response.correct(await use_case.update(dataset_type_id, dataset_type_dto))


@dataset_type_router.delete("/{dataset_type_id}", response_model=Response[str])
async def delete(dataset_type_id: str, use_case=Depends(get_dataset_type_use_case)) -> Response[str]:
    return Response.correct(await use_case.delete(dataset_type_id))
