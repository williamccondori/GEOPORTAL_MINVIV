from datetime import datetime

from app.admin.application.dtos.category_dto import CategoryCreateDTO, CategoryDTO, CategoryNodeDTO
from app.admin.domain.exceptions.not_found_exception import NotFoundException
from app.admin.domain.models.category import Category
from app.admin.domain.repositories.category_repository import CategoryRepository


class CategoryService:
    def __init__(self, category_repository: CategoryRepository, user_authenticated: str):
        self.category_repository = category_repository
        self.user_authenticated = user_authenticated

    async def get_structure(self) -> list[CategoryNodeDTO]:
        categories:  list[Category] = await self.category_repository.get_all()
        root_categories = [x for x in categories if x.category_id is None]

        result = []
        for root in root_categories:
            tree = self._build_tree(root, categories)
            result.append(tree)

        return result


    async def get_by_id(self, category_dto: str) -> CategoryDTO:
        category: Category = await self.category_repository.get(category_dto)
        if not category:
            raise NotFoundException("categoría")

        return CategoryDTO(
            id=category.id,
            name=category.name,
            description=category.description,
            category_id=category.category_id
        )

    async def create(self, category_dto: CategoryCreateDTO) -> str:
        category: Category = Category(
            name=category_dto.name,
            description=category_dto.description,
            category_id=category_dto.category_id,
            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        category = await self.category_repository.save(category)
        return category.id

    async def update(self, category_id: str, category_dto: CategoryCreateDTO) -> str:
        category: Category = await self.category_repository.get(category_id)
        if not category:
            raise NotFoundException("categoría")

        category.update(
            name=category_dto.name,
            description=category_dto.description,
            category_id=category_dto.category_id,
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

    def _build_tree(self, root: Category, categories: list[Category]) -> CategoryNodeDTO:
        children = [x for x in categories if x.category_id == root.id]
        node = CategoryNodeDTO(
            id=root.id,
            name=root.name,
            category_id=root.category_id,
            children=[self._build_tree(child, categories) for child in children]
        )
        return node