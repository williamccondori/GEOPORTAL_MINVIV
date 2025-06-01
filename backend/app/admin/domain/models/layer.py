from app.shared.domain.entities.base import Base


class Layer(Base):
    name: str

    table: str
    schema: str
