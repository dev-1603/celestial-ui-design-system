# Menubar

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Horizontal menu bar with nested menus.

## Scope

Phase 1 (P1) contract for `menubar`. Framework-agnostic semantics only; rendering belongs to adapters.

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

Consume this ComponentSpec via `@celestial-ui/core/specs/menubar`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "menubar",
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
      },
      "separator": {
        "name": "separator",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "menu",
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
    "trap": false,
    "restoreFocus": true
  },
  "controlled": {
    "fields": [
      {
        "prop": "open",
        "event": "openChange"
      }
    ]
  },
  "composition": {
    "allowedChildren": [
      "button",
      "dropdown-menu",
      "icon",
      "text"
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
