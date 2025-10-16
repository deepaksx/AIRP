.PHONY: help up down restart logs clean install dev build test e2e migrate seed demo

help: ## Show this help message
	@echo "AIRP Development Commands"
	@echo "========================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install

up: ## Start all services (Docker Compose)
	docker-compose up -d
	@echo "Services started. Waiting for database..."
	@sleep 5

down: ## Stop all services
	docker-compose down

restart: down up ## Restart all services

logs: ## Tail all service logs
	docker-compose logs -f

clean: ## Clean up containers, volumes, and build artifacts
	docker-compose down -v
	pnpm clean
	rm -rf node_modules

dev: ## Start development servers (after 'make up')
	pnpm dev

build: ## Build all packages and apps
	pnpm build

test: ## Run all tests
	pnpm test

e2e: ## Run end-to-end tests
	pnpm test:e2e

migrate: ## Run database migrations
	pnpm db:migrate

seed: ## Seed database with demo data
	pnpm db:seed

demo: up migrate seed ## Full demo setup: start services, migrate, and seed
	@echo ""
	@echo "✅ Demo environment ready!"
	@echo "   - API: http://localhost:3001"
	@echo "   - Web: http://localhost:3000"
	@echo "   - Temporal UI: http://localhost:8233"
	@echo ""
	@echo "Run 'make dev' to start development servers"

check-env: ## Check if .env file exists
	@test -f .env || (echo "⚠️  .env file not found. Copy .env.example to .env" && exit 1)
