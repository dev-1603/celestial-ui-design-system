# Drawer

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Edge-anchored overlay panel for secondary tasks.

## Scope

Phase 1 (P0) contract for `drawer`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Escape` → `close`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/drawer`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "drawer",
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
      },
      "modal": {
        "name": "modal",
        "type": "boolean",
        "default": true
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
      "dismiss": {
        "name": "dismiss"
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
        "required": false
      },
      "overlay": {
        "name": "overlay",
        "required": true
      },
      "content": {
        "name": "content",
        "required": true,
        "refTarget": true
      },
      "title": {
        "name": "title",
        "required": false
      },
      "description": {
        "name": "description",
        "required": false
      },
      "close": {
        "name": "close",
        "required": false
      },
      "footer": {
        "name": "footer",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "dialog",
    "name": {
      "from": "prop:ariaLabel"
    }
  },
  "keyboard": {
    "bindings": [
      {
        "keys": [
          "Escape"
        ],
        "intent": "close"
      }
    ]
  },
  "focus": {
    "trap": true,
    "restoreOnClose": true
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
      "text",
      "heading",
      "icon"
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
