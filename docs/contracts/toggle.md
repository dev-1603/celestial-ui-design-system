# Toggle

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Two-state pressed button control.

## Scope

Phase 1 (P1) contract for `toggle`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Enter` → `activate`
- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/toggle`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "toggle",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "disabled": {
        "name": "disabled",
        "type": "boolean"
      }
    },
    "nativePassthrough": "root"
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
      "disabled",
      "focus-visible",
      "hover",
      "pressed"
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
        "refTarget": true,
        "receivesNativeProps": true
      }
    }
  },
  "accessibility": {
    "role": "button",
    "name": {
      "from": "contents"
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
  "polymorphism": {
    "nativeTag": "button",
    "allowedAs": [
      "button",
      "a"
    ]
  },
  "behavior": {
    "supportsDisabled": true,
    "requiresRole": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
