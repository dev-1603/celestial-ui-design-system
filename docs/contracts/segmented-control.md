# Segmented Control

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Mutually exclusive compact option switcher.

## Scope

Phase 1 (P1) contract for `segmented-control`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

- `Enter` → `activate`
- ` ` → `activate`

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/segmented-control`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "segmented-control",
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
      }
    },
    "nativePassthrough": "control"
  },
  "states": {
    "allowed": [
      "disabled",
      "checked",
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
        "required": true
      },
      "control": {
        "name": "control",
        "required": true,
        "refTarget": true,
        "receivesNativeProps": true
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
