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
    # 短链接的基础URL，用于生成完整的短链接地址
    # 本地开发: http://localhost:3000
    # Docker本地: http://localhost:3000
    # 生产环境(域名): https://yourdomain.com 或 https://api.yourdomain.com
    # 可通过环境变量 SHORT_LINK_BASE_URL 设置
    short_link_base_url: str = "http://localhost:3000"
    
    # Frontend
    # 前端应用的URL，用于CORS配置和重定向
    # 本地开发(Vite): http://localhost:5173
    # Docker本地(nginx): http://localhost:80
    # 生产环境(域名): https://yourdomain.com
    # 可通过环境变量 FRONTEND_URL 设置
    frontend_url: str = "http://localhost:5173"
    
    # Upload settings
    max_file_size: int = 1024 * 1024 * 1024  # 1GB
    chunk_size: int = 5 * 1024 * 1024  # 5MB
    small_file_threshold: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
