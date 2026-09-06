# Environment Compatibility Matrix

The Celestial UI Foundation is built to be robust across different environments, from build-time scripts to Server-Side Rendering (SSR) and Edge runtimes.

This document outlines the verified compatibility for each package.

## Compatibility Matrix

| Package                | Browser (CSR)      | Node.js / Build          | SSR / Hydration             | Edge Runtimes |
| ---------------------- | ------------------ | ------------------------ | --------------------------- | ------------- |
| `@celestial-ui/tokens` | ✅ Native CSS/JS   | ✅ Data/JSON access      | ✅ Fully supported          | ✅ Supported  |
| `@celestial-ui/theme`  | ✅ Fully supported | ✅ Fully supported       | ✅ Fully supported          | ✅ Supported  |
| `@celestial-ui/styles` | ✅ Fully supported | ✅ Build-time generation | ✅ Fully supported          | ✅ Supported  |
| `@celestial-ui/icons`  | ✅ SVG rendering   | ✅ Fully supported       | ✅ Safe for SSR             | ✅ Supported  |
| `@celestial-ui/core`   | ✅ Fully supported | ✅ Safe (No-op DOM)      | ✅ Environment abstractions | ✅ Supported  |

## Bun runtime

Packed-tarball fixtures (`pnpm consumer:test:bun`) run the **same** consumer checks as npm/pnpm/yarn, using Bun **1.1.20** to install and execute them (`bun install`, `bun check.ts`, CJS `require` smoke). That covers both the Bun package manager and the Bun runtime.

`createThemeStyleManager` (DOM) is not part of the consumer fixtures. Icon Lucide resolution is verified with `lucide-static` installed.

## Package-Specific Considerations

### `@celestial-ui/core`

- **SSR/Hydration:** `core` is tested for SSR compatibility via `createNullEnvironment()`. DOM-dependent helpers no-op without a document.
- **Imports:** Prefer granular subpaths, e.g. `import { buttonSpec } from '@celestial-ui/core/specs/button'`.

### `@celestial-ui/icons`

- **SSR/Hydration:** `resolveIcon()` does not access the DOM. Pass request-local `IconConfig` in SSR.
- **Imports:** Import one provider, e.g. `import { LucideAdapter } from '@celestial-ui/icons/providers/lucide'`.

### `@celestial-ui/styles`

- **SSR/Hydration:** `renderThemeStyleTag` / `adoptHydratedStyle` are the SSR surfaces. `createThemeStyleManager` needs a `Document`.
- **Node/Build-time:** `compileResolvedTheme` / `compileThemeSet` produce CSS strings.

### `@celestial-ui/tokens` & `@celestial-ui/theme`

- Prebuilt CSS is static. `getCanonicalTokenSources()` / `resolveTheme()` use Node `fs` and also ran under Bun 1.1.20 in consumer fixtures.

## Testing and Verification

Verified by `pnpm test`, `pnpm consumer:test` (pnpm packed tarballs), and `pnpm consumer:test:bun` (Bun packed tarballs). Deno remains `pnpm consumer:test:deno` (best-effort, non-blocking).
