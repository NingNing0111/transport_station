from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
import json
import math
from datetime import datetime

from backend.config import settings
from backend.database import get_db, engine, Base
from backend.models import Transfer, TransferType
from backend.utils import generate_short_code, generate_visit_code, calculate_expires_at, is_expired
from backend.s3_client import (
    upload_file, create_multipart_upload, upload_part, 
    complete_multipart_upload, abort_multipart_upload, generate_presigned_url
)
from backend.redis_client import set_cache, get_cache, exists_cache

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="中转站应用", version="0.1.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "中转站应用 API"}


@app.post("/api/upload/file/init")
async def init_file_upload(
    file_name: str = Form(...),
    file_size: int = Form(...),
    mime_type: str = Form(...),
    expiration: str = Form("10m"),
    db: Session = Depends(get_db)
):
    """初始化文件上传（创建分片上传）"""
    # 验证文件大小
    if file_size > settings.max_file_size:
        raise HTTPException(status_code=400, detail="文件大小超过限制（1GB）")
    
    # 生成代码
    short_code = generate_short_code()
    visit_code = generate_visit_code()
    file_key = f"files/{short_code}/{file_name}"
    
    # 计算过期时间
    expires_at = calculate_expires_at(expiration)
    
    # 创建分片上传
    upload_id = create_multipart_upload(file_key, mime_type)
    if not upload_id:
        raise HTTPException(status_code=500, detail="创建分片上传失败")
    
    chunk_count = math.ceil(file_size / settings.chunk_size)
    
    # 创建数据库记录
    transfer = Transfer(
        id=short_code,
        short_code=short_code,
        visit_code=visit_code,
        transfer_type=TransferType.FILE,
        file_name=file_name,
        file_size=file_size,
        file_key=file_key,
        mime_type=mime_type,
        upload_id=upload_id,
        chunk_count=chunk_count,
        uploaded_chunks=json.dumps({}),  # 保存 {chunk_index: etag} 的映射
        expires_at=expires_at
    )
    db.add(transfer)
    db.commit()
    
    return {
        "short_code": short_code,
        "visit_code": visit_code,
        "upload_id": upload_id,
        "chunk_count": chunk_count,
        "chunk_size": settings.chunk_size
    }


@app.post("/api/upload/file/chunk")
async def upload_file_chunk(
    short_code: str = Form(...),
    chunk_index: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """上传文件分片"""
    transfer = db.query(Transfer).filter(Transfer.short_code == short_code).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="未找到上传记录")
    
    if is_expired(transfer.expires_at):
        raise HTTPException(status_code=400, detail="上传已过期")
    
    if not transfer.upload_id:
        raise HTTPException(status_code=400, detail="该文件不支持分片上传")
    
    # 检查分片索引是否有效
    if chunk_index < 0 or chunk_index >= transfer.chunk_count:
        raise HTTPException(status_code=400, detail="分片索引无效")
    
    # 检查分片是否已上传
    uploaded_chunks = json.loads(transfer.uploaded_chunks or "{}")
    if str(chunk_index) in uploaded_chunks:
        return {
            "message": "分片已上传",
            "chunk_index": chunk_index,
            "etag": uploaded_chunks[str(chunk_index)]
        }
    
    # 上传分片
    content = await file.read()
    import io
    chunk_file = io.BytesIO(content)
    # S3的PartNumber从1开始
    etag = upload_part(transfer.file_key, transfer.upload_id, chunk_index + 1, chunk_file)
    
    if not etag:
        raise HTTPException(status_code=500, detail="分片上传失败")
    
    # 更新已上传分片列表，保存ETag
    uploaded_chunks[str(chunk_index)] = etag
    transfer.uploaded_chunks = json.dumps(uploaded_chunks)
    db.commit()
    
    return {
        "message": "分片上传成功",
        "chunk_index": chunk_index,
        "etag": etag
    }


@app.post("/api/upload/file/complete")
async def complete_file_upload(
    short_code: str = Form(...),
    db: Session = Depends(get_db)
):
    """完成文件分片上传"""
    transfer = db.query(Transfer).filter(Transfer.short_code == short_code).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="未找到上传记录")
    
    if not transfer.upload_id:
        raise HTTPException(status_code=400, detail="该文件不支持分片上传")
    
    # 获取已上传的分片信息
    uploaded_chunks = json.loads(transfer.uploaded_chunks or "{}")
    if len(uploaded_chunks) != transfer.chunk_count:
        raise HTTPException(status_code=400, detail=f"还有分片未上传，已上传 {len(uploaded_chunks)}/{transfer.chunk_count}")
    
    # 构建parts列表，按chunk_index排序
    parts = []
    for i in range(transfer.chunk_count):
        chunk_key = str(i)
        if chunk_key not in uploaded_chunks:
            raise HTTPException(status_code=400, detail=f"分片 {i} 未上传")
        parts.append({
            'ETag': uploaded_chunks[chunk_key],
            'PartNumber': i + 1  # S3的PartNumber从1开始
        })
    
    # 完成分片上传
    if not complete_multipart_upload(transfer.file_key, transfer.upload_id, parts):
        raise HTTPException(status_code=500, detail="完成分片上传失败")
    
    # 生成短链接
    short_link = f"{settings.short_link_base_url}/{short_code}"
    
    return {
        "message": "文件上传完成",
        "short_code": short_code,
        "visit_code": transfer.visit_code,
        "short_link": short_link,
        "expires_at": transfer.expires_at.isoformat()
    }


@app.post("/api/upload/message")
async def upload_message(
    content: str = Form(...),
    expiration: str = Form("10m"),
    db: Session = Depends(get_db)
):
    """上传消息（富文本）"""
    # 生成代码
    short_code = generate_short_code()
    visit_code = generate_visit_code()
    
    # 计算过期时间
    expires_at = calculate_expires_at(expiration)
    
    # 创建数据库记录
    transfer = Transfer(
        id=short_code,
        short_code=short_code,
        visit_code=visit_code,
        transfer_type=TransferType.MESSAGE,
        message_content=content,
        expires_at=expires_at
    )
    db.add(transfer)
    db.commit()
    
    # 生成短链接
    short_link = f"{settings.short_link_base_url}/{short_code}"
    
    return {
        "short_code": short_code,
        "visit_code": visit_code,
        "short_link": short_link,
        "expires_at": expires_at.isoformat()
    }


@app.get("/api/transfer/{short_code}")
async def get_transfer(
    short_code: str,
    visit_code: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """获取传输信息"""
    transfer = db.query(Transfer).filter(Transfer.short_code == short_code).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="未找到资源")
    
    if is_expired(transfer.expires_at):
        raise HTTPException(status_code=410, detail="资源已过期")
    
    # 验证访问码
    if not visit_code or visit_code != transfer.visit_code:
        raise HTTPException(status_code=403, detail="访问码错误")
    
    # 更新访问统计
    transfer.access_count += 1
    transfer.last_accessed_at = datetime.utcnow()
    db.commit()
    
    if transfer.transfer_type == TransferType.FILE:
        # 生成下载URL
        download_url = generate_presigned_url(transfer.file_key, expiration=3600)
        return {
            "type": "file",
            "file_name": transfer.file_name,
            "file_size": transfer.file_size,
            "mime_type": transfer.mime_type,
            "download_url": download_url,
            "expires_at": transfer.expires_at.isoformat()
        }
    else:
        return {
            "type": "message",
            "content": transfer.message_content,
            "expires_at": transfer.expires_at.isoformat()
        }


@app.get("/s/{short_code}")
async def short_link_redirect(
    short_code: str,
    visit_code: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """短链接重定向"""
    transfer = db.query(Transfer).filter(Transfer.short_code == short_code).first()
    if not transfer:
        return RedirectResponse(url=f"{settings.frontend_url}/not-found")
    
    if is_expired(transfer.expires_at):
        return RedirectResponse(url=f"{settings.frontend_url}/expired")
    
    # 如果有访问码，直接重定向到访问页面
    if visit_code and visit_code == transfer.visit_code:
        if transfer.transfer_type == TransferType.FILE:
            return RedirectResponse(url=f"{settings.frontend_url}/file/{short_code}?visitCode={visit_code}")
        else:
            return RedirectResponse(url=f"{settings.frontend_url}/message/{short_code}?visitCode={visit_code}")
    
    # 否则重定向到输入访问码页面
    return RedirectResponse(url=f"{settings.frontend_url}/access/{short_code}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.server_host, port=settings.server_port)
