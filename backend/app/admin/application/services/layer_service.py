from datetime import datetime
from pathlib import Path

import geopandas as gpd
import pandas as pd
import psycopg2
from geo.Geoserver import Geoserver
from psycopg2.extras import RealDictCursor
from sqlalchemy import make_url, create_engine

from app.admin.application.dtos.layer_dto import LayerFormDTO, RegisteredLayerDTO
from app.admin.domain.models.layer import Layer
from app.admin.domain.repositories.layer_repository import LayerRepository
from app.config import settings
from app.shared.domain.exceptions.application_exception import ApplicationException


class LayerService:
    def __init__(self, layer_repository: LayerRepository, user_authenticated: str):
        self.layer_repository = layer_repository
        self.user_authenticated = user_authenticated

    @staticmethod
    async def get_cursor(database_name: str):
        url = make_url(settings.POSTGIS_STRING_CONNECTION)

        try:
            conn = psycopg2.connect(
                host=url.host,
                port=url.port,
                dbname=database_name,
                user=url.username,
                password=url.password
            )
            cur = conn.cursor(cursor_factory=RealDictCursor)
        except Exception:
            raise ApplicationException("No se pudo conectar a la base de datos")

        return cur, conn

    async def create(self, layer_form_dto: LayerFormDTO) -> str:
        exists = await self.layer_repository.exists({
            "$or": [
                {"code": layer_form_dto.code},
            ],
            "status": True
        })
        if exists:
            raise ApplicationException("El código de la capa ya existe.")

        registered_layer_dto = self.__register_in_geodatabase(
            layer_form_dto.code,
            layer_form_dto.shape_file_name
        )

        self.__register_in_geoserver(
            registered_layer_dto.table_name,
            layer_form_dto.name
        )

        layer = Layer(
            # Campos principales.
            name=layer_form_dto.name,

            # Campos de la publicación.
            table_name=registered_layer_dto.table_name,
            schema_name=registered_layer_dto.schema_name,

            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        layer = await self.layer_repository.save(layer)
        return layer.id

    @staticmethod
    def __get_geo_dataframe(shape_file_name: Path) -> gpd.GeoDataFrame:
        try:
            gdf = gpd.read_file(shape_file_name, encoding='utf-8')
        except ValueError:
            gdf = gpd.read_file(shape_file_name, encoding='utf-8')
            gdf = gdf.rename_geometry("geometry")

        if gdf.empty:
            raise ApplicationException("El archivo SHP está vacío o no contiene geometrías válidas.")

        if not hasattr(gdf, 'geometry') or gdf.geometry.empty:
            raise ApplicationException("El archivo SHP no contiene una columna de geometría válida.")

        # Nos aseguramos que el CRS sea WGS84 (EPSG:4326).
        if gdf.crs is None or gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)

        return gdf

    @staticmethod
    def __save_to_postgis(gdf: gpd.GeoDataFrame, db_url: str, tabla: str):
        engine = None

        try:
            gdf_copy = gdf.copy()

            # Convertir columnas de tipo objeto a datetime si es posible.
            for column in gdf_copy.columns:
                if column != gdf_copy.geometry.name and gdf_copy[column].dtype == object:
                    sample_values = gdf_copy[column].dropna().head(5)

                    if len(sample_values) > 0:
                        try:
                            pd.to_datetime(sample_values.iloc[0])
                            gdf_copy[column] = pd.to_datetime(gdf_copy[column], errors='coerce')
                        except (ValueError, TypeError):
                            gdf_copy[column] = gdf_copy[column].astype(str)

            # Asegurarse de que la geometría sea válida.
            if not gdf_copy.geometry.is_valid.all():
                gdf_copy['geometry'] = gdf_copy.geometry.buffer(0)

            engine = create_engine(db_url)

            gdf.to_postgis(
                name=tabla,
                con=engine,
                if_exists="replace",
                index=False,
                chunksize=1000  # Ajusta el tamaño del chunk según sea necesario para evitar problemas de memoria.
            )
        except Exception as e:
            print(e)
            raise ApplicationException("Error al guardar el archivo SHP en la base de datos PostGIS.")
        finally:
            if 'engine' in locals():
                engine.dispose()

    @staticmethod
    def __register_in_geoserver(table_name: str, title: str):
        try:
            geoserver = Geoserver(
                settings.GEOSERVER_URL,
                username=settings.GEOSERVER_USER,
                password=settings.GEOSERVER_PASSWORD,
            )

            # Registramos la capa en Geoserver.
            geoserver.publish_featurestore(
                store_name=settings.GEOSERVER_DATASTORE,
                pg_table=table_name,
                workspace=settings.GEOSERVER_WORKSPACE,
                title=title,
                advertised=True,
                abstract="Capa registrada desde la API del Ministerio de Vivienda.",
                keywords=["Ministerio de Vivienda", "Capa Geográfica"],
            )

            geoserver.reload()
        except Exception as e:
            print(e)
            raise ApplicationException(f"Error al registrar la capa en Geoserver")

    def __register_in_geodatabase(self, code: str, shape_file_name: str) -> RegisteredLayerDTO:
        try:
            # Lectura del archivo SHP.
            shape_file_path = Path(settings.STORAGE_PATH) / shape_file_name
            if not shape_file_path.exists():
                raise ApplicationException("El archivo SHP no existe o la ruta es incorrecta.")

            gdf = self.__get_geo_dataframe(shape_file_path)

            self.__save_to_postgis(
                gdf,
                settings.POSTGIS_STRING_CONNECTION,
                code
            )

            registered_layer = RegisteredLayerDTO(
                table_name=code,
                schema_name="public",
            )

            return registered_layer
        except ApplicationException:
            raise
        except Exception:
            raise ApplicationException("Error al leer el archivo SHP. Asegúrese de que el archivo sea válido.")
