# EARS Specs: Deployment & CI

Traces to `docs/llds/deployment.md`.

## Local: Docker Compose

- [x] **DEPLOY-001**: The system shall provide a `docker-compose.yml` defining `db`, `backend`, and `frontend` services such that `docker compose up` alone produces a fully running, seeded application with no additional manual steps. *(Verified: full `docker compose up --build` run, confirmed the frontend (served via nginx) loads real seeded data from the backend across containers, including a live browser check of the dashboard.)*
- [x] **DEPLOY-002**: The `db` service's healthcheck shall use `pg_isready`; the `backend` service shall wait on that healthcheck reporting healthy before starting.

## Schema & Seed Data

- [x] **DEPLOY-003**: The system shall manage database schema via Flyway migrations, not JPA `ddl-auto`.
- [x] **DEPLOY-004**: The system shall apply `V1__init_schema.sql`, creating the `company`, `rating`, and `app_user` tables.
- [x] **DEPLOY-005**: The system shall apply `V2__seed_data.sql`, inserting 15–20 sample companies (each with 2–4 historical ratings) and the seeded `admin`/`viewer` users referenced in `docs/specs/auth.md`.
- [x] **DEPLOY-006**: The system shall rely on Flyway's schema-history bookkeeping to apply each migration, including the seed migration, exactly once per database — a redeploy against an already-migrated database shall not duplicate seed rows. *(Verified indirectly: every integration test run reuses the same Testcontainers Postgres across all test classes without re-seeding errors.)*
- [x] **DEPLOY-007**: The system shall tolerate concurrent Flyway execution triggered by rapid backend restarts via Flyway's default schema-level advisory lock, without requiring additional application-level coordination. *(True by construction of Flyway's default locking; not specifically fault-injection tested.)*

## Continuous Integration

- [x] **DEPLOY-008**: On every push and pull request, the system shall run a backend CI job executing the full JUnit unit and `@SpringBootTest`/MockMvc integration test suite against a Testcontainers-provisioned Postgres instance. *(`.github/workflows/ci.yml`; GitHub's `ubuntu-latest` runners have Docker available natively for Testcontainers. Workflow file exists and is believed correct by inspection — not yet observed running green on GitHub itself, which requires a pushed remote.)*
- [x] **DEPLOY-009**: The backend CI job shall be bounded by an explicit 10-minute timeout.
- [x] **DEPLOY-010**: On every push and pull request, the system shall run a frontend CI job executing `npm ci` and `npm run build` (and lint, if configured). *(Also runs `npm test` — a stronger bar than the spec's minimum.)*
- [x] **DEPLOY-011**: If either CI job fails, then the system shall report the pull request as failing, not green. *(Standard GitHub Actions job-failure behavior; not yet observed against a real PR.)*

## Live Deployment

- [ ] **DEPLOY-012**: The system shall deploy the frontend to Vercel from the `main` branch, configured with a `VITE_API_BASE_URL` environment variable pointing at the live backend. *(Not started.)*
- [ ] **DEPLOY-013**: The system shall deploy the backend to a Render free web service, built from the same `Dockerfile` used by local Docker Compose. *(Dockerfile ready and verified via Docker Compose; Render deployment itself not started.)*
- [ ] **DEPLOY-014**: The system shall use a Neon free-tier Postgres instance as the live database, with its connection string supplied to the Render backend via environment variables. *(Not started.)*
- [ ] **DEPLOY-015**: The system shall supply `JWT_SECRET` to the live backend via a value generated once and set directly in Render's dashboard, distinct from the fixed dev-only value documented in `.env.example` for local use. *(Not started.)*
- [ ] **DEPLOY-016**: If a live backend deploy fails its health check (Render probing `/actuator/health`, per AUTH-BE-019), then the system shall continue serving the previously running version rather than taking the service down. *(Depends on DEPLOY-013 existing; the health endpoint itself is ready and verified reachable.)*
- [x] **DEPLOY-019**: The system shall set `spring.jpa.hibernate.ddl-auto=validate` so that a mismatch between the Flyway-managed schema (DEPLOY-003/004) and the JPA entity mappings fails startup loudly instead of silently drifting.

Cold-start UX for the Render free-tier backend is a frontend-observable behavior and is specified as **FE-UI-016** in `docs/specs/frontend.md`, not here — this file only owns the infrastructure side (the backend does sleep/cold-start; see `docs/llds/deployment.md`).

## Local/Live Configuration Parity

- [x] **DEPLOY-017**: The system shall document `.env.example` as the single source of truth for required environment variable names across both local Docker Compose and the live Vercel/Render/Neon deployment; no automated sync between `.env.example` and the dashboard-configured values is provided.
