# App Shell

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Application frame with nav and content regions.

## Scope

Phase 1 (P1) contract for `app-shell`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

No special focus contract beyond native element behavior.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/app-shell`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "app-shell",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "parts": {
    "parts": {
      "root": {
        "name": "root",
        "required": true,
        "refTarget": true
      },
      "header": {
        "name": "header",
        "required": false
      },
      "content": {
        "name": "content",
        "required": false
      },
      "footer": {
        "name": "footer",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "region",
    "name": {
      "from": "prop:ariaLabel"
    }
  },
  "composition": {
    "allowedChildren": [
      "sidebar",
      "page-header",
      "stack",
      "box",
      "container"
    ]
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
