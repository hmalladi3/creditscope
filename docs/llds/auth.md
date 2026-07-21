# Authentication & Authorization

## Context and Design Philosophy

Auth exists to demonstrate the JWT-through-Spring-Security flow named explicitly in the target job description, and to give the write endpoints in `backend-api.md` a real reason to exist behind a login. It spans both the backend (Spring Security filter chain, JWT issuance/validation) and the frontend (login form, token storage, conditional UI), which is why this LLD — following the EARS reference convention — owns both `AUTH-BE-*` and `AUTH-UI-*` specs rather than being split across the backend/frontend LLDs.

Scope is deliberately narrow: no self-registration, no refresh tokens, no OAuth. A small fixed set of seeded users is sufficient to demonstrate the mechanism (see HLD Non-Goals).

## User Model

- `User` — `id (UUID)`, `username (unique)`, `passwordHash`, `role (VIEWER | ADMIN)`.
- Seeded at startup (see `deployment.md`): one `ADMIN` user, one `VIEWER` user, credentials documented in the README (this is a demo, not a real system — publishing demo credentials is intentional so reviewers can log in).
- Passwords hashed with `BCryptPasswordEncoder` (Spring Security default, adaptive cost factor).

## Backend: Login & Token Issuance

| Endpoint | Method | Auth | Request | Response |
|---|---|---|---|---|
| `/api/auth/login` | POST | public | `{ username, password }` | `{ token, username, role, expiresAt }`, 200; `401` on bad credentials |

- On successful login, a JWT is issued with claims: `sub` (username), `role`, `iat`, `exp`.
- Expiry: 1 hour. No refresh token — a reviewer re-logs-in if the session goes stale; acceptable for a demo's usage pattern (deferred item below).
- Signing: HMAC-SHA256, secret from an environment variable (`JWT_SECRET`), never committed to the repo. Local Docker Compose supplies a dev-only default via `.env`; the live deployment supplies its own secret via Render's environment config.

## Backend: Security Filter Chain

- A single `SecurityFilterChain` bean, stateless (`SessionCreationPolicy.STATELESS`), CSRF disabled (no cookies involved — pure Bearer-token API).
- Path rules:
  - `permitAll`: `GET /api/companies/**`, `GET /api/ratings/**`, `POST /api/auth/login`, `/swagger-ui/**`, `/v3/api-docs/**`.
  - `hasRole('ADMIN')`: `POST|PUT|DELETE /api/companies/**`, `POST /api/companies/*/ratings`.
  - Anything else: `authenticated()` (default-deny posture for anything not explicitly listed).
- A custom `JwtAuthenticationFilter` runs once per request ahead of Spring Security's standard chain: extracts `Authorization: Bearer <token>`, validates signature + expiry, and if valid populates the `SecurityContext` with the username and a `ROLE_<role>` authority. An invalid/expired/missing token on a route that requires auth falls through to Spring Security's normal `401`/`403` handling — the filter itself doesn't short-circuit with its own error responses, to keep error-shape handling in one place (see `backend-api.md`'s `@RestControllerAdvice`).

## Frontend: Login Flow & Token Handling

- A `/login` route renders a form (username, password). On submit, calls `POST /api/auth/login`; on success stores `{ token, username, role, expiresAt }`.
- **Token storage: `localStorage`**, not an httpOnly cookie. Chosen over cookies because frontend (Vercel) and backend (Render) live on different origins in the live deployment — a cross-origin httpOnly cookie needs `SameSite=None; Secure` plus matched CORS credentials config on both ends, meaningfully more moving parts for a demo whose actual threat model (public portfolio piece, synthetic data, no real user PII) doesn't warrant the extra hardening. This trade-off is deliberate, not an oversight — noted explicitly so it can be defended if asked.
- API client attaches `Authorization: Bearer <token>` to every request when a token is present; unauthenticated requests (browsing) simply omit the header.
- On `401`/`403` from any request, the client clears the stored token and redirects to `/login` (session expired or invalid — no silent retry loop).
- UI conditionally renders admin-only controls (create/edit/delete buttons on the dashboard and detail view) based on the stored `role`; this is a UX convenience only — the backend's role check is the actual enforcement boundary, the frontend hiding a button is not treated as a security control.

## Edge-Case Behavior

Resolved during the Phase 2 edge-case probe:

- **Malformed login body** (missing `username`/`password`) → `400` (Bean Validation), distinct from `401` for a correctly-shaped request with wrong credentials.
- **Missing / expired / invalid-signature token** on a protected route → all `401`, indistinguishable at the HTTP level (Spring Security's default). **Valid token, wrong role** → `403`. A route never returns `404` to hide its existence from an unauthorized caller — not treated as a leak worth defending against here.
- **Role changes after issuance**: the stale role claim is honored until the token's natural 1-hour expiry — stated explicitly as accepted, not silent.
- **`JWT_SECRET` rotation**: invalidates every previously issued token immediately (signature check fails); acceptable, no migration/grace-period handling needed.
- **Clock skew**: `exp` validation is a strict server-clock comparison, no leeway. Acceptable given both frontend and backend deploy targets keep accurate clocks (Vercel/Render/Neon), and a demo doesn't need tolerance for client-side clock drift.
- **Username matching**: case-insensitive, both at login comparison and the DB `username` unique constraint.
- **Concurrent sessions**: multiple simultaneously valid tokens for the same user across tabs/devices is explicitly intended behavior under stateless JWT, not a bug to prevent.
- **401/403 mid-session with unsaved form input**: the frontend redirects to `/login`; in-progress unsaved admin-form input is lost. Documented as an accepted limitation — session/draft restoration is out of scope.
- **Login rate limiting**: none is implemented today. Stated here directly (not just as a "deferred" line item) so the current unmitigated behavior is unambiguous.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Token storage location | `localStorage` | httpOnly cookie, in-memory only (lost on refresh) | Cross-origin cookie complexity not justified by the actual threat model; in-memory-only would force re-login on every page refresh, hurting the demo experience |
| Token lifetime strategy | Single 1h JWT, no refresh | Refresh token + short-lived access token | Refresh-token rotation is real production complexity with no interview-relevant signal beyond "I know it exists"; documented as a deferred item instead |
| Role model | Two roles (`VIEWER`, `ADMIN`) | Fine-grained permissions (per-action) | Two roles is enough to demonstrate role-based `hasRole()` checks without inventing a permission system nobody asked for |
| Self-registration | None — seeded users only | Public signup form | Out of scope per HLD Non-Goals; adds surface area (email verification, password policy UX) without adding auth-flow signal |

## Open Questions & Future Decisions

### Resolved
1. ✅ No token revocation/blocklist — stateless JWT with a 1-hour expiry is an accepted trade-off at this scale; a real production system would need one.

### Deferred
1. Refresh tokens — noted above, deliberately out of scope for v1.
2. Rate limiting on `/api/auth/login` (brute-force protection) — not implemented; acceptable given seeded demo credentials aren't protecting real data.

## References

- `docs/high-level-design.md` — Key Design Decisions #2 (public reads, JWT-gated writes) and #5 (stateless JWT over sessions).
- `docs/llds/backend-api.md` — endpoints this LLD's role checks gate.
- `docs/llds/frontend.md` — where the login route and conditional admin UI live structurally.
