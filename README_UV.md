# 使用 uv 管理项目

本项目使用 [uv](https://github.com/astral-sh/uv) 作为 Python 包管理器。uv 是一个极快的 Python 包和项目管理工具。

## 安装 uv

### Windows (PowerShell)

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Linux/Mac

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 验证安装

```bash
uv --version
```

## 常用命令

### 同步依赖

```bash
# 安装所有依赖（会自动创建虚拟环境）
uv sync

# 安装依赖但不安装开发依赖
uv sync --no-dev

# 使用锁文件安装（确保版本一致）
uv sync --frozen
```

### 运行命令

```bash
# 使用 uv 运行 Python 命令
uv run python script.py

# 运行 uvicorn
uv run uvicorn backend.main:app --reload

# 运行其他工具
uv run pytest
uv run black .
```

### 添加依赖

```bash
# 添加新依赖
uv add package-name

# 添加开发依赖
uv add --dev package-name

# 添加特定版本
uv add "package-name>=1.0.0"
```

### 更新依赖

```bash
# 更新所有依赖
uv sync --upgrade

# 更新特定包
uv add package-name@latest
```

### 查看依赖

```bash
# 查看依赖树
uv tree

# 查看过时的包
uv sync --outdated
```

### 虚拟环境管理

```bash
# uv 会自动管理虚拟环境，通常不需要手动操作
# 虚拟环境位置：.venv/

# 激活虚拟环境（如果需要）
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

## 项目结构

使用 uv 后，项目结构如下：

```
transport_station/
├── .venv/              # uv 自动创建的虚拟环境
├── uv.lock             # 依赖锁文件（自动生成）
├── pyproject.toml       # 项目配置和依赖
└── ...
```

## Docker 中使用 uv

Dockerfile 已经配置为使用 uv：

```dockerfile
# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 使用 uv 安装依赖
RUN uv sync --frozen --no-dev

# 使用 uv 运行应用
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "3000"]
```

## 优势

使用 uv 的优势：

1. **极快的速度**：比 pip 快 10-100 倍
2. **自动管理虚拟环境**：无需手动创建和激活
3. **依赖解析**：更快的依赖解析和冲突检测
4. **锁文件支持**：`uv.lock` 确保依赖版本一致性
5. **兼容性**：完全兼容 pip 和 PyPI

## 迁移说明

如果项目之前使用 pip，迁移到 uv：

```bash
# 1. 安装 uv（见上方）

# 2. 同步依赖（会自动读取 pyproject.toml）
uv sync

# 3. 更新启动脚本使用 uv run
# 例如：uv run uvicorn backend.main:app --reload

# 4. 提交 uv.lock 文件到版本控制
git add uv.lock
git commit -m "Add uv.lock file"
```

## 故障排除

### uv 命令未找到

确保 uv 已正确安装并在 PATH 中：

```bash
# 检查安装位置
which uv  # Linux/Mac
where uv  # Windows

# 重新安装
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 依赖安装失败

```bash
# 清理并重新同步
rm -rf .venv uv.lock
uv sync
```

### 锁文件冲突

```bash
# 更新锁文件
uv lock --upgrade
```

## 更多信息

- [uv 官方文档](https://docs.astral.sh/uv/)
- [uv GitHub](https://github.com/astral-sh/uv)
