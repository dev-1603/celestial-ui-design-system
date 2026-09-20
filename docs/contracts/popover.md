# Popover

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Non-modal floating content anchored to trigger.

## Scope

Phase 1 (P0) contract for `popover`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Escape` → `close`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/popover`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "popover",
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
      "closed"
    ]
  },
  "events": {
    "events": {
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
    "visibleOnly": true
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
