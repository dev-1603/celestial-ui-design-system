# Form

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Semantic grouping and submission of form fields.

## Scope

Phase 1 (P0) contract for `form`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

No special focus contract beyond native element behavior.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/form`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "form",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "disabled": {
        "name": "disabled",
        "type": "boolean"
      }
    },
    "nativePassthrough": "none"
  },
  "events": {
    "events": {
      "change": {
        "name": "change"
      },
      "submit": {
        "name": "submit"
      }
    }
  },
  "parts": {
    "parts": {
      "root": {
        "name": "root",
        "required": true
      }
    }
  },
  "accessibility": {
    "role": "form",
    "name": {
      "from": "prop:ariaLabel"
    }
  },
  "composition": {
    "allowedChildren": [
      "input",
      "textarea",
      "label",
      "checkbox",
      "switch",
      "radio-group",
      "select",
      "button",
      "search-input"
    ]
  },
  "behavior": {
    "supportsDisabled": true,
    "requiresRole": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
