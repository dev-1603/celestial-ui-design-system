# Build and Validation

Maintainer guide for building, testing, and validating Celestial UI packages before release.

## Build

```bash
# All packages (dependency order)
pnpm build

# Single package (with dependencies)
pnpm --filter @celestial-ui/styles... build

# Single package only
pnpm --filter @celestial-ui/core build
```

Turbo caches `dist/**` outputs. Clean with:

```bash
pnpm --filter @celestial-ui/tokens clean
pnpm build
```

## Test

```bash
pnpm test          # all packages
pnpm typecheck     # tsc --noEmit per package
pnpm lint          # currently tsc --noEmit (not ESLint)
pnpm format:check  # Prettier
pnpm shake:test    # gzip budgets + leak assertions (requires build)
```

Tests run after build (`turbo.json` `test.dependsOn: ["build"]`) because styles artifact tests require `dist/css`.

## Validation gate

```bash
pnpm validate
```

Runs:

1. Dependency graph validation
2. Changesets access check
3. Documentation validation
4. Pack + artifact inspection for all public packages
5. Writes `reports/validation.json` and `reports/validation.md`

Sub-commands:

```bash
pnpm validate:graph      # dependency graph only
pnpm validate:packages   # pack/artifact checks (requires build)
pnpm docs:validate       # documentation links and README coverage
```

## Pack inspection

```bash
pnpm package:pack
```

Packs all public packages to `artifacts/`. Each tarball is checked for:

- `LICENSE` and `README.md`
- No `workspace:*` protocol
- No `src/`, `*.test.ts`, `.turbo`
- All `exports` targets exist
- Tokens include `data/` for catalog APIs

## Consumer tests

Simulates external consumers installing packed tarballs (not workspace links):

```bash
pnpm consumer:test        # pnpm fixtures
pnpm consumer:test:npm    # npm fixtures
pnpm consumer:test:yarn   # Yarn Berry fixtures
pnpm consumer:test:bun    # same fixtures as pnpm/npm/yarn, installed with Bun
pnpm consumer:test:deno   # Deno best-effort (non-blocking)
pnpm consumer:test:portal # independent-repo pnpm link: (Yarn Berry portal: when available)
```

Fixtures live in `tooling/consumer-fixtures/fixtures/` (`foundation-node`, `core-node`, `icons-node`, `ssr-node`). All package managers run those same checks.

`consumer:test:portal` creates a temporary directory **outside** the workspace, depends on each package **directory** (not `dist/`, not `src/`), asserts `import.meta.resolve` lands in `dist/`, typechecks with TypeScript `moduleResolution: Node16`, and proves a foundation rebuild updates the consumer. Its pnpm `link:` check is required in CI and release. Yarn Berry `portal:`, npm `file:`, Yarn Classic `file:`, and Bun `file:` are attempted when those binaries exist; otherwise they are recorded as **NOT TESTED**. Production consumers still install packed tarballs.

## Dry-run publish

```bash
pnpm publish:dry-run
```

Runs `pnpm publish --dry-run` for each public package. **Does not publish.**

## CI

GitHub Actions CI runs format, lint, typecheck, tests, build, `pnpm shake:test`, pack/docs validation, packed-tarball consumers (pnpm, npm, Bun), and the required independent-repository pnpm `link:` check. See `.github/workflows/ci.yml`.

SonarQube Cloud analysis is a separate workflow (`.github/workflows/sonarqube.yml`) on the same branches. It needs `SONAR_TOKEN` and Automatic Analysis turned off.

Production publish is a separate workflow (`.github/workflows/release.yml`) on `release/**`. Its `validate` job rechecks the exact publish SHA with build, typecheck, tests, pack/docs inspection, tree-shaking budgets, pnpm and Bun tarball consumers, and the independent-repository pnpm `link:` baseline before OIDC publish. See [release.md](./release.md).

## Validation report

After `pnpm validate`, read:

- `reports/validation.md` — human-readable summary
- `reports/validation.json` — machine-readable findings

Overall status is `RELEASE_READY` only when no BLOCKER or REQUIRED findings remain.

## Frozen packages

See [frozen-packages.md](./frozen-packages.md). Validation must not require architectural changes to frozen packages.
