# ADR-001: Celestial Nexus Priority Map Governance

**Status:** Accepted  
**Date:** 2026-09-20

## Context

Celestial Nexus requires **36 P0 / 46 P1 / 16 P2 / 5 P3** component priorities for Phase 1 contract engineering. Core is locked and must remain product-priority agnostic.

## Decision

Store priority in a **planning artifact**, not in `ComponentContract`:

- Machine-readable: [`packages/core/src/catalog/data/phase1-component-priority-map.json`](../packages/core/src/catalog/data/phase1-component-priority-map.json)
- Human-readable: [`docs/phase1-component-priority-map.md`](../phase1-component-priority-map.md)

## Validation

`validatePhase1PriorityMap()` enforces bijection with the 103-component catalog and exact tier counts.

## Governance

Priority changes require impact analysis and test updates. They do **not** change `ComponentSpec` schema versions.
