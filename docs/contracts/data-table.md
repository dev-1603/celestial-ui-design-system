# Data Table

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Tabular data with sorting, filtering, and selection.

## Scope

Phase 1 (P1) contract for `data-table`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Enter` → `activate`
- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/data-table`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "data-table",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "sortColumn": {
        "name": "sortColumn",
        "type": "string"
      },
      "selectedRows": {
        "name": "selectedRows",
        "type": "string",
        "controlled": true
      }
    },
    "nativePassthrough": "none"
  },
  "states": {
    "allowed": [
      "focus-visible",
      "selected"
    ]
  },
  "events": {
    "events": {
      "change": {
        "name": "change"
      },
      "select": {
        "name": "select"
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
        "required": false
      },
      "cell": {
        "name": "cell",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "grid",
    "name": {
      "from": "prop:ariaLabel"
    }
  },
  "keyboard": {
    "bindings": [
      {
        "keys": [
          "Enter"
        ],
        "intent": "activate"
      },
      {
        "keys": [
          " "
        ],
        "intent": "activate"
      }
    ]
  },
  "focus": {
    "visibleOnly": true
  },
  "composition": {
    "allowedChildren": [
      "table",
      "checkbox",
      "pagination",
      "button",
      "icon",
      "text"
    ]
  },
  "behavior": {
    "supportsDisabled": false
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
