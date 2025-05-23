import os


class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://root:ficticio@localhost:27017/mimviv-pnvr?authSource=admin")
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ficticio")
    MAPBOX_TOKEN: str = "pk.eyJ1Ijoia2Vlbi1pbyIsImEiOiIza0xnNXBZIn0.PgzKlxBmYkOq6jBGErpqOg"


settings = Settings()
