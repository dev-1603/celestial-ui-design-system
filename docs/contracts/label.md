# Label

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Accessible label for a form control.

## Scope

Phase 1 (P0) contract for `label`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

No special focus contract beyond native element behavior.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/label`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "label",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "htmlFor": {
        "name": "htmlFor",
        "type": "string",
        "mapsTo": "native"
      }
    },
    "nativePassthrough": "root"
  },
  "parts": {
    "parts": {
      "root": {
        "name": "root",
        "required": true,
        "refTarget": true,
        "receivesNativeProps": true
      }
    }
  },
  "accessibility": {
    "name": {
      "from": "contents"
    }
  },
  "polymorphism": {
    "nativeTag": "label"
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
