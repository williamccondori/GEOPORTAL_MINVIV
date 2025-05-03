from fastapi import UploadFile
from typing_extensions import Optional

from app.admin.application.dtos.base_dto import BaseDTO


class DatasetTypeDTO(BaseDTO):
    id: str
    name: str
    description: str
    file_path: str | None = None


class DatasetTypeCreateDTO(BaseDTO):
    name: str
    description: str
    file: Optional[UploadFile]
