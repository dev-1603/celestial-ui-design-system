# @celestial-ui/core Lock Policy

**Status:** LOCKED (Foundation Finalization — 2026-09-06)  
**Schema versions:** Contract `1.1.0` · Spec `1.1.0`  
**Runtime dependencies:** 0

## Foundation lock vs Phase 1 contract freeze

| Lock | Document | What it freezes |
|---|---|---|
| **Foundation lock** (this document) | `core-lock.md` | Schema 1.1.0, contract system, catalog structure, behavior primitives, zero runtime deps, export map |
| **Phase 1 contract freeze** | [PHASE-1-CONTRACT-FREEZE.md](./architecture/PHASE-1-CONTRACT-FREEZE.md) | Verified P0/P1 **behavioral** contracts after P1-VERIFY + CCA-ACCEPT |

Foundation lock (2026-09-06) does **not** replace P1-VERIFY or Phase 1 freeze. Local P1-IMPL work is not a freeze. Adapters must consume **published frozen Core** from the Phase 1 freeze artifact, not unpublished `src/`.

```text
Foundation lock → schema/package architecture frozen
P1-VERIFY       → P0/P1 contracts audited (28 dimensions)
P1-FREEZE       → implementation baseline frozen
WF04 Wave 0     → may start after P1-FREEZE
```

## What is locked

The following Core surfaces are **architecturally finalized**:

### Contract system

- Composable `ComponentContract` model
- `SizeContract` and `PointerContract` (schema 1.1)
- Anatomy validation (parts, slots, refs)
- Capability validation against declared contracts

### Specification model

- `ComponentSpec` with metadata, defaults, environment requirements
- **103 generic component specs** (nine hand-authored references + ninety-four profile-generated)
- Canonical catalog metadata registry (`CANONICAL_CATALOG`)

### Behavior primitives

- Controllable state, disclosure, collection, selection, overlay
- Focus manager, roving focus, typeahead, keyboard/directional intents
- `shouldIgnorePointer` / `shouldSuppressPointerInteraction`

### Boundaries

- Zero production runtime dependencies
- No framework imports
- No CSS/theme/token/icon ownership
- Localization contract only (no i18n engine)
- Adapter contract defines HOW mapping — implementations live outside Core

### Public exports

| Subpath           | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| `.`               | Convenience barrel (prefer subpaths for tree-shaking) |
| `./contracts`     | Contract/spec types and validators                    |
| `./behavior`      | Behavior controllers                                  |
| `./accessibility` | ARIA helpers, focus manager                           |
| `./collection`    | Collection/selection controllers                      |
| `./overlay`       | Overlay controller                                    |
| `./runtime`       | Celestial runtime                                     |
| `./catalog`       | Catalog metadata API (103 components)                 |
| `./specs/*`       | Individual component specs (103 granular subpaths)    |
| `./testing`       | Conformance harness                                   |

## Allowed changes without architecture review

- Test additions that strengthen release gates
- Documentation clarifications
- `package.json` export map adjustments that preserve API compatibility
- Bug fixes that do not change contract semantics
- Patch/minor schema additions within major version `1.x`

## Forbidden without architecture review

- Adding React, Vue, Svelte, Angular, or i18n engine dependencies
- Moving framework rendering into Core
- Adding production dependencies on tokens, theme, styles, or icons
- Breaking changes to reference spec semantics without migration plan
- Removing or renaming locked contract sections in a breaking way
- Creating new public packages (`@celestial-ui/behavior`, `@celestial-ui/utils`, etc.)

## Schema compatibility policy

- Major version must match for validation (`isSchemaCompatible`)
- `1.0.0` specs remain valid under `1.1.0` validator when they omit new optional sections
- New specs should target `CONTRACT_SCHEMA_VERSION` / `SPEC_SCHEMA_VERSION` constants

## Prerequisites for framework component libraries

Before starting `@celestial-ui/react`, `@celestial-ui/vue`, or `@celestial-ui/svelte`:

1. Core lock checklist complete (this document — foundation lock)
2. **Phase 1 Contract Freeze** complete ([PHASE-1-CONTRACT-FREEZE.md](./architecture/PHASE-1-CONTRACT-FREEZE.md) Status: FROZEN)
3. `pnpm validate` passes including consumer fixtures
4. Framework adapter implements `FrameworkAdapterContract`
5. Components conform to frozen specs via `createConformanceHarness`
6. Rendering and sanitization remain in the adapter/library layer

## Documented future work (not blockers)

| Item                                   | Severity | Notes                                                              |
| -------------------------------------- | -------- | ------------------------------------------------------------------ |
| ESM dual-publish                       | Done     | `import` → `dist/esm`; CJS retained via `require`/`default`/`main` |
| Framework-specific conformance runners | P2       | Live in framework packages                                         |
| Root barrel minimization               | P3       | Prefer subpath imports                                             |

## Lock checklist

- [x] Framework-independent
- [x] Zero production runtime dependencies
- [x] Contract system finalized (incl. Size, Pointer)
- [x] ComponentSpec finalized
- [x] Catalog model finalized (103 generic components)
- [x] Capability model finalized
- [x] Anatomy validation finalized
- [x] Behavior primitives finalized
- [x] Accessibility model finalized
- [x] Adapter boundary finalized
- [x] Conformance harness finalized
- [x] SSR/environment rules finalized
- [x] Localization boundary finalized
- [x] Public exports reviewed
- [x] Tests pass
- [x] Documentation complete

**Core is LOCKED.**
