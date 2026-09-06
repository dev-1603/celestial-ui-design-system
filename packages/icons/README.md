# @celestial-ui/icons

Provider-neutral icon registry and resolver: canonical names, adapters, fallback, and SSR-safe payloads — not a rendered icon component.

## What is this?

`@celestial-ui/icons` maps Celestial **canonical** names (`search`, `chevron-down`, `close`, …) to a chosen icon provider (Lucide, Font Awesome, Material Symbols, Heroicons, Phosphor, Iconify).

It returns a `NormalizedIconPayload` (SVG string, SVG data, font class, …). Your application or framework adapter turns that payload into DOM. This package does not render icons.

The canonical catalogue contains **103** names.

## Why use it?

Components can request `name: 'search'` instead of a vendor-specific export. You can change providers, add fallbacks, or register a custom adapter without rewriting call sites.

Facts from this package:

- Zero runtime dependencies
- Provider libraries are **optional peers**
- Provider adapters are **not** on the root barrel — import subpaths
- `resolveIcon()` is the single resolution entry point
- No DOM access in the resolver (SSR-safe algorithm)

## When to use it

Install this package when you need:

- A stable icon vocabulary across an app or in-house library
- The ability to swap Lucide / FA / Phosphor / … behind one API
- Node/SSR resolution that returns data, not components

You do **not** need tokens, theme, styles, or core.

## What this package does

- Canonical catalogue + alias resolution (`canonicalRegistry`)
- Provider registry (`registerIconProvider`, `IconProviderRegistry`)
- `resolveIcon(request, config?, registryOrOptions?)`
- Application config (`configureCelestialIcons`, `getIconConfig`)
- Theme-hint helpers that do **not** import `@celestial-ui/theme`
- Six built-in adapters on subpaths
- Catalogue validation helpers

## What this package does NOT do

- Render SVG into the document
- Sanitize SVG (callers must sanitize `svg-string` before innerHTML)
- Ship icon glyph packages (you install optional peers)
- Bundle Font Awesome Pro (register a custom `IconProviderAdapter`)
- Export `resolveLucideIcon` or other per-provider helper functions
- Depend on other `@celestial-ui/*` packages

## Package independence

| Scenario                         | Supported? | Notes                                                                                 |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| Package alone                    | Yes        | Engine works; payloads need a registered adapter + peer (except Material class names) |
| With other Celestial UI packages | Yes        | Optional. Theme may pass `icons.provider`; core may describe an icon _part_           |
| Existing application             | Yes        | Resolve payloads and render with your stack                                           |
| In-house component/UI library    | Yes        | Keep components on canonical names                                                    |
| React                            | Current    | Wrap `resolveIcon` yourself; no React package here                                    |
| Vue                              | Current    | Same                                                                                  |
| Svelte                           | Current    | Same                                                                                  |
| SSR                              | Yes        | Pass request-local `IconConfig` + registry; avoid the process-wide singleton          |

## Installation

Package-manager support and runtime support are verified separately. Node.js **>= 22**. Bun **1.1.20** was used for packed-tarball consumer fixtures.

### npm

```bash
npm install @celestial-ui/icons
```

### pnpm

```bash
pnpm add @celestial-ui/icons
```

### yarn

```bash
yarn add @celestial-ui/icons
```

### Bun

```bash
bun add @celestial-ui/icons
```

Verified with the same packed-tarball fixtures as npm/pnpm/yarn (`icons-node`), installed and run with Bun. That fixture uses Lucide (`lucide-static`) and `resolveIcon({ name: 'search' })`.

```bash
bun add lucide-static
```

### Deno

Deno is **partial** (CJS + optional peers). There is no dedicated icons Deno fixture.

Install **only** the provider peer you use. Examples:

```bash
pnpm add lucide-static
```

```bash
pnpm add @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons
```

```bash
pnpm add @phosphor-icons/core
```

```bash
pnpm add heroicons
```

```bash
pnpm add @iconify/utils @iconify-json/ph
```

Material Symbols has **no npm peer**. The adapter emits `font-class` payloads; the app must load Material Symbols CSS.

### Verified compatibility

| Environment   | Status    | What was verified                                           |
| ------------- | --------- | ----------------------------------------------------------- |
| Node.js >= 22 | Supported | Package tests + Node consumer fixtures                      |
| npm           | Supported | Packed tarball consumer fixtures                            |
| pnpm          | Supported | Packed tarball consumer fixtures (CI)                       |
| Yarn          | Supported | Packed tarball consumer fixtures                            |
| Bun 1.1.20    | Supported | Same packed-tarball fixtures as npm/pnpm/yarn, run with Bun |
| Deno          | Partial   | CJS + optional peers; no dedicated fixture                  |

## Quick Start

```ts
import { configureCelestialIcons, registerIconProvider, resolveIcon } from '@celestial-ui/icons';
import { LucideAdapter } from '@celestial-ui/icons/providers/lucide';

registerIconProvider(LucideAdapter);
configureCelestialIcons({ provider: 'lucide', missingIconPolicy: { kind: 'empty' } });

const result = resolveIcon({ name: 'search' });
// result.status === 'resolved'
// result.payload?.kind === 'svg-string'
// result.payload?.data is the SVG markup from lucide-static
```

Sanitize `svg-string` data before inserting it into the DOM.

## Public API

### Root (`@celestial-ui/icons`)

**Resolution:** `resolveIcon`, type `ResolveIconOptions`

**Config:** `configureCelestialIcons`, `getIconConfig`, `iconConfigFromThemeHint`, `iconConfigFromResolvedTheme`

**Registries:** `registerIconProvider`, `defaultIconProviderRegistry`, `IconProviderRegistry`, `canonicalRegistry`, `CanonicalRegistry`

**Validation:** `validateCanonicalCatalogue`, `validateProviderCatalogue`

**Errors:** `IconResolutionError`, `IconProviderRegistrationError`, `iconError`

**Version:** `ICON_SYSTEM_VERSION`, catalogue/contract version constants, `isCatalogueCompatible`

**Types:** `IconRequest`, `IconConfig`, `IconResolution`, `NormalizedIconPayload`, `IconProviderAdapter`, `BuiltInProviderId`, `CanonicalIconName`, …

`_resetIconConfig` is exported as `@internal` for tests. Do not use it in application code.

Default config (until you call `configureCelestialIcons`):

```ts
{
  provider: 'lucide',
  fallback: [],
  missingIconPolicy: { kind: 'empty' },
  explicitProviderPolicy: 'apply-missing-policy',
  diagnostics: false,
}
```

Built-in provider ids: `'lucide' | 'fa' | 'material' | 'heroicons' | 'phosphor' | 'iconify'`.

### Provider subpaths

| Import path                                  | Export                                   | Peer / requirement                                                       |
| -------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| `@celestial-ui/icons/providers/lucide`       | `LucideAdapter`                          | `lucide-static`                                                          |
| `@celestial-ui/icons/providers/font-awesome` | `FontAwesomeAdapter`                     | `@fortawesome/fontawesome-svg-core` plus free solid and/or regular packs |
| `@celestial-ui/icons/providers/material`     | `MaterialSymbolsAdapter`                 | Material Symbols **font CSS** in the app (no npm peer)                   |
| `@celestial-ui/icons/providers/heroicons`    | `HeroiconsAdapter`                       | `heroicons` (SVG files)                                                  |
| `@celestial-ui/icons/providers/phosphor`     | `PhosphorAdapter`                        | `@phosphor-icons/core`                                                   |
| `@celestial-ui/icons/providers/iconify`      | `IconifyAdapter`, `createIconifyAdapter` | `@iconify/utils` and `@iconify-json/<prefix>`                            |

Lucide loads the `lucide-static` package once and indexes PascalCase names. Per-icon tree-shaking at the resolver layer is not available because the canonical name is chosen at runtime.

## Entry Points

| Import path                          | Purpose                      | Use when                          |
| ------------------------------------ | ---------------------------- | --------------------------------- |
| `@celestial-ui/icons`                | Resolver, config, registries | Always for `resolveIcon`          |
| `@celestial-ui/icons/providers/<id>` | One adapter                  | Only the provider(s) you register |

Do not import adapters from the root barrel — they are intentionally omitted.

## Common Usage

### Missing icons

```ts
configureCelestialIcons({
  provider: 'lucide',
  missingIconPolicy: { kind: 'empty' }, // or 'error', or { kind: 'fallback-icon', canonicalName: 'info' }
});
```

Unknown names do not throw when policy is `'empty'`; `status` is `'missing'` and `payload` is `null`.

### Explicit provider on one request

```ts
resolveIcon({ name: 'search', provider: 'fa' });
```

By default (`explicitProviderPolicy: 'apply-missing-policy'`), failure does not walk the fallback list. Set `'allow-fallback'` to continue.

### Fallback chain

```ts
configureCelestialIcons({
  provider: 'lucide',
  fallback: ['phosphor', 'material'],
});
```

Register every adapter you list.

## Advanced Usage

### SSR / per-request config

Do not rely on `configureCelestialIcons()` for per-request SSR (module singleton). Pass config and a request-local registry:

```ts
import { resolveIcon, IconProviderRegistry } from '@celestial-ui/icons';
import { LucideAdapter } from '@celestial-ui/icons/providers/lucide';
import type { IconConfig } from '@celestial-ui/icons';

const registry = new IconProviderRegistry();
registry.register(LucideAdapter);

const config: IconConfig = {
  provider: 'lucide',
  missingIconPolicy: { kind: 'empty' },
};

const result = resolveIcon({ name: 'chevron-down' }, config, { registry });
```

### Theme hint without depending on theme

```ts
import { iconConfigFromResolvedTheme, resolveIcon } from '@celestial-ui/icons';

const config = iconConfigFromResolvedTheme({ icons: { provider: 'lucide' } });
resolveIcon({ name: 'menu' }, config, { registry });
```

### Custom Iconify collection

```ts
import { createIconifyAdapter } from '@celestial-ui/icons/providers/iconify';

const mdi = createIconifyAdapter({ collection: 'mdi' });
registry.register(mdi);
```

### Custom provider

Implement `IconProviderAdapter` (`id`, `resolveNativeName`, `canSatisfyVariant`, `resolve`, `capabilities`, …) and `registerIconProvider(adapter)`.

## Package Combinations

| Combination                      | Valid?        | Purpose                                                        |
| -------------------------------- | ------------- | -------------------------------------------------------------- |
| `@celestial-ui/icons` only       | Yes           | Registry + resolver                                            |
| icons + a provider peer          | Yes           | Actual payloads                                                |
| icons + `@celestial-ui/theme`    | Optional      | `ResolvedTheme.icons` → `iconConfigFromResolvedTheme`          |
| icons + `@celestial-ui/core`     | Yes           | Independent; core `icon` spec is a contract, not this resolver |
| icons + tokens/styles            | Yes           | Independent                                                    |
| icons + future framework package | Future/Target | Adapters should call `resolveIcon` and sanitize/render         |

## Existing Application Integration

```text
Existing application
        ↓
Install @celestial-ui/icons + one provider peer
        ↓
registerIconProvider(LucideAdapter)
        ↓
resolveIcon({ name: 'search' })
        ↓
Render payload in your framework (sanitize SVG)
```

You can keep MUI, Ant Design, or in-house components and only replace icon lookup.

## In-house Library Integration

Library components should accept canonical names (`search`, `close`) and call `resolveIcon`. The host application registers providers and config.

Do not import provider subpaths from every component file if you want a single registered adapter — register once at app startup.

SVG sanitization stays in the adapter/render layer, not in this package.

## Framework Integration

**CURRENT**

- Framework-agnostic `resolveIcon` + adapters
- Payload kinds: `svg-string`, `svg-data`, `component-ref`, `font-class`, `url` (adapters in this repo use `svg-string` or `font-class`)

**PLANNED / FUTURE**

Future framework integration is expected to consume this package through the framework adapter architecture; no official framework package is currently documented here unless implemented in this repository.

**NOT SUPPORTED**

- Official `<Icon name="…">` React/Vue/Svelte components in this package
- `resolveLucideIcon()` (use `LucideAdapter` + `resolveIcon`)

## SSR / Browser / Runtime

The resolver does not touch the DOM. Returning SVG strings or font classes avoids framework hydration of icon _components_, but you still must render consistently on server and client.

Heroicons and Phosphor adapters read SVG files from the peer package (`fs`). That path is Node-oriented. Lucide uses `lucide-static` JS string exports. Material emits class + ligature text.

v0.1.0 is **CommonJS**. Bun 1.1.20 consumed that CJS resolver via the same `icons-node` fixture as npm/pnpm/yarn. Optional peers must be installed in the consuming app (or they resolve to missing payloads). Deno is partial.

## Tree-shaking / Bundle Usage

- Import **one** `@celestial-ui/icons/providers/…` module per provider you register.
- Root import does not include adapters.
- Lucide cannot tree-shake unused glyphs through this resolver; the native name is selected at runtime from the catalogue.

## Troubleshooting

| Issue                                                    | What to check                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `status: 'missing'`                                      | Register the adapter, install the peer, use a canonical name (`search`, not `Search`) |
| Lucide payload undefined                                 | `pnpm add lucide-static`                                                              |
| Font Awesome empty                                       | Install svg-core **and** a free icon pack; Pro is not bundled                         |
| Material has no glyphs                                   | Load Material Symbols CSS; payload is `font-class`, not SVG                           |
| SSR icons leak across requests                           | Do not use `configureCelestialIcons` as request state; pass `IconConfig` + registry   |
| Importing from `/providers/lucide` pulls unused adapters | Only import the subpath you need; do not import all provider files                    |
| `resolveLucideIcon` is not exported                      | Use `LucideAdapter` + `resolveIcon`                                                   |

## Related Packages

| Package                | Relationship                               |
| ---------------------- | ------------------------------------------ |
| `@celestial-ui/theme`  | Optional companion (provider hint only)    |
| `@celestial-ui/core`   | Independent related contract (`icon` spec) |
| `@celestial-ui/tokens` | Independent                                |
| `@celestial-ui/styles` | Independent                                |

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

Provider glyph licenses are those of the optional peer packages / font you install.
