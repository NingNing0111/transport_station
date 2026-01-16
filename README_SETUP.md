# 中转站应用 - 安装和运行指南

## 环境要求

- Python 3.10+
- [uv](https://github.com/astral-sh/uv) (Python 包管理器)
- Node.js 18+
- PostgreSQL
- Redis
- AWS S3 账户（或兼容 S3 的对象存储服务）

## 后端设置

### 1. 安装 uv

```bash
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Linux/Mac
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. 安装 Python 依赖

```bash
# 使用 uv 同步依赖（会自动创建虚拟环境）
uv sync

# 或者使用 uv pip 安装（如果需要）
uv pip install -e .
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
# Database
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/transfer_station

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=3000

# Short Link
SHORT_LINK_BASE_URL=http://localhost:3000/s

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. 创建数据库

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE transfer_station;

# 创建用户（如果需要）
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE transfer_station TO myuser;
```

### 4. 启动后端服务

```bash
# Windows
start_backend.bat

# Linux/Mac
uv run uvicorn backend.main:app --host 0.0.0.0 --port 3000 --reload
```

后端服务将在 `http://localhost:3000` 启动。

## 前端设置

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置环境变量（可选）

创建 `frontend/.env` 文件：

```bash
VITE_API_BASE_URL=http://localhost:3000
```

### 3. 启动前端服务

```bash
# Windows
start_frontend.bat

# Linux/Mac
cd frontend
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

## 功能说明

### 文件中转站

1. 访问 `http://localhost:5173/upload/file`
2. 选择文件（最大 1GB）
3. 选择过期时间（10分钟、1小时、1天、7天）
4. 上传文件
5. 获得短链接和取件码
6. 分享短链接和取件码给他人
7. 他人通过短链接访问，输入取件码后下载文件

### 消息中转站

1. 访问 `http://localhost:5173/upload/message`
2. 输入富文本消息内容
3. 选择过期时间
4. 上传消息
5. 获得短链接和阅读码
6. 分享短链接和阅读码给他人
7. 他人通过短链接访问，输入阅读码后查看消息

## API 文档

启动后端服务后，访问 `http://localhost:3000/docs` 查看 Swagger API 文档。

## 注意事项

1. **S3 配置**：确保 AWS S3 凭证正确，并且有相应的读写权限
2. **数据库**：首次运行会自动创建数据库表
3. **Redis**：用于缓存，确保 Redis 服务正在运行
4. **CORS**：后端已配置 CORS，允许前端跨域访问
5. **文件大小**：默认最大文件大小为 1GB，可在配置中修改
6. **分片上传**：大于 10MB 的文件会自动使用分片上传（5MB/片）

## 故障排除

### 后端无法启动

- 检查数据库连接是否正常
- 检查 Redis 是否运行
- 检查环境变量配置是否正确

### 前端无法连接后端

- 检查后端服务是否运行
- 检查 `VITE_API_BASE_URL` 配置是否正确
- 检查 CORS 配置

### 文件上传失败

- 检查 S3 凭证和权限
- 检查 S3 bucket 是否存在
- 检查网络连接
