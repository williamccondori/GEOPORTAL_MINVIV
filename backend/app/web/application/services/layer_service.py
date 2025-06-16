from typing import Optional

import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.linear_model import LinearRegression

from app.shared.domain.exceptions.application_exception import ApplicationException
from app.web.application.dtos.layer_dto import LayerSearchDTO, LayerDTO
from app.web.application.dtos.layer_information_dto import LayerInformationTableDTO, LayerInformationFilterDTO, \
    LayerInformationOptionDTO
from app.web.domain.models.layer import Layer
from app.web.domain.models.layer_information_table import LayerInformationTable
from app.web.domain.models.wms_layer import WmsLayer
from app.web.domain.repositories.category_repository import CategoryRepository
from app.web.domain.repositories.layer_information_repository import LayerInformationRepository
from app.web.domain.repositories.layer_repository import LayerRepository
from app.web.domain.repositories.wms_layer_repository import WmsLayerRepository


class LayerService:
    def __init__(self, layer_repository: LayerRepository, wms_layer_repository: WmsLayerRepository,
                 category_repository: CategoryRepository, layer_information_repository: LayerInformationRepository):
        self.layer_repository = layer_repository
        self.wms_layer_repository = wms_layer_repository
        self.category_repository = category_repository
        self.layer_information_repository = layer_information_repository

    async def get_by_id(self, layer_id: str) -> LayerDTO:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        category = await self.category_repository.get(layer.category_id)
        if category:
            category_name = category.name
        else:
            category_name = "Sin categoría"

        return LayerDTO(
            id=layer.id,
            category_name=category_name,
            name=layer.code,
            title=layer.name,
            description=layer.description,
            url=layer.wms_url,
            download_url=layer.wfs_url
        )

    async def get_all(self, layer_search_dto: LayerSearchDTO) -> list[LayerDTO]:
        result: list[LayerDTO] = []

        layers: list[Layer] = await self.layer_repository.get_all({
            "category_id": layer_search_dto.category_id,
            "is_visible": True
        })

        for layer in layers:
            category = await self.category_repository.get(layer.category_id)
            if category:
                category_name = category.name
            else:
                category_name = "Sin categoría"

            result.append(LayerDTO(
                id=layer.id,
                category_name=category_name,
                name=layer.view_name,
                title=layer.name,
                description=layer.description,
                url=layer.wms_url,
                download_url=layer.wfs_url
            ))

        if layer_search_dto.include_wms_layers:
            wms_layers: list[WmsLayer] = await self.wms_layer_repository.get_all({
                "category_id": layer_search_dto.category_id,
                "is_visible": True
            })
            for wms_layer in wms_layers:
                category = await self.category_repository.get(wms_layer.category_id)
                if category:
                    category_name = category.name
                else:
                    category_name = "Sin categoría"

                result.append(LayerDTO(
                    id=wms_layer.id,
                    category_name=category_name,
                    name=wms_layer.code,
                    title=wms_layer.name,
                    description="WMS",
                    url=wms_layer.url
                ))

        return result

    async def get_geojson(self, layer_id: str, row_id: str) -> dict:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        columns = await self.layer_information_repository.get_columns(layer.layer_information_name)
        if not columns:
            raise ApplicationException("No se ha encontrado información de columnas para la capa solicitada")

        row = await self.layer_information_repository.get_geojson(layer.layer_information_name, row_id)
        if not row:
            raise ApplicationException("No se ha encontrado información geográfica para la capa solicitada")

        allowed_columns = [
            base for base in columns['columns']
            if columns['columns_status'].get(base, False)
        ]

        for feature in row.get("features", []):
            properties = feature.get("properties", {})
            for property in list(properties.keys()):
                if property in allowed_columns:
                    new_name = columns['columns_with_prefix'][columns['columns'].index(property)]
                    properties[new_name] = properties.pop(property)
                else:
                    # Si no está permitido, lo eliminamos
                    properties.pop(property)

        return row

    async def get_table(self, layer_id: str) -> LayerInformationTableDTO:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        columns = await self.layer_information_repository.get_columns(layer.layer_information_name)
        if not columns:
            raise ApplicationException("No se ha encontrado información de columnas para la capa solicitada")

        table_information: Optional[LayerInformationTable] = await self.layer_information_repository.get_table(
            layer.layer_information_name)
        if not table_information:
            raise ApplicationException("No se ha encontrado información tabular para la capa solicitada")

        # 1) Construye la lista filtrada con mapeo
        columns_with_mapping = [
            {
                "name": pref,  # columna con prefijo (header)
                "original": base  # columna real (dato)
            }
            for base, pref in zip(columns['columns'], columns['columns_with_prefix'])
            if columns['columns_status'].get(base, False)
        ]

        # 2) Lista de columnas originales permitidas
        allowed_original_columns = [c["original"] for c in columns_with_mapping]

        # 3) Recorta cada fila de data a solo esas columnas
        filtered_data = []
        for row in table_information.data:
            filtered_row = {key: row[key] for key in allowed_original_columns if key in row}
            if '_id' in row:
                filtered_row['_id'] = row['_id']
            filtered_data.append(filtered_row)

        # Los filtros también necesitan analogía.
        base_to_pref = {c["original"]: c["name"] for c in columns_with_mapping}

        # 4) Devuelve todo listo
        return LayerInformationTableDTO(
            columns=columns_with_mapping,
            data=filtered_data,
            filters=[
                LayerInformationFilterDTO(
                    label=base_to_pref.get(x.name, x.name),
                    name=x.name,
                    options=[LayerInformationOptionDTO(id=label.id, label=label.label) for label in x.options]
                )
                for x in table_information.filters
            ]
        )

    async def filter_table(self, layer_id: str, filter_columns: dict) -> dict:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        columns = await self.layer_information_repository.get_columns(layer.layer_information_name)
        if not columns:
            raise ApplicationException("No se ha encontrado información de columnas para la capa solicitada")

        results = await self.layer_information_repository.get_geometry_and_table(
            layer.layer_information_name, filter_columns)

        return results

    async def get_summary(self, layer_id: str) -> dict:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        columns = await self.layer_information_repository.get_columns(layer.layer_information_name)
        if not columns:
            raise ApplicationException("No se ha encontrado información de columnas para la capa solicitada")

        table_information: Optional[LayerInformationTable] = await self.layer_information_repository.get_table(
            layer.layer_information_name)
        if not table_information:
            raise ApplicationException("No se ha encontrado información tabular para la capa solicitada")

        # 1) Construye la lista filtrada con mapeo
        columns_with_mapping = [
            {
                "name": pref,  # nombre legible (prefijo)
                "original": base  # columna real
            }
            for base, pref in zip(columns['columns'], columns['columns_with_prefix'])
            if columns['columns_status'].get(base, False)
        ]

        allowed_original_columns = [c["original"] for c in columns_with_mapping]

        # 2) Filtra data
        filtered_data = []
        for row in table_information.data:
            filtered_row = {key: row[key] for key in allowed_original_columns if key in row}
            if '_id' in row:
                filtered_row['_id'] = row['_id']
            filtered_data.append(filtered_row)

        # 3) Para cada filtro, calcula número único
        summaries = []

        for filter_def in table_information.filters:
            filter_column = filter_def.name

            # Busca prefijo legible
            display_name = next(
                (c["name"] for c in columns_with_mapping if c["original"] == filter_column),
                filter_column
            )

            unique_values = set()
            for row in filtered_data:
                value = row.get(filter_column)
                if value is None:
                    continue
                if isinstance(value, str):
                    value = value.strip()
                unique_values.add(value)

            count = len(unique_values)

            summaries.append({
                "name": display_name,
                "value": count,
                "description": f"Número de categorías únicas para {display_name}: {count}"
            })

        return {
            "summaries": summaries
        }

    async def get_graphs(self, layer_id: str) -> dict:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        columns = await self.layer_information_repository.get_columns(layer.layer_information_name)
        if not columns:
            raise ApplicationException("No se ha encontrado información de columnas para la capa solicitada")

        table_information: Optional[LayerInformationTable] = await self.layer_information_repository.get_table(
            layer.layer_information_name)
        if not table_information:
            raise ApplicationException("No se ha encontrado información tabular para la capa solicitada")

        # 1) Construye la lista filtrada con mapeo
        columns_with_mapping = [
            {
                "name": pref,  # columna con prefijo (header)
                "original": base  # columna real (dato)
            }
            for base, pref in zip(columns['columns'], columns['columns_with_prefix'])
            if columns['columns_status'].get(base, False)
        ]

        # 2) Lista de columnas originales permitidas
        allowed_original_columns = [c["original"] for c in columns_with_mapping]

        # 3) Recorta cada fila de data a solo esas columnas
        filtered_data = []
        for row in table_information.data:
            filtered_row = {key: row[key] for key in allowed_original_columns if key in row}
            if '_id' in row:
                filtered_row['_id'] = row['_id']
            filtered_data.append(filtered_row)

        # 3) Para cada filtro, agrupa y arma gráfico
        graphs = []
        for filter_def in table_information.filters:
            filter_column = filter_def.name  # nombre real de la columna

            # 1) Busca el nombre bonito (prefijo)
            display_name = next(
                (c["name"] for c in columns_with_mapping if c["original"] == filter_column),
                filter_column  # fallback: usa el real si no lo encuentra
            )

            counts = {}

            # 2) Agrupa
            for row in filtered_data:
                value = row.get(filter_column)
                if value is None:
                    continue
                if isinstance(value, str):
                    value = value.strip()
                counts[value] = counts.get(value, 0) + 1

            labels = list(counts.keys())
            data = list(counts.values())

            chart = {
                "title": f"Distribución por {display_name}",
                "type": "bar",
                "labels": labels,
                "datasets": [{
                    "label": f"Cantidad por {display_name}",
                    "data": data,
                    "backgroundColor": [
                                           "#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#00BCD4", "#FFC107"
                                       ][:len(labels)]
                }]
            }
            graphs.append(chart)

        return {
            "graphs": graphs
        }

    async def get_tendencies(self, layer_id: str) -> dict:
        layer: Optional[Layer] = await self.layer_repository.get(layer_id)
        if not layer:
            raise ApplicationException("No se ha encontrado la capa solicitada")

        columns = await self.layer_information_repository.get_columns(layer.layer_information_name)
        if not columns:
            raise ApplicationException("No se ha encontrado información de columnas para la capa solicitada")

        table_information: Optional[LayerInformationTable] = await self.layer_information_repository.get_table(
            layer.layer_information_name)
        if not table_information:
            raise ApplicationException("No se ha encontrado información tabular para la capa solicitada")

        # 1) Construye la lista filtrada con mapeo
        columns_with_mapping = [
            {
                "name": pref,  # columna con prefijo (header)
                "original": base  # columna real (dato)
            }
            for base, pref in zip(columns['columns'], columns['columns_with_prefix'])
            if columns['columns_status'].get(base, False)
        ]

        # 2) Lista de columnas originales permitidas
        allowed_original_columns = [c["original"] for c in columns_with_mapping]

        # 3) Recorta cada fila de data a solo esas columnas
        filtered_data = []
        for row in table_information.data:
            filtered_row = {key: row[key] for key in allowed_original_columns if key in row}
            if '_id' in row:
                filtered_row['_id'] = row['_id']
            filtered_data.append(filtered_row)

        tendencies = []

        if layer.layer_information_name == "geo_suelo_urbano":
            X_area = []
            Y_viviendas = []
            X_features = []  # Para clustering y PCA

            for row in filtered_data:
                try:
                    area = float(row.get("ÁREA_(ha)", 0) or 0)
                    viviendas = int(row.get("VIVIENDAS", 0) or 0)
                    beneficiarios = int(row.get("BENEFICIAR", 0) or 0)
                    if area > 0 and viviendas > 0:
                        X_area.append([area])
                        Y_viviendas.append(viviendas)
                        X_features.append([area, viviendas, beneficiarios])
                except (TypeError, ValueError):
                    pass

            if len(X_area) >= 2:
                # Regresión lineal
                lr = LinearRegression()
                lr.fit(X_area, Y_viviendas)

                # Línea de tendencia
                x_min, x_max = min(X_area)[0], max(X_area)[0]
                x_line = np.linspace(x_min, x_max, 10).reshape(-1, 1)
                y_line = lr.predict(x_line)

                regression_result = {
                    "label": "Regresión: Área vs Viviendas",
                    "data": [{"x": float(x), "y": float(y)} for x, y in zip(x_line.flatten(), y_line)],
                    "original_data": [{"x": float(x[0]), "y": float(y)} for x, y in zip(X_area, Y_viviendas)],
                    "borderColor": "#FF5722",
                    "type": "line"
                }
                tendencies.append(regression_result)

            if len(X_features) >= 2:
                # 2) Clustering KMeans (2 clusters)
                kmeans = KMeans(n_clusters=2, random_state=42)
                clusters = kmeans.fit_predict(X_features)

                cluster_result = {
                    "label": "Clusters",
                    "data": [{"x": float(a), "y": float(v), "cluster": int(c)}
                             for (a, v, _), c in zip(X_features, clusters)],
                    "type": "scatter",
                    "backgroundColor": ["#4CAF50" if c == 0 else "#2196F3" for c in clusters]
                }
                tendencies.append(cluster_result)

                # 3) PCA
                pca = PCA(n_components=2)
                pca_coords = pca.fit_transform(X_features)
                pca_result = {
                    "label": "PCA",
                    "data": [{"x": float(x), "y": float(y)} for x, y in pca_coords],
                    "type": "scatter",
                    "backgroundColor": "#9C27B0"
                }
                tendencies.append(pca_result)

            return {
                "columns": columns_with_mapping,
                "data": filtered_data,
                "tendencies": tendencies
            }

        else:
            return {}
