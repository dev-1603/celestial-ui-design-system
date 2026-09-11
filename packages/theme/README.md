# @celestial-ui/theme

Theme identity, appearance modes, inheritance, tenant slot overrides, and `resolveTheme()` for Celestial UI.

## What is this?

`@celestial-ui/theme` maps **who the theme is** (id, version, parent, modes, approved overrides) onto the canonical token catalog from `@celestial-ui/tokens`.

It produces a `ResolvedTheme`: a flat, alias-resolved token map plus validation — not CSS.

## Why use it?

Use this package when you need light/dark modes, theme inheritance, or restricted tenant overrides **without** baking CSS generation into the theme layer.

Facts from this package:

- Runtime dependency: `@celestial-ui/tokens` only
- Ships `CELESTIAL_THEME` (`id: 'celestial'`, modes `light` | `dark`)
- Resolution precedence: canonical tokens → mode overlay → inherited themes → tenant slots
- Theme configs do not contain raw catalogs or CSS

## When to use it

Install this package when you need to:

- Resolve the Celestial theme (or a child theme) to a `ResolvedTheme`
- Support `light` / `dark` (and a `system` _preference_ that you resolve yourself)
- Apply tenant overrides through approved slots (`brand`, `typography`, …)
- Feed a resolved theme into `@celestial-ui/styles` or your own CSS-in-JS mapping

You do **not** need this package if you only import `@celestial-ui/tokens/css`.

## What this package does

- Defines `ThemeConfig` / `ThemeDefinition` (identity, modes, overrides, optional icon _hint_)
- Registers themes in `ThemeRegistry`
- Resolves appearance mode (`light` | `dark`; `system` is not a third token overlay)
- Applies theme and tenant overrides under policy/slot rules
- Calls `@celestial-ui/tokens` to flatten, resolve aliases, and validate
- Exposes slot contracts (`THEME_SLOT_DEFINITIONS`) and override policy helpers

## What this package does NOT do

- Emit CSS, inject `<style>` tags, or manage FOUC
- Own the token catalog (that remains `@celestial-ui/tokens`)
- Render components or provide framework theme providers
- Resolve or sanitize icons (`icons` on a theme is configuration only)
- Work without `@celestial-ui/tokens`

There is no `createTheme({ name, tokens: { colors: { primary } } })` API.

## Package independence

| Scenario                         | Supported?  | Notes                                                                                       |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| Package alone                    | No          | Requires `@celestial-ui/tokens`                                                             |
| With other Celestial UI packages | Yes         | tokens required; styles optional consumer of `ResolvedTheme`                                |
| Existing application             | Yes         | Resolve in Node/build, or consume tokens CSS without this package                           |
| In-house component/UI library    | Yes         | Libraries should consume resolved CSS variables, not call `resolveTheme()` per component    |
| React                            | Current     | Use the JS API from any app; no React wrapper exists here                                   |
| Vue                              | Current     | Same                                                                                        |
| Svelte                           | Current     | Same                                                                                        |
| SSR                              | Conditional | `resolveTheme()` loads the token catalog with Node `fs`. Verified in Node consumer fixtures |

## Installation

Package-manager support and runtime support are verified separately. Node.js **>= 22**. Bun **1.1.20** was used for packed-tarball consumer fixtures.

### npm

```bash
npm install @celestial-ui/theme @celestial-ui/tokens
```

### pnpm

```bash
pnpm add @celestial-ui/theme @celestial-ui/tokens
```

### yarn

```bash
yarn add @celestial-ui/theme @celestial-ui/tokens
```

### Bun

```bash
bun add @celestial-ui/theme @celestial-ui/tokens
```

Verified with the same packed-tarball fixtures as npm/pnpm/yarn (`foundation-node`), installed and run with Bun.

### Deno

Deno is **partial** (CJS interop). There is no dedicated theme Deno fixture. See [compatibility-matrix.md](../../docs/compatibility-matrix.md).

`@celestial-ui/tokens` is required. `@celestial-ui/styles` is optional.

### Verified compatibility

| Environment   | Status    | What was verified                                           |
| ------------- | --------- | ----------------------------------------------------------- |
| Node.js >= 22 | Supported | Package tests + Node consumer fixtures                      |
| npm           | Supported | Packed tarball consumer fixtures                            |
| pnpm          | Supported | Packed tarball consumer fixtures (CI)                       |
| Yarn          | Supported | Packed tarball consumer fixtures                            |
| Bun 1.1.20    | Supported | Same packed-tarball fixtures as npm/pnpm/yarn, run with Bun |
| Deno          | Partial   | Best-effort CJS interop; not a dedicated fixture            |

`@celestial-ui/tokens` is required. `@celestial-ui/styles` is optional.

## Quick Start

```ts
import { CELESTIAL_THEME, createThemeRegistry, resolveTheme } from '@celestial-ui/theme';

const registry = createThemeRegistry([CELESTIAL_THEME]);
const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });

console.log(light.themeId); // 'celestial'
console.log(light.mode); // 'light'
console.log(light.validation.isValid); // true
console.log(light.tokens['surface.canvas']?.$value);
```

## Public API

Single entry: `@celestial-ui/theme`.

### Theme definitions

- `CELESTIAL_THEME` — shipped Celestial theme
- `defineTheme(theme)` — identity helper that returns the given `ThemeConfig`
- `THEME_SCHEMA_VERSION` (`'1.0.0'`), `SLOT_SCHEMA_VERSION` (`'1.0.0'`)

### Registry

- `ThemeRegistry`, `createThemeRegistry(themes?)`
- `register`, `has`, `get`, `list`, `getInheritanceChain`

### Resolution

- `resolveTheme(registry, options)` → `ResolvedTheme`
- `resolveAppearanceMode(theme, options)`
- `ResolveThemeOptions`: `themeId`, `mode?`, `modePreference?`, `systemResolvedMode?`, `tenantProfile?`, `includeProvenance?`

### Validation and policy

- `validateThemeConfig`, `validateTenantThemeProfile`
- `getEffectivePolicy`, `canThemeOverride`, `canTenantOverride`
- `THEME_SLOT_DEFINITIONS`, `THEME_SLOT_IDS`, `THEME_SLOTS`
- `findSlotForPath`, `isPathInSlot`, `isPolicyAllowedInSlot`

### Version and errors

- `compareSemver`, `isCompatibleTokenSystem`
- `ThemeResolutionError`, `themeError`
- Types: `ResolvedTheme`, `ThemeConfig`, `TenantThemeProfile`, `AppearanceMode`, `ModePreference`, `IconProviderConfig`, …

## Entry Points

| Import path           | Purpose         | Use when                                |
| --------------------- | --------------- | --------------------------------------- |
| `@celestial-ui/theme` | All public APIs | Theme registration and `resolveTheme()` |

No CSS or provider subpaths.

## Common Usage

### Light and dark

```ts
import { CELESTIAL_THEME, createThemeRegistry, resolveTheme } from '@celestial-ui/theme';

const registry = createThemeRegistry([CELESTIAL_THEME]);
const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
const dark = resolveTheme(registry, { themeId: 'celestial', mode: 'dark' });
```

### System preference

`modePreference: 'system'` is not a visual mode. Pass the OS result as `systemResolvedMode`:

```ts
const mode = resolveTheme(registry, {
  themeId: 'celestial',
  modePreference: 'system',
  systemResolvedMode: 'dark', // from matchMedia / your app
});
```

If `systemResolvedMode` is omitted, the theme `defaultMode` is used (`light` for `CELESTIAL_THEME`).

### Child theme with inheritance

```ts
import {
  CELESTIAL_THEME,
  defineTheme,
  createThemeRegistry,
  THEME_SCHEMA_VERSION,
  resolveTheme,
} from '@celestial-ui/theme';

const acme = defineTheme({
  id: 'acme',
  name: 'Acme',
  version: '1.0.0',
  schemaVersion: THEME_SCHEMA_VERSION,
  parentId: 'celestial',
  defaultMode: 'light',
  modes: ['light', 'dark'],
  overrides: {
    'action.primary.background': '{color.blue.700}',
  },
});

const registry = createThemeRegistry([CELESTIAL_THEME, acme]);
const resolved = resolveTheme(registry, { themeId: 'acme', mode: 'light' });
```

Unknown token paths and policy-forbidden overrides throw `ThemeResolutionError`.

## Advanced Usage

### Tenant slot overrides

Tenants may only patch approved slots, not arbitrary paths:

```ts
import {
  CELESTIAL_THEME,
  createThemeRegistry,
  resolveTheme,
  THEME_SCHEMA_VERSION,
} from '@celestial-ui/theme';

const registry = createThemeRegistry([CELESTIAL_THEME]);
const resolved = resolveTheme(registry, {
  themeId: 'celestial',
  mode: 'light',
  tenantProfile: {
    tenantId: 'acme-corp',
    baseThemeId: 'celestial',
    schemaVersion: THEME_SCHEMA_VERSION,
    slots: {
      brand: {
        'action.primary.background': '{color.blue.700}',
      },
    },
  },
});
```

### Icon hint (not resolution)

```ts
const theme = defineTheme({
  ...CELESTIAL_THEME,
  id: 'acme',
  name: 'Acme',
  icons: { provider: 'lucide' },
});
```

Pass `resolved.icons` to `@celestial-ui/icons` (`iconConfigFromResolvedTheme`) if you use that package. Theme never loads SVG.

### Provenance (debug)

```ts
const resolved = resolveTheme(registry, {
  themeId: 'celestial',
  mode: 'light',
  includeProvenance: true,
});
// resolved.provenance?.[path] → { source: 'canonical' | 'mode' | 'theme' | 'tenant', sourceId? }
```

## Package Combinations

| Combination                             | Valid?        | Purpose                                               |
| --------------------------------------- | ------------- | ----------------------------------------------------- |
| `@celestial-ui/theme` only              | No            | Missing `@celestial-ui/tokens`                        |
| theme + tokens                          | Yes           | Resolve themes without a CSS compiler                 |
| theme + tokens + `@celestial-ui/styles` | Yes           | Compile `ResolvedTheme` to CSS                        |
| theme + `@celestial-ui/core`            | Indirect      | Independent; add tokens because theme requires it     |
| theme + `@celestial-ui/icons`           | Optional      | Share provider id via `ResolvedTheme.icons`           |
| theme + future framework package        | Future/Target | Adapters may call `resolveTheme` in the product shell |

## Existing Application Integration

```text
Existing application
        ↓
Install @celestial-ui/theme and @celestial-ui/tokens
        ↓
createThemeRegistry([CELESTIAL_THEME])
        ↓
resolveTheme(registry, { themeId: 'celestial', mode })
        ↓
Map resolved.tokens in your styling system
   or pass the result to @celestial-ui/styles
```

If you only need static Celestial colors, install `@celestial-ui/tokens` and import `/css` instead.

## In-house Library Integration

Host applications (product shells) should resolve the theme **once**. Component libraries should consume CSS variables, not this package’s registry, inside `Button` / `Card` implementations.

You can `defineTheme` for brand variants and register them next to `CELESTIAL_THEME`. Override only token paths that exist in the catalog and are allowed by policy.

## Framework Integration

**CURRENT**

- Framework-agnostic TypeScript API
- Usable from Node scripts and bundlers that can load the tokens `data/` files via the tokens package

**PLANNED / FUTURE**

Future framework integration is expected to consume this package through a framework adapter architecture; no official framework package is currently documented here unless implemented in this repository.

**NOT SUPPORTED**

- React/Vue/Svelte `ThemeProvider` components in this package
- CSS output from theme itself

## SSR / Browser / Runtime

`resolveTheme()` calls `getCanonicalTokenSources()` from `@celestial-ui/tokens`, which reads JSON with Node `fs`. Node consumer fixtures verify this path.

Browser bundling of `resolveTheme()` is **not** a verified public contract. For the client, prefer:

- Precompiled CSS from `@celestial-ui/styles/css`, or
- CSS from `@celestial-ui/tokens/css`

Resolved objects are plain data (no DOM). Hydration concerns belong to `@celestial-ui/styles`.

v0.1.0 ships **CommonJS**. Bun 1.1.20 consumed that CJS output (`resolveTheme` included). Deno: partial CJS interop.

## Tree-shaking / Bundle Usage

There is one root CJS entry. Import only the names you need; do not assume full tree-shaking.

Do not put `resolveTheme()` in a per-component client module if your bundler cannot provide `fs` + the tokens `data/` files.

## Troubleshooting

| Issue                                        | What to check                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `Theme '…' is not registered`                | Pass the theme into `createThemeRegistry([...])` before `resolveTheme` |
| `Mode '…' is not supported`                  | `CELESTIAL_THEME.modes` is `['light', 'dark']` only                    |
| `Cannot override unknown token path`         | Path must exist in the tokens catalog                                  |
| `Override of '…' is not permitted by policy` | Check `overridePolicy` / slot `allowedTokenPaths`                      |
| Expecting CSS from this package              | Use `@celestial-ui/styles` or `@celestial-ui/tokens/css`               |
| `createTheme` is not exported                | Use `defineTheme` + `createThemeRegistry` + `resolveTheme`             |
| `fs` / catalog errors in the browser         | Resolve on the server/build, or use prebuilt CSS                       |

## Related Packages

| Package                | Relationship                                     |
| ---------------------- | ------------------------------------------------ |
| `@celestial-ui/tokens` | **Required**                                     |
| `@celestial-ui/styles` | Optional companion that compiles `ResolvedTheme` |
| `@celestial-ui/icons`  | Optional; theme only stores a provider hint      |
| `@celestial-ui/core`   | Independent                                      |

## Documentation

- [Package usage](../../docs/package-usage.md) — identity subpath vs `resolveTheme`, exclusive CSS stacks
- [Package selection](../../docs/package-selection-guide.md)
- [Architecture for consumers](../../docs/architecture-for-consumers.md)
- [Package combinations](../../docs/package-combination-matrix.md)
- [Installation matrix](../../docs/installation-matrix.md)
- [Compatibility matrix](../../docs/compatibility-matrix.md)
- [Registries](../../docs/registries.md)

## License

MIT. See [LICENSE](./LICENSE).
