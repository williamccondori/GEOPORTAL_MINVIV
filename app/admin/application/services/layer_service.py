from app.admin.domain.repositories.layer_repository import LayerRepository


class LayerService:
    def __init__(self, layer_repository: LayerRepository, user_authenticated: str):
        self.layer_repository = layer_repository
        self.user_authenticated = user_authenticated