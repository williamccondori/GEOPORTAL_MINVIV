from fastapi import APIRouter, Form, UploadFile, File, Depends

from app.shared.models.response import Response
from app.web.api.dependencies import get_chat_service
from app.web.application.dtos.chat_response_dto import ChatResponseDTO

chat_router = APIRouter()


@chat_router.post("/queries/", response_model=Response[list[ChatResponseDTO]])
async def consultar(
        session_id: str = Form(...),
        message: str = Form(...),
        service=Depends(get_chat_service)
) -> Response[list[ChatResponseDTO]]:
    return Response.correct(await service.get_query(session_id=session_id, message=message))


@chat_router.post("/voice-queries/", response_model=Response[list[ChatResponseDTO]])
async def consultar_por_voz(
        session_id: str = Form(...),
        audio: UploadFile = File(...),
        service=Depends(get_chat_service)
) -> Response[list[ChatResponseDTO]]:
    return Response.correct(await service.get_voice_query(session_id=session_id, audio=audio))
