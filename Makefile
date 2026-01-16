.PHONY: help build up down restart logs clean

help:
	@echo "可用命令:"
	@echo "  make build      - 构建所有 Docker 镜像"
	@echo "  make up         - 启动所有服务"
	@echo "  make down       - 停止所有服务"
	@echo "  make restart    - 重启所有服务"
	@echo "  make logs       - 查看所有服务日志"
	@echo "  make clean      - 清理所有容器和镜像"
	@echo "  make prod-up    - 启动生产环境"
	@echo "  make prod-down  - 停止生产环境"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --rmi all

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f
