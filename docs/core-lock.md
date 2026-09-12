# @celestial-ui/core Lock Policy

**Status:** LOCKED (Foundation Finalization — 2026-09-06)  
**Schema versions:** Contract `1.1.0` · Spec `1.1.0`  
**Runtime dependencies:** 0

## What is locked

The following Core surfaces are **architecturally finalized**:

### Contract system

- Composable `ComponentContract` model
- `SizeContract` and `PointerContract` (schema 1.1)
- Anatomy validation (parts, slots, refs)
- Capability validation against declared contracts

### Specification model

- `ComponentSpec` with metadata, defaults, environment requirements
- **103 generic component specs** (six hand-authored references + ninety-seven profile-generated)
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

1. Core lock checklist complete (this document)
2. `pnpm validate` passes including consumer fixtures
3. Framework adapter implements `FrameworkAdapterContract`
4. Components conform to reference specs via `createConformanceHarness`
5. Rendering and sanitization remain in the adapter/library layer

## Documented future work (not blockers)

| Item                                   | Severity | Notes                                        |
| -------------------------------------- | -------- | -------------------------------------------- |
| ESM dual-publish                       | P2       | Improves tree-shaking; CJS retained in 0.1.x |
| Framework-specific conformance runners | P2       | Live in framework packages                   |
| Root barrel minimization               | P3       | Prefer subpath imports                       |

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
