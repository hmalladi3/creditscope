# CreditScope

A full-stack credit ratings dashboard — Spring Boot (Java) REST API, React + TypeScript frontend, PostgreSQL, JWT auth. Built as a portfolio piece modeled directly on S&P Global Ratings' own product category: a customer-facing website presenting company credit ratings.

**Live demo:** _pending deployment._
**Run locally in one command:** `docker compose up` (see [Quick Start](#quick-start)).

## What it does

- Browse companies with server-side search, sector/country/grade filtering, sorting (including by *current credit rating quality* — not alphabetically), and pagination.
- View a company's full rating history and a rating-trend chart plotted on an ordinal "AAA is best" axis, not a naive alphabetical one.
- A rating-distribution chart across all ten grade buckets (AAA…D).
- JWT-authenticated admin actions: create/edit/delete companies, add new ratings. Reads are public; writes require an `ADMIN` token — the frontend hides admin controls for non-admins, but the backend's role check is the actual enforcement boundary.
- Rating history is **append-only** by design: no endpoint edits or deletes an individual rating, mirroring how real rating agencies operate (a correction is a new rating, not a rewritten one).

Demo credentials (seeded, documented on purpose — this is a demo, not a real system): `admin` / `admin123` (full access), `viewer` / `viewer123` (read-only).

## Stack

| Layer | Tech |
|---|---|
| Backend | Java 21, Spring Boot 3.3, Spring Data JPA, Spring Security + JWT (`jjwt`), Bean Validation, springdoc-openapi |
| Database | PostgreSQL 16, Flyway migrations (schema + seed data, no `ddl-auto`) |
| Frontend | React 19, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS v4, Recharts |
| Testing | JUnit 5 + `@SpringBootTest`/MockMvc integration tests against a Testcontainers-provisioned Postgres (41 backend tests); Vitest + Testing Library (18 frontend tests) |
| Infra | Docker Compose (local), GitHub Actions CI, Vercel + Render + Neon (live) |

## Quick start

```bash
git clone git@github.com:hmalladi3/creditscope.git
cd creditscope
docker compose up
```

- Frontend: http://localhost:5173
- Backend API + Swagger UI: http://localhost:8080/swagger-ui.html
- No manual seeding step — Flyway seeds ~18 sample companies with realistic multi-year rating histories on first boot.

## Running tests

```bash
# Backend (JUnit + Testcontainers — requires Docker running)
cd backend && mvn test

# Frontend
cd frontend && npm ci && npm test
```

## Benchmarks

Load-tested with `hey` against the Docker Compose stack — see [`benchmarks/RESULTS.md`](benchmarks/RESULTS.md) for the full table and an honest discussion of what the numbers do and don't mean (including a counter-intuitive result: the filtered/sorted query using a native Postgres `LATERAL` join was *faster* than the plain list query at this data scale, and why). Reproduce with `./benchmarks/run.sh`.

