# ADR-003: Token / Theme Contract Boundary

**Status:** Accepted (Option B)  
**Date:** 2026-09-20

## Decision

**Do not add a `tokens` field to `ComponentContract`.**

Core remains framework-agnostic semantics (behavior, a11y, anatomy). Visual dependencies live in:

- `@celestial-ui/tokens` — component namespaces (e.g. `button`, `input` in `data/components.json`)
- `@celestial-ui/theme` — slot policy (`THEME_SLOT_DEFINITIONS`)
- `@celestial-ui/styles` — compiled CSS

## Phase 1 readiness

Per-component token/theme readiness is tracked against the tokens package and theme slots, not Core contracts.
