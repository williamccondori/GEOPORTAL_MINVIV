from typing import Optional
from urllib.parse import urlparse, urlunparse

import numpy as np
import pandas as pd
from pandas import DataFrame
from pydantic import BaseModel
from pydantic import HttpUrl

from app.shared.domain.exceptions.wms_exception import WmsException
from app.shared.domain.utils.constants import EMPTY_STRING, COORDINATE_SYSTEM, OUTPUT_HTML, WMS_FORMAT_LABELS, \
    WMS_TRANSPARENCY_SUPPORTED_FORMATS
from app.shared.infrastructure.utils.ogc_reader import WebMapService111, web_map_service


class StyleModel(BaseModel):
    """
    Data model for WMS service styles.
    """
    title: str
    legend: str


class ExportModel(BaseModel):
    """
    Data model for export URLs.
    """
    name: str
    url: str
    type: str


class LayerModel(BaseModel):
    """
    Data model for a WMS service layer.
    """
    name: str
    title: str
    abstract: str
    keywords: list[str] = []
    bounding_box: list[float]
    styles: list[StyleModel] = {}
    export_urls: list[ExportModel] = []
    thumbnail: str = EMPTY_STRING


class WebMapServiceInfoModel(BaseModel):
    """
    Data model for WMS service information.
    """
    url: str
    name: str
    title: str
    description: str
    version: str
    keywords: list[str] = []
    operations: list[str] = []
    layers: list[LayerModel]


class FeatureInfoModel(BaseModel):
    """
    Data model for WMS feature information.
    """
    key: str
    value: str
    type: str


class FeatureInfoResultModel(BaseModel):
    """
    Data model for the result of a WMS feature info request.
    """
    information: list[FeatureInfoModel]


def __get_type(value: str):
    """
    Gets the type of value.
    Args:
        value: Value.
    Returns:
        Value type.
    """
    if value.startswith("http"):
        return "link"
    if value.isnumeric():
        return "number"
    if value.endswith(".jpg") or value.endswith(".png"):
        return "image"
    return "string"


def __get_base_url(url: HttpUrl) -> HttpUrl:
    """
    Gets the base URL from an external service, stripping query parameters.
    Args:
        url: Service URL.
    Returns:
        Base URL.
    """
    parsed = urlparse(str(url))
    # Elimina query y fragment
    clean_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
    return HttpUrl(clean_url)


def __get_data_from_dataframe(data_frames: list[DataFrame], is_geoserver: bool) -> list[FeatureInfoResultModel]:
    """
    Gets data from a list of DataFrames.
    Args:
        data_frames: List of DataFrames.
        is_geoserver: Indicates if the service is from GeoServer.
    Returns:
        List of feature info results.
    """
    results: list[FeatureInfoResultModel] = []
    for data_frame in data_frames:
        if not is_geoserver:
            if data_frame.shape[0] > 1 and data_frame.shape[1] == 2:
                data_frame = data_frame.set_index(data_frame.columns[0])
                data_frame = data_frame.transpose()

        data_frame.columns = data_frame.columns.astype(str).str.upper()

        ignored_columns = ["ID", "FID", "GUID", "GID", "OBJECTID", "SHAPE"]  # noqa
        area_columns = ["SHAPE.AREA", "SHAPE.STAREA", "ST_AREASHAPE", "SHAPE.STAREASHAPE"]  # noqa
        perimeter_columns = ["SHAPE.LEN", "SHAPE.STLENGTH", "ST_LENGTHSHAPE", "SHAPE.STLENGTHSHAPE"]  # noqa

        data_frame = data_frame.drop(columns=ignored_columns + area_columns + perimeter_columns, errors='ignore')

        if data_frame.empty:
            return []

        data_frame = data_frame.replace({np.nan: None, pd.NaT: None, "Null": None}).fillna(EMPTY_STRING)
        data_frame = data_frame.astype(str)

        record_dict: dict = data_frame.to_dict(orient='records')[0]
        results.append(FeatureInfoResultModel(
            information=[FeatureInfoModel(
                key=key.replace("_", " "),
                value=value,
                type=__get_type(value)
            ) for key, value in record_dict.items()]
        ))

    return results


def __get_export_urls(
        formats: list[str],
        base_url: str,
        layer_name: str,
        bbox: list[float],
        srs: str = COORDINATE_SYSTEM,
        width: int = 800
) -> \
        list[ExportModel]:
    """
    Generates export URLs from a format list for either WMS (GetMap) or WFS (GetFeature).
    Args:
        formats: List of MIME types.
        base_url: Base endpoint (e.g., WMS or WFS URL).
        layer_name: Name of the layer to export.
        bbox: Bounding box coordinates.
        width: Image width.
    Returns:
        List of ExportModel with name, url, and type.
    """
    export_urls: list[ExportModel] = []

    if not bbox or len(bbox) != 4:
        bbox = [-180, -90, 180, 90]

    min_x, min_y, max_x, max_y = bbox
    bbox_str = f"{min_x},{min_y},{max_x},{max_y}"

    aspect_ratio = (max_x - min_x) / (max_y - min_y) if (max_y - min_y) != 0 else 1
    height = round(width / aspect_ratio) if aspect_ratio != 0 else 600

    for fmt in formats:
        transparent_flag = ""
        if fmt in WMS_TRANSPARENCY_SUPPORTED_FORMATS:
            transparent_flag = "&transparent=true"

        label = WMS_FORMAT_LABELS.get(fmt, fmt.upper().split("/")[-1])
        url = (
            f"{base_url}?service=WMS&version=1.1.1&request=GetMap"
            f"&layers={layer_name}&format={fmt}"
            f"&bbox={bbox_str}&width={width}&height={height}&srs={srs}"
            f"{transparent_flag}"
        )
        export_urls.append(ExportModel(name=label, url=url, type=fmt))

    return export_urls


def __get_thumbnail(base_url: str,
                    layer_name: str,
                    bbox: list[float],
                    srs: str = COORDINATE_SYSTEM,
                    width: int = 400
                    ):
    if not bbox or len(bbox) != 4:
        bbox = [-180, -90, 180, 90]

    min_x, min_y, max_x, max_y = bbox
    bbox_str = f"{min_x},{min_y},{max_x},{max_y}"

    aspect_ratio = (max_x - min_x) / (max_y - min_y) if (max_y - min_y) != 0 else 1
    height = round(width / aspect_ratio) if aspect_ratio != 0 else 600

    url = (
        f"{base_url}?service=WMS&version=1.1.1&request=GetMap"
        f"&layers={layer_name}&format=image/png"
        f"&bbox={bbox_str}&width={width}&height={height}&srs={srs}"
        f"&transparent=true"
    )

    return url


def get_wms_info(url: HttpUrl, filters: Optional[str]) -> WebMapServiceInfoModel:
    """
    Gets WMS service information.
    Args:
        url: Service URL.
        filters: Filters.
    Returns:
        WMS service information.
    """
    try:
        base_url: HttpUrl = __get_base_url(url)

        wms: WebMapService111 = web_map_service(base_url)
        print(filters)

        if not wms:
            raise Exception()
    except Exception as e:
        raise WmsException("No se pudo conectar con el servicio WMS") from e

    layers: list[LayerModel] = []

    formats = []
    for op in wms.operations:
        if op.name == "GetMap":
            formats = op.formatOptions
            break

    for layer_name, layer_info in wms.contents.items():
        if not layer_info.queryable == 1:
            continue
        if len(list(layer_info.layers)) > 0:
            continue

        bbox: list[float] = []
        if layer_info.boundingBoxWGS84:
            bbox = list(map(float, layer_info.boundingBoxWGS84[:4]))

        styles: list[StyleModel] = []
        if layer_info.styles:
            for style_data in layer_info.styles.values():
                styles.append(StyleModel(
                    title=style_data.get("title", EMPTY_STRING),
                    legend=style_data.get("legend", EMPTY_STRING)
                ))

        export_urls = __get_export_urls(formats, str(base_url), layer_name, bbox)

        thumbnail = __get_thumbnail(str(base_url), layer_name, bbox)

        layers.append(
            LayerModel(
                name=layer_name,
                title=layer_info.title or EMPTY_STRING,
                bounding_box=bbox,
                keywords=layer_info.keywords or [],
                abstract=layer_info.abstract or EMPTY_STRING,
                styles=styles,
                export_urls=export_urls,
                thumbnail=thumbnail
            )
        )

    operations: list[str] = [operation.name for operation in wms.operations]
    return WebMapServiceInfoModel(
        url=str(base_url),
        name=wms.identification.type or EMPTY_STRING,
        title=wms.identification.title or EMPTY_STRING,
        version=wms.identification.version or EMPTY_STRING,
        description=wms.identification.abstract or EMPTY_STRING,
        keywords=wms.identification.keywords or [],
        operations=operations,
        layers=layers
    )


def get_wms_feature_info(url: HttpUrl, x: int, y: int, width: int, height: int,
                         bounding_box: str, layers: str, filters: str) -> list[FeatureInfoResultModel]:
    """
    Gets WMS feature information (GetFeatureInfo).
    Args:
        url: Service URL.
        x: X coordinate.
        y: Y coordinate.
        width: Image width.
        height: Image height.
        bounding_box: Bounding box.
        layers: Layers.
        filters: Filters.
    Returns:
        List of feature info results.
    """
    try:
        base_url: HttpUrl = __get_base_url(url)
        wms: WebMapService111 = web_map_service(base_url)
        if not wms:
            raise Exception()
    except Exception as e:
        print(e)
        return []

    bbox = tuple(map(float, bounding_box.split(',')))
    layer_list: list[str] = layers.split(',')

    feature_info = wms.get_feature_info(
        srs=COORDINATE_SYSTEM,
        xy=(x, y),
        size=(width, height),
        info_format=OUTPUT_HTML,
        bbox=bbox,
        layers=layer_list,
        query_layers=layer_list,
        cql_filter=filters
    )

    result: bytes = feature_info.read()
    result_text = result.decode('utf-8')

    try:
        tables: list[DataFrame] = pd.read_html(result_text)
    except ValueError:
        return []

    is_geoserver: bool = 'geoserver' in base_url.lower()  # noqa
    return __get_data_from_dataframe(tables, is_geoserver)


def get_legend_url(url: str, layer_name: str) -> str:
    """
    Gets the legend URL for a layer.
    Args:
        url: Service URL.
        layer_name: Layer name.
    Returns:
        Legend URL.
    """
    return f"{url}/wms?service=WMS&version=1.1.1&layer={layer_name}&request=GetLegendGraphic&format=image/png"
