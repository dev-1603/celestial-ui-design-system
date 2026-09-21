# Image

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Responsive image with alt semantics.

## Scope

Phase 1 (P1) contract for `image`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

No special focus contract beyond native element behavior.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/image`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "image",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "src": {
        "name": "src",
        "type": "string"
      },
      "alt": {
        "name": "alt",
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
        "refTarget": true,
        "receivesNativeProps": true
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
