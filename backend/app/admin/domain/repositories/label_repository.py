from abc import ABC

from app.shared.domain.repositories.base_repository import CRUDRepository


class LabelRepository(CRUDRepository, ABC):
    pass
