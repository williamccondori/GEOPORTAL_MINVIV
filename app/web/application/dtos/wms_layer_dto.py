from typing import Optional

from pydantic import HttpUrl

from app.admin.application.dtos.base_dto import BaseDTO


class StyleResponseDTO(BaseDTO):
    title: str
    legend: str


class ExportResponseDTO(BaseDTO):
    name: str
    url: str
    type: str


class LayerResponseDTO(BaseDTO):
    name: str
    title: str
    abstract: str
    keywords: list[str] = []
    bounding_box: list[float]
    styles: list[StyleResponseDTO] = []
    exports: list[ExportResponseDTO] = []
    thumbnail: str


class WebMapServiceResponseDTO(BaseDTO):
    url: str
    name: str
    title: str
    version: str
    description: str
    keywords: list[str]
    operations: list[str]
    layers: list[LayerResponseDTO] = []


class WebMapServiceRequestDTO(BaseDTO):
    url: HttpUrl
    filters: Optional[str] = None


class WebMapServiceFeatureRequestDTO(BaseDTO):
    url: HttpUrl
    x: int
    y: int
    width: int
    height: int
    bounding_box: str
    layers: str
    filters: Optional[str] = None


class FeatureWebMapServiceInformationResponseDTO(BaseDTO):
    key: str
    value: str


class FeatureWebMapServiceResponseDTO(BaseDTO):
    information: list[FeatureWebMapServiceInformationResponseDTO] = []
