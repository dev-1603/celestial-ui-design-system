# Celestial UI Core Architecture

`@celestial-ui/core` is the **framework-agnostic semantic foundation** for all Celestial UI component libraries.

## Core defines WHAT — not HOW

| Layer                 | Responsibility                                                                          |
| --------------------- | --------------------------------------------------------------------------------------- |
| **Core**              | What a component _is_: contracts, specs, behavior semantics, accessibility, interaction |
| **Framework adapter** | How framework mechanics map to Core contracts                                           |
| **Component library** | How the framework _renders_ the component                                               |

Core must **never** import React, Vue, Svelte, Angular, CSS engines, token catalogs, icon catalogs, or i18n runtimes.

## Responsibilities

Core owns:

- **Component contracts** — composable capability declarations (`ComponentContract`)
- **Component specifications** — canonical metadata + contract (`ComponentSpec`)
- **Component catalog** — lightweight registry of recognized components (`CANONICAL_CATALOG`)
- **Behavior controllers** — disclosure, controllable state, collection, selection, overlay
- **Accessibility semantics** — roles, ARIA mapping helpers, focus/keyboard contracts
- **Pointer semantics** — framework-neutral interaction contract (not DOM event types)
- **State vocabulary** — standardized semantic states serialized to DOM attributes
- **Environment abstraction** — SSR-safe browser/Node environment factories
- **Adapter contract** — integration boundary for future framework packages
- **Conformance harness** — validates specs and optional implementation snapshots

## Non-responsibilities

Core does **not** own:

- Framework rendering (JSX, templates, Web Components implementation)
- CSS, themes, tokens, icons
- i18n engines or locale loading
- Business/domain UI (Care Caddy, Identity workflows, etc.)
- Visual component implementations

## Package shape

```text
@celestial-ui/core =
  canonical contracts
+ component specifications
+ component metadata/catalog
+ framework-neutral behavior
+ accessibility / keyboard / focus / pointer semantics
+ state management primitives
+ collection / selection / overlay primitives
+ SSR/environment abstractions
+ adapter contract
+ conformance definitions/testing
```

## Dependency guarantee

```text
@celestial-ui/core → 0 production runtime dependencies
```

Core is independent of `@celestial-ui/tokens`, `@celestial-ui/theme`, `@celestial-ui/styles`, and `@celestial-ui/icons`.

## Contract system

Contracts are **composable**. A component declares only applicable sections:

- `PropsContract`, `VariantsContract`, `SizeContract`, `StatesContract`
- `EventsContract`, `SlotsContract`, `PartsContract`
- `BehaviorContract`, `AccessibilityContract`
- `KeyboardContract`, `PointerContract`, `FocusContract`
- `ControlledStateContract`, `CollectionContract`, `SelectionContract`, `OverlayContract`
- `FormFieldContract`, `LocalizationKeysContract`, `PolymorphismContract`, `RefContract`
- `EnvironmentContract`, `ConformanceContract`, `DiagnosticsContract`

See [core-component-contract.md](./core-component-contract.md).

## Component specifications

A `ComponentSpec` wraps a `ComponentContract` with metadata:

- purpose, taxonomy (atomic → advanced), engineering family
- capability flags
- defaults (props, variants, size)
- environment requirements (SSR/browser)

Specs are **not implementations**. See [core-component-specification.md](./core-component-specification.md).

## Canonical catalog

The catalog (`@celestial-ui/core/catalog`) exposes **metadata only** — no eager spec loading.

Reference specs ship as independent subpath exports:

```ts
import { getCatalogEntry } from '@celestial-ui/core/catalog';
import { buttonSpec } from '@celestial-ui/core/specs/button';
```

Six reference components prove model expressiveness: `button`, `input`, `checkbox`, `select`, `dialog`, `table`.

The full **103-component generic inventory** is defined in `packages/core/src/catalog/data/generic-component-inventory.json`. All 103 components have catalog metadata entries; six ship hand-authored reference specs and ninety-seven use profile-based generated specs via `@celestial-ui/core/specs/<id>`.

## Import model (tree-shaking)

Prefer capability subpaths over the root barrel:

```ts
import { createDisclosure } from '@celestial-ui/core/behavior';
import { defineComponentSpec } from '@celestial-ui/core/contracts';
import { createConformanceHarness } from '@celestial-ui/core/testing';
```

The root export remains for convenience. **CJS output (v0.1.x)** limits dead-code elimination — ESM dual-publish is documented future work.

## Adapter boundary

Framework adapters implement `FrameworkAdapterContract` **outside** Core:

```ts
import { defineFrameworkAdapterContract } from '@celestial-ui/core';
```

Rendering, lifecycle, refs, events, and controlled-state translation remain adapter-owned while preserving Core semantics.

## Conformance

```ts
import { createConformanceHarness } from '@celestial-ui/core/testing';
import { buttonSpec } from '@celestial-ui/core/specs/button';

const harness = createConformanceHarness(buttonSpec);
harness.assertCompliant();
```

Framework libraries will use this harness (and extend with framework-specific runners later).

## Localization boundary

Core defines **message key contracts** and `resolveMessage()` — not translation engines. Applications supply pre-translated `messages` at runtime.

## SSR / environment

Use `createNullEnvironment()` for SSR/tests. Browser APIs are accessed lazily via `createBrowserEnvironment()` — never at module initialization.

## Lock status

See [core-lock.md](./core-lock.md) for frozen boundaries and change policy.
