.PHONY: help up down infra backend ai-worker queue frontend test seed

help:
	@echo "Bhai Ektu Dekhen - dev tasks"
	@echo "  make infra       Start Postgres + Redis (Docker)"
	@echo "  make backend     Start Laravel API on :8000"
	@echo "  make ai-worker   Start AI worker on :9000"
	@echo "  make queue       Start Laravel queue worker (Redis)"
	@echo "  make frontend    Start Next.js app on :3000"
	@echo "  make up          Start the full Docker Compose stack"
	@echo "  make seed        Migrate + seed the dev database"
	@echo "  make test        Run backend + AI worker test suites"

infra:
	docker compose up -d postgres redis

backend:
	cd backend && php artisan serve --host=127.0.0.1 --port=8000

ai-worker:
	cd ai-worker && python -m uvicorn app.main:app --host 127.0.0.1 --port 9000

queue:
	cd backend && php artisan queue:work --timeout=120 --tries=1

frontend:
	cd frontend && npm run dev

up:
	docker compose up -d --build

seed:
	cd backend && php artisan migrate --seed

test:
	cd backend && php artisan test
	cd ai-worker && python -m pytest -q
	cd frontend && npm run test