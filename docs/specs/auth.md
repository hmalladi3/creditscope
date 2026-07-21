# EARS Specs: Authentication & Authorization

Traces to `docs/llds/auth.md`. Spans backend (`AUTH-BE-*`) and frontend (`AUTH-UI-*`) per the same arrow segment.

## Backend: Login & Token Issuance

- [x] **AUTH-BE-001**: The system shall serve `POST /api/auth/login` as a public endpoint accepting `{username, password}` and, on success, returning `{token, username, role, expiresAt}` with status `200`.
- [x] **AUTH-BE-002**: If login credentials are incorrect, then the system shall respond `401`.
- [x] **AUTH-BE-003**: If the login request body is malformed (missing `username` or `password`), then the system shall respond `400`, distinct from the `401` used for incorrect credentials.
- [x] **AUTH-BE-004**: The system shall match `username` case-insensitively at both the login comparison and the database uniqueness constraint.
- [x] **AUTH-BE-005**: The system shall store passwords as BCrypt hashes, never in plaintext.
- [ ] **AUTH-BE-006**: The system shall sign issued JWTs with HMAC-SHA256 using a secret read from the `JWT_SECRET` environment variable. *(Implemented in `JwtService`; not yet exercised by a dedicated test.)*
- [ ] **AUTH-BE-007**: The system shall set issued JWTs to expire 1 hour after issuance and shall not issue refresh tokens. *(Expiry is configured; not yet asserted by a test — would need a time-travel/expired-token test.)*

## Backend: Security Filter Chain

- [x] **AUTH-BE-008**: The system shall run a stateless (`SessionCreationPolicy.STATELESS`) security filter chain with CSRF protection disabled.
- [x] **AUTH-BE-009**: The system shall permit unauthenticated access to `GET /api/companies/**`, `GET /api/ratings/distribution`, `POST /api/auth/login`, `/swagger-ui/**`, `/v3/api-docs/**`, and `/actuator/health`. The rating-distribution rule shall be scoped to that exact path, not a `/api/ratings/**` wildcard, so a future rating-related endpoint added under `/api/ratings/` does not become accidentally public by inheriting an over-broad permitAll rule.
- [x] **AUTH-BE-019**: The system shall expose `/actuator/health` reporting `DOWN` whenever startup migrations (DEPLOY-004/005) have failed or the database is unreachable, so that Render's deploy health check (DEPLOY-016) can detect a broken deploy and decline to cut traffic over to it. *(Health endpoint is public and reachable; the DOWN-on-migration-failure behavior is Spring Boot Actuator's default and hasn't been explicitly fault-injection tested.)*
- [x] **AUTH-BE-010**: The system shall require the `ADMIN` role for `POST`, `PUT`, and `DELETE` requests under `/api/companies/**`.
- [x] **AUTH-BE-020**: The system shall respond to browser CORS preflight (`OPTIONS`) requests and attach `Access-Control-Allow-Origin` for the configured frontend origin(s) (`app.cors.allowed-origins`, env `CORS_ALLOWED_ORIGINS`), on every route — not only the routes that are otherwise `permitAll`. *(Discovered by actually running the frontend against the backend in a browser — MockMvc integration tests never exercise real CORS preflight, so this gap was invisible to the test suite; without it every browser request is blocked before Spring Security's own authorization rules are ever consulted.)*
- [ ] **AUTH-BE-011**: The system shall require authentication (`authenticated()`) for any route not explicitly listed as public or role-restricted (default-deny posture). *(Configured; not yet covered by a test asserting an unauthenticated request to an arbitrary unlisted route is rejected.)*
- [x] **AUTH-BE-012**: If a request to a protected route carries a missing, expired, or invalid-signature token, then the system shall respond `401`.
- [x] **AUTH-BE-013**: If a request carries a valid token whose role does not satisfy the route's role requirement, then the system shall respond `403`, not `404`.
- [ ] **AUTH-BE-014**: While a token remains unexpired, the system shall honor the role claim embedded at issuance even if the underlying user's role has since changed. *(True by construction of the stateless design — the filter only ever reads the role from the token's own claims — but not exercised by a dedicated test.)*
- [ ] **AUTH-BE-015**: If `JWT_SECRET` changes, then the system shall reject all previously issued tokens as having an invalid signature. *(True by construction of HMAC signing — not exercised by a dedicated test.)*
- [ ] **AUTH-BE-016**: The system shall validate the `exp` claim with a strict server-clock comparison and no clock-skew leeway. *(Default `jjwt` behavior; not exercised by a dedicated test.)*
- [ ] **AUTH-BE-017**: The system shall support multiple simultaneously valid tokens for the same user across different sessions/devices, with no single-session enforcement. *(True by construction — nothing tracks issued tokens — not exercised by a dedicated test.)*
- [x] **AUTH-BE-018**: The system shall not apply any rate limiting or lockout to `POST /api/auth/login` attempts. *(Vacuously true — no such mechanism exists in the codebase.)*

## Frontend: Login Flow & Token Handling

- [x] **AUTH-UI-001**: The system shall render a `/login` route with a username/password form.
- [x] **AUTH-UI-002**: When login succeeds, the system shall store the returned `{token, username, role, expiresAt}` in `localStorage`.
- [x] **AUTH-UI-003**: The system shall attach `Authorization: Bearer <token>` to every API request when a token is present in storage, and omit it otherwise.
- [x] **AUTH-UI-004**: If any API response returns `401` or `403`, then the system shall clear the stored token and redirect to `/login`, discarding any in-progress unsaved form input on the current page. *(Session-clear + redirect wiring implemented via a window event from `apiFetch` to `AuthProvider`; the clear-on-401 half is unit tested, the redirect half verified logically but not via a dedicated browser check of an actual token-expiry scenario.)*
- [x] **AUTH-UI-005**: The system shall conditionally render admin-only controls (create/edit/delete affordances) based on the stored `role`, treating this as a UX convenience only — not a security boundary (the backend role check per AUTH-BE-010/013 is the actual enforcement point). *(Verified in browser: logged in as admin, saw controls; logged out, controls disappeared.)*
