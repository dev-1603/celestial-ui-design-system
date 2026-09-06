# Frozen Foundation Packages

The following packages are **architecturally finalized**. Changes to their `src/` implementation require explicit justification in pull requests.

| Package                | Path                                  | Status |
| ---------------------- | ------------------------------------- | ------ |
| `@celestial-ui/tokens` | [packages/tokens](../packages/tokens) | Frozen |
| `@celestial-ui/theme`  | [packages/theme](../packages/theme)   | Frozen |
| `@celestial-ui/styles` | [packages/styles](../packages/styles) | Frozen |
| `@celestial-ui/icons`  | [packages/icons](../packages/icons)   | Frozen |
| `@celestial-ui/core`   | [packages/core](../packages/core)     | Frozen |

## Allowed changes without architecture review

- `package.json` packaging metadata (`files`, `publishConfig`, `exports`, scripts)
- `LICENSE`, `README.md`, and documentation links
- Test files (`*.test.ts`) that strengthen release gates
- Build/release tooling that does not change runtime behavior

## Forbidden without architecture review

- Adding React, Vue, Svelte, or i18n engine dependencies to Core
- Moving framework rendering into Core
- Duplicating token catalogs outside `@celestial-ui/tokens`
- Changing theme resolution boundaries (theme must not own CSS delivery)
- Changing icon sanitization boundary (sanitization stays in framework adapters)

## Dependency rules

```text
tokens → theme → styles
icons (independent)
core (independent, zero @celestial-ui runtime deps)
```

Validation enforces this graph in `pnpm validate:graph`.
