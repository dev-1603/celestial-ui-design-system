# Checkbox

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Binary or indeterminate selection control.

## Scope

Phase 1 (P0) contract for `checkbox`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/checkbox`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "checkbox",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "props": {
    "props": {
      "checked": {
        "name": "checked",
        "type": "boolean",
        "controlled": true
      },
      "defaultChecked": {
        "name": "defaultChecked",
        "type": "boolean"
      },
      "disabled": {
        "name": "disabled",
        "type": "boolean"
      },
      "indeterminate": {
        "name": "indeterminate",
        "type": "boolean"
      },
      "required": {
        "name": "required",
        "type": "boolean"
      }
    },
    "nativePassthrough": "control"
  },
  "states": {
    "allowed": [
      "checked",
      "indeterminate",
      "disabled",
      "invalid",
      "focus-visible",
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
        "refTarget": true
      },
      "control": {
        "name": "control",
        "required": true,
        "receivesNativeProps": true
      },
      "indicator": {
        "name": "indicator",
        "required": true
      },
      "label": {
        "name": "label",
        "required": false
      }
    }
  },
  "accessibility": {
    "role": "checkbox",
    "name": {
      "from": "slot:label"
    }
  },
  "keyboard": {
    "bindings": [
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
  "controlled": {
    "fields": [
      {
        "prop": "checked",
        "event": "change"
      }
    ]
  },
  "formField": {
    "fields": [
      "name",
      "value",
      "required",
      "disabled",
      "invalid"
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
