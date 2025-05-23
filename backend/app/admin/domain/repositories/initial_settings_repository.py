from abc import ABC

from app.admin.domain.models.initial_settings import InitialSettings
from app.shared.domain.repositories.base_repository import CRUDRepository


class InitialSettingsRepository(CRUDRepository, ABC):
    def get_unique(self) -> InitialSettings:
        """
        Get unique initial settings.
        """
        pass
