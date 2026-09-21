# ADR-002: Global Contract Consistency Rules

**Status:** Accepted  
**Date:** 2026-09-20

## Rules

### `requiresRole`

- `accessibility.role` is authoritative.
- `behavior.requiresRole: true` means adapters must emit that role.
- Validator enforces: `requiresRole` ⇒ `accessibility.role` present.
- Native elements with implicit roles (e.g. `label`) omit both.

### Keyboard bindings

- **`keyboard.bindings` is the single source of truth** for key → intent maps.
- `accessibility.keyboard` is deprecated; do not add new bindings there.
- If both exist, validator requires every `accessibility.keyboard` entry to be mirrored in `keyboard.bindings`.

### `formField`

- Required only for components that register **name/value** with forms.
- `engineeringFamily: 'forms'` is classification only.
- `form` container uses `composition` + events, not `formField`.

### Polymorphism

- Core declares `nativeTag` + optional `allowedAs` only.
- `as` / `asChild` syntax is adapter-owned.

### Catalog capabilities

- Reference specs (`referenceSpec: true`) derive catalog capabilities from hand-authored `metadata.capabilities`, not the stub `reference` profile.
