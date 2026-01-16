FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 复制依赖文件
COPY pyproject.toml ./
COPY README.md ./
COPY uv.lock* ./

# 使用 uv 安装依赖（如果有 uv.lock 则使用 --frozen，否则正常安装）
# 使用 --no-install-project 因为此时 backend/ 目录还未复制
RUN if [ -f uv.lock ]; then \
        uv sync --frozen --no-dev --no-install-project; \
    else \
        uv sync --no-dev --no-install-project; \
    fi

# 复制后端代码
COPY backend/ ./backend/

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# 使用 uv 运行应用
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "3000"]
