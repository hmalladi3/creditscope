# EARS Specs: Backend API

Traces to `docs/llds/backend-api.md`.

## Domain Model & Data Integrity

- [x] **API-DATA-001**: The system shall enforce `Company.ticker` uniqueness case-insensitively, normalizing to uppercase before comparison and storage.
- [ ] **API-DATA-002**: The system shall constrain `Rating.grade` to the fixed enum `AAA, AA, A, BBB, BB, B, CCC, CC, C, D`. *(Enforced at the Java type level via the `Grade` enum; not yet exercised by a dedicated test.)*
- [ ] **API-DATA-003**: The system shall constrain `Rating.outlook` to the fixed enum `POSITIVE, STABLE, NEGATIVE`. *(Same as above — implemented, untested.)*
- [x] **API-DATA-004**: The system shall derive a company's current rating as the `Rating` row with the most recent `rating_date` for that company; where two ratings share the same `rating_date`, the row with the higher `id` shall be treated as current.
- [ ] **API-DATA-005**: When a `Company` is deleted, the system shall cascade-delete all of its `Rating` rows. *(JPA cascade mapping is in place; no test yet since `DELETE /api/companies/{id}` (API-BE-013) isn't implemented in this pass.)*
- [x] **API-DATA-006**: If a company has no `Rating` rows, then the system shall represent its current rating as `null` and its rating history as an empty list, not as an error.

## List, Filter, Sort, Paginate (`GET /api/companies`)

- [x] **API-BE-001**: The system shall serve `GET /api/companies` as a public (unauthenticated) endpoint returning a paginated list of `CompanySummaryDto`, defaulting to `size=20` when not specified.
- [x] **API-BE-002**: If a request specifies `size` greater than 100, or a negative/zero `page` or `size`, then the system shall reject it with `400`.
- [ ] **API-BE-003**: When a `search` query param is present, the system shall match it case-insensitively as a partial match against `Company.name` or `Company.ticker`. *(Not yet implemented — deferred past the vertical slice.)*
- [ ] **API-BE-004**: When `sector`, `country`, and/or `grade` query params are present on `GET /api/companies`, the system shall apply them as exact-match filters combined with AND semantics, and combinable with `search`. *(Not yet implemented — deferred past the vertical slice.)*
- [ ] **API-BE-005**: The system shall accept `sort` values of `name`, `ticker`, `sector`, or `currentGrade`, each with an optional `,desc` suffix; sorting on `currentGrade` shall be resolved against each company's derived current rating (API-DATA-004), not an in-memory sort. *(Implemented for `name`/`ticker`/`sector` only; the `currentGrade` branch is deferred — sorting by a derived value needs a subquery not yet written.)*
- [x] **API-BE-006**: The system shall append `id` as a secondary sort key to every list query, so that rows with equal primary sort values paginate deterministically across requests.
- [x] **API-BE-007**: If `grade` or `sort` specifies a value outside its allowed set, then the system shall reject the request with `400`, never silently no-matching or returning `500`. *(The `sort` half is implemented and tested; the `grade` half is currently vacuous since the `grade` filter param doesn't exist yet — see API-BE-004.)*
- [x] **API-BE-008**: When a `page` value exceeds the total available pages, the system shall return an empty `content` array with otherwise valid, correct pagination metadata — not an error.

## Company & Rating Detail, Create, Update, Delete

- [x] **API-BE-009**: The system shall serve `GET /api/companies/{id}` as a public endpoint returning `CompanyDetailDto`, including the company's full rating history ordered by `rating_date`.
- [x] **API-BE-010**: If `GET /api/companies/{id}` targets a nonexistent id, then the system shall return `404`.
- [ ] **API-BE-011**: The system shall restrict `POST /api/companies`, `PUT /api/companies/{id}`, and `DELETE /api/companies/{id}` to callers holding the `ADMIN` role (see AUTH-BE-010). *(`POST` is implemented and tested; `PUT`/`DELETE` don't exist yet, so the spec as a whole isn't fully met — left as a gap rather than marked done.)*
- [x] **API-BE-012**: When `POST /api/companies` succeeds, the system shall return the created `CompanyDetailDto` with status `201`.
- [ ] **API-BE-013**: If `DELETE /api/companies/{id}` targets an already-deleted or nonexistent id, then the system shall return `404` (not an idempotent `204`). *(`DELETE` not yet implemented.)*
- [ ] **API-BE-014**: The system shall restrict `POST /api/companies/{id}/ratings` to callers holding the `ADMIN` role. *(Endpoint not yet implemented — deferred past the vertical slice.)*
- [ ] **API-BE-015**: If `POST /api/companies/{id}/ratings` targets a nonexistent company id, then the system shall return `404`, checked explicitly before insert (never falling through to a raw foreign-key-violation `500`). *(Endpoint not yet implemented.)*
- [x] **API-BE-018**: The system shall not expose any endpoint to update or delete an individual `Rating` — rating history is append-only; corrections are made by adding a new `Rating` row, never by editing or removing an existing one.

## Rating Distribution

- [x] **API-BE-016**: The system shall serve `GET /api/ratings/distribution` as a public endpoint returning a count of companies per current-rating grade bucket, always including all 10 grade buckets even when a bucket's count is zero.

## API Documentation

- [x] **API-BE-017**: The system shall serve `/swagger-ui.html` and `/v3/api-docs` publicly, without authentication.

## Error Handling

- [x] **API-ERR-001**: If a request body fails Bean Validation, then the system shall respond `400` with field-level error messages in the standard error envelope `{status, error, message, path, timestamp}`.
- [x] **API-ERR-002**: If a requested entity does not exist, then the system shall respond `404` using the standard error envelope.
- [x] **API-ERR-003**: If a create/update violates a uniqueness constraint (e.g. duplicate ticker per API-DATA-001), then the system shall respond `409` using the standard error envelope.
- [ ] **API-ERR-004**: If an unhandled exception occurs, then the system shall respond `500` with a generic message in the standard error envelope, and shall not leak stack trace details to the client. *(Handler is implemented; not yet exercised by a dedicated test.)*
