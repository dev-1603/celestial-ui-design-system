# Input OTP

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

One-time password or PIN segmented input.

## Scope

Phase 1 (P1) contract for `input-otp`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/input-otp`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "input-otp",
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
      "readOnly": {
        "name": "readOnly",
        "type": "boolean"
      },
      "required": {
        "name": "required",
        "type": "boolean"
      }
    },
    "nativePassthrough": "control"
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
      "readonly",
      "required",
      "invalid",
      "focus",
      "focus-visible"
    ]
  },
  "events": {
    "events": {
      "change": {
        "name": "change"
      },
      "focus": {
        "name": "focus"
      },
      "blur": {
        "name": "blur"
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
    "role": "textbox",
    "name": {
      "from": "slot:label"
    }
  },
  "focus": {
    "initialFocus": "autofocus"
  },
  "controlled": {
    "fields": [
      {
        "prop": "value",
        "event": "change"
      }
    ]
  },
  "formField": {
    "fields": [
      "name",
      "value",
      "defaultValue",
      "required",
      "disabled",
      "readOnly",
      "invalid"
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
