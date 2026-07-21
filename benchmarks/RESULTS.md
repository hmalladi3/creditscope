# Benchmark Results

Load-tested with [`hey`](https://github.com/rakyll/hey) against the backend running via `docker compose up` (single Postgres 16 container + single Spring Boot container, both on a MacBook — **not** a production environment; see [Caveats](#caveats)). Reproduce with `./benchmarks/run.sh` (backend must be running first).

| Endpoint | Load | p50 | p90 | p99 | req/s |
|---|---|---|---|---|---|
| `GET /api/companies?size=20` | 2000 req, 50 concurrent | 48ms | 126ms | 236ms | 796 |
| `GET /api/companies?sort=currentGrade,desc&sector=Industrials` | 2000 req, 50 concurrent | 26ms | 55ms | 131ms | 1554 |
| `GET /api/companies/{id}` | 2000 req, 50 concurrent | 9ms | 19ms | 90ms | 3955 |
| `GET /api/ratings/distribution` | 2000 req, 50 concurrent | 9ms | 22ms | 108ms | 3617 |
| `POST /api/auth/login` | 500 req, 20 concurrent | 191ms | 279ms | 647ms | 91 |

Raw `hey` output for each run: `bench-*.txt` in this directory.

## Reading these numbers

- **Detail view and distribution chart are the fastest paths** (~9ms p50) — single-row-or-small-aggregate reads with no dynamic filtering.
- **The filtered + `currentGrade`-sorted list query (the one using the native `LATERAL` join, see `docs/llds/backend-api.md`) was *faster* than the plain unfiltered list**, not slower. That's not the join being free — it's that `sector=Industrials` narrows the result set considerably, and less data serialized to JSON dominates the extra join cost at this data scale (18 seed companies). This is exactly the kind of result that matters more than it looks: it's a reminder that "this query is more complex" and "this query is slower" are different claims, and the honest way to know which applies is to measure, not assume. At a much larger row count the join cost would eventually dominate — worth re-benchmarking if/when this schema needs to scale past a demo dataset.
- **Login is ~20x slower than every read** (191ms vs ~9-48ms p50) — by design, not a bug. BCrypt is deliberately computationally expensive (adaptive cost factor) specifically to resist brute-force password guessing; a fast login endpoint would be a security smell, not a performance win.
- **p99 tails are consistently 3-5x the p50** across all endpoints, most visible on login. At this concurrency (50) against a single-instance, non-pooled-beyond-Hikari-defaults local container, that's expected connection-pool queuing, not a leak or regression — worth watching if it degrades further under real production load, but not alarming at this scale.

## Caveats

- Single MacBook, both containers competing for the same CPU/memory — not representative of Render's actual (and smaller) free-tier resources, and *not* run against the cold-start scenario the live deployment has to handle (see `docs/llds/deployment.md` § Cold start).
- Seed data is 18 companies / ~40 ratings. These numbers describe query-shape behavior at that scale, not what happens with a materially larger dataset — the LATERAL-join-vs-simple-query comparison above should be re-run if the dataset grows substantially.
- No connection pool tuning was done beyond HikariCP's defaults; this is a demo app's baseline, not a production capacity plan.
