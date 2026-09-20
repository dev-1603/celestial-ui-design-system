# Calendar

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Date grid for selecting dates or ranges.

## Scope

Phase 1 (P1) contract for `calendar`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Enter` → `activate`
- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/calendar`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "calendar",
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
      },
      "readOnly": {
        "name": "readOnly",
        "type": "boolean"
      }
    },
    "nativePassthrough": "none"
  },
  "states": {
    "allowed": [
      "focus-visible",
      "readonly",
      "invalid"
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
      "viewport": {
        "name": "viewport",
        "required": true,
        "refTarget": true
      }
    }
  },
  "accessibility": {
    "role": "application",
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
    "trap": false
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
      "button",
      "text",
      "icon"
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
