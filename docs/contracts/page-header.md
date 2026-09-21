# Page Header

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Title area with actions and metadata.

## Scope

Phase 1 (P1) contract for `page-header`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

No special focus contract beyond native element behavior.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/page-header`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "page-header",
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
      "heading",
      "text",
      "button",
      "breadcrumb",
      "icon"
    ]
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
