.PHONY: help build up down restart logs ps clean shell backup restore

help: ## 显示帮助信息
	@echo "Lenbrary Server - Makefile 命令"
	@echo "================================"
	@echo "可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## 构建 Docker 镜像
	docker-compose build

up: ## 启动服务（后台）
	docker-compose up -d

dev: ## 启动服务（前台，查看日志）
	docker-compose up

down: ## 停止并删除容器
	docker-compose down

restart: ## 重启服务
	docker-compose restart

logs: ## 查看实时日志
	docker-compose logs -f

logs-tail: ## 查看最近 100 行日志
	docker-compose logs --tail=100

ps: ## 查看容器状态
	docker-compose ps

clean: ## 清理容器和镜像
	docker-compose down
	docker system prune -f

shell: ## 进入容器 shell
	docker-compose exec lenbrary-server sh

shell-root: ## 使用 root 权限进入容器 shell
	docker-compose exec -u root lenbrary-server sh

status: ## 查看服务和健康状态
	@echo "容器状态:"
	@docker-compose ps
	@echo "\n健康检查:"
	@docker-compose exec lenbrary-server curl -f http://localhost:3000/api/health || echo "健康检查失败或未配置"

backup: ## 备份数据（数据库和上传文件）
	@BACKUP_DIR=backup/$(shell date +%Y%m%d_%H%M%S); \
	mkdir -p $$BACKUP_DIR; \
	echo "备份到: $$BACKUP_DIR"; \
	cp data/assets.db $$BACKUP_DIR/ 2>/dev/null || echo "数据库文件不存在"; \
	cp -r uploads $$BACKUP_DIR/ 2>/dev/null || echo "uploads 目录不存在"; \
	tar -czf lenbrary-backup-$(shell date +%Y%m%d_%H%M%S).tar.gz $$BACKUP_DIR; \
	rm -rf $$BACKUP_DIR; \
	echo "备份完成: lenbrary-backup-$(shell date +%Y%m%d_%H%M%S).tar.gz"

rebuild: clean build up ## 完全重新构建并启动

install: build up ## 首次安装（构建并启动）

update: ## 更新应用（拉取代码、重新构建、重启）
	git pull
	docker-compose down
	docker-compose build
	docker-compose up -d

docker-prune: ## 清理未使用的 Docker 资源
	docker system prune -a -f

check: ## 检查环境
	@echo "检查 Docker 安装..."
	@docker --version
	@echo "\n检查 Docker Compose..."
	@docker-compose --version
	@echo "\n检查 Docker 守护进程状态..."
	@docker info > /dev/null 2>&1 && echo "Docker 运行正常" || echo "Docker 未运行"
