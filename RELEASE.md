# Release Guide

This document outlines the entire release lifecycle, branch policies, versioning strategies, and tagging for the Celestial UI Design System.

## 1. Release Lifecycle

The release process follows a highly structured, branch-based stabilization workflow:

1. **`develop`**: All features and fixes are continuously integrated into `develop`.
2. **Cut `release/x.y`**: When it is time for a release, cut a release branch (e.g., `release/1.0`) from `develop`.
3. **Freeze Feature Work**: The release branch only accepts stabilization fixes, documentation updates, and release metadata. No new features.
4. **Release Validation**: CI runs a full validation matrix on the release branch.
5. **Changesets Version**: The release engineer runs `pnpm changeset version` on the release branch to consume pending changesets and generate version bumps and changelogs.
6. **Pack and Validate**: Packages are packed locally and verified against consumer integration tests.
7. **Publish via CI**: The release workflow (`.github/workflows/release.yml`) is manually triggered against the release branch. CI publishes the selected public packages.
8. **Tag Published Packages**: Package-scoped Git tags are created mapping exactly to the published versions.
9. **Merge `release/x.y` → `master`**: The stable code is merged into the canonical `master` branch.
10. **Merge `release/x.y` → `develop`**: The changes (including changelogs and version bumps) are backported to `develop`.
11. **Delete `release/x.y`**: The temporary release branch is deleted unless it is explicitly retained as an LTS maintenance branch.

## 2. Release Branch Policy

- **Naming Convention**: `release/x.y` (e.g., `release/1.0`, `release/2.0`).
- **Do NOT** use `release` as a permanent branch.
- **Allowed Changes**: Release blockers, compatibility fixes, documentation, version/changelog generation.
- **Forbidden Changes**: Unrelated new features or major refactoring.

## 3. Independent Package Release Policy

Celestial UI uses **INDEPENDENT package versioning**.
Packages are not kept in lockstep.

The release process correctly manages dependent bumps. For example, if `@celestial-ui/tokens` is unchanged but `@celestial-ui/core` is updated, only `@celestial-ui/core` will be published and bumped. However, dependent packages may receive patch bumps if their dependencies change, preserving the actual architectural relationships (e.g., `tokens → theme → styles`).

## 4. Tagging Strategy

We use **package-scoped tags**. Release tags must map exactly to the published packages.

**Format**: `[package-name]@[version]`

- Example: `@celestial-ui/core@1.0.0`
- Example: `@celestial-ui/icons@1.0.0`

**Do NOT** use a single monorepo tag (e.g., `v1.0.0`) as packages are versioned independently. Tags are immutable references to published commits.

## 5. Hotfix Handling and Rollback

### Rollback Strategy

**npm package rollback must NOT depend on unpublishing.**
Unpublishing breaks the ecosystem. If a release is fundamentally broken:

1. Acknowledge the broken release.
2. Fix the issue on a branch.
3. Publish a **new patch version** (e.g., `1.0.1`).

### Hotfix Workflow

1. Cut a `fix/*` branch from `master` (or the relevant maintenance branch).
2. Fix the issue.
3. Validate and apply a changeset.
4. Merge, version, publish, and tag.
5. Backport the fix to `develop`.
