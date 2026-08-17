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

### ✅ Phase 3 — Map
- [x] PostGIS spatial column (`GEOGRAPHY(POINT,4326)`) + GIST index
- [x] Nearby issues endpoint (within radius, `ST_DWithin`)
- [x] Heatmap endpoint (grid aggregation)

### ✅ Phase 4 — Admin / Moderation
- [x] Dashboard stats endpoints
- [x] Teams + Assignments
- [x] Assign issue to team
- [x] Review issues: verify / reject / change severity
- [x] Status management + history audit

### ✅ Frontend (Next.js)
- [x] Scaffold Next.js 16 + TypeScript + Tailwind
- [x] Auth pages (login / register), API client + auth context (Sanctum token)
- [x] Report an Issue page (photo upload + geolocation)
- [x] My Reports list
- [x] Explore map (Leaflet + OpenStreetMap)
- [x] Admin dashboard
- [x] Next.js rewrites proxy → Laravel API (no CORS in dev)

### ✅ Phase 5 — AI
- [x] Python AI worker service (FastAPI, port 9000)
- [x] Image classification (category + confidence) + severity scoring + DCT embeddings
- [x] Image embeddings (duplicate detection)
- [x] Queue job wiring (Redis → worker → Laravel callback, `AnalyzeReport` job)
- [x] `ai_analyses` table
- [x] `issue_matches` table + duplicate detection flow (geo 300m + image + text, threshold 0.70)

### ✅ Phase 6 — Intelligence
- [x] Issue clustering / hotspot detection (grid cells)
- [x] Priority/severity scoring (AI + volume + support + age + category blend)
- [x] Analytics endpoints (summary, severity/status/category breakdowns)
- [x] Community support (`issue_supports`)

### ✅ Phase 7 — Production Hardening
- [x] Caching (Redis, 300s analytics/hotspots), rate limiting (auth/api/reports), queues
- [x] Logging + slow-query monitoring (`slow_query_threshold_ms`)
- [x] Tests (28 feature + unit, expanded to 47; AI worker pytest suite)
- [x] Security hardening (role middleware, input validation, rate limits)
- [x] Docker Compose (postgres, redis, ai-worker, backend, queue-worker, scheduler, frontend) + CI/CD (GitHub Actions)
- [x] Notifications (status changes, assignments, duplicate detection, moderation)
- [x] API documentation (Scramble OpenAPI `/docs/api`) + Postman collection
- [x] Admin moderation queue (frontend)
- [x] Scheduler (nightly priority recompute, AI retry) + demo seed data

---

## Implementation Progress Log

| Date | Phase | What was done | Status |
|------|-------|---------------|--------|
| 2026-08-16 | Setup | Init git repo, linked GitHub remote, merged README, committed architecture doc | ✅ Done |
| 2026-08-16 | Setup | Added implementation tracking doc | ✅ Done |
| 2026-08-16 | 1 | Scaffolded Laravel 13 + Sanctum, PostGIS Postgres container (docker-compose), roles, users, auth API, role middleware | ✅ Done |
| 2026-08-16 | 2 | Report creation with photo upload + PostGIS point, media, categories, issues, status history, support endpoints | ✅ Done |
| 2026-08-16 | 3 | Nearby issues (ST_DWithin) + heatmap grid aggregation | ✅ Done |
| 2026-08-16 | 4 | Admin dashboard, teams, assignments, review/severity/status management | ✅ Done |
| 2026-08-16 | Frontend | Next.js 16 app: auth, report form, my reports, Leaflet explore map, admin dashboard, API proxy | ✅ Done |
| 2026-08-17 | 5 | FastAPI AI worker (classification, severity, DCT embeddings), `ai_analyses` + `issue_matches`, duplicate detection (geo 300m + image + text, 0.70 threshold), queue job wiring, E2E verified (report → analysis → issue/merge) | ✅ Done |
| 2026-08-17 | 6 | Priority scoring service, hotspot grid clustering, analytics + priorities endpoints, admin intelligence API | ✅ Done |
| 2026-08-17 | 7 | Redis caching + rate limiting + slow-query logging; 47 backend tests + 7 AI worker tests; Docker full stack + CI/CD | ✅ Done |
| 2026-08-17 | 7 | Notifications (status/assignment/duplicate/moderation), Scramble OpenAPI docs + Postman collection, admin moderation queue frontend, scheduler + demo seeder | ✅ Done |
| 2026-08-17 | 7 | Explore map filters (category/status/severity), profile page with stats, admin assignments tracker, map location picker on report form | ✅ Done |
| 2026-08-17 | 7 | Frontend Vitest suite, AI duplicate-detection feature tests, assignment-notification coverage (59 backend + 9 AI + 9 frontend tests) | ✅ Done |

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
