# Button

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Triggers an action or submits a form.

## Scope

Phase 1 (P0) contract for `button`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Enter` → `activate`
- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/button`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "button",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "disabled": {
        "name": "disabled",
        "type": "boolean"
      },
      "loading": {
        "name": "loading",
        "type": "boolean"
      },
      "type": {
        "name": "type",
        "type": "enum",
        "enumValues": [
          "button",
          "submit",
          "reset"
        ],
        "default": "button"
      }
    },
    "nativePassthrough": "root"
  },
  "variants": {
    "variants": {
      "variant": {
        "name": "variant",
        "values": [
          "primary",
          "secondary",
          "ghost",
          "destructive"
        ],
        "default": "primary"
      }
    }
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
      "loading",
      "pressed",
      "focus-visible",
      "hover"
    ]
  },
  "events": {
    "events": {
      "press": {
        "name": "press"
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
      },
      "icon": {
        "name": "icon",
        "required": false
      },
      "label": {
        "name": "label",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "button",
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
  "polymorphism": {
    "nativeTag": "button",
    "allowedAs": [
      "button",
      "a"
    ]
  },
  "behavior": {
    "supportsDisabled": true,
    "supportsLoading": true,
    "requiresRole": true
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
