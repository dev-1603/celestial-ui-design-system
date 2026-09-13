# Celestial UI — Package Usage Guide

Developer-facing guide for consuming the Celestial UI foundation packages from npm.

## 1. What is Celestial UI?

Celestial UI is a **framework-neutral design system foundation**. It provides design tokens, theme governance, CSS delivery, icon resolution, and framework-agnostic component contracts — without binding you to React, Vue, or Svelte.

This monorepo publishes **five foundation packages**. Component libraries and framework adapters may exist elsewhere; they are not distributed from this repository.

## 2. Package architecture

```text
@celestial-ui/tokens     Canonical token catalog and generators
        ↓
@celestial-ui/theme      Theme identity, modes, inheritance, tenant profiles
        ↓
@celestial-ui/styles     CSS compiler, runtime, SSR, Tailwind/shadcn bridges

@celestial-ui/icons      Provider-neutral icon resolution (sibling)
@celestial-ui/core       Component contracts and behavior controllers (independent)
```

## 3. Foundation packages

### Tokens

Canonical design-token source. Four layers: primitive → foundation → semantic → component. Generates CSS variables, Tailwind preset, and JSON artifacts.

[Package README](../packages/tokens/README.md) · [Developer guide](../packages/tokens/docs/developer-guide.md)

### Theme

Theme identity, light/dark modes, single-parent inheritance, tenant profiles, slot-based overrides, and `resolveTheme()`.

[Package README](../packages/theme/README.md)

### Styles

Compiles `ResolvedTheme` into CSS custom properties. Runtime style manager, SSR helpers, optional Tailwind v4 and shadcn bridges.

[Package README](../packages/styles/README.md)

### Icons

Canonical icon names, provider adapters (Lucide, Font Awesome, Phosphor, Heroicons, Iconify), fallback, and SSR-safe resolution.

[Package README](../packages/icons/README.md)

### Core

`ComponentSpec`, behavior controllers (disclosure, selection, overlay), accessibility contracts, runtime, and testing utilities.

[Package README](../packages/core/README.md)

## 4. Framework packages

`@celestial-ui/react`, `@celestial-ui/vue`, and `@celestial-ui/svelte` are **not in this monorepo**. They are separate products that should consume `@celestial-ui/core`, `@celestial-ui/styles`, and related foundation packages.

Do not expect framework hooks or composables from Core — those belong in framework adapter packages.

## 5. Component libraries

Full component libraries built on Celestial UI are future work. Core provides contracts and controllers; rendering is the responsibility of framework adapters.

## 6. Optional packages

### i18n

There is **no** `@celestial-ui/i18n` package in this repository. Core accepts pre-translated `messages` at runtime. Applications own i18n engines (e.g. `react-i18next`, `vue-i18n`).

## 7. Package dependency relationships

| Package | Depends on                   |
| ------- | ---------------------------- |
| tokens  | —                            |
| theme   | tokens                       |
| styles  | tokens, theme                |
| icons   | optional icon provider peers |
| core    | —                            |

Install only what you need. Styles pulls theme and tokens transitively.

## 8. Installation

### npm

```bash
npm install @celestial-ui/core
npm install @celestial-ui/styles @celestial-ui/theme
npm install @celestial-ui/icons
npm install @celestial-ui/tokens
```

### pnpm

```bash
pnpm add @celestial-ui/core
pnpm add @celestial-ui/styles @celestial-ui/theme
```

### Yarn

```bash
yarn add @celestial-ui/core
yarn add @celestial-ui/styles @celestial-ui/theme
```

### Bun

```bash
bun add @celestial-ui/core
bun add @celestial-ui/styles @celestial-ui/theme
bun add @celestial-ui/icons
bun add @celestial-ui/tokens
```

Bun **1.1.20** is verified via the same packed-tarball consumer fixtures as npm/pnpm/yarn (`pnpm consumer:test:bun`): `bun install`, `bun check.ts`, and a CJS `require` smoke. Installing with Bun is separate from running under the Bun runtime; both are exercised by that command.

### Deno

```ts
import { createDisclosure } from 'npm:@celestial-ui/core@0.1.0';
```

Deno support is **best-effort** for CJS packages. See [compatibility matrix](./compatibility-matrix.md).

## 9–12. Package manager usage

All foundation packages publish **dual CJS and ESM**. Bundlers resolve the `import` condition (`dist/esm`). Node.js **>= 22** `require` and `main` keep CJS (`dist/cjs`). Bun 1.1.20 consumes the same artifacts.

- **npm / pnpm / Yarn / Bun:** full support for all five packages (packed tarball fixtures)
- **Deno:** partial; CSS imports and Node `fs`-based catalog APIs may not work

## 13–15. Registries

Packages publish to the **npm Registry** (`https://registry.npmjs.org`). No extra `.npmrc` is required for public installs.

GitHub Releases record tags and changelogs after publish. GitHub Packages is not a live install path. See [registries.md](./registries.md) and [release.md](./release.md).

## 16. Basic application setup

Host application (product shell) resolves theme and CSS once. `resolveTheme` from the package root remains the documented Quick Start (Node/build). `@celestial-ui/theme/themes/celestial` is browser-safe identity; `@celestial-ui/theme/resolve` is Node/build-time. Apps should consume CSS or an already-built `ResolvedTheme` in the browser — do not call `resolveTheme()` on the client.

```ts
import { CELESTIAL_THEME, createThemeRegistry, resolveTheme } from '@celestial-ui/theme';
import { compileThemeSet } from '@celestial-ui/styles';

const registry = createThemeRegistry([CELESTIAL_THEME]);
const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
const dark = resolveTheme(registry, { themeId: 'celestial', mode: 'dark' });
const css = compileThemeSet([light, dark], { scope: { kind: 'document' } });
```

Or import prebuilt CSS:

```css
@import '@celestial-ui/styles/css';
```

Component libraries consume Core contracts and CSS variables; they do not resolve themes:

```ts
import { defineComponentSpec, createDisclosure } from '@celestial-ui/core';
```

Application vs component-library examples for each package:

- [Tokens](../packages/tokens/README.md)
- [Theme](../packages/theme/README.md)
- [Styles](../packages/styles/README.md)
- [Icons](../packages/icons/README.md)
- [Core](../packages/core/README.md)

## 17–21. Package-specific usage

See each package README for detailed APIs:

- [Tokens](../packages/tokens/README.md)
- [Theme](../packages/theme/README.md)
- [Styles](../packages/styles/README.md)
- [Icons](../packages/icons/README.md)
- [Core](../packages/core/README.md)

## 22. i18n

Core uses key-based message contracts (`closeLabel`, `emptyMessage`, etc.). Supply translated strings via runtime config:

```ts
createCelestialRuntime({ config: { messages: { closeLabel: 'Close' } } });
```

## 23–25. React / Vue / Svelte

Not distributed from this repository. When adapter packages exist, they should:

1. Wrap `createCelestialRuntime`
2. Map behavior controllers to framework state
3. Apply `data-cui-*` DOM attributes
4. Consume styles and icons — never the reverse

## 26. Component usage

Define or consume `ComponentSpec` from Core. Framework adapters render DOM and wire events.

## 27. SSR

- **Styles:** `renderThemeStyleTag`, `createModeBootstrapScript`, `adoptHydratedStyle`
- **Core:** `createNullEnvironment()` per request; one runtime per request
- **Icons:** pass request-local `IconConfig`; avoid process-wide singletons

## 28. Accessibility

- Tokens: WCAG 2.2 AA contrast validation at build time
- Core: ARIA builders, focus manager, keyboard interaction contracts
- Styles: opt-in reduced-motion base CSS

## 29. RTL / LTR

Core `Direction = 'ltr' | 'rtl'` comes from runtime config (app/i18n), not from Core locale files.

## 30. Build requirements

- Node.js >= 22
- TypeScript 5.4+ recommended for consumers
- Packages ship compiled `dist/` — no source compilation required in consuming apps

## 31. TypeScript

All packages include `.d.ts` declarations. Subpath exports are typed:

```ts
import { createContractHarness } from '@celestial-ui/core/testing';
import { LucideAdapter } from '@celestial-ui/icons/providers/lucide';
```

## 32. Package exports

Root barrels remain convenience entries. Prefer granular subpaths in application bundles. Bundlers resolve ESM via `import`; `require` keeps CJS.

| Package | Subpaths                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| tokens  | `.`, `./css`, `./tailwind`, `./shadcn`, `./types`, `./resolve`, `./catalog`, `./a11y`, `./validation`, `./generators`                            |
| theme   | `.`, `./themes/celestial`, `./mode`, `./registry`, `./resolve`, `./slots`, `./validate`                                                          |
| styles  | `.`, `./css`, `./base`, `./tailwind`, `./shadcn`, `./runtime`, `./ssr`, `./compiler`, `./bridges/tailwind`, `./bridges/shadcn`, `./bridges/base` |
| icons   | `.`, `./providers/*`                                                                                                                             |
| core    | `.`, `./contracts`, `./behavior`, `./accessibility`, `./collection`, `./overlay`, `./runtime`, `./catalog`, `./testing`, `./specs/<id>`          |

## 32a. Import strategy and exclusive CSS stacks

v0.1.x ships dual CJS+ESM: bundlers use `import` (`dist/esm`); Node `require` keeps CJS. Prefer granular subpaths in application bundles. Root imports keep working.

| Job                                    | Import                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Token CSS in the browser               | `@celestial-ui/tokens/css` (not the JS root; the root links Node `fs` catalog)                                                    |
| Flatten / resolve aliases in a bundler | `@celestial-ui/tokens/resolve`                                                                                                    |
| Load the JSON catalog                  | `@celestial-ui/tokens/catalog` — Node/`fs` only                                                                                   |
| Theme identity in the client           | `@celestial-ui/theme/themes/celestial` (browser-safe preset)                                                                      |
| `resolveTheme()`                       | `@celestial-ui/theme` (Quick Start) or `./resolve` — Node/build only; do not call in the browser                                  |
| Theme CSS / `ResolvedTheme` in the app | Prebuilt `@celestial-ui/styles/css` (or tokens CSS), or a `ResolvedTheme` produced at build time                                  |
| Styles runtime / SSR / compiler        | `@celestial-ui/styles/runtime`, `./ssr`, `./compiler` (not the JS root unless you need all three)                                 |
| Styles JS bridges                      | `@celestial-ui/styles/bridges/tailwind`, `./bridges/shadcn`, `./bridges/base` — CSS stays on `./tailwind` / `./shadcn` / `./base` |
| Core controllers                       | `@celestial-ui/core/behavior`, `./runtime`, `./overlay`, … — not the root barrel                                                  |
| One icon provider                      | `@celestial-ui/icons` + **one** `./providers/<id>`. Do not bundle `lucide-static` CJS or a full `@iconify-json/*` set             |

**Pick one static CSS stack — never both:**

- **Styles stack:** `@celestial-ui/styles/css` plus optional `/base`, `/tailwind` (v4), `/shadcn`
- **Tokens stack:** `@celestial-ui/tokens/css` plus optional `/shadcn` and `/tailwind` (v3 JS preset)

Do not import `styles/css` together with `tokens/css`. Do not import both shadcn adapters (`styles/shadcn` and `tokens/shadcn`): they share 20 CSS names with different mappings; last stylesheet wins.

## 33. Versioning

Independent versions per package via [Changesets](https://github.com/changesets/changesets). Packages do not share a single version number.

## 34. Release policy

- Foundation packages use semver
- Breaking changes require a major bump and Changeset
- Frozen packages require architecture justification for behavioral changes

## 35. Troubleshooting

| Issue                              | Resolution                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `workspace:*` in installed package | You installed from source, not a published tarball                                |
| Missing `data/` in tokens          | Ensure you installed a published version with `files: ["dist", "data"]`           |
| Icon provider not found            | Install the optional peer (`lucide-static`, etc.) and import the provider subpath |
| CSS variables missing              | Import `@celestial-ui/styles/css` or compile theme server-side                    |
| Type errors on subpaths            | Ensure `moduleResolution` is `node16`/`bundler` and TypeScript 5+                 |

## 36. Compatibility matrix

See [compatibility-matrix.md](./compatibility-matrix.md).

## 37–39. Links

- [Repository README](../README.md)
- [Build and validation](./build-and-validate.md)
- [Registry configuration](./registries.md)
- [Release process](./release.md)
- npm (after publish): `https://www.npmjs.com/package/@celestial-ui/<package>`
