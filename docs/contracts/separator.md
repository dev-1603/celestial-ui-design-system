# Separator

> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.

## Purpose

Visual divider between content regions.

## Scope

Phase 1 (P0) contract for `separator`. Framework-agnostic semantics only; rendering belongs to adapters.

## Non-goals

- Visual styling (tokens/theme/styles packages)
- Framework-specific APIs (`asChild`, hooks, JSX)

## Keyboard interaction

No keyboard bindings declared.

## Focus behavior

No special focus contract beyond native element behavior.

## Framework adapter notes

Consume this ComponentSpec via `@celestial-ui/core/specs/separator`. Do not redefine behavior in React/Vue.

## Contract status

**PHASE-1 READY**

## Machine-derived (from ComponentSpec)

```json
{
  "id": "separator",
  "version": "1.0.0",
  "schemaVersion": "1.1.0",
  "parts": {
    "parts": {
      "root": {
        "name": "root",
        "required": true
      }
    }
  },
  "accessibility": {
    "role": "separator"
  },
  "extensions": {
    "phase1Readiness": "ready"
  }
}
```
