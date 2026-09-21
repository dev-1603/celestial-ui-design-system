# Tabs

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Tabbed interface with one active panel.

## Scope

Phase 1 (P0) contract for `tabs`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Enter` → `activate`
- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/tabs`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "tabs",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "value": {
        "name": "value",
        "type": "string",
        "controlled": true
      },
      "defaultValue": {
        "name": "defaultValue",
        "type": "string"
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
      }
    }
  },
  "parts": {
    "parts": {
      "root": {
        "name": "root",
        "required": true
      },
      "list": {
        "name": "list",
        "required": true
      },
      "trigger": {
        "name": "trigger",
        "required": false
      },
      "content": {
        "name": "content",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "tablist",
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
  "controlled": {
    "fields": [
      {
        "prop": "value",
        "event": "change"
      }
    ]
  },
  "composition": {
    "allowedChildren": [
      "text",
      "icon",
      "button"
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
