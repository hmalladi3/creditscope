# High-Level Design: CreditScope

## Problem

Landing a Java/frontend role requires demonstrable, verifiable proof of full-stack ability — not just a resume line. Generic tutorial projects (todo apps, blog CRUD) don't map to any specific employer's domain and don't survive a "walk me through your code" interview round. There's no single project in the current portfolio that exercises Spring Boot + React/TypeScript + PostgreSQL + JWT auth together, in a domain that mirrors a target employer's actual product — and a busy reviewer is far more likely to click a live link than clone a repo and run it themselves.

## Approach

Build a small, complete, end-to-end financial data dashboard — CreditScope — modeled directly on S&P Global Ratings' own product category (a customer-facing website presenting company credit ratings). The project deliberately restates the target job description's stack requirement-for-requirement:

- **Backend** (Spring Boot 3.x / Java 21 LTS): a REST API over PostgreSQL with the standard controller → service → repository layering, Spring Data JPA, Spring Security + JWT, Bean Validation, and OpenAPI/Swagger docs.
- **Frontend** (React + TypeScript): a data table (search, filter, sort, paginate) plus a company detail view and charts (rating distribution, rating-history trend), consuming the REST API directly — no mocked data. UI quality is a first-class concern, not an afterthought: the role is explicitly "building external customer-facing websites," so a polished, professional, responsive design (real typography/spacing/loading states — not a bare default HTML table) is itself part of what's being demonstrated.
- **Testing depth**: JUnit unit tests plus `@SpringBootTest`/`MockMvc` integration tests against real controllers, backed by Testcontainers for a real Postgres instance in CI — not unit tests alone.
- **Distribution**: a live, clickable demo on free-tier hosting is the primary way a reviewer experiences the app; Docker Compose remains the reliable local fallback (documented in the README) for when the free-tier backend is cold-started or a reviewer prefers to run it themselves. No paid hosting — this stays $0 to operate.
- **Packaging**: Docker Compose ties backend + Postgres + frontend together into a single `docker compose up` for local use. GitHub Actions runs backend JUnit + integration tests (and a frontend build) on every push.

**Build order**: a working vertical slice first — one entity (`Company`), list + detail view, login, one chart, deployed live — before expanding to the full feature set. This keeps something demoable at every point rather than a pile of half-finished breadth, and de-risks an "interview is tomorrow" scenario.

## Target Users

Two audiences, both external to the running app itself:

- **Job application reviewers / interviewers** — need to click a link and see a working, populated app in under a minute (accepting a possible cold-start delay on the free-tier backend), with a cloneable fallback if they want to run it themselves or the link is unavailable. They will look at the code, not just the UI.
- **The candidate (Hari), in a live technical interview** — needs to be able to explain, live and unaided, how a request flows from browser click to database and back, and why each architectural choice was made.

There is no third-party "real user" audience — this is a portfolio artifact, not a product with a customer base. Domain data (companies, ratings) is illustrative/synthetic, not real financial advice.

## Goals

- A **live, free-hosted demo URL** at the top of the README that a reviewer can click with zero setup, showing a populated, working app. Docker Compose (`docker compose up`) documented immediately below it as the guaranteed local fallback.
- A REST API that actually implements list-with-pagination/filter/sort, get-by-id, and create/update/delete — not stubs.
- A frontend table and detail view that call the real API for every interaction (search, sort, filter, pagination), not a client-side mock — rendered with genuine visual polish (real design, loading/empty/error states, mobile-responsive), since UI craft is part of the job being applied for.
- JWT-based login that gates write operations; anyone can browse without an account.
- Two charts (rating distribution, rating trend over time) rendered from real API data via Recharts.
- Backend test suite includes both JUnit unit tests and `@SpringBootTest`/`MockMvc` integration tests against real controllers, run against a real Postgres via Testcontainers in CI.
- A green GitHub Actions pipeline running the full backend test suite on every push.
- A demonstrable vertical slice (one entity end-to-end, deployed) reached before breadth work begins, so the project is never in a state where nothing works.
- A README with a live demo link, a screenshot, and a "how to run locally" section a reviewer can follow without asking questions.
- The candidate can explain, from their own code: dependency injection/`@Autowired`, the controller/service/repository pattern, how Spring Data JPA derives queries, what `@RestController`/`@GetMapping` do, the JWT auth flow through Spring Security, the request lifecycle end-to-end, and how the MockMvc/Testcontainers integration tests work.

## Non-Goals

- **Paid hosting of any kind.** The live demo must run entirely on no-card-required free tiers. If a feature would require a paid tier (e.g., an always-on backend with no cold start, a custom domain), it's out of scope — the documented cold-start tradeoff and the Docker Compose fallback are the accepted mitigations instead.
- **Real-time or third-party market data.** No live price feeds, no external financial data API integration. "Market data" in the original pitch is realized as historical rating changes over time, not live equity prices.
- **Real credit rating methodology.** Ratings are illustrative/synthetic seed data, not the output of any actual credit analysis. CreditScope is not, and must not be represented as, real investment or credit advice.
- **Multi-tenant or auto-scaling infrastructure.** A single free-tier instance per service is sufficient; this is a demo artifact, not a SaaS.
- **OAuth/SSO/social login.** JWT with username + password is sufficient to demonstrate the auth flow; social login adds surface area without adding interview-relevant signal.
- **Mobile app / native clients.** Web-responsive only (though responsive design itself is in-scope and a stated goal).
- **User self-registration flow.** A small fixed set of seeded users (including one admin) is sufficient; a public signup flow is not needed to demonstrate the auth mechanism.

## System Design

```mermaid
flowchart LR
    subgraph Browser
        UI[React + TypeScript SPA]
    end

    subgraph "Spring Boot App (Java 21)"
        CTRL[Controllers<br/>@RestController]
        SEC[Spring Security<br/>JWT filter]
        SVC[Services]
        REPO[Repositories<br/>Spring Data JPA]
        DOCS[springdoc-openapi<br/>/swagger-ui]
    end

    DB[(PostgreSQL)]

    UI -- "REST/JSON over HTTPS" --> SEC
    SEC --> CTRL
    CTRL --> SVC
    SVC --> REPO
    REPO --> DB
    CTRL -.-> DOCS
```

**Local deployment**: three containers under one `docker-compose.yml` — `frontend` (static build served or dev server), `backend` (Spring Boot fat jar), `db` (Postgres with a named volume). Backend seeds sample `Company`/`Rating`/`User` rows on first startup via a `CommandLineRunner` (or Flyway seed migration) so the app is populated immediately, locally or live.

**Live deployment** (all free tiers, no card required, $0 to operate):
- **Frontend** → Vercel (static React/TS build, no sleep, `*.vercel.app` URL).
- **Backend** → Render free web service (Spring Boot). Spins down after ~15 minutes idle; first request after idle cold-starts (roughly tens of seconds). Documented in the README so it isn't mistaken for a broken link.
- **Database** → Neon free-tier Postgres. Chosen over Render's free Postgres because Neon's free tier persists indefinitely; Render's free Postgres instances expire after a fixed window, which would silently break the live demo weeks after deployment.

**Testing**: JUnit unit tests for services; `@SpringBootTest` + `MockMvc` integration tests exercise controllers through Spring's real request-handling stack; Testcontainers spins up a real Postgres for those integration tests so they run against actual JPA/SQL behavior rather than an in-memory substitute (e.g., H2) that can mask dialect differences.

**Request lifecycle** (the thing the candidate must be able to narrate): browser → JWT filter (validates/skips based on path) → `@RestController` → `@Service` (business rules, e.g. pagination defaults) → `@Repository` (Spring Data JPA, PostgreSQL) → response DTO → JSON back to React, rendered into table/detail/chart.

**Core entities**:
- `Company` — id, name, ticker, sector, country, description.
- `Rating` — id, company (FK), grade (e.g. AAA…D), outlook (positive/stable/negative), rating date, agency-style rationale text. A company has a history of ratings over time (feeds the trend chart); the most recent rating per company feeds the distribution chart.
- `User` — id, username, password hash, role (`VIEWER` or `ADMIN`). Only used for authentication; not domain data.

## Key Design Decisions

1. **Ratings-only domain, no live market data.** Alternatives considered: (a) integrate a real market-data API (Alpha Vantage, IEX) for stock prices, (b) ratings-only with synthetic history. Chose (b): a third-party API dependency adds failure modes and rate limits that have nothing to do with the JD's actual requirements (Java/Spring/React/SQL), and risks the whole demo breaking on interview day due to an external outage or expired free-tier key.

2. **Public reads, JWT-gated writes.** Alternatives: (a) gate the entire API behind login, (b) no auth at all, (c) public `GET`, authenticated+role-checked `POST/PUT/DELETE`. Chose (c): it's the realistic real-world shape (public content, admin-only mutation), gives Spring Security actual path-based and role-based rules to configure and explain, and lets a reviewer explore the app without creating an account.

3. **Server-side pagination/filtering/sorting.** Alternatives: fetch everything and filter in the React client, vs. push it to the database via Spring Data JPA `Pageable` + `Specification`/derived queries. Chose the server-side route because the JD explicitly names "list with pagination, filtering, sorting" as a backend responsibility — faking it client-side would defeat the purpose of the exercise.

4. **Startup data seeding over manual entry.** Alternatives: ship an empty database and rely on the create-endpoints to populate it by hand, vs. seed realistic sample data automatically on first boot. Chose auto-seed: the primary audience (a reviewer with limited time) must see a populated, working app within seconds, whether they hit the live link or run it locally.

5. **Stateless JWT over server-side sessions.** Alternatives: traditional session cookie + server session store, vs. stateless JWT. Chose JWT: explicitly named in the JD, fits a REST API cleanly (no session affinity concerns), and is the more commonly asked-about mechanism in Spring Security interview questions.

6. **Free-tier live deployment (Vercel + Render + Neon) over Docker-Compose-only distribution.** Alternatives: (a) no live deployment, README + `docker compose up` only, (b) live deployment on a paid always-on host (Railway/Fly.io/AWS with a small always-on instance) for zero cold-start latency, (c) free-tier deployment accepting a documented cold start. Chose (c): a clickable link dramatically raises the odds a time-constrained reviewer actually sees the working app (ruling out (a)); the no-spend constraint rules out (b); the cold-start tradeoff of (c) is honestly documented rather than hidden, and Docker Compose remains available as an instant, always-fresh fallback.

7. **Render over Railway/Fly.io for the free backend host.** Alternatives considered: Railway (usage-based trial credit, not a true no-card free tier for new accounts), Fly.io (free allowance now generally requires a card on file). Chose Render: genuinely free, no card required, sufficient for a low-traffic portfolio demo despite the cold-start tradeoff.

8. **Neon over Render's free Postgres for the live database.** Both are free and card-free, but Render's free Postgres tier auto-expires after a fixed window, which would silently break the live link weeks after deployment with no code change to explain why. Neon's free tier has no such expiry, at the cost of being a separate provider from the backend host.

9. **Vertical-slice-first build order.** Alternative: build each layer to completion horizontally (all entities' backend CRUD, then all frontend views, then auth, then deploy). Chose vertical-slice-first (one entity end-to-end, deployed, before expanding breadth): guarantees a demoable state exists at every point in the build, which matters given the project's purpose is to be shown to other people on a timeline the candidate doesn't fully control.

10. **Integration tests via MockMvc + Testcontainers, not unit tests alone.** Alternative: JUnit unit tests against services with mocked repositories only. Chose to add MockMvc integration tests against real controllers backed by a real Postgres (Testcontainers): Spring's testing stack is a commonly probed interview topic, and "I wrote MockMvc integration tests against my controllers, backed by Testcontainers" is a materially stronger claim than unit tests alone.

## Success Metrics

- A live URL (Vercel frontend, hitting the Render-hosted API) loads and is fully interactive without cloning anything — accepting a documented cold-start delay on the first request if the Render service has gone idle. Falsifiable: if the link is dead (not just cold) or returns stale/unseeded data, this metric fails.
- `docker compose up` from a clean clone produces a working app (frontend reachable, API reachable, Swagger UI reachable, data populated) with zero additional manual steps, as the fallback path. Falsifiable: a clean-machine run that requires any undocumented step is a failure.
- Every documented REST endpoint (list/get/create/update/delete for `Company` and `Rating`) is exercised by at least one passing test and is visible/callable in Swagger UI. At least the core controllers have a MockMvc integration test running against a Testcontainers-backed Postgres, in addition to service-level unit tests.
- The frontend table's search, sort, filter, and pagination controls each produce a distinct network request to the backend (verifiable in browser devtools) — not a client-side filter over a fully-fetched dataset.
- The UI passes a basic polish bar: no unstyled/default HTML table, visible loading and empty/error states, usable at a mobile viewport width. Falsifiable: an unstyled or broken-on-mobile UI fails this metric regardless of functional correctness.
- An unauthenticated request to a write endpoint (`POST /companies`, etc.) returns `401`/`403`; the same request with a valid `ADMIN` JWT succeeds. A `VIEWER` JWT is rejected on write endpoints.
- GitHub Actions runs on every push and reports pass/fail for the full backend test suite; a broken build shows red within the same PR.
- Falsification signal for the underlying goal: if, in a live interview, the candidate cannot explain the six checklist items (DI/`@Autowired`, controller/service/repository, Spring Data JPA query derivation, `@RestController`/`@GetMapping`, JWT-through-Spring-Security flow, request lifecycle) plus the MockMvc/Testcontainers testing setup, using their own code as reference, the project has failed its actual purpose regardless of whether the app runs.

## References

- Job description: S&P Global Ratings, Grade 10, frontend/Java role (provided by user, 2026-07-21).
- EARS syntax reference: `docs/specs/` (to be populated in Phase 3).
- Parent workspace conventions: `/Users/hari/Projects/CLAUDE.md` (sibling HFT trading system repos — unrelated domain, shared only at the filesystem level).
