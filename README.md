# Bhai Ektu Dekhen 👀

A community-powered civic issue reporting and tracking platform. Citizens report local infrastructure problems with photos and geolocation; AI + geospatial intelligence + community validation help authorities prioritize and resolve them.

> Full product definition and architecture: [`Bhai_Ektu_Dekhen_Project_Architecture.md`](./Bhai_Ektu_Dekhen_Project_Architecture.md)
> Implementation plan, progress log and checklists: [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Leaflet |
| Backend | Laravel 13 (modular monolith), Sanctum token auth |
| Database | PostgreSQL + PostGIS (Docker) |
| AI (Phase 5) | Python worker (CV, embeddings, duplicate detection) |

## Getting started

### 1. Infrastructure (PostgreSQL + PostGIS)

```bash
docker compose up -d
```

Database runs on `localhost:5433` (user `bek`, password `bek_password_2026`, database `bek`).

### 2. Backend

```bash
cd backend
cp .env.example .env   # configure DB to match docker-compose
composer install
php artisan migrate --seed
php artisan serve
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. The Next.js app proxies `/api/*` to the Laravel API (see `frontend/next.config.ts`).

### Seed accounts

- `admin@bek.local` / `password` — ADMIN
- `test@example.com` / `password` — USER

## API (v1)

- `POST /api/v1/auth/register` · `POST /api/v1/auth/login` · `POST /api/v1/auth/logout` · `GET /api/v1/auth/profile`
- `GET|POST /api/v1/reports` · `GET /api/v1/reports/{publicId}`
- `GET /api/v1/issues` · `GET /api/v1/issues/{publicId}` · `POST /api/v1/issues/{publicId}/support`
- `GET /api/v1/map/nearby` · `GET /api/v1/map/heatmap`
- `GET /api/v1/admin/dashboard` · `GET|POST /api/v1/admin/teams` · `POST /api/v1/admin/issues/{publicId}/assign`
- Moderation: `POST /api/v1/reports/{report}/create-issue` · `PATCH /api/v1/issues/{publicId}/status|severity`

## Progress

Phases 1–4 + frontend are implemented. See the [implementation plan](./docs/IMPLEMENTATION_PLAN.md) for the current checklist and decisions log.
