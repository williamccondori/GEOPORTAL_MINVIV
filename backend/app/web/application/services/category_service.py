from app.web.application.dtos.category_dto import CategoryNodeDTO
from app.web.domain.models.category import Category
from app.web.domain.repositories.category_repository import CategoryRepository


class CategoryService:
    def __init__(self, category_repository: CategoryRepository):
        self.category_repository = category_repository

    async def get_structure(self) -> list[CategoryNodeDTO]:
        categories: list[Category] = await self.category_repository.get_all()
        root_categories = [x for x in categories if x.category_id is None]

        result = []
        for root in root_categories:
            tree = self.__build_tree(root, categories)
            result.append(tree)

        return result

    def __build_tree(self, root: Category, categories: list[Category]) -> CategoryNodeDTO:
        children = [x for x in categories if x.category_id == root.id]
        node = CategoryNodeDTO(
            id=root.id,
            name=root.name,
            category_id=root.category_id,
            children=[self.__build_tree(child, categories) for child in children]
        )
        return node
