from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List

T = TypeVar("T")


class CRUDRepository(ABC, Generic[T]):
    @abstractmethod
    async def get_all(self, filters: Optional[dict] = None) -> List[T]:
        pass

    @abstractmethod
    async def get(self, user_id: str) -> Optional[T]:
        pass

    @abstractmethod
    async def find(self, param) -> Optional[T]:
        pass

    @abstractmethod
    async def save(self, user: T) -> T:
        pass

    @abstractmethod
    async def exists(self, filters: Optional[dict] = None) -> bool:
        pass
