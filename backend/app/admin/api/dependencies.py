import jwt
from fastapi import Depends, Security
from fastapi.security import OAuth2PasswordBearer

from app.admin.application.services.base_layer_service import BaseLayerService
from app.admin.application.services.category_service import CategoryService
from app.admin.application.services.file_service import FileService
from app.admin.application.services.initial_settings_service import InitialSettingsService
from app.admin.application.services.layer_service import LayerService
from app.admin.application.services.rol_service import RoleService
from app.admin.application.services.user_service import UserService
from app.admin.application.services.wms_layer_service import WmsLayerService
from app.admin.application.use_cases.dataset_type_use_case import DatasetTypeUseCase
from app.admin.application.use_cases.dataset_use_case import DatasetUseCase
from app.admin.application.use_cases.get_publication_use_case import PublicationUseCase
from app.admin.application.use_cases.label_use_case import LabelUseCase
from app.admin.domain.exceptions.not_authenticated_exception import NotAuthenticatedException
from app.admin.domain.repositories.base_layer_repository import BaseLayerRepository
from app.admin.domain.repositories.category_repository import CategoryRepository
from app.admin.domain.repositories.dataset_repository import DatasetRepository
from app.admin.domain.repositories.dataset_type_repository import DatasetTypeRepository
from app.admin.domain.repositories.initial_settings_repository import InitialSettingsRepository
from app.admin.domain.repositories.label_repository import LabelRepository
from app.admin.domain.repositories.layer_repository import LayerRepository
from app.admin.domain.repositories.publication_repository import PublicationRepository
from app.admin.domain.repositories.role_repository import RoleRepository
from app.admin.domain.repositories.user_repository import UserRepository
from app.admin.domain.repositories.wms_layer_repository import WmsLayerRepository
from app.admin.infrastructure.persistence.repositories.base_layer_repository_impl import BaseLayerRepositoryImpl
from app.admin.infrastructure.persistence.repositories.category_repository_impl import CategoryRepositoryImpl
from app.admin.infrastructure.persistence.repositories.dataset_repository_impl import DatasetRepositoryImpl
from app.admin.infrastructure.persistence.repositories.dataset_type_repository_impl import DatasetTypeRepositoryImpl
from app.admin.infrastructure.persistence.repositories.initial_settings_repository_impl import \
    InitialSettingsRepositoryImpl
from app.admin.infrastructure.persistence.repositories.label_repository_impl import LabelRepositoryImpl
from app.admin.infrastructure.persistence.repositories.layer_repository_impl import LayerRepositoryImpl
from app.admin.infrastructure.persistence.repositories.publication_repository_impl import PublicationRepositoryImpl
from app.admin.infrastructure.persistence.repositories.role_repository_impl import RoleRepositoryImpl
from app.admin.infrastructure.persistence.repositories.user_repository_impl import UserRepositoryImpl
from app.admin.infrastructure.persistence.repositories.wms_layer_repository_impl import WmsLayerRepositoryImpl

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def get_authenticated_user(token: str = Security(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise NotAuthenticatedException()
        return sub
    except Exception:
        raise NotAuthenticatedException()


def get_label_use_case(
        label_repository: LabelRepository = Depends(LabelRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return LabelUseCase(label_repository, user_authenticated)


def get_dataset_type_use_case(
        dataset_type_repository: DatasetTypeRepository = Depends(DatasetTypeRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return DatasetTypeUseCase(dataset_type_repository, user_authenticated)


def get_dataset_use_case(
        dataset_repository: DatasetRepository = Depends(DatasetRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return DatasetUseCase(dataset_repository, user_authenticated)


def get_role_service(
        role_repository: RoleRepository = Depends(RoleRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return RoleService(role_repository, user_authenticated)


def get_user_service(
        user_repository: UserRepository = Depends(UserRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return UserService(user_repository, user_authenticated)


def get_user_administrator_service(
        user_repository: UserRepository = Depends(UserRepositoryImpl),
):
    return UserService(user_repository)


def get_publication_use_case(
        publication_repository: PublicationRepository = Depends(PublicationRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return PublicationUseCase(publication_repository, user_authenticated)


def get_base_layer_service(
        base_layer_repository: BaseLayerRepository = Depends(BaseLayerRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return BaseLayerService(base_layer_repository, user_authenticated)


def get_wms_layer_service(
        wms_layer_repository: WmsLayerRepository = Depends(WmsLayerRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return WmsLayerService(wms_layer_repository, user_authenticated)


def get_initial_settings_service(
        initial_settings_repository: InitialSettingsRepository = Depends(InitialSettingsRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return InitialSettingsService(initial_settings_repository, user_authenticated)


def get_category_service(
        category_repository: CategoryRepository = Depends(CategoryRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return CategoryService(category_repository, user_authenticated)


def get_file_service(user_authenticated: str = Depends(get_authenticated_user)) -> FileService:
    return FileService(user_authenticated)


def get_layer_service(
        layer_repository: LayerRepository = Depends(LayerRepositoryImpl),
        user_authenticated: str = Depends(get_authenticated_user),
):
    return LayerService(layer_repository, user_authenticated)
