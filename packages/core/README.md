# @celestial-ui/core

Framework-agnostic contracts, component specifications, behavior controllers, and accessibility primitives for Celestial UI.

Core describes **what** a component is. It does not render DOM, JSX, Vue templates, or Svelte components.

## What is this?

`@celestial-ui/core` is the behavioral and contractual foundation of Celestial UI:

| Layer                   | Responsibility                                                             |
| ----------------------- | -------------------------------------------------------------------------- |
| **Core (this package)** | What the component is: `ComponentSpec`, contracts, behavior, a11y, catalog |
| **Framework adapter**   | How framework mechanics map to Core (`FrameworkAdapterContract`)           |
| **Component library**   | How the component is rendered in a framework                               |

It ships **103** generic component specs (six hand-authored references + ninety-seven profile-generated), granular `./specs/<id>` entry points, and zero production runtime dependencies.

`sideEffects` is `false`. Output in v0.1.0 is **CommonJS**.

## Why use it?

Use Core when you want shared accessibility and interaction semantics without taking a rendered Celestial component library (none ships from this repository).

Facts from this package:

- `package.json` `dependencies`: none
- Does not import React, Vue, Svelte, CSS engines, tokens, or icons
- Contract schema `1.1.0`, spec schema `1.1.0` (`CONTRACT_SCHEMA_VERSION`, `SPEC_SCHEMA_VERSION`)
- Catalog metadata is separate from spec modules so listing components does not load every spec

## When to use it

Install this package when you are:

- Building or tightening an in-house component library
- Adding disclosure, selection, overlay, or ARIA helpers to an existing app
- Writing a future framework adapter that must implement `FrameworkAdapterContract`
- Validating specs with `@celestial-ui/core/testing`

You do **not** need tokens, theme, styles, or icons. Those are optional visual/icon layers.

## What this package does

- `ComponentContract` + `defineComponentSpec` / `validateComponentSpec`
- Canonical catalog metadata (`@celestial-ui/core/catalog`)
- Per-component specs (`@celestial-ui/core/specs/button`, …)
- Behavior: `createDisclosure`, `createControllableState`, `shouldIgnorePointer`
- Collection / selection / roving focus
- Overlay controllers
- `buildAriaProps`, `createFocusManager`
- Keyboard / pointer / size helpers
- `createCelestialRuntime` with environment + pre-translated `messages`
- Conformance harness on `./testing`
- Adapter contract types and `defineFrameworkAdapterContract`

## What this package does NOT do

- Render buttons, dialogs, or any UI
- Include React/Vue/Svelte components or hooks
- Own CSS, tokens, themes, or icons
- Run an i18n engine (you pass already-translated `messages`)
- Export `ButtonSpec.getAriaAttributes()` — the spec object is `buttonSpec`; ARIA is `buildAriaProps`
- Load all 103 specs from the catalog entry (catalog is metadata-only)

## Package independence

| Scenario                         | Supported?                                      | Notes                                                           |
| -------------------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| Package alone                    | Yes                                             | Zero runtime dependencies                                       |
| With other Celestial UI packages | Yes                                             | Optional; no package.json dependency on them                    |
| Existing application             | Yes                                             | Call controllers/helpers from your code                         |
| In-house component/UI library    | Yes                                             | Primary intended consumer                                       |
| React                            | Current (as a library of contracts/controllers) | No `@celestial-ui/react` in this repo                           |
| Vue                              | Current (same)                                  | No `@celestial-ui/vue` in this repo                             |
| Svelte                           | Current (same)                                  | No `@celestial-ui/svelte` in this repo                          |
| SSR                              | Yes                                             | `createNullEnvironment()`; DOM helpers no-op without a document |

## Installation

Package-manager support and runtime support are verified separately. Node.js **>= 22**. Bun **1.1.20** was used for packed-tarball consumer fixtures.

### npm

```bash
npm install @celestial-ui/core
```

### pnpm

```bash
pnpm add @celestial-ui/core
```

### yarn

```bash
yarn add @celestial-ui/core
```

### Bun

```bash
bun add @celestial-ui/core
```

Verified with the same packed-tarball fixtures as npm/pnpm/yarn (`core-node`, `ssr-node`), installed and run with Bun.

### Deno

Deno is **partial**. A best-effort non-blocking fixture imports `createDisclosure` via `npm:@celestial-ui/core` from a packed tarball. CJS interop may fail depending on Deno version. See [compatibility-matrix.md](../../docs/compatibility-matrix.md).

No other `@celestial-ui/*` package is required.

### Verified compatibility

| Environment   | Status    | What was verified                                           |
| ------------- | --------- | ----------------------------------------------------------- |
| Node.js >= 22 | Supported | Package tests + Node consumer fixtures                      |
| npm           | Supported | Packed tarball consumer fixtures                            |
| pnpm          | Supported | Packed tarball consumer fixtures (CI)                       |
| Yarn          | Supported | Packed tarball consumer fixtures                            |
| Bun 1.1.20    | Supported | Same packed-tarball fixtures as npm/pnpm/yarn, run with Bun |
| Deno          | Partial   | Best-effort `npm:` import of Core; non-blocking             |

No other `@celestial-ui/*` package is required.

## Quick Start

```ts
import { createDisclosure } from '@celestial-ui/core/behavior';

const disclosure = createDisclosure({ defaultOpen: false });
disclosure.open();
console.log(disclosure.getSnapshot().open); // true
disclosure.destroy();
```

That is the smallest useful unit: a framework-neutral open/close controller. You bind `open` to your own markup.

## Public API

### Root (`@celestial-ui/core`)

Convenience barrel. It does **not** re-export `./catalog`, `./specs/*`, or `./testing`.

Notable exports:

- Version: `CORE_PACKAGE_VERSION`, `CONTRACT_SCHEMA_VERSION`, `SPEC_SCHEMA_VERSION`, `PLUGIN_CONTRACT_VERSION`, `isSchemaCompatible`
- Specs/contracts: `defineComponentSpec`, `validateComponentSpec`, `serializeComponentSpec`, `parseComponentSpec`, `assertValidContract`, `validateComponentContract`
- Behavior: `createDisclosure`, `createControllableState`, `shouldIgnorePointer`
- A11y: `buildAriaProps`, `createFocusManager`, `getFocusRestoreTarget`
- Collection: `createCollection`, `createSelection`, `createRovingFocus`
- Overlay: `createOverlayController`, `getTopOverlay`
- Runtime: `createCelestialRuntime`, `getDefaultRuntime`
- Environment: `createEnvironment`, `createBrowserEnvironment`, `createNullEnvironment`
- DOM naming: `CUI_ATTRIBUTES`, `buildPartAttributes`, `toKebabCase`
- State: `createStateSet`, `statesToDomAttributes`, `COMPONENT_STATES`
- Forms: `createFormFieldState`
- Localization: `resolveMessage`, `createMessageResolver`
- Adapter: `defineFrameworkAdapterContract`, `DEFAULT_ADAPTER_INTEGRATION`
- Plus matching public types (`ComponentSpec`, `ComponentContract`, …)

### Capability subpaths

Prefer these over the root barrel when you want a smaller import graph:

| Import path                        | Purpose                                                      | Use when                           |
| ---------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `@celestial-ui/core/contracts`     | `defineComponentSpec`, contract/spec types                   | Authoring specs                    |
| `@celestial-ui/core/behavior`      | `createDisclosure`, controllable state                       | Open/close and controlled values   |
| `@celestial-ui/core/accessibility` | `buildAriaProps`, focus manager                              | ARIA snapshots                     |
| `@celestial-ui/core/collection`    | Collection, selection, roving focus                          | Lists, menus, grids                |
| `@celestial-ui/core/overlay`       | Overlay controller                                           | Dialogs/popovers (logic only)      |
| `@celestial-ui/core/runtime`       | `createCelestialRuntime`                                     | App/runtime shell                  |
| `@celestial-ui/core/catalog`       | `CANONICAL_CATALOG`, `getCatalogEntry`, `listCatalogEntries` | Metadata without loading specs     |
| `@celestial-ui/core/testing`       | `createConformanceHarness`, `createContractHarness`          | Tests — not for production bundles |
| `@celestial-ui/core/specs/<id>`    | One `ComponentSpec` (e.g. `buttonSpec`)                      | A single component                 |

`./runtime` exports `createCelestialRuntime` only. `getDefaultRuntime` is on the **root** barrel.

## Entry Points

### Catalog vs specs

```ts
import { getCatalogEntry, listCatalogEntries } from '@celestial-ui/core/catalog';
import { buttonSpec } from '@celestial-ui/core/specs/button';

const meta = getCatalogEntry('button');
// meta is catalog metadata — not the full spec
console.log(buttonSpec.contract.accessibility?.role); // 'button'
```

Reference specs (hand-authored): `button`, `input`, `checkbox`, `select`, `dialog`, `table`.

The other catalogue ids use profile-generated specs. Each published id is a subpath:

`accordion`, `action-bar`, `alert`, `alert-dialog`, `app-shell`, `aspect-ratio`, `avatar`, `badge`, `banner`, `blockquote`, `box`, `breadcrumb`, `button`, `calendar`, `callout`, `card`, `carousel`, `center`, `chart`, `checkbox`, `chip`, `code`, `collapsible`, `color-picker`, `combobox`, `command`, `container`, `context-menu`, `data-table`, `date-picker`, `date-range-picker`, `dialog`, `divider`, `drawer`, `dropdown-menu`, `dropzone`, `empty-state`, `figure`, `file-upload`, `flex`, `form`, `grid`, `heading`, `hero`, `hover-card`, `icon`, `image`, `input`, `input-otp`, `kbd`, `label`, `link`, `list`, `list-item`, `menubar`, `meter`, `navigation-menu`, `notice`, `number-input`, `page-header`, `page-layout`, `pagination`, `panel`, `password-input`, `phone-input`, `pin-input`, `popover`, `progress`, `radio-group`, `rating`, `resizable`, `scroll-area`, `search-input`, `segmented-control`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `spacer`, `spinner`, `stack`, `stat`, `stepper`, `switch`, `table`, `tabs`, `tag`, `text`, `textarea`, `time-picker`, `timeline`, `toast`, `toggle`, `toggle-group`, `toolbar`, `tooltip`, `transfer-list`, `tree`, `tree-view`, `video`.

Export name is camelCase + `Spec` (`alertDialogSpec`, `inputOtpSpec`, …).

## Common Usage

### Define a spec

```ts
import { CONTRACT_SCHEMA_VERSION, defineComponentSpec } from '@celestial-ui/core';

const spec = defineComponentSpec({
  contract: {
    id: 'consumer-check',
    version: '1.0.0',
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    states: { allowed: ['idle'] },
    parts: { parts: { root: { name: 'root', required: true } } },
  },
  metadata: { displayName: 'Consumer Check', status: 'stable' },
});
```

### ARIA from a shipped spec

```ts
import { buttonSpec } from '@celestial-ui/core/specs/button';
import { buildAriaProps } from '@celestial-ui/core/accessibility';

const aria = buildAriaProps({
  contract: buttonSpec.contract.accessibility,
  disabled: true,
});
// aria['aria-disabled'] === 'true'
```

### Runtime for SSR

```ts
import { createCelestialRuntime, createNullEnvironment } from '@celestial-ui/core';

const runtime = createCelestialRuntime({
  environment: createNullEnvironment(),
  config: { messages: { closeLabel: 'Close' } },
});
```

Use one runtime per SSR request. `createEnvironment()` already returns a null environment when `document` is undefined.

## Advanced Usage

### Conformance

```ts
import { createConformanceHarness } from '@celestial-ui/core/testing';
import { buttonSpec } from '@celestial-ui/core/specs/button';

const harness = createConformanceHarness(buttonSpec);
harness.assertCompliant();
```

Optional implementation snapshot: `validateImplementation({ props, states, aria, parts, size })`.

`createContractHarness(spec).assertValid()` is a lighter spec-only check (used by the Node consumer fixture).

### Framework adapter contract (no renderer)

```ts
import { defineFrameworkAdapterContract } from '@celestial-ui/core';

const contract = defineFrameworkAdapterContract({
  framework: 'react',
  minCorePackage: '0.1.0',
  minContractSchema: '1.1.0',
});
// contract.integration.rendering === 'framework-owned'
```

Implement rendering in a **separate** package. Core only stores this contract shape.

### Overlay and collection (logic only)

```ts
import { createOverlayController } from '@celestial-ui/core/overlay';
import { createSelection } from '@celestial-ui/core/collection';

const overlay = createOverlayController();
const selection = createSelection({ mode: 'single' });
```

These return controllers/snapshots. Positioning libraries (e.g. Floating UI) stay outside Core.

## Package Combinations

| Combination                         | Valid?        | Purpose                                  |
| ----------------------------------- | ------------- | ---------------------------------------- |
| `@celestial-ui/core` only           | Yes           | Contracts, specs, controllers            |
| core + `@celestial-ui/icons`        | Yes           | Independent; icon _spec_ ≠ icon resolver |
| core + tokens / theme / styles      | Yes           | Independent visual pipeline              |
| Five-package foundation             | Yes           | Coherent but not required                |
| core + `@celestial-ui/react` (etc.) | Future/Target | Not in this repository                   |

## Existing Application Integration

```text
Existing React / Vue / Svelte / vanilla app
        ↓
npm install @celestial-ui/core
        ↓
Import createDisclosure / buildAriaProps / a spec
        ↓
Keep your current components; map state + ARIA onto them
        ↓
Optionally add tokens/styles/icons later
```

No migration to a Celestial component library is required (none is published here).

## In-house Library Integration

Typical split:

- **Consume Core** — import specs and controllers
- **Wrap Core** — your `<Button>` reads `buttonSpec` and `createDisclosure` / `buildAriaProps`
- **Do not** put rendering inside Core
- **Extend** through `defineComponentSpec` for custom ids, or plugins on `createCelestialRuntime`
- **Adapter packages** implement `FrameworkAdapterContract` outside this package

The `icon` spec describes an icon _slot/contract_. SVG lookup is `@celestial-ui/icons` if you choose to install it.

## Framework Integration

**CURRENT**

- Any framework can import Core as TypeScript/JavaScript
- `defineFrameworkAdapterContract` documents the boundary
- Consumer fixture `core-node` imports Core from Node without a UI framework

**PLANNED / FUTURE**

Future framework integration is expected to consume this package through the framework adapter architecture; no official framework package is currently documented here unless implemented in this repository.

Do not treat `@celestial-ui/react`, `@celestial-ui/vue`, or `@celestial-ui/svelte` as installable from this monorepo.

**NOT SUPPORTED**

- Rendering implementations inside Core
- Framework dependencies on this package
- Using Core as a drop-in component library

## SSR / Browser / Runtime

- `createNullEnvironment()` — no document; safe on the server
- `createBrowserEnvironment()` — lazy `document`/`window` access (not at module init)
- `createFocusManager` and similar APIs that need a document should run in the browser, or they no-op via a null environment
- Specs declare `environment: { ssr: true, browser: true }` on shipped components
- Pass `messages` as already-translated strings; Core does not load locale files
- `Direction` is `'ltr' | 'rtl'` from runtime config, not from Core locale packs
- `createOverlayController()` uses an in-process overlay stack. Call `destroy()` when done; for SSR prefer request-scoped usage and do not leave controllers alive across requests
- Bun 1.1.20: same `core-node` / `ssr-node` fixtures as npm/pnpm/yarn; they exercise `createDisclosure`, `createCelestialRuntime({ environment: createNullEnvironment() })`, and SSR style-tag compilation

## Tree-shaking / Bundle Usage

- Use `@celestial-ui/core/specs/button` when you need one spec. Do not import the root barrel expecting only that spec.
- `@celestial-ui/core/catalog` does not embed full specs.
- Do not import `@celestial-ui/core/testing` in application bundles.
- v0.1.x is **CJS**. Dead-code elimination is limited compared to ESM. Prefer granular subpaths; do not claim the package is fully tree-shakable. ESM dual-publish is documented as future work in architecture docs.

## Troubleshooting

| Issue                                       | What to check                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| Bundle includes every spec                  | Import `@celestial-ui/core/specs/<id>`, not a non-existent root `ButtonSpec` |
| `ButtonSpec` is not exported                | Use `buttonSpec` from `./specs/button`                                       |
| `getAriaAttributes` missing                 | Use `buildAriaProps({ contract, disabled, … })`                              |
| Testing APIs missing from root              | Import `@celestial-ui/core/testing`                                          |
| Catalog has no `contract.props`             | Catalog entries are metadata; load `./specs/<id>`                            |
| DOM errors during SSR                       | `createCelestialRuntime({ environment: createNullEnvironment() })`           |
| Expecting HTML output                       | Core never renders; map snapshots to your elements                           |
| Installing tokens “because Core needs them” | Core does not depend on tokens                                               |

## Related Packages

| Package                                  | Relationship                           |
| ---------------------------------------- | -------------------------------------- |
| `@celestial-ui/tokens`                   | Independent optional visual layer      |
| `@celestial-ui/theme`                    | Independent optional visual layer      |
| `@celestial-ui/styles`                   | Independent optional CSS delivery      |
| `@celestial-ui/icons`                    | Independent optional icon resolver     |
| `@celestial-ui/react` / `vue` / `svelte` | Future/target — not in this repository |

## Documentation

- [Package usage](../../docs/package-usage.md)
- [Core architecture](../../docs/core-architecture.md)
- [Component contract](../../docs/core-component-contract.md)
- [Component specification](../../docs/core-component-specification.md)
- [Core lock policy](../../docs/core-lock.md)
- [Component contract matrix](../../docs/component-contract-matrix.md)
- [Package selection](../../docs/package-selection-guide.md)
- [Architecture for consumers](../../docs/architecture-for-consumers.md)
- [Package combinations](../../docs/package-combination-matrix.md)
- [Compatibility matrix](../../docs/compatibility-matrix.md)
- [Registries](../../docs/registries.md)

## License

MIT. See [LICENSE](./LICENSE).
