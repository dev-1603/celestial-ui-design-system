# ADR-004: Composition Contract Adoption

**Status:** Accepted  
**Date:** 2026-09-20

## Decision

Use `composition.allowedChildren: ComponentId[]` for **compound** P0/P1 components.

| Class | Composition |
|---|---|
| Atomic / leaf | NOT_APPLICABLE |
| Unconstrained layout (Box, Stack, …) | NOT_APPLICABLE |
| Compound (Dialog, Select, Form, …) | REQUIRED — see `PHASE1_COMPOSITION_REQUIRED` in `phase1-rules.ts` |

Anatomy (`parts`) describes internal regions; composition describes **catalog child component IDs**.

Validation runs for P0/P1 only via `validatePhase1Composition`.
