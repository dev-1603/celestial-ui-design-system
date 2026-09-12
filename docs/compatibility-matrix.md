# Compatibility Matrix

Support levels for consuming Celestial UI foundation packages.

| Package                | npm | pnpm | Yarn (Berry) | Bun 1.1.20 | Deno                                       |
| ---------------------- | --- | ---- | ------------ | ---------- | ------------------------------------------ |
| `@celestial-ui/tokens` | ✓   | ✓    | ✓            | ✓          | Partial (CSS ✓; Node `fs` catalog API N/A) |
| `@celestial-ui/theme`  | ✓   | ✓    | ✓            | ✓          | Partial (CJS interop)                      |
| `@celestial-ui/styles` | ✓   | ✓    | ✓            | ✓          | Partial (CSS imports best-effort)          |
| `@celestial-ui/icons`  | ✓   | ✓    | ✓            | ✓          | Partial (CJS + optional peers)             |
| `@celestial-ui/core`   | ✓   | ✓    | ✓            | ✓          | Partial (CJS interop)                      |
| `@celestial-ui/react`  | N/A | N/A  | N/A          | N/A        | N/A (not in this repo)                     |
| `@celestial-ui/vue`    | N/A | N/A  | N/A          | N/A        | N/A (not in this repo)                     |
| `@celestial-ui/svelte` | N/A | N/A  | N/A          | N/A        | N/A (not in this repo)                     |

## Legend

- **✓** — Supported and tested via packed-tarball consumer fixtures
- **Partial** — May work with `npm:` specifiers; Deno ergonomics are limited for Node `fs` catalog APIs and CJS interop
- **N/A** — Package does not exist in this monorepo

Package-manager installation and runtime execution are separate. A **✓** under Bun means the same packed-tarball consumer fixtures as npm/pnpm/yarn, installed and executed with Bun (`bun install`, `bun check.ts`, plus a CJS `require` smoke).

## Runtime requirements

- **Node.js:** >= 22 (all packages)
- **Bun:** 1.1.20 verified (`pnpm consumer:test:bun`). CI pins this version.
- **Module format:** Dual CJS + ESM. Bundlers resolve the `import` condition (`dist/esm`). Node `require` and tools that ignore `exports` keep CJS (`dist/cjs`, `main`/`types`). CSS assets live under `dist/css`.
- **TypeScript:** 5.4+ recommended; declarations included

## How combinations are tested

| Manager    | Command                   | Scope                              |
| ---------- | ------------------------- | ---------------------------------- |
| pnpm       | `pnpm consumer:test`      | All Node fixtures (required in CI) |
| npm        | `pnpm consumer:test:npm`  | All Node fixtures                  |
| Yarn Berry | `pnpm consumer:test:yarn` | All Node fixtures                  |
| Bun        | `pnpm consumer:test:bun`  | Same Node fixtures; required in CI |
| Deno       | `pnpm consumer:test:deno` | Core import only; non-blocking     |

## CSS consumption

CSS subpath exports (`@celestial-ui/styles/css`, `@celestial-ui/tokens/css`) work with bundlers and PostCSS. The shared `foundation-node` fixture resolves these paths with `require.resolve` and reads the files (including when that fixture is run with Bun). Deno can import CSS directly in some setups but this is not a guaranteed public contract for Deno yet.

## Optional icon peers

Icons require installing provider packages separately:

```bash
pnpm add lucide-static
bun add lucide-static
pnpm add @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons
```

Only install providers you use. The icons consumer fixture verifies Lucide (`lucide-static`).
