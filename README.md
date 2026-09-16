# Celestial UI Design System

Monorepo for the **Celestial UI** framework-neutral foundation packages under the `@celestial-ui` npm organization.

## Packages

| Package                                     | Description                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| [`@celestial-ui/tokens`](./packages/tokens) | Canonical design tokens, resolver, validation, and generators             |
| [`@celestial-ui/theme`](./packages/theme)   | Theme identity, modes, inheritance, tenant profiles, and resolution       |
| [`@celestial-ui/styles`](./packages/styles) | CSS compiler, runtime, SSR, and optional Tailwind/shadcn bridges          |
| [`@celestial-ui/icons`](./packages/icons)   | Provider-neutral icon catalogues, resolution, fallback, and adapters      |
| [`@celestial-ui/core`](./packages/core)     | Framework-agnostic component contracts, behavior controllers, and runtime |

Framework adapters (`@celestial-ui/react`, `@celestial-ui/vue`, `@celestial-ui/svelte`) are **not** in this repository. See [docs/package-usage.md](./docs/package-usage.md).

## Requirements

- Node.js **>= 22**
- pnpm **10**

## Commands

| Command                     | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `pnpm install`              | Install workspace dependencies                    |
| `pnpm build`                | Build all packages (dependency order via Turbo)   |
| `pnpm test`                 | Run package tests                                 |
| `pnpm typecheck`            | Typecheck all packages                            |
| `pnpm lint`                 | Typecheck packages (`tsc --noEmit`; not ESLint)   |
| `pnpm validate`             | Full validation gate (graph, pack, docs)          |
| `pnpm validate:packages`    | Pack and inspect publishable artifacts            |
| `pnpm validate:graph`       | Validate workspace dependency graph               |
| `pnpm consumer:test`        | Clean tarball consumer tests (pnpm)               |
| `pnpm consumer:test:portal` | Independent-repo `link:` / `portal:` (local only) |
| `pnpm consumer:test:bun`    | Packed tarball consumer tests (Bun 1.1.20)        |
| `pnpm docs:validate`        | Validate documentation links and README coverage  |
| `pnpm publish:dry-run`      | Dry-run publish all public packages               |

## Documentation

- [Package ecosystem guide](./docs/package-usage.md)
- [Build and validation](./docs/build-and-validate.md)
- [Registry setup (npm)](./docs/registries.md)
- [Release process](./docs/release.md)
- [Compatibility matrix](./docs/compatibility-matrix.md)
- [Frozen foundation packages](./docs/frozen-packages.md)

## Structure

- `packages/` — publishable foundation packages
- `apps/` — applications (documentation, storybook — reserved)
- `tooling/` — internal build/validation tooling (unpublished)
- `docs/` — central developer documentation

## License

MIT — see [LICENSE](./LICENSE).
