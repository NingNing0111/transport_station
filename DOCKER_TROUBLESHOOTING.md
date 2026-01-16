# Docker 故障排除指南

## 常见问题

### 1. 网络连接问题

**错误信息**：
```
failed to fetch anonymous token: Get "https://auth.docker.io/token...": dial tcp ...: connectex: A connection attempt failed
```

**解决方案**：

#### 方案 A：配置 Docker 镜像加速器（推荐）

编辑 Docker 配置文件（Windows: `%USERPROFILE%\.docker\daemon.json`，Linux: `/etc/docker/daemon.json`）：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

重启 Docker Desktop 或 Docker 服务。

#### 方案 B：使用代理

如果使用代理，配置 Docker 使用代理：

Windows (Docker Desktop):
- Settings → Resources → Proxies → 配置代理

Linux:
```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf <<EOF
[Service]
Environment="HTTP_PROXY=http://proxy.example.com:8080"
Environment="HTTPS_PROXY=http://proxy.example.com:8080"
Environment="NO_PROXY=localhost,127.0.0.1"
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 2. 缺少 uv.lock 文件

**错误信息**：
```
COPY failed: file not found in build context or excluded by .dockerignore: uv.lock
```

**解决方案**：

#### 方案 A：生成 uv.lock 文件（推荐）

在本地运行：
```bash
uv sync
```

这会生成 `uv.lock` 文件，然后提交到版本控制。

#### 方案 B：修改 Dockerfile（已自动处理）

Dockerfile 已经配置为自动检测 `uv.lock` 文件：
- 如果存在 `uv.lock`，使用 `uv sync --frozen`（锁定版本）
- 如果不存在，使用 `uv sync`（正常安装）

### 3. 环境变量未设置警告

**警告信息**：
```
The "AWS_SECRET_ACCESS_KEY" variable is not set. Defaulting to a blank string.
```

**解决方案**：

创建 `.env` 文件并配置所有必需的环境变量：

```bash
# AWS S3 (必需)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# 可选配置
SHORT_LINK_BASE_URL=http://localhost:3000/s
FRONTEND_URL=http://localhost:80
VITE_API_BASE_URL=http://localhost:3000
```

### 4. 端口被占用

**错误信息**：
```
Error: bind: address already in use
```

**解决方案**：

#### 检查端口占用

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :80
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Linux/Mac
lsof -i :3000
lsof -i :80
lsof -i :5432
lsof -i :6379
```

#### 修改端口映射

编辑 `docker-compose.yml`，修改端口映射：

```yaml
services:
  backend:
    ports:
      - "3001:3000"  # 改为 3001
  frontend:
    ports:
      - "8080:80"    # 改为 8080
```

### 5. 构建失败：uv 安装失败

**错误信息**：
```
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
```

**解决方案**：

如果无法访问 GitHub Container Registry，可以手动安装 uv：

修改 `backend/Dockerfile`：

```dockerfile
# 安装 uv（替代方案）
RUN pip install uv
# 或
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 6. 数据库连接失败

**错误信息**：
```
could not connect to server: Connection refused
```

**解决方案**：

1. 确保 PostgreSQL 容器已启动：
```bash
docker compose ps postgres
```

2. 检查数据库健康状态：
```bash
docker compose exec postgres pg_isready -U transfer_user
```

3. 等待数据库就绪（后端服务配置了 `depends_on`，会自动等待）

### 7. Redis 连接失败

**解决方案**：

1. 确保 Redis 容器已启动：
```bash
docker compose ps redis
```

2. 测试 Redis 连接：
```bash
docker compose exec redis redis-cli ping
```

### 8. 前端构建失败

**错误信息**：
```
npm ERR! code ELIFECYCLE
```

**解决方案**：

1. 清理构建缓存：
```bash
docker compose down
docker system prune -a
docker compose build --no-cache frontend
```

2. 检查 Node.js 版本兼容性

3. 查看详细错误日志：
```bash
docker compose build frontend
```

### 9. 权限问题（Linux）

**错误信息**：
```
permission denied while trying to connect to the Docker daemon socket
```

**解决方案**：

```bash
# 将用户添加到 docker 组
sudo usermod -aG docker $USER
# 重新登录或执行
newgrp docker
```

### 10. 磁盘空间不足

**错误信息**：
```
no space left on device
```

**解决方案**：

```bash
# 清理未使用的 Docker 资源
docker system prune -a

# 清理构建缓存
docker builder prune -a

# 查看磁盘使用情况
docker system df
```

## 调试技巧

### 查看详细日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend

# 查看构建日志
docker compose build --progress=plain
```

### 进入容器调试

```bash
# 进入后端容器
docker compose exec backend bash

# 进入数据库容器
docker compose exec postgres psql -U transfer_user -d transfer_station

# 进入 Redis 容器
docker compose exec redis redis-cli
```

### 检查服务状态

```bash
# 查看所有服务状态
docker compose ps

# 查看服务健康状态
docker compose ps --format json | jq '.[] | {name: .Service, status: .State, health: .Health}'
```

### 重新构建特定服务

```bash
# 重新构建后端
docker compose build backend
docker compose up -d backend

# 重新构建前端
docker compose build frontend
docker compose up -d frontend

# 强制重新构建（不使用缓存）
docker compose build --no-cache
```

## 完整重置

如果遇到无法解决的问题，可以完全重置：

```bash
# 停止并删除所有容器
docker compose down -v

# 删除所有镜像
docker compose down --rmi all

# 清理所有未使用的资源
docker system prune -a

# 重新构建和启动
docker compose build --no-cache
docker compose up -d
```

## 获取帮助

如果以上方法都无法解决问题：

1. 查看完整错误日志：`docker compose logs > error.log`
2. 检查 Docker 版本：`docker --version` 和 `docker compose version`
3. 检查系统资源：CPU、内存、磁盘空间
4. 查看 Docker Desktop 日志（Windows/Mac）
