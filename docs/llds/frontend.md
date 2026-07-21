# Frontend Dashboard

## Context and Design Philosophy

The frontend is a React + TypeScript SPA (Vite build). Because the target role is explicitly "building external customer-facing websites," visual polish is treated as a functional requirement here, not a nice-to-have — the HLD's Success Metrics include a falsifiable UI-quality bar. This LLD covers everything except login/auth UI mechanics, which live in `auth.md` (this doc references where those pieces slot into the page structure).

## Pages / Views

```
┌──────────────────────────────────────────────┐
│ CreditScope                    [Login/Admin▾] │  ← header, auth state in top-right
├──────────────────────────────────────────────┤
│ [Search........] [Sector▾] [Country▾] [Grade▾]│  ← filter bar
│                                                │
│ Rating Distribution        ┌─────────────┐    │
│ ┌───────────────────────┐  │  bar chart  │    │
│ │ Name │Sector│Grade│... │  └─────────────┘    │
│ │ ...  │ ...  │ ... │ ▸  │                     │
│ └───────────────────────┘  [Add Company] (ADMIN)│
│         [< 1 2 3 >]                            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ← Back        Acme Corp (ACME)                │
├──────────────────────────────────────────────┤
│ Sector: Industrials   Country: US              │
│ Current: BBB (Stable)                          │
│                                                │
│ Rating Trend                                   │
│ ┌────────────────────────────────────────┐    │
│ │            line chart over time         │    │
│ └────────────────────────────────────────┘    │
│              [Edit] [Delete] company (ADMIN)   │
│              [Add Rating] (ADMIN)              │
└──────────────────────────────────────────────┘
```

`Edit`/`Delete` act on the `Company` record only. Rating history is append-only (see `backend-api.md`) — the only rating-level admin action is `Add Rating`; there is no per-rating edit/delete control.

- **Dashboard** (`/`) — filter bar, data table, rating-distribution chart, admin-only "Add Company" affordance.
- **Company Detail** (`/companies/:id`) — company info, rating-trend line chart, rating history list, admin-only edit/delete.
- **Login** (`/login`) — see `auth.md`.

## Data Fetching

- **TanStack (React) Query** manages all server state — caching, loading/error states, and refetch-on-filter-change come from the library rather than hand-rolled `useEffect`/`useState` chains. Chosen specifically because it demonstrates a modern, production-standard data-fetching pattern rather than the more tutorial-grade `fetch` + `useState` approach.
- A thin `apiClient` (wrapping `fetch`) centralizes base URL config (`VITE_API_BASE_URL`, pointing at the Render backend in production / `localhost` in Docker Compose) and attaches the JWT header per `auth.md`.
- Table filter/sort/search state lives in the URL query string (not just component state) — makes a given filtered view shareable/bookmarkable and keeps the "does this hit the real API" success metric easy to verify (network tab shows a request per URL change).
- Search input is debounced (300ms) before triggering a query, to avoid firing a request per keystroke.

## Table: Server-Driven Pagination/Filter/Sort

Every table interaction (page change, column sort, filter dropdown, search) updates URL query params, which React Query uses as its query key — a param change is a new query, a new request to `GET /api/companies`. No client-side re-filtering of an already-fetched page. This directly satisfies the HLD's falsifiable success metric that table controls must produce distinct network requests.

## Charts (Recharts)

- **Rating distribution** (dashboard) — bar chart, one bar per grade bucket (`AAA`...`D`), sourced from `GET /api/ratings/distribution`.
- **Rating trend** (detail view) — line chart of grade-over-time for one company, sourced from the rating history embedded in `CompanyDetailDto`. Grades are ordinal (`AAA` > `AA` > ... > `D`); the Y-axis maps grade strings to a fixed ordinal scale rather than relying on string sort.

## Design System

- **Styling: Tailwind CSS** (utility-first) — chosen to reach a genuinely polished, custom look quickly without either hand-rolling a full CSS design system from scratch or pulling in a component library (MUI/Ant) whose default look is instantly recognizable as "off-the-shelf" to anyone who's used those libraries, undercutting the "customer-facing website craft" signal this project is supposed to send.
- A small shared set of design tokens (color scale, spacing scale, type scale) configured in `tailwind.config` — not ad hoc utility classes per component — so the app reads as one coherent system rather than a pile of individually-styled pages.
- **States every data view must handle explicitly**: loading (skeleton, not a bare spinner-on-white), empty (e.g. "no companies match these filters"), and error (failed request — retry affordance, not a blank screen).
- **Responsive**: table view collapses to a stacked-card layout below a ~640px breakpoint rather than a horizontally-scrolling table — a horizontally-scrolling data table on mobile is a common "didn't actually test on a phone" tell.

## Edge-Case Behavior

Resolved during the Phase 2 edge-case probe:

- **Invalid/out-of-range query params on load** (`?grade=NOTAGRADE`, `?page=-1`, `?sort=nonexistentColumn`): sanitized to defaults client-side *before* the request fires — never passed through to the API to trigger a `400` the user didn't cause directly.
- **Debounced-search race conditions**: not a new problem to solve — TanStack Query keys each request by its full param set, so a stale in-flight response for an old search term cannot overwrite the cache entry for the current one. Documented as existing library behavior, not bespoke logic.
- **Malformed id in the URL** (non-UUID) on the detail route: short-circuits to the not-found state client-side without an API call. **Valid-UUID-but-nonexistent id**: renders the `404` state returned by the API.
- **Trend chart with 0 or 1 ratings**: 0 → chart's empty state; 1 → a single point rendered, no line drawn.
- **History behavior**: filter/search/sort changes use `history.replaceState` (no back-button spam per keystroke or click); actual route navigation (e.g. dashboard → detail) uses normal push, so back/forward works as expected between pages.
- **Any filter or search change resets `page` to 1** in the URL — prevents landing on a stale, now out-of-range page after narrowing results.
- **Empty-state copy is context-aware**: zero companies with no filters/search active → "no companies yet"; zero results with filters/search active → "no matches" plus a clear-filters affordance. These are visually distinct, not the same generic message.
- **Mobile layout**: charts stack full-width below the table (not hidden); pagination/sort controls remain present as compact tap targets rather than disappearing.
- **Accessibility baseline** (not a full audit): semantic HTML landmarks, ARIA labels on interactive filter/pagination/chart elements, and keyboard operability for filters and pagination. Full WCAG conformance audit explicitly deferred — see Open Questions.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Server-state library | TanStack Query | Plain `fetch` + `useState`/`useEffect`, Redux Toolkit Query | TanStack Query is the current standard for this exact problem and is lighter-weight to set up and explain than RTK Query for an app with no complex client-side state to justify Redux |
| Styling approach | Tailwind CSS + shared design tokens | Component library (MUI/Ant Design), plain CSS Modules | A component library's default look reads as generic; hand-rolled CSS Modules is slower to reach a polished result. Tailwind + tokens balances speed and a custom look |
| Filter/sort/search state location | URL query params | Component-local state only | Shareable/bookmarkable views; makes "does the UI hit the real API" independently verifiable via the URL alone |
| Mobile table layout | Card-stack below 640px | Horizontal scroll, hide columns | A horizontally-scrolling data table is a common mobile-UX failure; a card layout stays fully usable |
| Chart library | Recharts | Chart.js, D3 directly | Recharts is React-native (declarative components, no imperative canvas/DOM wiring), sufficient for a bar chart and a line chart, and was the library already named in the original project brief |

## Open Questions & Future Decisions

### Resolved
1. ✅ URL-driven filter state, not component state — resolved above.

### Deferred
1. Dark mode — visually nice but not load-bearing for the JD's requirements; deferred unless time permits after the vertical slice and CRUD are done.
2. Client-side form validation mirroring backend Bean Validation rules exactly (currently: basic required-field checks only, real validation enforced server-side) — acceptable since the write UI is admin-only and low-traffic.
3. Full WCAG conformance audit — a baseline (semantic HTML, ARIA labels, keyboard operability) is in scope and specified above; a formal audit/certification is not.

## References

- `docs/high-level-design.md` — Goals (UI polish), System Design.
- `docs/llds/auth.md` — login route and conditional admin-only rendering.
- `docs/llds/backend-api.md` — endpoint shapes this UI consumes.
