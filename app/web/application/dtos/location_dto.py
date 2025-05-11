from app.web.application.dtos.base_dto import BaseDTO


class LocationRequestDTO(BaseDTO):
    query: str


class LocationResponseDTO(BaseDTO):
    id: str
    name: str
    center: list[float]
    zoom: int


class CoordinatesRequestDTO(BaseDTO):
    projection: str
    datum: str
    zone: int
    x: float
    y: float


class CoordinatesResponseDTO(BaseDTO):
    latitude: float
    longitude: float
