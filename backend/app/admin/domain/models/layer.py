from app.shared.domain.entities.base import Base


class Layer(Base):
    name: str

    table_name: str
    schema_name: str
