from abc import ABC, abstractmethod

from app.web.domain.models.initial_settings import InitialSettings


class InitialSettingsRepository(ABC):
    @abstractmethod
    async def get(self) -> InitialSettings:
        pass
