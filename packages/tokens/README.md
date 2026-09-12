# @celestial-ui/tokens

Canonical design-token catalog, alias resolution, WCAG contrast validation, and generated CSS / Tailwind / shadcn artifacts for Celestial UI.

## What is this?

`@celestial-ui/tokens` is a framework-agnostic design-token package. It ships:

- DTCG-style JSON catalogs (`primitive` → `foundation` → `semantic` → `component`)
- TypeScript APIs to flatten, resolve aliases, validate contrast, and generate CSS/Tailwind/shadcn output
- Prebuilt CSS custom properties (`--cui-*`)
- A Tailwind v3-style preset
- A shadcn CSS variable mapping

It does not depend on any other `@celestial-ui/*` package.

## Why use it?

Use this package when you need a single, typed source of design values that can be consumed as CSS variables, a Tailwind preset, shadcn mappings, or as a Node/build-time catalog — without installing the rest of Celestial UI.

Facts from this package:

- Zero runtime dependencies
- Token system version `TOKEN_SYSTEM_VERSION` is `'0.1.0'`
- Published files are `dist` and `data`
- Build-time validation enforces WCAG 2.2 AA contrast on tokens marked `a11ySensitive`

## When to use it

Install this package when you need:

- Celestial primitive and semantic values in an existing app
- CSS variables (`--cui-surface-canvas`, `--cui-space-4`, …) without theme resolution
- A Tailwind preset mapped to those CSS variables
- shadcn/Radix CSS variable aliases
- Node/build tooling that loads, flattens, resolves, or validates the catalog

You do **not** need this package if you only want component contracts (`@celestial-ui/core`) or icon resolution (`@celestial-ui/icons`).

## What this package does

- Owns the canonical token catalog (`data/*.json` plus mode overlays)
- Flattens nested token groups and resolves `{alias}` references
- Validates layer rules, broken aliases, and contrast pairs
- Generates CSS custom properties prefixed `--cui-`
- Generates a Tailwind preset and a shadcn mapping stylesheet
- Exposes Node APIs to load the same catalog the build uses

## What this package does NOT do

- Theme identity, inheritance, tenant slots, or `resolveTheme()` — that is `@celestial-ui/theme`
- Runtime CSS injection, SSR style tags, or Tailwind v4 `@theme` bridges — that is `@celestial-ui/styles`
- Component rendering, behavior, or accessibility controllers
- Icon resolution
- Framework integrations (no React/Vue/Svelte APIs)
- A published JS object export named `colors` or `spacing`

## Package independence

| Scenario                         | Supported?  | Notes                                                                            |
| -------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Package alone                    | Yes         | Zero runtime dependencies                                                        |
| With other Celestial UI packages | Yes         | Optional. `@celestial-ui/theme` and `@celestial-ui/styles` consume this package  |
| Existing application             | Yes         | Import CSS, the Tailwind preset, or Node catalog APIs                            |
| In-house component/UI library    | Yes         | Style with `var(--cui-*)`; do not resolve catalogs inside each component         |
| React                            | Current     | Use CSS/JS from any React app; no React package is required                      |
| Vue                              | Current     | Same as React — CSS/JS consumption                                               |
| Svelte                           | Current     | Same as React — CSS/JS consumption                                               |
| SSR                              | Conditional | Prebuilt CSS is static and SSR-safe. `getCanonicalTokenSources()` uses Node `fs` |

## Installation

Package-manager support and runtime support are verified separately. Node.js **>= 22** is the Node runtime requirement. Bun **1.1.20** uses the same packed-tarball consumer fixtures as npm/pnpm/yarn (`pnpm consumer:test:bun`).

### npm

```bash
npm install @celestial-ui/tokens
```

### pnpm

```bash
pnpm add @celestial-ui/tokens
```

### yarn

```bash
yarn add @celestial-ui/tokens
```

### Bun

```bash
bun add @celestial-ui/tokens
```

Verified with the same packed-tarball fixtures as npm/pnpm/yarn (`foundation-node`), installed and run with Bun.

### Deno

Deno is **partial**. CSS subpaths may work with `npm:` specifiers in some setups. The catalog API uses Node `fs` and is not a Deno contract. See [compatibility-matrix.md](../../docs/compatibility-matrix.md).

No companion Celestial packages are required.

### Verified compatibility

| Environment   | Status    | What was verified                                           |
| ------------- | --------- | ----------------------------------------------------------- |
| Node.js >= 22 | Supported | Package tests + Node consumer fixtures                      |
| npm           | Supported | Packed tarball consumer fixtures                            |
| pnpm          | Supported | Packed tarball consumer fixtures (CI)                       |
| Yarn          | Supported | Packed tarball consumer fixtures                            |
| Bun 1.1.20    | Supported | Same packed-tarball fixtures as npm/pnpm/yarn, run with Bun |
| Deno          | Partial   | Best-effort `npm:` interop; fs catalog API not contracted   |

## Quick Start

Import the generated CSS and use semantic variables:

```css
@import '@celestial-ui/tokens/css';

.card {
  background-color: var(--cui-surface-elevated);
  color: var(--cui-text-primary);
  border-radius: var(--cui-radius-md);
  padding: var(--cui-space-4);
}
```

Toggle appearance with `.light` / `.dark` on an ancestor (semantic values are emitted under `:root, .light` and `.dark`).

## Public API

Root import: `@celestial-ui/tokens` (CJS `require` + ESM `import`, plus `.d.ts`). Prefer granular subpaths in application bundles; root imports remain supported in 0.1.x.

**Browser-preferred:** `./css`, `./resolve`, `./types`, `./a11y`, `./validation`  
**Node-preferred:** `./catalog`, `./generators` (also available from `.`)

Do not import `{ colors, spacing }` — those JS domains are not published.

### Constants and types

- `TOKEN_SYSTEM_VERSION`
- `Token`, `TokenConfig`, `TokenGroup`, `TokenType`, `TokenLayer`, `TokenValue`
- `TokenModeBundle` (deprecated alias: `ThemeConfig`)
- `ValidationReport`, `FlatTokenMap`, `CanonicalTokenSources`
- `CelestialExtensions`, `OverridePolicy`

### Catalog (Node / build)

```ts
import { getCanonicalTokenSources, buildTokenConfigForMode } from '@celestial-ui/tokens';

const sources = getCanonicalTokenSources();
const light = buildTokenConfigForMode(sources, 'light');
```

`getCanonicalTokenSources()` reads `data/` with `fs`. It is not a browser API. Prefer `@celestial-ui/tokens/catalog` in Node; the root import above remains valid.

### Resolve and validate

```ts
import { flattenTokens, resolveAliases, validateTokens } from '@celestial-ui/tokens';

const flat = flattenTokens(light);
const resolved = resolveAliases(flat);
const report = validateTokens(light);
```

In bundlers, prefer `@celestial-ui/tokens/resolve` and `@celestial-ui/tokens/validation`.

### Generators

```ts
import {
  generateCSS,
  generateTailwindPreset,
  generateShadcnMapping,
  generateTS,
} from '@celestial-ui/tokens';

const css = generateCSS(resolved);
```

Prefer `@celestial-ui/tokens/generators` in Node; these names remain on `.`.

### Accessibility helpers

`parseColorToRGBA`, `compositeColors`, `getLuminance`, `getContrastRatio`, `meetsContrastAA`.

## Entry Points

| Import path                       | Purpose                                          | Use when                                                   |
| --------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| `@celestial-ui/tokens`            | Catalog, resolve, validate, generate APIs        | Node/build tooling or custom generators (root still works) |
| `@celestial-ui/tokens/css`        | Prebuilt `--cui-*` stylesheet                    | Application CSS (browser-preferred)                        |
| `@celestial-ui/tokens/resolve`    | `flattenTokens`, `resolveAliases`                | Bundlers / browser (preferred over root)                   |
| `@celestial-ui/tokens/types`      | Token types                                      | Bundlers / browser (preferred)                             |
| `@celestial-ui/tokens/a11y`       | Contrast helpers                                 | Bundlers / browser (preferred)                             |
| `@celestial-ui/tokens/validation` | `validateTokens`                                 | Bundlers / browser (preferred)                             |
| `@celestial-ui/tokens/catalog`    | `getCanonicalTokenSources`                       | Node/build (preferred; uses `fs`)                          |
| `@celestial-ui/tokens/generators` | `generateCSS`, Tailwind/shadcn/TS generators     | Node/build (preferred)                                     |
| `@celestial-ui/tokens/tailwind`   | Tailwind v3 `presets` module                     | Tailwind config                                            |
| `@celestial-ui/tokens/shadcn`     | Maps `--background`, `--primary`, … to `--cui-*` | shadcn/ui or Radix-style variable names                    |

Do not import private `/src/` or unpublished `/dist/...` paths. Prefer the export map above.

`dist/resolved.ts`, `dist/tokens-light.json`, and `dist/tokens-dark.json` are build artifacts. They are **not** listed in `package.json` `exports` and are not a public import contract.

## Common Usage

### CSS variables in an existing app

```css
@import '@celestial-ui/tokens/css';
```

Useful semantic variables (from generated `tokens.css`):

- Surfaces: `--cui-surface-canvas`, `--cui-surface-elevated`, `--cui-surface-subtle`, `--cui-surface-inverse`
- Text: `--cui-text-primary`, `--cui-text-secondary`, `--cui-text-muted`, `--cui-text-inverse`
- Actions: `--cui-action-primary-background`, `--cui-action-primary-text`, …
- Status: `--cui-status-success`, `--cui-status-warning`, `--cui-status-error`, `--cui-status-info`
- Space / radius: `--cui-space-4`, `--cui-radius-md`

Prefer semantic variables over primitives such as `--cui-color-blue-500`.

### Tailwind preset

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('@celestial-ui/tokens/tailwind')],
};
```

The preset extends Tailwind theme keys with `var(--cui-*)` values. Color utilities follow token paths (for example `surface-canvas` → `var(--cui-surface-canvas)`). Because values are CSS variables, `.dark` on an ancestor updates colors without a Tailwind `dark:` variant for those mappings.

### shadcn mapping

```css
@import '@celestial-ui/tokens/css';
@import '@celestial-ui/tokens/shadcn';
```

`--background` becomes `var(--cui-surface-canvas)`, `--primary` becomes `var(--cui-action-primary-background)`, and so on.

### Node catalog for custom tooling

```ts
import {
  getCanonicalTokenSources,
  buildTokenConfigForMode,
  flattenTokens,
  resolveAliases,
  validateTokens,
} from '@celestial-ui/tokens';

const sources = getCanonicalTokenSources();
const config = buildTokenConfigForMode(sources, 'dark');
const report = validateTokens(config);
if (!report.isValid) {
  throw new Error(report.errors.join('\n'));
}
const tokens = resolveAliases(flattenTokens(config));
console.log(tokens['surface.canvas']?.$value);
```

## Advanced Usage

Generate CSS from a custom `TokenConfig` (your own JSON, not necessarily the shipped catalog):

```ts
import { flattenTokens, resolveAliases, generateCSS, type TokenConfig } from '@celestial-ui/tokens';

const config: TokenConfig = {
  color: {
    blue: {
      500: {
        $type: 'color',
        $value: '#3B82F6',
        $extensions: { celestial: { layer: 'primitive' } },
      },
    },
  },
  action: {
    primary: {
      $type: 'color',
      $value: '{color.blue.500}',
      $extensions: { celestial: { layer: 'semantic' } },
    },
  },
};

const css = generateCSS(resolveAliases(flattenTokens(config)));
```

## Package Combinations

| Combination                       | Valid?         | Purpose                                                                                 |
| --------------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `@celestial-ui/tokens` only       | Yes            | CSS variables, Tailwind preset, shadcn mapping, catalog APIs                            |
| tokens + `@celestial-ui/theme`    | Yes            | Theme identity/modes resolve against this catalog                                       |
| tokens + `@celestial-ui/styles`   | Not sufficient | `styles` also depends on `theme`                                                        |
| tokens + theme + styles           | Yes            | Full token → theme → CSS pipeline                                                       |
| tokens + `@celestial-ui/core`     | Yes            | Independent packages; no package.json link                                              |
| tokens + `@celestial-ui/icons`    | Yes            | Independent packages                                                                    |
| tokens + future framework package | Future/Target  | Adapters may consume CSS variables; no official framework package is in this repository |

## Existing Application Integration

```text
Existing application
        ↓
npm install @celestial-ui/tokens
        ↓
@import '@celestial-ui/tokens/css'  (or /tailwind or /shadcn)
        ↓
Use var(--cui-*) in your CSS / components
        ↓
Optionally add @celestial-ui/theme later for modes/tenants
```

You do not need to migrate styling, components, or frameworks to use the token CSS.

## In-house Library Integration

In a component library, consume **semantic CSS variables** (`var(--cui-surface-elevated)`). Do not call `getCanonicalTokenSources()` or resolve themes inside each component.

If you maintain a custom token pipeline, reuse `flattenTokens`, `resolveAliases`, `validateTokens`, and `generateCSS` on your own `TokenConfig`.

## Framework Integration

**CURRENT**

- CSS and generated artifacts work in any framework that can import CSS or CommonJS
- Tailwind v3 `presets` via `@celestial-ui/tokens/tailwind`
- shadcn variable names via `@celestial-ui/tokens/shadcn`

**PLANNED / FUTURE**

Future framework packages are expected to consume semantic CSS variables. No official `@celestial-ui/react`, `@celestial-ui/vue`, or `@celestial-ui/svelte` package is implemented in this repository.

**NOT SUPPORTED**

- Framework component exports from this package
- A published `import { colors, spacing } from '@celestial-ui/tokens'` object API

## SSR / Browser / Runtime

| Surface                                                                       | Runtime                              |
| ----------------------------------------------------------------------------- | ------------------------------------ |
| `@celestial-ui/tokens/css`, `/tailwind`, `/shadcn`                            | Bundler, browser, SSR (static files) |
| `flattenTokens`, `resolveAliases`, `validateTokens`, generators, a11y helpers | Pure JS; Node and bundlers           |
| `getCanonicalTokenSources()`, `buildTokenConfigForMode()`                     | Node/build (`fs` + `data/`)          |

Module format is **dual CJS + ESM**. Bundlers resolve `import` (`dist/esm`); Node `require` keeps CJS (`dist/cjs`). Bun 1.1.20 consumed CJS via ESM named imports and `require()`. Deno support for CSS is partial; the Node `fs` catalog API is not a Deno contract. See [compatibility-matrix.md](../../docs/compatibility-matrix.md).

## Tree-shaking / Bundle Usage

- Prefer `@celestial-ui/tokens/css` when you only need variables in the browser. That path does not load the catalog APIs.
- Prefer `@celestial-ui/tokens/resolve`, `/types`, `/a11y`, and `/validation` in bundlers. Prefer `/catalog` and `/generators` in Node.
- Root `@celestial-ui/tokens` remains supported (`getCanonicalTokenSources` still works from `.`). In CJS it evaluates the barrel; ESM `import` is tree-shakable but Node catalog code can still leak if you import catalog names.
- `sideEffects` lists CSS globs only (never `false`) so bundlers keep `@celestial-ui/tokens/css`.
- Use the Node catalog APIs only in build scripts, not in client bundles.

## Troubleshooting

| Issue                                           | What to check                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `var(--cui-…)` is invalid                       | Import `@celestial-ui/tokens/css` (or compile via `@celestial-ui/styles`)                         |
| `--celestial-color-blue-500` missing            | Variables are `--cui-*`, not `--celestial-*`                                                      |
| `Cannot find module './css'`                    | Use `@celestial-ui/tokens/css`, not `/dist/css/tokens.css`                                        |
| `getCanonicalTokenSources` fails in the browser | Expected — it reads files with `fs`. Use CSS exports in the client                                |
| `import { colors } from '@celestial-ui/tokens'` | Not a public export. Use CSS variables or resolved `FlatTokenMap` keys such as `'color.blue.500'` |
| Dark mode not switching                         | Ensure `.dark` is on an ancestor; semantic rules are emitted under `.dark`                        |
| Contrast / alias errors at build                | `validateTokens()` failed; inspect `report.errors`                                                |

## Related Packages

| Package                | Relationship                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `@celestial-ui/theme`  | Optional companion. Depends on this package for catalog resolution             |
| `@celestial-ui/styles` | Optional companion. Compiles resolved themes to CSS; depends on tokens + theme |
| `@celestial-ui/icons`  | Independent                                                                    |
| `@celestial-ui/core`   | Independent                                                                    |

These packages are modular. Installing tokens does not install or require the others.

## Documentation

- [Package usage](../../docs/package-usage.md) — granular imports, exclusive CSS/shadcn stacks, Node vs browser catalog APIs
- [Developer guide](./docs/developer-guide.md)
- [Package selection](../../docs/package-selection-guide.md)
- [Architecture for consumers](../../docs/architecture-for-consumers.md)
- [Package combinations](../../docs/package-combination-matrix.md)
- [Installation matrix](../../docs/installation-matrix.md)
- [Compatibility matrix](../../docs/compatibility-matrix.md)
- [Registries](../../docs/registries.md)

## License

MIT. See [LICENSE](./LICENSE).
