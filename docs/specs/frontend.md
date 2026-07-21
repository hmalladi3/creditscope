# EARS Specs: Frontend Dashboard

Traces to `docs/llds/frontend.md`. Excludes login/auth UI, which is specified under `AUTH-UI-*` in `docs/specs/auth.md`.

## Data Fetching & URL State

- [ ] **FE-DATA-001**: The system shall manage all server state for companies and ratings via TanStack Query, keyed by the full set of active request parameters.
- [ ] **FE-DATA-002**: The system shall store table filter, sort, search, and pagination state in the URL query string, not component-local-only state.
- [ ] **FE-DATA-003**: When a filter, sort, or search value changes, the system shall update the URL via `history.replaceState`; when navigating between routes (e.g. dashboard to detail), the system shall use a normal history push.
- [ ] **FE-DATA-004**: The system shall debounce the search input by 300ms before triggering a query.
- [ ] **FE-DATA-005**: When any filter or search value changes, the system shall reset the URL's `page` param to 1.
- [ ] **FE-DATA-006**: If the URL contains an out-of-range or invalid filter/sort/page value on load, then the system shall sanitize it to its default client-side before issuing any API request. The set of valid `sort` fields and `grade` values used for this check shall be kept identical to the backend's allow-lists (API-BE-005, API-DATA-002) — defined once and imported by both, not independently authored on each side, so the two cannot silently drift apart.
- [ ] **FE-DATA-007**: If the company detail route's id segment is not a well-formed UUID, then the system shall render the not-found state without issuing an API request.

## Dashboard View

- [ ] **FE-UI-001**: The system shall render, on the dashboard route, a filter bar, a data table, and a rating-distribution chart.
- [ ] **FE-UI-002**: Every table pagination, sort, filter, and search interaction shall produce a distinct network request to the backend; the system shall not re-filter an already-fetched page of results client-side.
- [ ] **FE-UI-003**: The system shall render the rating-distribution chart using all 10 grade buckets returned by the API (API-BE-016), including zero-count buckets.
- [ ] **FE-UI-004**: While no companies exist and no filter/search is active, the system shall display an empty state reading that no companies exist yet.
- [ ] **FE-UI-005**: While a filter or search is active and matches zero companies, the system shall display an empty state distinct from FE-UI-004, including an affordance to clear the active filters.

## Company Detail View

- [ ] **FE-UI-006**: The system shall render, on the company detail route, company information, a rating-trend line chart, the rating history, and (for `ADMIN` sessions) edit/delete controls for the company plus an "add rating" control. Rating history itself carries no per-entry edit/delete control (API-BE-018).
- [ ] **FE-UI-007**: If a company has zero ratings, then the rating-trend chart shall render its empty state, not a broken or blank chart.
- [ ] **FE-UI-008**: If a company has exactly one rating, then the rating-trend chart shall render a single point with no connecting line.
- [ ] **FE-UI-009**: If the requested company id does not exist, then the system shall render the API's `404` as a not-found state.

## Loading, Error, and Responsive States

- [ ] **FE-UI-010**: While a data request is in flight, the system shall display a loading skeleton, not a bare spinner-on-blank-page.
- [ ] **FE-UI-011**: If a data request fails, then the system shall display an error state with a retry affordance, not a blank screen.
- [ ] **FE-UI-012**: While the viewport is narrower than 640px, the system shall render the data table as a stacked-card layout and charts full-width below it, keeping pagination and sort controls visible as compact tap targets.
- [ ] **FE-UI-016**: While *any* request to the backend is pending past approximately 5 seconds — including the login request (AUTH-UI-001), not only TanStack-Query-managed data fetches — the system shall display a "waking up the server" loading state (accounting for the Render free-tier backend's cold start, see `docs/llds/deployment.md`); if still pending past 60 seconds, the system shall switch to a persistent message advising the user to retry shortly.

## Visual Design & Accessibility

- [ ] **FE-UI-013**: The system shall implement styling via Tailwind CSS driven by a shared set of design tokens (color, spacing, and type scale), not per-component ad hoc utility classes.
- [ ] **FE-UI-014**: The system shall provide ARIA labels on interactive filter, pagination, and chart elements, and shall support keyboard operation of filter and pagination controls.
- [ ] **FE-UI-015**: The system shall render admin-only affordances (add/edit/delete) only when the stored session role is `ADMIN` (see AUTH-UI-005).
