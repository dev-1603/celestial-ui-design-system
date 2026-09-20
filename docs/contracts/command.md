# Command

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Searchable command palette over a collection.

## Scope

Phase 1 (P1) contract for `command`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Enter` → `activate`
- ` ` → `activate`
- `Escape` → `close`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/command`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "command",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "open": {
        "name": "open",
        "type": "boolean",
        "controlled": true
      },
      "defaultOpen": {
        "name": "defaultOpen",
        "type": "boolean"
      }
    },
    "nativePassthrough": "none"
  },
  "states": {
    "allowed": [
      "open",
      "closed",
      "focus-visible"
    ]
  },
  "events": {
    "events": {
      "select": {
        "name": "select"
      },
      "openChange": {
        "name": "openChange"
      }
    }
  },
  "parts": {
    "parts": {
      "root": {
        "name": "root",
        "required": true
      },
      "input": {
        "name": "input",
        "required": true,
        "refTarget": true
      },
      "list": {
        "name": "list",
        "required": true
      },
      "item": {
        "name": "item",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "listbox",
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
      },
      {
        "keys": [
          "Escape"
        ],
        "intent": "close"
      }
    ]
  },
  "focus": {
    "trap": true
  },
  "composition": {
    "allowedChildren": [
      "input",
      "icon",
      "text",
      "button"
    ]
  },
  "behavior": {
    "openClosed": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
