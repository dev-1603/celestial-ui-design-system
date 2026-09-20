# Tag

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Removable or static label chip.

## Scope

Phase 1 (P1) contract for `tag`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

No special focus contract beyond native element behavior.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/tag`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "tag",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "ariaLabel": {
        "name": "ariaLabel",
        "type": "string"
      }
    },
    "nativePassthrough": "root"
  },
  "parts": {
    "parts": {
      "root": {
        "name": "root",
        "required": true,
        "refTarget": true
      }
    }
  },
  "accessibility": {
    "role": "img",
    "name": {
      "from": "prop:ariaLabel"
    }
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
