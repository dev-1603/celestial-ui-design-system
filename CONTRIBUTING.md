# Contributing to Celestial UI

Thank you for contributing to the Celestial UI Design System! This document outlines our branch model, PR workflow, and validation expectations.

## 1. Branch Model

We follow a structured branching model to maintain stability:

- **`master`**: The canonical stable/released branch. No direct development occurs here.
- **`develop`**: The ongoing integration/development branch. All feature PRs merge here.
- **`release/x.y`**: Temporary stabilization branches (e.g., `release/1.0`).
- **`feat/*`, `fix/*`, `refactor/*`, `docs/*`, `chore/*`**: Short-lived topic branches for all ongoing work.

### Branch Rules

- `feat/*` → `develop`
- `fix/*` → `develop`
- `refactor/*` → `develop`
- `docs/*` → `develop`
- `chore/*` → `develop`

> [!WARNING]
> Do **NOT** perform direct feature development on `master` or `release/x.y`.

## 2. PR Workflow

1. Create a topic branch (e.g., `feat/my-new-component`) off `develop`.
2. Implement your changes.
3. Open a Pull Request targeting `develop`.
4. Ensure all CI checks pass.
5. Obtain approval from a CODEOWNER.
6. Merge (squash) into `develop`.

## 3. Required Validation

Our CI enforces a rigorous validation matrix. Before merging, your branch must pass:

- Installation, formatting, linting, and typechecking
- Unit Tests (`pnpm test` builds via Turbo)
- Package and Graph Validation
- Tree-shaking budgets
- Packed-tarball consumer tests (pnpm, npm, Bun)
- Independent-repository pnpm `link:` validation (`pnpm consumer:test:portal`)

Yarn Berry `portal:` and other local-directory package-manager checks are optional parts of `consumer:test:portal`; pnpm `link:` is the required CI and release baseline.

## 4. Changeset Expectations

Public package changes require an appropriate Changeset to trigger the release pipeline.

Run `pnpm changeset` and commit the generated Markdown file along with your PR.

### Exceptions

Changesets are **not** required for:

- Documentation-only changes
- CI-only changes
- Repository tooling-only changes
- Non-published private packages

## 5. Development Workflow

- Run `pnpm install`
- Run `pnpm build`
- Run `pnpm test`
- Run `pnpm validate` to check the packages locally.

## 6. Hotfix Workflow

If a critical fix is needed for a published release:

1. Create a `fix/*` branch.
2. Fix the issue.
3. Follow the rollback/patch policy (do not unpublish broken versions; release a new patch).
4. Merge through standard release processes or backport to `develop`.

## 7. Commit Expectations

We follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`). Ensure your commit messages clearly explain the "why" and "what" of your changes.
