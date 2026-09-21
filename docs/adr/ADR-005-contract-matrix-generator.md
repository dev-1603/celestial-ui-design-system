# ADR-005: Contract Matrix Generator

**Status:** Accepted  
**Date:** 2026-09-20

## Decision

Never hand-maintain the machine-derived contract matrix.

Generator: `tooling/generate-contract-matrix.mjs`  
Output: `docs/component-contract-matrix.md`

Inputs: `listComponentSpecs()` + Phase 1 priority map.

CI should run `pnpm build && node tooling/generate-contract-matrix.mjs` and fail on drift (recommended; not a blocker for individual contract authoring).
