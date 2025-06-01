from fastapi import APIRouter, Depends

from app.shared.models.response import Response
from app.web.api.dependencies import get_category_service
from app.web.application.dtos.category_dto import CategoryNodeDTO

category_router = APIRouter()


@category_router.get("/structure/", response_model=Response[list[CategoryNodeDTO]])
async def get_all(service=Depends(get_category_service)) -> Response[list[CategoryNodeDTO]]:
    return Response.correct(await service.get_structure())
