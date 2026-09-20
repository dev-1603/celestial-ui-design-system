# Spinner

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Indeterminate loading indicator.

## Scope

Phase 1 (P0) contract for `spinner`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

No special focus contract beyond native element behavior.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/spinner`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "spinner",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "open": {
        "name": "open",
        "type": "boolean"
      }
    },
    "nativePassthrough": "none"
  },
  "states": {
    "allowed": [
      "open",
      "closed",
      "error",
      "warning",
      "success",
      "loading"
    ]
  },
  "events": {
    "events": {
      "dismiss": {
        "name": "dismiss"
      }
    }
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
    "role": "status",
    "name": {
      "from": "contents"
    }
  },
  "behavior": {
    "supportsLoading": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
