import os
import zipfile
from datetime import datetime

from fastapi import UploadFile

from app.config import settings


class FileService:
    upload_folder = settings.STORAGE_PATH

    def __init__(self, user_authenticated: str):
        self.user_authenticated = user_authenticated

    async def upload_shapefile(self, file: UploadFile) -> str:
        shapefile_name = datetime.now().strftime("%Y%m%d%H%M%S") + ".zip"

        os.makedirs(self.upload_folder, exist_ok=True)

        # Guarda el archivo ZIP en el directorio de carga configurado de FastAPI.
        save_path = os.path.join(self.upload_folder, shapefile_name)
        with open(save_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # Lee en bloques de 1MB.
                buffer.write(chunk)  # type: ignore

        is_not_shapefile = False
        # Verifica que el ZIP contenga un archivo SHP, si no tiene que haber una excepción.
        with zipfile.ZipFile(save_path, 'r') as zip_ref:
            file_list = zip_ref.namelist()
            shp_files = [f for f in file_list if f.lower().endswith('.shp')]

            if not shp_files:
                is_not_shapefile = True

        if is_not_shapefile:
            os.remove(save_path)
            raise ValueError("El archivo ZIP no contiene un archivo SHP válido.")

        return shapefile_name
