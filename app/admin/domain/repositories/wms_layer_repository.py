from abc import ABC

from app.shared.domain.repositories.base_repository import CRUDRepository


class WmsLayerRepository(CRUDRepository, ABC):
    pass
