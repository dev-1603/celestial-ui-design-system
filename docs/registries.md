# Registry Configuration

Celestial UI foundation packages publish to the **npm Registry** only.

```bash
npm install @celestial-ui/core
# or
pnpm add @celestial-ui/core
```

Scoped packages use `publishConfig.access: public`. Install needs no extra `.npmrc` for public npm.

## GitHub Releases

After a successful npm publish, the Release workflow creates package-scoped git tags and GitHub Releases. Those releases are the source of version history and changelogs in this repository. They are not an alternate install registry.

## GitHub Packages (deferred)

GitHub Packages is **not** a live install path. The npm scope is `@celestial-ui`, and this repository currently lives under GitHub user `dev-1603`. `GITHUB_TOKEN` cannot publish `@celestial-ui/*` into a mismatched GitHub namespace.

Revisit GitHub Packages only after a GitHub owner matches `@celestial-ui` (or after a conscious, breaking npm scope rename). Do not configure consumer `.npmrc` files to `https://npm.pkg.github.com` for these packages.

## Maintainer publishing

Publishing is automated from `release/**` via npm Trusted Publishing (OIDC). There is no `NPM_TOKEN`. See [release.md](./release.md) for the Version Packages PR flow, GitHub Environment `npm`, and Trusted Publisher fields.

Do not publish production versions from a laptop. Use Changesets on a `release/*` branch.

## Validation

| Stage           | What is validated                                                                   |
| --------------- | ----------------------------------------------------------------------------------- |
| **Local**       | `publishConfig.access: public`, Changesets `access: public`, `pnpm publish:dry-run` |
| **CI**          | Format, lint, tests, pack, docs, tree-shaking, consumer fixtures                    |
| **Pre-publish** | Release workflow `validate` job (same gate) before OIDC publish                     |
| **Production**  | `changeset publish` to npm with provenance; GitHub Releases for tags and changelogs |
