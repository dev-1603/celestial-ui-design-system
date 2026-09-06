# @celestial-ui/styles

Framework-neutral CSS compiler, browser style manager, SSR helpers, and optional Tailwind v4 / shadcn bridges for resolved Celestial themes.

## What is this?

`@celestial-ui/styles` turns a `ResolvedTheme` from `@celestial-ui/theme` into CSS custom properties (`--cui-*`), then either:

- writes that CSS as a string (Node/SSR/build), or
- attaches it to the document with `createThemeStyleManager` (browser)

It also ships prebuilt CSS files and optional Tailwind v4 / shadcn adapter stylesheets.

## Why use it?

Use this package when tokens and theme resolution are not enough and you need **deliverable CSS**: compiled variable sheets, scoped roots, SSR `<style>` tags, or a runtime attachment that can be hydrated.

Facts from this package:

- Dependencies: `@celestial-ui/theme` and `@celestial-ui/tokens`
- `SEMANTIC_CSS_API_VERSION` is `'1.0.0'`; `STYLES_PACKAGE_VERSION` is `'0.1.0'`
- Prebuilt `@celestial-ui/styles/css` is compiled from `CELESTIAL_THEME` light + dark
- Base CSS is opt-in (color-scheme, reduced-motion, forced-colors, `:focus-visible`) — not a global reset

## When to use it

Install this package when you need to:

- Compile `ResolvedTheme` to CSS at build or request time
- Inject theme CSS in the browser and update it
- Emit SSR `<style>` tags and hydrate without duplicating nodes
- Import prebuilt Celestial CSS instead of compiling
- Bridge Celestial semantics to Tailwind v4 `@theme` or shadcn variable names

You do **not** need this package to use `@celestial-ui/tokens/css` alone, or to use `@celestial-ui/core` / `@celestial-ui/icons`.

## What this package does

- `compileResolvedTheme` / `compileThemeSet` → `CompiledThemeCss`
- Semantic aliases (for example `--cui-primary` → `var(--cui-action-primary-background)`)
- Scope selectors (`document` | `application` | `sandbox`) and `data-cui-*` attributes
- Browser `ThemeStyleManager` (`attach` / `update` / `detach` / `setState` / `destroy`)
- SSR: `renderThemeStyleTag`, `createThemeHydrationState`, `createModeBootstrapScript`, `adoptHydratedStyle`
- Optional `generateBaseCss`, `generateTailwindBridge`, `generateShadcnAdapter`

## What this package does NOT do

- Resolve themes (call `@celestial-ui/theme` first)
- Render UI components
- Provide React/Vue/Svelte style providers
- Ship a class named `StyleManager` with `.mount(theme)`
- Require `@celestial-ui/core` or `@celestial-ui/icons`

## Package independence

| Scenario                         | Supported? | Notes                                                                                 |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| Package alone                    | No         | Requires theme and tokens                                                             |
| With other Celestial UI packages | Yes        | tokens + theme required; core/icons independent                                       |
| Existing application             | Yes        | Import `/css` or compile in the product shell                                         |
| In-house component/UI library    | Yes        | Components consume variables; the host compiles/attaches once                         |
| React                            | Current    | CSS/runtime APIs; no React package in this repo                                       |
| Vue                              | Current    | Same                                                                                  |
| Svelte                           | Current    | Same                                                                                  |
| SSR                              | Yes        | Node fixtures compile CSS and `renderThemeStyleTag`; browser manager needs `Document` |

## Installation

Package-manager support and runtime support are verified separately. Node.js **>= 22**. Bun **1.1.20** was used for packed-tarball consumer fixtures.

### npm

```bash
npm install @celestial-ui/styles @celestial-ui/theme @celestial-ui/tokens
```

### pnpm

```bash
pnpm add @celestial-ui/styles @celestial-ui/theme @celestial-ui/tokens
```

### yarn

```bash
yarn add @celestial-ui/styles @celestial-ui/theme @celestial-ui/tokens
```

### Bun

```bash
bun add @celestial-ui/styles @celestial-ui/theme @celestial-ui/tokens
```

Verified with the same packed-tarball fixtures as npm/pnpm/yarn (`foundation-node`, `ssr-node`), installed and run with Bun. `createThemeStyleManager` needs a `Document` and is not exercised in those Node/Bun fixtures.

### Deno

Deno CSS imports are best-effort, not a guaranteed public contract.

Install theme and tokens explicitly if you call their APIs. They are also declared dependencies of this package.

### Verified compatibility

| Environment   | Status    | What was verified                                           |
| ------------- | --------- | ----------------------------------------------------------- |
| Node.js >= 22 | Supported | Package tests + Node consumer fixtures                      |
| npm           | Supported | Packed tarball consumer fixtures                            |
| pnpm          | Supported | Packed tarball consumer fixtures (CI)                       |
| Yarn          | Supported | Packed tarball consumer fixtures                            |
| Bun 1.1.20    | Supported | Same packed-tarball fixtures as npm/pnpm/yarn, run with Bun |
| Deno          | Partial   | CSS imports best-effort; not a dedicated fixture            |

## Quick Start

Prebuilt CSS (no compiler):

```css
@import '@celestial-ui/styles/css';
```

Or compile from a resolved theme:

```ts
import { CELESTIAL_THEME, createThemeRegistry, resolveTheme } from '@celestial-ui/theme';
import { compileThemeSet } from '@celestial-ui/styles';

const registry = createThemeRegistry([CELESTIAL_THEME]);
const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
const dark = resolveTheme(registry, { themeId: 'celestial', mode: 'dark' });
const compiled = compileThemeSet([light, dark], { scope: { kind: 'document' } });

console.log(compiled.cssText.includes('--cui-primary')); // true
```

## Public API

Root import: `@celestial-ui/styles`.

### Compiler

- `compileResolvedTheme(theme, options)` → `CompiledThemeCss`
- `compileThemeSet(themes, options)` — all items must share `themeId`
- `CompileThemeOptions`: `scope`, `includeCompatibilityVariables?`, `includeSemanticVariables?`, `includeMetadataComment?`

`CompiledThemeCss` includes `cssText`, `variables`, `selector`, `styleId`, `contentHash`, `metadata`.

For `compileThemeSet`, `cssText` is the multi-mode stylesheet; `variables` is last-mode-wins after sequential merge.

### Runtime (browser)

- `createThemeStyleManager(options?)` → `ThemeStyleManager`
  - `attach(scope, compiled, options?)`
  - `update(attachment, compiled)`
  - `detach(attachment)`
  - `setState(target, state)`
  - `destroy()`
- `adoptHydratedStyle(doc, { styleId, contentHash })` — reuse an SSR `<style>` node; throws `SSR_HYDRATION_MISMATCH` if the hash differs
- Options: `document?`, `nonce?`, `schedule?` (`'sync' | 'microtask' | 'animation-frame'`)

`createThemeStyleManager` throws `StyleRuntimeError` with `DOM_UNAVAILABLE` when no `Document` is present.

### SSR

- `renderThemeStyleTag(compiled, options?)` → HTML string
- `createThemeHydrationState(compiled, state)`
- `createModeBootstrapScript({ themeId, defaultMode, storageKey? })` — inline IIFE; default `localStorage` key `cui-mode`
- `renderThemeRootAttributes(state)` → `data-cui-theme` / `data-cui-mode` / … attribute string
- `getThemeAttributes`, `applyThemeAttributes`

### Bridges and base

- `generateBaseCss(options?)`
- `DEFAULT_TAILWIND_BRIDGE`, `generateTailwindBridge(...)`
- `DEFAULT_SHADCN_REGISTRY`, `generateShadcnAdapter(...)`
- `tokenPathToVariableName(path)` — e.g. `surface.canvas` → `--cui-surface-canvas`
- `SEMANTIC_CSS_REGISTRY`

### Errors

- `StyleCompilationError`, `StyleRuntimeError`, `styleError`

## Entry Points

| Import path                     | Purpose                             | Use when                                    |
| ------------------------------- | ----------------------------------- | ------------------------------------------- |
| `@celestial-ui/styles`          | Compiler, runtime, SSR, generators  | Programmatic CSS                            |
| `@celestial-ui/styles/css`      | Prebuilt multi-mode theme variables | Fastest app integration                     |
| `@celestial-ui/styles/base`     | Opt-in a11y/base layer              | Reduced-motion, focus-visible, color-scheme |
| `@celestial-ui/styles/tailwind` | Tailwind v4 `@theme inline` bridge  | Tailwind v4 projects                        |
| `@celestial-ui/styles/shadcn`   | shadcn variable adapter             | shadcn/ui variable names                    |

`@celestial-ui/tokens/tailwind` is a **v3 preset**. `@celestial-ui/styles/tailwind` is a **v4 CSS bridge**. They are different artifacts.

## Common Usage

### Static CSS in an app

```css
@import '@celestial-ui/styles/base';
@import '@celestial-ui/styles/css';
```

### SSR style tag

```ts
import { CELESTIAL_THEME, createThemeRegistry, resolveTheme } from '@celestial-ui/theme';
import { compileResolvedTheme, renderThemeStyleTag } from '@celestial-ui/styles';

const registry = createThemeRegistry([CELESTIAL_THEME]);
const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
const compiled = compileResolvedTheme(light, { scope: { kind: 'document' } });
const tag = renderThemeStyleTag(compiled);
// insert `tag` into <head>
```

### Mode bootstrap (before paint)

```ts
import { createModeBootstrapScript } from '@celestial-ui/styles';

const script = createModeBootstrapScript({
  themeId: 'celestial',
  defaultMode: 'light',
});
```

The script sets `data-cui-theme`, `data-cui-mode`, `data-cui-mode-preference`, and the `light`/`dark` class on `document.documentElement`.

## Advanced Usage

### Browser style manager

```ts
import { createThemeStyleManager } from '@celestial-ui/styles';
import type { CompiledThemeCss } from '@celestial-ui/styles';

const manager = createThemeStyleManager({ schedule: 'sync' });
const attachment = manager.attach({ kind: 'document' }, compiled);
manager.setState(document.documentElement, {
  themeId: 'celestial',
  mode: 'light',
});
// later: manager.update(attachment, nextCompiled);
// manager.destroy();
```

`compiled` is a `CompiledThemeCss` from `compileResolvedTheme` / `compileThemeSet`.

### Application or sandbox scope

```ts
compileThemeSet([light, dark], {
  scope: { kind: 'application', id: 'shell' },
});
```

Scopes isolate `styleId` and selectors so multiple roots can coexist.

### Tailwind v4 and shadcn CSS

```css
@import '@celestial-ui/styles/css';
@import '@celestial-ui/styles/tailwind';
@import '@celestial-ui/styles/shadcn';
```

Or generate at runtime with `generateTailwindBridge()` / `generateShadcnAdapter()`.

## Package Combinations

| Combination                        | Valid?        | Purpose                                                                               |
| ---------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `@celestial-ui/styles` only        | No            | Needs theme + tokens                                                                  |
| styles + theme (tokens transitive) | Indirect      | Works if tokens is installed transitively; install tokens explicitly if you import it |
| styles + tokens without theme      | No            | Compiler input is `ResolvedTheme`                                                     |
| styles + theme + tokens            | Yes           | CSS pipeline                                                                          |
| styles + `@celestial-ui/core`      | Indirect      | Independent; add theme/tokens for styles                                              |
| styles + `@celestial-ui/icons`     | Optional      | No direct dependency                                                                  |
| styles + future framework package  | Future/Target | Adapters should consume compiled CSS / variables                                      |

## Existing Application Integration

```text
Existing application
        ↓
Install styles + theme + tokens
        ↓
@import '@celestial-ui/styles/css'
   or compileThemeSet in the product shell
        ↓
Use var(--cui-primary), var(--cui-surface-canvas), …
        ↓
Optionally add /base, /tailwind, /shadcn
```

You can keep your current component library and only adopt Celestial CSS variables.

## In-house Library Integration

Compile or import CSS **once in the host**. Library components should use semantic variables (`var(--cui-primary)`, `var(--cui-border)`), not call `resolveTheme` or `compileResolvedTheme` inside each widget.

If you already emit CSS from another engine, you can still use `tokenPathToVariableName` / `SEMANTIC_CSS_REGISTRY` as a naming contract — only if you actually consume those helpers.

## Framework Integration

**CURRENT**

- CSS imports in Vite/Webpack/PostCSS
- Node compiler + `renderThemeStyleTag` for SSR frameworks you wire yourself
- Tailwind v4 CSS bridge and shadcn adapter CSS

**PLANNED / FUTURE**

Future framework integration is expected to consume this package through the framework adapter architecture; no official framework package is currently documented here unless implemented in this repository.

**NOT SUPPORTED**

- Official React/Vue/Svelte style provider components in this package
- Using styles without a valid `ResolvedTheme` (except prebuilt `/css` artifacts)

## SSR / Browser / Runtime

| API                                                   | Where                                                |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `compileResolvedTheme`, `compileThemeSet`, generators | Node and bundlers (no DOM)                           |
| `renderThemeStyleTag`, `createModeBootstrapScript`    | Node/SSR string output                               |
| `createThemeStyleManager`                             | Browser `Document` (or inject `document` in options) |
| Prebuilt `/css`, `/base`, `/tailwind`, `/shadcn`      | Static files; SSR-safe                               |

Hydration tests assert SSR `styleId` matches runtime adoption. Pass a CSP `nonce` when required; invalid nonces throw `CSP_NONCE_INVALID`.

v0.1.0 is **CommonJS**. Bun 1.1.20 consumed that CJS compiler output and resolved CSS subpaths with `require.resolve`. Deno CSS imports are best-effort, not a guaranteed contract.

## Tree-shaking / Bundle Usage

- Import `@celestial-ui/styles/css` when you do not need the JS compiler/runtime in the client.
- Root `@celestial-ui/styles` is a CJS barrel — not advertised as fully tree-shakable.
- Use `./tailwind` or `./shadcn` only when you need those bridges.

## Troubleshooting

| Issue                                            | What to check                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `ResolvedTheme validation.isValid must be true`  | Fix token/theme resolution before compiling                                      |
| `DOM_UNAVAILABLE`                                | `createThemeStyleManager` ran without a Document                                 |
| `compileThemeSet requires at least one theme`    | Pass a non-empty array                                                           |
| Themes in a set must share `themeId`             | Do not mix `celestial` and a child id in one `compileThemeSet`                   |
| `StyleManager` / `.mount()` missing              | Use `createThemeStyleManager` + `attach`                                         |
| Tailwind v3 preset not working from this package | Use `@celestial-ui/tokens/tailwind` for v3; this package’s `/tailwind` is v4 CSS |
| FOUC on first paint                              | Emit `renderThemeStyleTag` and/or `createModeBootstrapScript` before paint       |
| Missing `--cui-primary`                          | Compile with semantic variables (default on) or import `/css`                    |

## Related Packages

| Package                | Relationship                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `@celestial-ui/theme`  | **Required** (`ResolvedTheme`)                               |
| `@celestial-ui/tokens` | **Required** (catalog used by theme; types used by compiler) |
| `@celestial-ui/core`   | Independent                                                  |
| `@celestial-ui/icons`  | Independent                                                  |

## Documentation

- [Package usage](../../docs/package-usage.md)
- [Package selection](../../docs/package-selection-guide.md)
- [Architecture for consumers](../../docs/architecture-for-consumers.md)
- [Package combinations](../../docs/package-combination-matrix.md)
- [Installation matrix](../../docs/installation-matrix.md)
- [Compatibility matrix](../../docs/compatibility-matrix.md)
- [Registries](../../docs/registries.md)

## License

MIT. See [LICENSE](./LICENSE).
