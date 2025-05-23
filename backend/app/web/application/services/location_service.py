import uuid

import pyproj
import requests

from app.config import settings
from app.shared.domain.exceptions.application_exception import ApplicationException
from app.web.application.dtos.location_dto import LocationRequestDTO, LocationResponseDTO, \
    CoordinatesRequestDTO, CoordinatesResponseDTO


class LocationService:
    def __init__(self):
        pass

    @staticmethod
    def __validate_coordinates_parameters(request: CoordinatesRequestDTO) -> None:
        if request.projection == "utm":
            if request.zone is None or request.zone == 0:
                raise ApplicationException("La proyección UTM requiere la zona.")
            if not (0 < request.x < 1000000 and 0 < request.y < 10000000):
                raise ApplicationException("Las coordenadas no están dentro de los límites.")
        else:
            if not (-180 < request.x < 180 and -85 < request.y < 85):
                raise ApplicationException("Las coordenadas no están dentro de los límites.")

    @staticmethod
    def __get_mapbox_url(location_name: str) -> str:
        url_mapbox: str = f"https://api.mapbox.com/geocoding/v5/mapbox.places/${location_name}.json"
        url_mapbox += f"?access_token={settings.MAPBOX_TOKEN}&language=es"
        return url_mapbox

    async def get_all_locations(
            self, request: LocationRequestDTO
    ) -> list[LocationResponseDTO]:
        location_type = {
            "country": 6,
            "place": 12,
            "locality": 14,
            "neighborhood": 16,
            "address": 18,
            "poi": 18,
        }

        response = requests.get(self.__get_mapbox_url(request.query))
        if response.status_code != 200:
            return []

        response_json = response.json()
        locations: list[dict] = response_json["features"]
        return [
            LocationResponseDTO(
                id=str(uuid.uuid4()),
                name=location.get("place_name"),
                center=list(reversed(location.get("center", []))),
                zoom=location_type.get(location.get("place_type", ["place"])[0], 12),
            )
            for location in locations
        ]

    async def get_coordinate(self, request: CoordinatesRequestDTO) -> CoordinatesResponseDTO:
        self.__validate_coordinates_parameters(request)
        if request.projection == "utm":
            input_project = pyproj.Proj(
                proj=request.projection,
                datum=request.datum,
                zone=request.zone
            )
        else:
            input_project = pyproj.Proj(
                proj=request.projection,
                datum=request.datum
            )

        output_project = pyproj.Proj(proj="latlong", datum="WGS84")
        input_crs = pyproj.CRS.from_proj4(input_project.srs)
        output_crs = pyproj.CRS.from_proj4(output_project.srs)

        transformer = pyproj.Transformer.from_crs(input_crs, output_crs)
        longitude, latitude = transformer.transform(request.x, request.y)
        return CoordinatesResponseDTO(
            longitude=longitude,
            latitude=latitude
        )
