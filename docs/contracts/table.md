# Table

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Tabular data display with optional selection and keyboard traversal.

## Scope

Phase 1 (P0) contract for `table`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `ArrowDown` → `next`
- `ArrowUp` → `prev`
- `ArrowLeft` → `prev`
- `ArrowRight` → `next`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/table`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "table",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "selectionMode": {
        "name": "selectionMode",
        "type": "enum",
        "enumValues": [
          "none",
          "single",
          "multiple"
        ],
        "default": "none"
      },
      "disabled": {
        "name": "disabled",
        "type": "boolean"
      }
    },
    "nativePassthrough": "none"
  },
  "states": {
    "allowed": [
      "selected",
      "disabled",
      "focus-visible",
      "loading"
    ]
  },
  "events": {
    "events": {
      "select": {
        "name": "select"
      },
      "change": {
        "name": "change"
      }
    }
  },
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
      "body": {
        "name": "body",
        "required": true
      },
      "row": {
        "name": "row",
        "required": true
      },
      "cell": {
        "name": "cell",
        "required": true
      },
      "columnHeader": {
        "name": "columnHeader",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "grid"
  },
  "keyboard": {
    "bindings": [
      {
        "keys": [
          "ArrowDown"
        ],
        "intent": "next"
      },
      {
        "keys": [
          "ArrowUp"
        ],
        "intent": "prev"
      },
      {
        "keys": [
          "ArrowLeft"
        ],
        "intent": "prev"
      },
      {
        "keys": [
          "ArrowRight"
        ],
        "intent": "next"
      }
    ],
    "roving": true
  },
  "focus": {
    "roving": true,
    "visibleOnly": true
  },
  "composition": {
    "allowedChildren": [
      "checkbox",
      "button",
      "text",
      "icon"
    ]
  },
  "behavior": {
    "selectionMode": "multiple",
    "requiresRole": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
