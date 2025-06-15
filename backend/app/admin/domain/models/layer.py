from typing import Optional

from app.shared.domain.entities.base import Base


class Layer(Base):
    id: Optional[str] = None
    category_id: str
    code: str
    name: str
    description: str
    shape_file_name: str
    layer_information_name: str
    table_name: str
    view_name: str
    schema_name: str
    wms_url: str
    wfs_url: str
    allow_download: bool = False
    is_visible: bool = True

