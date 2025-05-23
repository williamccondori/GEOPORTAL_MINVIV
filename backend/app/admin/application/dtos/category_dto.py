from typing import Optional

from app.admin.application.dtos.base_dto import BaseDTO


class CategoryDTO(BaseDTO):
    id: str
    name: str
    description: str
    category_id: Optional[str] = None


class CategoryCreateDTO(BaseDTO):
    name: str
    description: str
    category_id: Optional[str] = None


class CategoryNodeDTO(BaseDTO):
    id: str
    category_id: Optional[str] = None
    name: str
    children: Optional[list['CategoryNodeDTO']] = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.children = [] if self.children is None else self.children
