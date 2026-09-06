# Registry Configuration

Celestial UI packages publish to **npm Registry** and **GitHub Packages**.

## npm Registry (default)

No configuration required for public packages:

```bash
npm install @celestial-ui/core
```

Scoped packages are published with `publishConfig.access: public`.

## GitHub Packages

### Consumer `.npmrc`

Create or extend `.npmrc` in your project:

```ini
@celestial-ui:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Authenticate with a GitHub personal access token that has `read:packages` scope.

### Install from GitHub Packages

```bash
npm install @celestial-ui/core
# or
pnpm add @celestial-ui/core
```

The scoped registry redirect applies only to `@celestial-ui/*`.

### Publishing (maintainers)

Publishing is **not automated in this repository yet**. When release workflows are added:

1. **npm:** npm Trusted Publishing (OIDC) or `NPM_TOKEN`
2. **GitHub Packages:** `GITHUB_TOKEN` with `packages: write`

### Dual registry validation

| Stage           | What is validated                                                                     |
| --------------- | ------------------------------------------------------------------------------------- |
| **Local**       | `publishConfig.access: public`, Changesets `access: public`, `pnpm publish --dry-run` |
| **Pre-release** | RC publish to both registries, install smoke test                                     |
| **Production**  | Post-publish `npm view` on both registries                                            |

Do not publish production versions during development. Use Changesets prerelease (`0.1.0-rc.0`) for registry smoke tests.

## Required secrets (future CI publish job)

| Secret         | Purpose                                     |
| -------------- | ------------------------------------------- |
| `NPM_TOKEN`    | npm registry publish (if not using OIDC)    |
| `GITHUB_TOKEN` | GitHub Packages publish (`packages: write`) |

These are documented only — no secrets are stored in this repository.
