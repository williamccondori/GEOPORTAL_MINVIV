from typing import List

from fastapi import UploadFile
from typing_extensions import Optional

from app.admin.application.dtos.base_dto import BaseDTO


class DatasetDTO(BaseDTO):
    id: str
    name: str
    description: str
    file_path: str | None = None


class DatasetCreateDTO(BaseDTO):
    name: str
    description: str
    file: Optional[UploadFile]
    dataset_type_id: str
    category_id: Optional[str]
    label_ids: List[str]
