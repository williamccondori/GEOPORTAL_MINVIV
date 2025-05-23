from datetime import datetime
from pathlib import Path
from typing import List, Optional

from bson import ObjectId

from app.admin.application.dtos.dataset_type_dto import DatasetTypeCreateDTO, DatasetTypeDTO
from app.admin.domain.exceptions.already_exists_exception import AlreadyExistsException
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.exceptions.validation_exception import ValidationException
from app.admin.domain.models.dataset_type import DatasetType
from app.admin.domain.repositories.dataset_type_repository import DatasetTypeRepository


class DatasetTypeUseCase:
    URL_BASE = "http://localhost:8000"

    def __init__(self, dataset_type_repository: DatasetTypeRepository, user_authenticated: str):
        self.dataset_type_repository = dataset_type_repository
        self.user_authenticated = user_authenticated

    async def create(self, dataset_type_dto: DatasetTypeCreateDTO) -> str:
        exists = await self.dataset_type_repository.exists({
            "$or": [
                {"name": dataset_type_dto.name}
            ],
            "status": True
        })
        if exists:
            raise AlreadyExistsException()

        file_path = await self.__guardar_archivo(dataset_type_dto.file)

        dataset_type = DatasetType(
            name=dataset_type_dto.name,
            description=dataset_type_dto.description,
            file_path=file_path,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        dataset_type = await self.dataset_type_repository.save(dataset_type)
        return dataset_type.id

    async def get_all(self) -> List[DatasetTypeDTO]:
        dataset_type = await self.dataset_type_repository.get_all()
        result = []
        for x in dataset_type:
            result.append(DatasetTypeDTO(
                id=x.id,
                name=x.name,
                description=x.description
            ))
        return result

    async def get_by_id(self, dataset_type_id: str) -> DatasetTypeDTO:
        dataset_type: DatasetType = await self.dataset_type_repository.get(dataset_type_id)
        if not dataset_type:
            raise NotFoundException("tipo de conjunto de datos")
        return DatasetTypeDTO(
            id=dataset_type.id,
            name=dataset_type.name,
            description=dataset_type.description,
            file_path=f"{self.URL_BASE}/{dataset_type.file_path}"
        )

    async def update(self, dataset_type_id: str, dataset_type_dto: DatasetTypeCreateDTO) -> str:
        exists = await self.dataset_type_repository.exists({
            "$and": [
                {"name": dataset_type_dto.name},
                {"status": True},
                {"_id": {"$ne": ObjectId(dataset_type_id)}}
            ]
        })
        if exists:
            raise AlreadyExistsException()

        dataset_type: DatasetType = await self.dataset_type_repository.get(dataset_type_id)
        if not dataset_type:
            raise NotFoundException("tipo de conjunto de datos")

        file_path = await self.__guardar_archivo(dataset_type_dto.file)

        dataset_type.update(
            name=dataset_type_dto.name,
            description=dataset_type_dto.description,
            file_path=file_path,
            user_updated=self.user_authenticated
        )

        dataset_type = await self.dataset_type_repository.save(dataset_type)
        return dataset_type.id

    async def delete(self, dataset_type_id: str) -> str:
        dataset_type: DatasetType = await self.dataset_type_repository.get(dataset_type_id)
        if not dataset_type:
            raise NotFoundException("tipo de conjunto de datos")
        dataset_type.delete(self.user_authenticated)
        dataset_type = await self.dataset_type_repository.save(dataset_type)
        return dataset_type.id

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
