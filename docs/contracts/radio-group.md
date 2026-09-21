# Radio Group

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Single selection among mutually exclusive options.

## Scope

Phase 1 (P0) contract for `radio-group`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `ArrowDown` → `next`
- `ArrowRight` → `next`
- `ArrowUp` → `prev`
- `ArrowLeft` → `prev`
- `Home` → `first`
- `End` → `last`
- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/radio-group`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "radio-group",
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
      "disabled": {
        "name": "disabled",
        "type": "boolean"
      },
      "required": {
        "name": "required",
        "type": "boolean"
      }
    },
    "nativePassthrough": "none"
  },
  "states": {
    "allowed": [
      "disabled",
      "invalid",
      "focus-visible"
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
        "required": true,
        "refTarget": true
      },
      "item": {
        "name": "item",
        "required": true
      },
      "indicator": {
        "name": "indicator",
        "required": false
      },
      "label": {
        "name": "label",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "radiogroup",
    "name": {
      "from": "slot:label"
    }
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
          "ArrowRight"
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
          "Home"
        ],
        "intent": "first"
      },
      {
        "keys": [
          "End"
        ],
        "intent": "last"
      },
      {
        "keys": [
          " "
        ],
        "intent": "activate"
      }
    ],
    "roving": true
  },
  "focus": {
    "visibleOnly": true,
    "roving": true
  },
  "controlled": {
    "fields": [
      {
        "prop": "value",
        "event": "change"
      }
    ]
  },
  "formField": {
    "fields": [
      "name",
      "value",
      "defaultValue",
      "required",
      "disabled",
      "invalid"
    ]
  },
  "polymorphism": {
    "nativeTag": "div"
  },
  "behavior": {
    "supportsDisabled": true,
    "selectionMode": "single",
    "requiresRole": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
