from fastapi import APIRouter, Depends, UploadFile, File

from app.admin.api.dependencies import get_file_service
from app.shared.models.response import Response

file_router = APIRouter()


@file_router.post("/", response_model=Response[str])
async def create(file: UploadFile = File(...), service=Depends(get_file_service)) -> Response[str]:
    shapefile_name = await service.upload_shapefile(file)
    return Response.correct(shapefile_name)
