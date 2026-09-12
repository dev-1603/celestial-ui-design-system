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
```

Fixtures live in `tooling/consumer-fixtures/fixtures/` (`foundation-node`, `core-node`, `icons-node`, `ssr-node`). All package managers run those same checks.

## Dry-run publish

```bash
pnpm publish:dry-run
```

Runs `pnpm publish --dry-run` for each public package. **Does not publish.**

## CI

GitHub Actions runs the full gate on push/PR. After `pnpm build` it runs `pnpm shake:test` (gzip budgets and leak assertions via package exports). See `.github/workflows/ci.yml`.

## Validation report

After `pnpm validate`, read:

- `reports/validation.md` — human-readable summary
- `reports/validation.json` — machine-readable findings

Overall status is `RELEASE_READY` only when no BLOCKER or REQUIRED findings remain.

## Frozen packages

See [frozen-packages.md](./frozen-packages.md). Validation must not require architectural changes to frozen packages.
