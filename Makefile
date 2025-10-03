# Makefile para IaProject - Docker Deployment
.PHONY: help start stop status test clean logs

# Cores para output
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Mostra esta ajuda
	@echo "$(GREEN)IaProject - Docker Deployment$(NC)"
	@echo "=================================="
	@echo ""
	@echo "$(YELLOW)Comandos disponíveis:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

start: ## Inicia todos os serviços
	@echo "$(GREEN)🚀 Iniciando IaProject...$(NC)"
	@docker-compose up -d --build
	@echo "$(GREEN)✅ Serviços iniciados!$(NC)"
	@echo ""
	@echo "$(YELLOW)🌐 Acesse os serviços:$(NC)"
	@echo "   • App Frontend: http://localhost:4200"
	@echo "   • App Backend: http://localhost:3000"
	@echo "   • IA Frontend: http://localhost:4201"
	@echo "   • IA Backend: http://localhost:3001"

stop: ## Para todos os serviços
	@echo "$(RED)🛑 Parando IaProject...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Serviços parados!$(NC)"

restart: ## Reinicia todos os serviços
	@echo "$(YELLOW)🔄 Reiniciando IaProject...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✅ Serviços reiniciados!$(NC)"

status: ## Mostra status dos serviços
	@echo "$(YELLOW)📊 Status dos Serviços$(NC)"
	@echo "========================"
	@docker-compose ps

logs: ## Mostra logs de todos os serviços
	@docker-compose logs -f

logs-app: ## Mostra logs do app backend
	@docker-compose logs -f app-backend

logs-ia: ## Mostra logs do IA backend
	@docker-compose logs -f ia-backend

logs-db: ## Mostra logs do banco de dados
	@docker-compose logs -f postgres

test: ## Testa conectividade dos serviços
	@echo "$(YELLOW)🧪 Testando serviços...$(NC)"
	@bash scripts/test-deployment.sh

clean: ## Remove containers, volumes e imagens
	@echo "$(RED)🗑️ Limpando tudo...$(NC)"
	@docker-compose down -v --rmi all
	@docker system prune -f
	@echo "$(GREEN)✅ Limpeza concluída!$(NC)"

build: ## Constrói imagens sem iniciar
	@echo "$(YELLOW)🔨 Construindo imagens...$(NC)"
	@docker-compose build
	@echo "$(GREEN)✅ Imagens construídas!$(NC)"

shell-app: ## Acessa shell do app backend
	@docker-compose exec app-backend sh

shell-ia: ## Acessa shell do IA backend
	@docker-compose exec ia-backend sh

shell-db: ## Acessa shell do banco de dados
	@docker-compose exec postgres psql -U dev -d app_db

dev: ## Inicia em modo desenvolvimento
	@echo "$(GREEN)🚀 Iniciando em modo desenvolvimento...$(NC)"
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Modo desenvolvimento ativo!$(NC)"
