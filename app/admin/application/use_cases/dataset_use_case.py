from datetime import datetime
from pathlib import Path
from typing import List, Optional

from bson import ObjectId

from app.admin.application.dtos.dataset_dto import DatasetCreateDTO, DatasetDTO
from app.admin.domain.exceptions.already_exists_exception import AlreadyExistsException
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.exceptions.validation_exception import ValidationException
from app.admin.domain.models.dataset import Dataset
from app.admin.domain.repositories.dataset_repository import DatasetRepository


class DatasetUseCase:
    URL_BASE = "http://localhost:8000"

    def __init__(self, dataset_repository: DatasetRepository, user_authenticated: str):
        self.dataset_repository = dataset_repository
        self.user_authenticated = user_authenticated

    async def create(self, dataset_dto: DatasetCreateDTO) -> str:
        exists = await self.dataset_repository.exists({
            "$or": [
                {"name": dataset_dto.name}
            ],
            "status": True
        })
        if exists:
            raise AlreadyExistsException()

        file_path = await self.__guardar_archivo(dataset_dto.file)

        dataset = Dataset(
            name=dataset_dto.name,
            description=dataset_dto.description,
            file_path=file_path,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        dataset = await self.dataset_repository.save(dataset)
        return dataset.id

    async def get_all(self) -> List[DatasetDTO]:
        dataset = await self.dataset_repository.get_all()
        result = []
        for x in dataset:
            result.append(DatasetDTO(
                id=x.id,
                name=x.name,
                description=x.description
            ))
        return result

    async def get_by_id(self, dataset_id: str) -> DatasetDTO:
        dataset: Dataset = await self.dataset_repository.get(dataset_id)
        if not dataset:
            raise NotFoundException("tipo de conjunto de datos")
        return DatasetDTO(
            id=dataset.id,
            name=dataset.name,
            description=dataset.description,
            file_path=f"{self.URL_BASE}/{dataset.file_path}"
        )

    async def update(self, dataset_id: str, dataset_dto: DatasetCreateDTO) -> str:
        exists = await self.dataset_repository.exists({
            "$and": [
                {"name": dataset_dto.name},
                {"status": True},
                {"_id": {"$ne": ObjectId(dataset_id)}}
            ]
        })
        if exists:
            raise AlreadyExistsException()

        dataset: Dataset = await self.dataset_repository.get(dataset_id)
        if not dataset:
            raise NotFoundException("tipo de conjunto de datos")

        file_path = await self.__guardar_archivo(dataset_dto.file)

        dataset.update(
            name=dataset_dto.name,
            description=dataset_dto.description,
            file_path=file_path,
            user_updated=self.user_authenticated
        )

        dataset = await self.dataset_repository.save(dataset)
        return dataset.id

    async def delete(self, dataset_id: str) -> str:
        dataset: Dataset = await self.dataset_repository.get(dataset_id)
        if not dataset:
            raise NotFoundException("tipo de conjunto de datos")
        dataset.delete(self.user_authenticated)
        dataset = await self.dataset_repository.save(dataset)
        return dataset.id

    @staticmethod
    async def __guardar_archivo(file):
        file_path: Optional[str] = None
        if file is not None:
            if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
                raise ValidationException("El formato del archivo no es válido")
            if file.size > 10485760:
                raise ValidationException("El tamaño del archivo no debe superar los 10MB")

            folder = Path("static")
            folder.mkdir(parents=True, exist_ok=True)
            final_file_path = folder / file.filename
            with open(final_file_path, "wb") as buffer:
                buffer.write(await file.read())
            file_path = str(final_file_path)
        return file_path
