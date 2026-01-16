from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://myuser:mypassword@localhost:5432/transfer_station"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # AWS S3
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "chatx-oss-server"
    
    # Server
    server_host: str = "0.0.0.0"
    server_port: int = 3000
    
    # Short Link
    short_link_base_url: str = "http://localhost:3000/s"
    
    # Frontend
    frontend_url: str = "http://localhost:5173"
    
    # Upload settings
    max_file_size: int = 1024 * 1024 * 1024  # 1GB
    chunk_size: int = 5 * 1024 * 1024  # 5MB
    small_file_threshold: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
