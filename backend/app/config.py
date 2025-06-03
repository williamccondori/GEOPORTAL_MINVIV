import os

# Se añaden variables de entorno para la configuración de la aplicación.

os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", "C:\\Users\\William\\Desktop\\geosnipa.json")
os.environ.setdefault("DIALOGFLOW_SESSION_ID", "me")


class Settings:
    MONGO_URI: str = os.getenv(
        "MONGO_URI",
        "mongodb://root:ficticio@localhost:27017/mimviv-pnvr?authSource=admin",
    )
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ficticio")
    MAPBOX_TOKEN: str = (
        "pk.eyJ1Ijoia2Vlbi1pbyIsImEiOiIza0xnNXBZIn0.PgzKlxBmYkOq6jBGErpqOg"
    )

    # Dialogflow configuration.

    DIALOGFLOW_PROJECT_ID: str = os.getenv("DIALOGFLOW_PROJECT_ID", "geosnipa-eij9")
    DIALOGFLOW_LANGUAGE_CODE: str = os.getenv("DIALOGFLOW_LANGUAGE_CODE", "es")

    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:4200")

    # Storage configuration.

    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "/storage")

    # PostGIS configuration.

    POSTGIS_STRING_CONNECTION: str = os.getenv("POSTGIS_STRING_CONNECTION",
                                               "postgresql://postgres:ficticio@localhost:5432/postgres")

    # GEOSERVER configuration.

    GEOSERVER_URL: str = os.getenv("GEOSERVER_URL", "https://geoserverministerioviviendageoportal.mooo.com/geoserver")
    GEOSERVER_USER: str = os.getenv("GEOSERVER_USER", "admin")
    GEOSERVER_PASSWORD: str = os.getenv("GEOSERVER_PASSWORD", "geoserver")
    GEOSERVER_WORKSPACE: str = os.getenv("GEOSERVER_WORKSPACE", "principal")
    GEOSERVER_DATASTORE: str = os.getenv("GEOSERVER_DATASTORE", "postgis")


settings = Settings()
