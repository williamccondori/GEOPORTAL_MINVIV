from typing import Optional

from app.web.application.dtos.base_dto import BaseDTO


class CategoryNodeDTO(BaseDTO):
    id: str
    category_id: Optional[str] = None
    name: str
    children: Optional[list['CategoryNodeDTO']] = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.children = [] if self.children is None else self.children
