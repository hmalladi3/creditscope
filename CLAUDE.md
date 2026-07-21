# CreditScope

## Vision

A full-stack, mini S&P-style credit ratings dashboard: users browse companies and their credit ratings / market data, search, filter, sort, and view charts. Built as a portfolio piece that mirrors S&P Global Ratings' own domain (customer-facing financial data websites) and demonstrates the stack a Java/frontend role expects: Spring Boot REST API, React/TypeScript frontend, PostgreSQL, JWT auth, Docker Compose, CI.

## Stack

- **Backend**: Java, Spring Boot, Spring Data JPA over PostgreSQL, layered controller → service → repository, Spring Security with JWT, Bean Validation, Swagger/OpenAPI docs.
- **Frontend**: React + TypeScript, sortable/filterable/searchable data table, detail view, charts (rating distribution, trend line) via Recharts, responsive HTML5/CSS3.
- **Infra**: Docker Compose (Spring + Postgres + frontend), JUnit tests, GitHub Actions CI.

## LID Mode: Full

## Linked-Intent Development (MANDATORY)

**Consult the `linked-intent-dev` skill for ALL code changes.** All changes flow through the arrow of intent in one direction:

```
HLD → LLDs → EARS → Tests → Code
```

- **New features and refactors**: full six-phase workflow (HLD check → LLD check/draft → EARS → intent-narrowing edge audit → tests-first → code).
- **Bug fixes**: walk the arrow like any other change — find where behavior diverged from intent and cascade from there. No short-circuit.
- **If unsure**: use the full workflow.

Stop after each phase for user review. Mutation, not accumulation — docs reflect current intent, not history.

### Navigation

| What you need | Where to look |
|---|---|
| High-level design | `docs/high-level-design.md` |
| Low-level designs | `docs/llds/` |
| EARS specs | `docs/specs/` |

### Terminology

- **HLD**: High-Level Design — single project-level doc at `docs/high-level-design.md`.
- **LLD**: Low-Level Design — detailed component design doc in `docs/llds/`. One per intent component.
- **EARS**: Easy Approach to Requirements Syntax — structured one-line requirements with globally unique IDs in `docs/specs/`. Markers: `[x]` implemented, `[ ]` active gap, `[D]` deferred.
- **Arrow**: the unidirectional chain from vision to code (HLD → LLDs → EARS → Tests → Code). Strictly a DAG of intent.
- **Arrow segment**: the territory owned by one LLD — the LLD itself plus the specs, tests, and code that cite its EARS IDs. Within-segment cascade is free; across-segment cascade pauses.
- **Cascade**: propagating a change downstream through the arrow so adjacent levels stay coherent.

### Code annotations

Annotate code and tests with `@spec` comments citing EARS IDs:

```
// @spec AUTH-UI-001, AUTH-UI-002
```

Place the annotation at the *entry point of the behavior's implementation graph* — the topmost function or module owning the specified behavior, not every helper. When a behavior spans multiple subsystems (UI + API + database, for example), annotate at the entry point in each subsystem. Tests follow the same rule: annotate the test that directly exercises the spec, not every inner assertion.
