# Releases

Production publishing for `@celestial-ui/*` runs only from `release/**` branches. Feature work still lands through CI; npm writes happen only after an approved Version Packages PR merges.

## Flow

1. Merge changesets into a `release/*` branch (each consumer-visible change needs a `.changeset/*.md` file).
2. Push to that branch (or dispatch the Release workflow). `changesets/action/select-mode` chooses:
   - **version** — pending changeset files exist. Opens or updates `chore: version packages` against the same `release/*` branch. Does not publish.
   - **publish** — no pending changeset files, and package versions are not yet on npm. Runs the validation gate, then publishes.
   - **none** — nothing to version or publish.
3. Review and merge the Version Packages PR. That merge is the only path that reaches npm.
4. The publish job uses GitHub Environment `npm` (required reviewers). It publishes to the npm registry with OIDC, then creates git tags and GitHub Releases.

`changeset status` in CI compares against `origin/develop` (Changesets `baseBranch`). The workflow fetches that remote-tracking ref before the check because `actions/checkout` only has the PR/push ref. Version PRs target `github.ref_name` (the triggering `release/*` branch).

The publish-mode `validate` job rechecks the exact publish SHA. It builds, typechecks, tests, validates packed artifacts and documentation, enforces tree-shaking budgets, runs pnpm and Bun packed-tarball consumers, and verifies independent-repository pnpm `link:` consumption. This protects manual dispatches and avoids relying on a separate CI run.

## Packages that publish

Only the five public foundation packages:

- `@celestial-ui/tokens`
- `@celestial-ui/theme`
- `@celestial-ui/styles`
- `@celestial-ui/icons`
- `@celestial-ui/core`

Private tooling (`package-validate`, shared configs, `tree-shaking-test`) is listed in Changesets `ignore` and is never versioned or published.

## Manual setup (required before the first publish)

These cannot live in git. Complete them once, then keep them in sync if the repository moves.

### GitHub repository

1. **Actions → General:** enable **Allow GitHub Actions to create and approve pull requests** (needed for the Version Packages PR).
2. **Settings → Secrets and variables → Actions:** add `SONAR_TOKEN` (SonarQube Cloud account token). Then in SonarCloud, **Administration → Analysis Method**, turn **off Automatic Analysis** so CI analysis can run.
3. **Settings → Environments → `npm`:**
   - Required reviewers
   - Deployment branches: `release/**` only
4. Branch protection on `release/**` should still require CI to pass before merging the Version Packages PR.

### npm Trusted Publisher

For each public package (or when creating the `@celestial-ui` scope):

| Field                | Value                                         |
| -------------------- | --------------------------------------------- |
| Organization or user | `dev-1603`                                    |
| Repository           | `celestial-ui-design-system`                  |
| Workflow filename    | `release.yml` (filename only, case-sensitive) |
| Environment          | `npm`                                         |
| Allowed action       | `npm publish`                                 |

Trusted Publishing needs npm CLI **≥ 11.5.1** and Node **≥ 22.14** on the publisher (the workflow pins both). No `NPM_TOKEN` is used.

An npm 2FA maintainer must own the `@celestial-ui` scope. After the first successful OIDC publish, restrict token publishing on the package (Require 2FA and disallow tokens) so only this workflow can publish.

### Provenance

Public packages from this public repository get provenance automatically on OIDC publish. Each public `package.json` `repository.url` must remain `git+https://github.com/dev-1603/celestial-ui-design-system.git`. If the GitHub owner changes, update those fields and the Trusted Publisher repository in the same change.

## Local checks (no registry write)

```bash
pnpm validate
pnpm publish:dry-run
```

`pnpm publish:dry-run` packs the five public packages only. It does not authenticate to npm.

## GitHub Packages

Not used. See [registries.md](./registries.md).
