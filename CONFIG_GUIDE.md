# 配置指南 - FRONTEND_URL 和 SHORT_LINK_BASE_URL

## 配置说明

### FRONTEND_URL
- **用途**：
  - CORS 配置：允许前端域名访问后端 API
  - 重定向 URL：当用户访问短链接时，重定向到前端页面
- **格式**：完整的前端访问地址（包含协议和端口）

### SHORT_LINK_BASE_URL
- **用途**：
  - 生成短链接的完整 URL
  - 用户访问短链接时，会先访问这个地址，然后后端重定向到前端
- **格式**：完整的后端访问地址（包含协议和端口）

## 配置示例

### 1. 本地开发环境（不使用 Docker）

**场景**：
- 前端：Vite 开发服务器运行在 `http://localhost:5173`
- 后端：FastAPI 运行在 `http://localhost:3000`

**配置**：
```bash
# .env 文件
FRONTEND_URL=http://localhost:5173
SHORT_LINK_BASE_URL=http://localhost:3000
```

**说明**：
- `FRONTEND_URL` 设置为前端开发服务器地址
- `SHORT_LINK_BASE_URL` 设置为后端服务器地址（短链接会先访问后端，然后重定向）

### 2. Docker 本地运行

**场景**：
- 前端：nginx 运行在 `http://localhost:80`
- 后端：FastAPI 运行在 `http://localhost:3000`

**配置**：
```bash
# docker-compose.yml 或 .env 文件
FRONTEND_URL=http://localhost:80
SHORT_LINK_BASE_URL=http://localhost:3000
```

**说明**：
- `FRONTEND_URL` 设置为前端 nginx 地址
- `SHORT_LINK_BASE_URL` 设置为后端服务器地址

### 3. 生产环境（使用域名，前后端同域名）

**场景**：
- 域名：`https://example.com`
- 前端和后端使用同一个域名（通过 nginx 反向代理区分）

**配置**：
```bash
# .env 文件或环境变量
FRONTEND_URL=https://example.com
SHORT_LINK_BASE_URL=https://example.com
```

**说明**：
- 前后端使用同一个域名
- 短链接直接访问 `https://example.com/{shortCode}`，后端处理后重定向到前端页面

### 4. 生产环境（使用域名，前后端不同域名）

**场景**：
- 前端域名：`https://example.com`
- 后端域名：`https://api.example.com`

**配置**：
```bash
# .env 文件或环境变量
FRONTEND_URL=https://example.com
SHORT_LINK_BASE_URL=https://api.example.com
```

**说明**：
- `FRONTEND_URL` 设置为前端域名
- `SHORT_LINK_BASE_URL` 设置为后端域名
- 短链接访问 `https://api.example.com/{shortCode}`，后端重定向到 `https://example.com/...`

### 5. 生产环境（使用域名，短链接使用独立域名）

**场景**：
- 前端域名：`https://example.com`
- 短链接域名：`https://s.example.com`（专门用于短链接）

**配置**：
```bash
# .env 文件或环境变量
FRONTEND_URL=https://example.com
SHORT_LINK_BASE_URL=https://s.example.com
```

**说明**：
- `FRONTEND_URL` 设置为前端域名
- `SHORT_LINK_BASE_URL` 设置为短链接专用域名
- 短链接访问 `https://s.example.com/{shortCode}`，后端重定向到 `https://example.com/...`

## 配置方式

### 方式 1：使用 .env 文件（推荐）

在项目根目录创建 `.env` 文件：

```bash
FRONTEND_URL=http://localhost:5173
SHORT_LINK_BASE_URL=http://localhost:3000
```

### 方式 2：使用环境变量

```bash
# Linux/Mac
export FRONTEND_URL=http://localhost:5173
export SHORT_LINK_BASE_URL=http://localhost:3000

# Windows PowerShell
$env:FRONTEND_URL="http://localhost:5173"
$env:SHORT_LINK_BASE_URL="http://localhost:3000"
```

### 方式 3：在 docker-compose.yml 中配置

```yaml
services:
  backend:
    environment:
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:80}
      SHORT_LINK_BASE_URL: ${SHORT_LINK_BASE_URL:-http://localhost:3000}
```

## 注意事项

1. **协议**：生产环境建议使用 `https://`
2. **端口**：如果使用标准端口（http 80, https 443），可以省略端口号
3. **路径**：不要包含路径，只需要域名和端口（如果需要）
4. **CORS**：确保 `FRONTEND_URL` 正确配置，否则前端无法访问后端 API
5. **重定向**：确保 `SHORT_LINK_BASE_URL` 可以访问到后端服务

## 验证配置

配置后，可以通过以下方式验证：

1. **检查 CORS**：打开浏览器开发者工具，查看 API 请求是否被 CORS 阻止
2. **测试短链接**：上传文件后，访问生成的短链接，看是否能正确重定向
3. **查看后端日志**：检查重定向 URL 是否正确
