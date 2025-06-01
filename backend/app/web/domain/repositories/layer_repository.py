from abc import ABC

from app.shared.domain.repositories.base_repository import CRUDRepository


class LayerRepository(CRUDRepository, ABC):
    pass
