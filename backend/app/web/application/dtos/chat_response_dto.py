from typing import Optional

from app.admin.application.dtos.base_dto import BaseDTO


class ChatResponseDTO(BaseDTO):
    message: str
    initial_message: str
    data: Optional[dict] = None
    action: Optional[str] = None
    action_window: Optional[str] = None
    action_control: Optional[str] = None
