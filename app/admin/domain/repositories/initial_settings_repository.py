from abc import ABC

from app.shared.domain.repositories.base_repository import CRUDRepository


class InitialSettingsRepository(CRUDRepository, ABC):
    def get_unique(self) -> dict:
        """
        Get unique initial settings.
        """
        pass