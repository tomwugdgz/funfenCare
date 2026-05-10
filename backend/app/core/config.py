from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "funfenCare"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/funfencare"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # SMS Service
    SMS_API_KEY: str = ""
    SMS_API_SECRET: str = ""
    SMS_SIGN: str = "funfenCare"

    # MQTT
    MQTT_BROKER_URL: str = "mqtt://localhost:1883"
    MQTT_USERNAME: str = "funfencare"
    MQTT_PASSWORD: str = "funfencare"

    # InfluxDB
    INFLUXDB_URL: str = "http://localhost:8086"
    INFLUXDB_TOKEN: str = ""
    INFLUXDB_ORG: str = "funfencare"
    INFLUXDB_BUCKET: str = "csi_data"

    # WeChat
    WECHAT_APP_ID: str = ""
    WECHAT_APP_SECRET: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
