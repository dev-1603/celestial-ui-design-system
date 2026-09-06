# Package Combination Matrix

Celestial UI is designed to be highly composable. You can use individual packages independently, combine a subset of the foundation, or use the entire ecosystem together. 

This matrix outlines the supported combinations, minimum required packages, and optional enhancements.

## Scenario Matrix

| Scenario | Minimum Package Set | Optional Packages | Notes |
|---------|---------------------|--------------------|------|
| **Token-only app** | `@celestial-ui/tokens` | — | Use CSS variables or JSON data in any app without other packages. |
| **Theme system** | `@celestial-ui/tokens`, `@celestial-ui/theme` | — | Manage theme identity and modes (e.g., dark/light). `theme` requires `tokens`. |
| **CSS system** | `@celestial-ui/tokens`, `@celestial-ui/theme`, `@celestial-ui/styles` | — | Compiles themes to CSS. `styles` requires both `theme` and `tokens`. |
| **Icon-only use** | `@celestial-ui/icons` | Icon provider (e.g., `lucide-static`) | Completely standalone. Provider is an optional peer dependency. |
| **In-house UI library** | `@celestial-ui/core` | `tokens`, `theme`, `styles`, `icons` | Core provides standalone behavioral contracts. Bring your own framework (React/Vue/Svelte). |
| **Existing React app** | `@celestial-ui/core` | Full Foundation | Use Core directly to strengthen internal components. |
| **Existing Vue app** | `@celestial-ui/core` | Full Foundation | Use Core directly to strengthen internal components. |
| **Existing Svelte app** | `@celestial-ui/core` | Full Foundation | Use Core directly to strengthen internal components. |
| **Complete Celestial Foundation** | All five packages | — | The full framework-agnostic foundation. Core and Icons remain architecturally independent. |
| **Official React Library** | `@celestial-ui/react` *(TARGET / FUTURE)* | Full Foundation | Will provide pre-built components using the foundation. |
| **Official Vue Library** | `@celestial-ui/vue` *(TARGET / FUTURE)* | Full Foundation | Will provide pre-built components using the foundation. |
| **Official Svelte Library** | `@celestial-ui/svelte` *(TARGET / FUTURE)* | Full Foundation | Will provide pre-built components using the foundation. |

## Detailed Combination Support

| Combination | Status | Reason / Explanation |
|-------------|--------|----------------------|
| `core` only | **SUPPORTED** | 0 runtime dependencies. Exposes framework-agnostic component contracts and behavior. |
| `tokens` only | **SUPPORTED** | 0 runtime dependencies. Exposes raw data, CSS vars, and Tailwind presets. |
| `theme` only | **NOT SUPPORTED** | Requires `@celestial-ui/tokens` to resolve design tokens for theme modes. |
| `styles` only | **NOT SUPPORTED** | Requires both `theme` and `tokens` to compile and manage CSS. |
| `icons` only | **SUPPORTED** | 0 runtime dependencies (optional peer dependencies based on chosen provider). |
| `tokens` + `theme` | **SUPPORTED** | Valid subset for managing themes without the `styles` compiler. |
| `tokens` + `styles` | **NOT SUPPORTED** | `styles` also requires `theme`. |
| `theme` + `styles` | **INDIRECT / TRANSITIVE** | Also requires `tokens` as a dependency. |
| `tokens` + `theme` + `styles` | **SUPPORTED** | The complete design system rendering pipeline. |
| `core` + `tokens` | **SUPPORTED** | Combine independent contracts with raw tokens. No direct dependency between them. |
| `core` + `styles` | **INDIRECT / TRANSITIVE** | Requires `theme` and `tokens` for `styles` to function. |
| `core` + `icons` | **SUPPORTED** | Combine independent contracts with icons. No direct dependency between them. |
| `core` + `tokens` + `theme` + `styles` | **SUPPORTED** | Core provides behavior; tokens/theme/styles provide visual design. |
| Complete five-package foundation | **SUPPORTED** | The full framework-agnostic stack. |
| Foundation + React | **FUTURE / TARGET** | `@celestial-ui/react` is a future target layer built on the foundation. |
| Foundation + Vue | **FUTURE / TARGET** | `@celestial-ui/vue` is a future target layer built on the foundation. |
| Foundation + Svelte | **FUTURE / TARGET** | `@celestial-ui/svelte` is a future target layer built on the foundation. |
| `core` + in-house React component library | **SUPPORTED** | Core acts as the foundational contract and behavior layer for your custom React components. |
| `core` + unrelated/third-party component library | **SUPPORTED** | Core contracts can be used alongside other component libraries for standardization. |

## The Most Important Rule

**The five packages form a coherent design-system foundation, but no package should be described as mandatory unless the real dependency graph requires it.**

- `@celestial-ui/core` is independent.
- `@celestial-ui/icons` is independent.
- `@celestial-ui/tokens` is independent.
- `@celestial-ui/theme` depends on `tokens`.
- `@celestial-ui/styles` depends on `theme` and `tokens`.
