from datetime import datetime
from typing import List

from app.admin.application.dtos.category_dto import CategoryCreateDTO, CategoryDTO
from app.admin.domain.exceptions.already_exists_exception import AlreadyExistsException
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.category import Category
from app.admin.domain.repositories.category_repository import CategoryRepository


class CategoryUseCase:
    def __init__(self, category_repository: CategoryRepository, user_authenticated: str):
        self.category_repository = category_repository
        self.user_authenticated = user_authenticated

    async def create(self, category_dto: CategoryCreateDTO) -> str:
        exists = await self.category_repository.exists({
            "$or": [
                {"name": category_dto.name}
            ],
            "status": True
        })
        if exists:
            raise AlreadyExistsException()

        category = Category(
            name=category_dto.name,
            description=category_dto.description,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        category = await self.category_repository.save(category)
        return category.id

    async def get_all(self) -> List[CategoryDTO]:
        category = await self.category_repository.get_all()
        result = []
        for x in category:
            result.append(CategoryDTO(
                id=x.id,
                name=x.name,
                description=x.description
            ))
        return result

    async def get_by_id(self, category_id: str) -> CategoryDTO:
        category = await self.category_repository.get(category_id)
        if not category:
            raise NotFoundException("categoría")
        return CategoryDTO(
            id=category.id,
            name=category.name,
            description=category.description
        )

    async def update(self, category_id: str, category_dto: CategoryCreateDTO) -> str:
        category: Category = await self.category_repository.get(category_id)
        if not category:
            raise NotFoundException("categoría")

        category.update(
            name=category_dto.name,
            description=category_dto.description,
            user_updated=self.user_authenticated
        )

        category = await self.category_repository.save(category)
        return category.id

    async def delete(self, category_id: str) -> str:
        category: Category = await self.category_repository.get(category_id)
        if not category:
            raise NotFoundException("categoría")
        category.delete(self.user_authenticated)
        category = await self.category_repository.save(category)
        return category.id
