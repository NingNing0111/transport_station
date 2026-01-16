import boto3
from botocore.exceptions import ClientError
from typing import Optional, BinaryIO
from backend.config import settings

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region
)


def upload_file(file_obj: BinaryIO, key: str, content_type: Optional[str] = None) -> bool:
    """上传文件到S3"""
    try:
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type
        
        s3_client.upload_fileobj(file_obj, settings.s3_bucket_name, key, ExtraArgs=extra_args)
        return True
    except ClientError as e:
        print(f"Error uploading file: {e}")
        return False


def create_multipart_upload(key: str, content_type: Optional[str] = None) -> Optional[str]:
    """创建分片上传"""
    try:
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type
        
        response = s3_client.create_multipart_upload(
            Bucket=settings.s3_bucket_name,
            Key=key,
            **extra_args
        )
        return response['UploadId']
    except ClientError as e:
        print(f"Error creating multipart upload: {e}")
        return None


def upload_part(key: str, upload_id: str, part_number: int, file_obj: BinaryIO) -> Optional[str]:
    """上传分片"""
    try:
        # 确保文件指针在开始位置
        file_obj.seek(0)
        body = file_obj.read()
        response = s3_client.upload_part(
            Bucket=settings.s3_bucket_name,
            Key=key,
            PartNumber=part_number,
            UploadId=upload_id,
            Body=body
        )
        return response['ETag']
    except ClientError as e:
        print(f"Error uploading part: {e}")
        return None


def complete_multipart_upload(key: str, upload_id: str, parts: list) -> bool:
    """完成分片上传"""
    try:
        s3_client.complete_multipart_upload(
            Bucket=settings.s3_bucket_name,
            Key=key,
            UploadId=upload_id,
            MultipartUpload={'Parts': parts}
        )
        return True
    except ClientError as e:
        print(f"Error completing multipart upload: {e}")
        return False


def abort_multipart_upload(key: str, upload_id: str) -> bool:
    """取消分片上传"""
    try:
        s3_client.abort_multipart_upload(
            Bucket=settings.s3_bucket_name,
            Key=key,
            UploadId=upload_id
        )
        return True
    except ClientError as e:
        print(f"Error aborting multipart upload: {e}")
        return False


def generate_presigned_url(key: str, expiration: int = 3600) -> Optional[str]:
    """生成预签名URL用于下载"""
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': settings.s3_bucket_name, 'Key': key},
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None
