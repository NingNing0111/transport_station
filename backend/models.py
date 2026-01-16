from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from datetime import datetime
import enum
from backend.database import Base


class TransferType(str, enum.Enum):
    FILE = "file"
    MESSAGE = "message"


class Transfer(Base):
    __tablename__ = "transfers"
    
    id = Column(String, primary_key=True)
    short_code = Column(String, unique=True, index=True, nullable=False)
    visit_code = Column(String, nullable=False, index=True)
    transfer_type = Column(SQLEnum(TransferType), nullable=False)
    
    # File specific
    file_name = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    file_key = Column(String, nullable=True)  # S3 key
    mime_type = Column(String, nullable=True)
    
    # Message specific
    message_content = Column(Text, nullable=True)
    
    # Upload info
    upload_id = Column(String, nullable=True)  # For multipart upload
    chunk_count = Column(Integer, nullable=True)
    uploaded_chunks = Column(String, nullable=True)  # JSON array of uploaded chunk indices
    
    # Expiration
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Access tracking
    access_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime, nullable=True)
