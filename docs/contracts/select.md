# Select

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Choose one value from a collection of options.

## Scope

Phase 1 (P0) contract for `select`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `ArrowDown` → `next`
- `ArrowUp` → `prev`
- `Enter` → `open`
- `Escape` → `close`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/select`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "select",
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
      "trigger": {
        "name": "trigger",
        "required": true
      },
      "value": {
        "name": "value",
        "required": true
      },
      "icon": {
        "name": "icon",
        "required": false
      },
      "content": {
        "name": "content",
        "required": true
      },
      "viewport": {
        "name": "viewport",
        "required": true
      },
      "group": {
        "name": "group",
        "required": false
      },
      "label": {
        "name": "label",
        "required": false
      },
      "item": {
        "name": "item",
        "required": true
      },
      "itemText": {
        "name": "itemText",
        "required": true
      },
      "itemIndicator": {
        "name": "itemIndicator",
        "required": false
      },
      "separator": {
        "name": "separator",
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
          "Enter"
        ],
        "intent": "open"
      },
      {
        "keys": [
          "Escape"
        ],
        "intent": "close"
      }
    ],
    "roving": true,
    "typeahead": true
  },
  "focus": {
    "trap": false,
    "restoreOnClose": true,
    "roving": true
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
      "label",
      "icon",
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
    "selectionMode": "single",
    "requiresRole": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
