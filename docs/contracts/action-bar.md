# Action Bar

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Grouped primary actions for a view.

## Scope

Phase 1 (P1) contract for `action-bar`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Enter` → `activate`
- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/action-bar`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "action-bar",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "value": {
        "name": "value",
        "type": "string",
        "controlled": true
      }
    },
    "nativePassthrough": "none"
  },
  "states": {
    "allowed": [
      "focus-visible",
      "selected",
      "disabled"
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
      "item": {
        "name": "item",
        "required": false
      },
      "link": {
        "name": "link",
        "required": false,
        "refTarget": true
      }
    }
  },
  "accessibility": {
    "role": "navigation",
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
      "button",
      "text",
      "icon"
    ]
  },
  "behavior": {
    "supportsDisabled": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
