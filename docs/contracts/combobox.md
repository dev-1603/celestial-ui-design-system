# Combobox

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Filterable selection from editable input.

## Scope

Phase 1 (P1) contract for `combobox`. Framework-agnostic semantics only; rendering belongs to adapters.

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

Consume this ComponentSpec via `@celestial-ui/core/specs/combobox`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "combobox",
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
  "sizes": {
    "sizes": [
      "sm",
      "md",
      "lg"
    ],
    "defaultSize": "md"
  },
  "states": {
    "allowed": [
      "open",
      "closed",
      "disabled",
      "focus-visible",
      "invalid"
    ]
  },
  "events": {
    "events": {
      "change": {
        "name": "change"
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
      "trigger": {
        "name": "trigger",
        "required": true,
        "refTarget": true
      },
      "content": {
        "name": "content",
        "required": true
      },
      "item": {
        "name": "item",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "combobox",
    "name": {
      "from": "slot:label"
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
    "visibleOnly": true
  },
  "controlled": {
    "fields": [
      {
        "prop": "value",
        "event": "change"
      },
      {
        "prop": "open",
        "event": "openChange"
      }
    ]
  },
  "composition": {
    "allowedChildren": [
      "input",
      "popover",
      "icon",
      "label",
      "text"
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
  "behavior": {
    "supportsDisabled": true,
    "openClosed": true,
    "requiresRole": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
