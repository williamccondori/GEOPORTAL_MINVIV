from abc import ABC

from app.shared.domain.repositories.base_repository import CRUDRepository


class UserRepository(CRUDRepository, ABC):
    pass
