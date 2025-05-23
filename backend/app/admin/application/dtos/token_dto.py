from app.admin.application.dtos.base_dto import BaseDTO


class TokenDTO(BaseDTO):
    access_token: str
    token_type: str
