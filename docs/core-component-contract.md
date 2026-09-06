# Core Component Contract Model

The `ComponentContract` is the canonical, serializable definition of what a Celestial UI component **must semantically provide**.

## Design principles

1. **Composable** — declare only applicable contract sections
2. **Framework-neutral** — no JSX, hooks, or framework event types
3. **Serializable** — contracts validate as plain JSON-compatible objects
4. **Versioned** — `schemaVersion` follows semver major compatibility (`1.x`)

Current schema: **`1.1.0`**

## Identity (required)

Every contract includes:

| Field | Purpose |
|---|---|
| `id` | Kebab-case `ComponentId` |
| `version` | Component contract version |
| `schemaVersion` | Contract schema version |

## Capability contracts

### Props (`PropsContract`)

Typed prop definitions with optional controlled flag, enum values, defaults, and native passthrough mode.

### Variants (`VariantsContract`)

Named variant dimensions (e.g. `variant: primary | secondary`).

### Sizes (`SizeContract`) — *new in 1.1*

First-class size dimension when applicable:

```ts
sizes: {
  sizes: ['sm', 'md', 'lg'],
  defaultSize: 'md',
}
```

Omit entirely when a component has no meaningful size axis.

### States (`StatesContract`)

Allowed semantic states from the Core vocabulary (`disabled`, `loading`, `open`, `indeterminate`, etc.).

### Events (`EventsContract`)

Partial map of semantic events (`change`, `openChange`, `select`, `dismiss`, …). Components declare only events they emit.

### Slots & parts (`SlotsContract`, `PartsContract`)

Framework-independent anatomy. Part keys must match `part.name`. See anatomy validation.

### Behavior (`BehaviorContract`)

High-level behavior flags: `supportsDisabled`, `openClosed`, `selectionMode`, etc.

### Accessibility (`AccessibilityContract`)

Role, accessible name source, keyboard/focus specs, ARIA relationships.

### Keyboard (`KeyboardContract`)

Semantic keyboard bindings mapping keys → intents (`activate`, `next`, `dismiss`, …).

### Pointer (`PointerContract`) — *new in 1.1*

Semantic pointer interactions (`click`, `press`, `hover`, `longpress`, …) with disabled suppression rules. **Not** React/Vue event types.

### Focus (`FocusContract`)

Focus trap, restore-on-close, roving focus, initial focus target.

### Controlled state (`ControlledStateContract`)

Maps controlled props to semantic change events.

### Collection & selection

`CollectionContract` — ordering, typeahead, roving focus, virtualization flag.  
`SelectionContract` — single/multiple/none selection semantics.

### Overlay (`OverlayContract`)

Modal behavior, escape/outside dismiss, scroll lock, focus restore.

### Form field (`FormFieldContract`)

Semantic form field capabilities (name, value, invalid, touched, …).

### Localization (`LocalizationKeysContract`)

Required/optional message keys — not translated strings.

### Polymorphism & refs

`PolymorphismContract` — allowed `as` targets.  
`RefContract` — primary ref and part ref targets.

### Environment, conformance, diagnostics

Optional declarations for SSR requirements, conformance areas, and structured diagnostics policy.

## Validation

```ts
import { validateComponentContract, assertValidContract } from '@celestial-ui/core/contracts';
```

Validation checks:

- schema compatibility
- size default ∈ sizes
- controlled prop/event cross-references
- anatomy consistency (parts, slots, refs)
- non-serializable values rejected

## Relationship to ComponentSpec

`ComponentContract` describes capabilities. `ComponentSpec` adds metadata, defaults, capabilities list, and environment requirements.

See [core-component-specification.md](./core-component-specification.md).
