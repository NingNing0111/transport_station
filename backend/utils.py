import shortuuid
from datetime import datetime, timedelta
from typing import Optional
import re


def generate_short_code() -> str:
    """生成短链接代码"""
    return shortuuid.uuid()[:8]


def generate_visit_code() -> str:
    """生成访问码（取件码/阅读码）"""
    return shortuuid.uuid()[:6].upper()


def parse_expiration(expiration_str: str) -> timedelta:
    """解析过期时间字符串"""
    expiration_map = {
        '10m': timedelta(minutes=10),
        '1h': timedelta(hours=1),
        '1d': timedelta(days=1),
        '7d': timedelta(days=7),
    }
    return expiration_map.get(expiration_str.lower(), timedelta(minutes=10))


def calculate_expires_at(expiration_str: str) -> datetime:
    """计算过期时间"""
    delta = parse_expiration(expiration_str)
    return datetime.utcnow() + delta


def is_expired(expires_at: datetime) -> bool:
    """检查是否过期"""
    return datetime.utcnow() > expires_at
