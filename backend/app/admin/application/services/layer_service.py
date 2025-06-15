from datetime import datetime
from pathlib import Path

import geopandas as gpd
import pandas as pd
import psycopg2
from geo.Geoserver import Geoserver
from psycopg2.extras import RealDictCursor
from sqlalchemy import make_url, create_engine, text

from app.admin.application.dtos.layer_dto import LayerFormDTO, RegisteredLayerDTO, LayerDTO
from app.admin.domain.models.layer import Layer
from app.admin.domain.repositories.category_repository import CategoryRepository
from app.admin.domain.repositories.layer_information_repository import LayerInformationRepository
from app.admin.domain.repositories.layer_repository import LayerRepository
from app.config import settings
from app.shared.domain.exceptions.application_exception import ApplicationException


class LayerService:
    def __init__(self, layer_repository: LayerRepository, category_repository: CategoryRepository,
                 layer_information_repository: LayerInformationRepository,
                 user_authenticated: str):
        self.layer_repository = layer_repository
        self.category_repository = category_repository
        self.layer_information_repository = layer_information_repository
        self.user_authenticated = user_authenticated

    async def get_all(self) -> list[LayerDTO]:
        layers: list[Layer] = await self.layer_repository.get_all()
        result = []
        for x in layers:
            category = await self.category_repository.get(x.category_id)
            if category:
                category_name = category.name
            else:
                category_name = "Sin categoría"

            result.append(LayerDTO(
                id=x.id,
                category_name=category_name,
                code=x.code,
                name=x.name,
                is_visible=x.is_visible,
            ))
        return result

    async def create(self, layer_form_dto: LayerFormDTO) -> str:
        exists = await self.layer_repository.exists({
            "$or": [
                {"code": layer_form_dto.code},
            ],
            "status": True
        })
        if exists:
            raise ApplicationException("El código de la capa ya existe.")

        registered_layer_dto = await self.__register_in_geodatabase(
            layer_form_dto.code,
            layer_form_dto.shape_file_name
        )

        # Se registra en GEOSERVER.

        self.__register_in_geoserver(
            registered_layer_dto.view_name,
            layer_form_dto.name
        )

        wms_url = f"{settings.GEOSERVER_URL}/{settings.GEOSERVER_WORKSPACE}/{layer_form_dto.view_name}/wms"
        wfs_url = f"{settings.GEOSERVER_URL}/{settings.GEOSERVER_WORKSPACE}/{layer_form_dto.view_name}/wfs"

        layer = Layer(
            # Campos principales.
            category_id=layer_form_dto.categoryId,
            code=layer_form_dto.code,
            name=layer_form_dto.name,
            description=layer_form_dto.description,
            shape_file_name=layer_form_dto.shape_file_name,

            # Campos de la publicación.
            layer_information_name=registered_layer_dto.layer_information_name,
            table_name=registered_layer_dto.table_name,
            view_name=registered_layer_dto.view_name,
            schema_name=registered_layer_dto.schema_name,

            # Campos por defecto.
            wms_url=wms_url,
            wfs_url=wfs_url,
            allow_download=False,
            is_visible=True,

            status=True,
            user_created=self.user_authenticated,
            created_at=datetime.now()
        )

        layer = await self.layer_repository.save(layer)
        return layer.id

    async def delete(self, layer_id: str) -> str:
        layer = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("La capa no existe o ha sido eliminada.")

        # Eliminar la capa de la base de datos PostGIS.
        cur, conn = await self.get_cursor(settings.POSTGIS_DATABASE_NAME)
        try:
            cur.execute(f'DROP TABLE IF EXISTS "{layer.table_name}" CASCADE;')
            conn.commit()
        except Exception as e:
            print(e)
            raise ApplicationException("Error al eliminar la capa de la base de datos PostGIS.")
        finally:
            cur.close()
            conn.close()

        # Eliminar la capa de Geoserver.
        try:
            geoserver = Geoserver(
                settings.GEOSERVER_URL,
                username=settings.GEOSERVER_USER,
                password=settings.GEOSERVER_PASSWORD,
            )
            geoserver.delete_featurestore(
                featurestore_name=settings.GEOSERVER_FEATURESTORE_NAME,
                workspace=settings.GEOSERVER_WORKSPACE
            )
            geoserver.reload()
        except Exception as e:
            print(e)
            raise ApplicationException("Error al eliminar la capa de Geoserver.")

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

    async def __save_to_mongo_db(self, code: str,
                                 gdf: gpd.GeoDataFrame):
        try:
            df = pd.DataFrame(gdf.drop(columns='geometry'))

            df['geometry'] = gdf.geometry.apply(lambda geom: geom.__geo_interface__)

            dictionary = df.to_dict(orient='records')

            await self.layer_information_repository.save(code, dictionary)

            # Guardar las columnas del DataFrame en MongoDB originales y con el prefijo "F_" y un estado true/false para cada una con
            # el fin de cambiar el nombre de las columnas en la vista del geoportal, identificar por code.

            columns = df.columns.tolist()

            columns = [col for col in columns if col != 'geometry']  # Excluir la columna de geometría

            columns_with_prefix = [f'F_{col}' for col in columns]

            columns_status = {col: True for col in columns}

            await self.layer_information_repository.save_columns(code, columns, columns_with_prefix, columns_status)


        except Exception as e:
            print(e)
            raise ApplicationException("Error al guardar los datos en MongoDB.")

    async def __register_in_geodatabase(self, code: str, shape_file_name: str) -> RegisteredLayerDTO:
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

            layer_information_name = f"geo_{code}"

            # Generar una vista para PostgresSQL con el objetivo de cambiar el nombre de las columnas.
            view_name = f"view_{code}"
            try:
                # Obtener las columnas del DataFrame
                columns = gdf.columns.tolist()
                # Filtrar la columna de geometría
                columns = [col for col in columns if col != 'geometry']

                # Crear la definición de la vista
                columns_definition = ", ".join([f'"{col}" AS "F_{col}"' for col in columns])
                view_query = f'CREATE OR REPLACE VIEW public.{view_name} AS SELECT {columns_definition}, geometry FROM public.{code};'

                # Ejecutar la consulta SQL para crear la vista
                engine = create_engine(settings.POSTGIS_STRING_CONNECTION)
                with engine.connect() as connection:
                    connection.execute(text(view_query))
                    connection.commit()
                engine.dispose()
            except Exception as e:
                print(e)
                raise ApplicationException(
                    "No se pudo crear la vista en la base de datos PostGIS. Asegúrese de que el código sea válido.")

            await self.__save_to_mongo_db(
                layer_information_name,
                gdf
            )

            registered_layer = RegisteredLayerDTO(
                layer_information_name=layer_information_name,
                table_name=code,
                schema_name="public",
                view_name=view_name
            )

            return registered_layer
        except ApplicationException:
            raise
        except Exception:
            raise ApplicationException("Error al leer el archivo SHP. Asegúrese de que el archivo sea válido.")
