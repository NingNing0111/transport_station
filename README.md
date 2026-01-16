# 中转站应用

文件中转站和消息中转站应用。

> 📖 **安装和运行指南**：请查看 [README_SETUP.md](./README_SETUP.md)  
> 🐳 **Docker 部署指南**：请查看 [README_DOCKER.md](./README_DOCKER.md)  
> ⚡ **uv 使用指南**：请查看 [README_UV.md](./README_UV.md)

## 功能

1. **文件中转站**：用户A上传文件，生成取件码和访问短链接；用户B通过访问短链接+取件码下载文件。
2. **消息中转站**：用户A上传一段富文本，生成阅读码+访问短链；用户B通过阅读码+访问短链读取富文本。

## 技术栈

- 后端：FastAPI
- 前端：React + Tailwind CSS + Shadcn UI
- 数据库：PostgreSQL
- 缓存：Redis
- 对象存储：Amazon S3

## 配置文件

```md
# Database
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/transfer_station

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
S3_BUCKET_NAME=chatx-oss-server

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=3000
# Short Link
SHORT_LINK_BASE_URL=http://localhost:3000/s

# Frontend
FRONTEND_URL=http://localhost:5173


```

## 核心特性

### 大文件上传特性
- 支持最大1GB文件上传
- 自动分片上传（默认5MB/片）
- 支持断点续传：上传中断后可以继续上传，已上传的分片不会重复上传
- 小文件（≤10MB）自动使用普通上传，大文件自动使用分片上传

### 短链接访问

- 支持短链接重定向。http://example.com/s/{shortCode}?visitCode={visitCode}
- 文件上传或消息上传完毕后，生成对应的短链和访问的code。若只访问短链，没有携带code，则需要填写visitCode才能访问相关的资源。

### 过期时间设置

支持以下过期时间选项：
- `10m` - 10分钟（默认）
- `1h` - 1小时
- `1d` - 1天
- `7d` - 7天