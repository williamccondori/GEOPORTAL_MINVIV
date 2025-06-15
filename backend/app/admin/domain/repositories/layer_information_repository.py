from abc import abstractmethod, ABC


class LayerInformationRepository(ABC):
    @abstractmethod
    async def save(self, collection_name: str, dictionary: list[dict]) -> str:
        pass

    async def save_columns(self, code, columns, columns_with_prefix, columns_status):
        pass
