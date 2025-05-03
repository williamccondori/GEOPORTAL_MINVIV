from abc import ABC

from app.shared.domain.repositories.base_repository import CRUDRepository


class DatasetTypeRepository(CRUDRepository, ABC):
    pass
