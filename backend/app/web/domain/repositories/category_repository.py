from abc import ABC

from app.shared.domain.repositories.base_repository import CRUDRepository


class CategoryRepository(CRUDRepository, ABC):
    pass
