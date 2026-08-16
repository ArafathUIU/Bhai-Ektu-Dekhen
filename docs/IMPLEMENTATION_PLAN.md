# Bhai Ektu Dekhen — Implementation Plan, Progress & Checklist

> Tracking document for building the civic issue reporting and tracking platform.
> Reference architecture: `Bhai_Ektu_Dekhen_Project_Architecture.md`

---

## Project Overview

A community-powered civic issue reporting and tracking platform using:

- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** Laravel + PHP (modular monolith, REST API)
- **Database:** PostgreSQL + PostGIS
- **Infrastructure:** Redis (queue/cache/rate-limit), Docker, Object Storage
- **AI Worker:** Python (CV classification, embeddings, duplicate detection, severity)

Status values: `PROCESSING → REPORTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED / REOPENED`

---

## Repository & Git Workflow

- **Remote:** `https://github.com/ArafathUIU/Bhai-Ektu-Dekhen`
- **Branch:** `main`
- **Policy:** Commit and push after every decision and every meaningful change.

---

## Phased Implementation Plan (from architecture doc §22)

### ✅ Phase 1 — Foundation
- [x] Scaffold Laravel backend (`composer create-project`)
- [x] Configure environment + database connection (PostgreSQL/PostGIS via Docker)
- [x] Roles model + `users.role_id` (USER / MODERATOR / ADMIN)
- [x] Auth API: register, login, logout, profile (Sanctum token-based)
- [x] Users API (profile, list for admins)
- [x] Authorization middleware (role-based) — verified 403 for citizen, 200 for admin
- [x] Push API response envelope (`data`, `message`, `errors`)

### ✅ Phase 2 — Core Reporting
- [x] `issue_categories` table + seed (road_damage, drainage, street_light, garbage)
- [x] `reports` table (public_id BEK-xxxxx, user, description, lat/lng, status)
- [x] `media` polymorphic table (REPORT_PHOTO, RESOLUTION_BEFORE/AFTER)
- [x] Create report API with image upload → object storage (local disk, later S3)
- [x] Report status lifecycle + `issue_status_history` table
- [x] My Reports (list own reports)
- [x] Report details endpoint
- [x] `issues` table + report→issue linking (`IssueService::createIssueFromReport`)
- [x] Issue lifecycle: status transitions + history + severity
- [x] Community support endpoint (`issue_supports`)

### ⬜ Phase 3 — Map
- [ ] PostGIS spatial column (`GEOGRAPHY(POINT,4326)`) + GIST index
- [ ] Nearby issues endpoint (within radius)
- [ ] Explore map view (frontend)
- [ ] Heatmap endpoint (later)

### ⬜ Phase 4 — Admin / Moderation
- [ ] Dashboard stats endpoints
- [ ] Review reports (verify / reject / change severity)
- [ ] Teams + Assignments
- [ ] Assign issue to team
- [ ] Status management + history audit

### ⬜ Phase 5 — AI
- [ ] Python AI worker service (FastAPI)
- [ ] Image classification (category + confidence)
- [ ] Image embeddings (duplicate detection)
- [ ] Queue job wiring (Redis → worker → Laravel callback)
- [ ] `ai_analyses` table
- [ ] `issue_matches` table + duplicate detection flow

### ⬜ Phase 6 — Intelligence
- [ ] Issue clustering / hotspot detection
- [ ] Priority/severity scoring
- [ ] Analytics endpoints
- [ ] Community support (`issue_supports`)

### ⬜ Phase 7 — Production Hardening
- [ ] Caching, rate limiting, queues
- [ ] Logging + monitoring
- [ ] Tests (unit/feature)
- [ ] Security hardening
- [ ] Docker Compose + CI/CD

---

## Implementation Progress Log

| Date | Phase | What was done | Status |
|------|-------|---------------|--------|
| 2026-08-16 | Setup | Init git repo, linked GitHub remote, merged README, committed architecture doc | ✅ Done |
| 2026-08-16 | Setup | Added implementation tracking doc | ✅ Done |
| 2026-08-16 | 1 | Scaffolded Laravel 13 + Sanctum, PostGIS Postgres container (docker-compose), roles, users, auth API, role middleware | ✅ Done |
| 2026-08-16 | 2 | Report creation with photo upload + PostGIS point, media, categories, issues, status history, support endpoints | ✅ Done |

---

## Repository Structure

```text
backend/       → Laravel REST API (modular monolith)
frontend/      → Next.js + TypeScript + Tailwind app
ai-worker/     → Python AI service (Phase 5)
docs/          → planning and tracking documents
```

---

## Decisions Log

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| 1 | 2026-08-16 | Modular monolith (Laravel) + separate AI worker | Keeps scope manageable, allows production-grade architecture (arch §3.1) |
| 2 | 2026-08-16 | `Report` ≠ `Issue` as separate entities | Reports are observations; issues are confirmed real-world problems (arch §4.1) |
| 3 | 2026-08-16 | Token-based auth (Sanctum) for API-first app | Frontend is separate Next.js SPA; stateless API auth required |
| 4 | 2026-08-16 | PostgreSQL + PostGIS for spatial data | Required for nearby/duplicate geo queries |
| 5 | 2026-08-16 | PostGIS runs in Docker (port 5433) | Avoids local install conflicts; reproducible via docker-compose |
| 6 | 2026-08-16 | `EnsureRole` middleware + `role:admin` route alias | Backend authorization, not just hidden frontend buttons (arch §3.15) |
