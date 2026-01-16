# Docker 容器化部署指南

本文档介绍如何使用 Docker 和 Docker Compose 部署中转站应用。

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+

> ⚠️ **遇到问题？** 请查看 [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)

## 快速开始

### 1. 配置环境变量

创建 `.env` 文件（用于开发环境）或配置生产环境变量：

```bash
# Database (可选，docker-compose 会自动创建)
POSTGRES_USER=transfer_user
POSTGRES_PASSWORD=transfer_password
POSTGRES_DB=transfer_station

# Redis (可选)
REDIS_PASSWORD=

# AWS S3 (必需)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Server
SHORT_LINK_BASE_URL=http://localhost:3000/s
FRONTEND_URL=http://localhost:80

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

### 2. 构建和启动服务

#### 开发环境

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

#### 生产环境

```bash
# 使用生产环境配置
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 停止服务
docker-compose -f docker-compose.prod.yml down
```

### 3. 访问应用

- 前端：http://localhost:80
- 后端 API：http://localhost:3000
- API 文档：http://localhost:3000/docs

## 服务说明

### PostgreSQL

- 容器名：`transport_station_postgres`
- 端口：5432（开发环境暴露，生产环境仅内部访问）
- 数据持久化：`postgres_data` 卷
- 健康检查：自动检查数据库就绪状态

### Redis

- 容器名：`transport_station_redis`
- 端口：6379（开发环境暴露，生产环境仅内部访问）
- 数据持久化：`redis_data` 卷
- 健康检查：自动检查 Redis 连接

### Backend

- 容器名：`transport_station_backend`
- 端口：3000
- 自动等待数据库和 Redis 就绪后启动
- 支持热重载（开发环境）

### Frontend

- 容器名：`transport_station_frontend`
- 端口：80
- 使用 Nginx 提供静态文件服务
- 自动代理 API 请求到后端

## 常用命令

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend bash

# 进入数据库容器
docker-compose exec postgres psql -U transfer_user -d transfer_station
```

### 数据库备份和恢复

```bash
# 备份
docker-compose exec postgres pg_dump -U transfer_user transfer_station > backup.sql

# 恢复
docker-compose exec -T postgres psql -U transfer_user transfer_station < backup.sql
```

### 清理

```bash
# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、数据卷
docker-compose down -v

# 删除镜像
docker-compose down --rmi all
```

## 生产环境部署建议

### 1. 安全配置

- 修改默认的数据库和 Redis 密码
- 使用强密码
- 配置 Redis 密码认证
- 限制数据库和 Redis 端口暴露（生产环境不暴露）

### 2. 数据持久化

数据卷会自动持久化，确保：
- 定期备份 `postgres_data` 卷
- 定期备份 `redis_data` 卷（如需要）

### 3. 资源限制

在 `docker-compose.prod.yml` 中添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 4. 反向代理

生产环境建议使用 Nginx 或 Traefik 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. SSL/TLS

使用 Let's Encrypt 或配置 SSL 证书：

```bash
# 使用 certbot
certbot --nginx -d your-domain.com
```

### 6. 监控和日志

- 配置日志收集（如 ELK、Loki）
- 配置监控（如 Prometheus + Grafana）
- 设置日志轮转

## 故障排除

### 服务无法启动

1. 检查端口是否被占用：
```bash
netstat -tuln | grep -E ':(80|3000|5432|6379)'
```

2. 查看服务日志：
```bash
docker-compose logs [service_name]
```

3. 检查环境变量配置是否正确

### 数据库连接失败

1. 检查数据库容器是否运行：
```bash
docker-compose ps postgres
```

2. 检查数据库健康状态：
```bash
docker-compose exec postgres pg_isready -U transfer_user
```

3. 检查连接字符串是否正确

### 前端无法连接后端

1. 检查后端服务是否运行：
```bash
curl http://localhost:3000/
```

2. 检查 CORS 配置
3. 检查 `VITE_API_BASE_URL` 环境变量

### 文件上传失败

1. 检查 S3 凭证配置
2. 检查网络连接
3. 查看后端日志中的错误信息

## 更新应用

```bash
# 停止服务
docker-compose down

# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

## 多环境部署

可以使用不同的 compose 文件管理不同环境：

- `docker-compose.yml` - 开发环境
- `docker-compose.prod.yml` - 生产环境
- `docker-compose.staging.yml` - 预发布环境

```bash
# 使用特定环境
docker-compose -f docker-compose.prod.yml up -d
```
