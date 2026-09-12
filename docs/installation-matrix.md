# Installation Matrix

This document provides the exact package manager commands needed for various valid consumption patterns of the Celestial UI Foundation.

Celestial is highly composable. You only need to install the packages you actually intend to use.

---

## Standalone Packages

### Core Only

For framework-independent behavioral contracts and accessibility:

```bash
pnpm add @celestial-ui/core
```

- **Dependencies Installed:** `core` (0 runtime dependencies)

### Icons Only

For provider-neutral icons in any application:

```bash
pnpm add @celestial-ui/icons
```

- **Dependencies Installed:** `icons` (0 runtime dependencies)
- **Optional Peers:** Install the provider of your choice (e.g., `pnpm add lucide-static`)

### Bun

```bash
bun add @celestial-ui/core
bun add @celestial-ui/icons
bun add @celestial-ui/tokens
bun add @celestial-ui/tokens @celestial-ui/theme
bun add @celestial-ui/tokens @celestial-ui/theme @celestial-ui/styles
```

Verified with Bun **1.1.20** packed-tarball consumer fixtures (`pnpm consumer:test:bun`).

---

## Tokens import strategy

Prefer subpaths. Root `@celestial-ui/tokens` (including `getCanonicalTokenSources`) remains supported in 0.1.x.

**Browser-preferred**

```ts
import '@celestial-ui/tokens/css';
import { flattenTokens } from '@celestial-ui/tokens/resolve';
import type { TokenConfig } from '@celestial-ui/tokens/types';
import { meetsContrastAA } from '@celestial-ui/tokens/a11y';
import { validateTokens } from '@celestial-ui/tokens/validation';
```

**Node-preferred** (also available from `.`)

```ts
import { getCanonicalTokenSources } from '@celestial-ui/tokens/catalog';
import { generateCSS } from '@celestial-ui/tokens/generators';
```

There is no `import { colors, spacing } from '@celestial-ui/tokens'` JS domain. Use CSS variables or resolved `FlatTokenMap` keys.

---

## Foundation Subsets

### Tokens + Theme

For managing theme identity and modes:

```bash
pnpm add @celestial-ui/tokens @celestial-ui/theme
```

- **Dependencies Installed:** `tokens`, `theme`

### Complete Design/CSS Pipeline (Tokens + Theme + Styles)

To compile and deliver CSS based on tokens and themes:

```bash
pnpm add @celestial-ui/tokens @celestial-ui/theme @celestial-ui/styles
```

- **Dependencies Installed:** `tokens`, `theme`, `styles`
- **Note:** `styles` transitively requires `theme` and `tokens`, but it is best practice to install them explicitly if you interact with their APIs directly.

---

## Advanced Combinations

### In-house Component Library Foundation

If you are building an in-house React/Vue/Svelte component library and want the behavioral contracts and the full design styling pipeline:

```bash
pnpm add @celestial-ui/core @celestial-ui/tokens @celestial-ui/theme @celestial-ui/styles @celestial-ui/icons
```

- **Dependencies Installed:** All five foundation packages.
- **Note:** You can omit `tokens`, `theme`, and `styles` if you only want the `core` behavior contracts and `icons`.

---

## Complete Celestial Ecosystem (Target / Future)

The official framework component libraries are currently under development. When released, they will form the final layer of the ecosystem.

### React (TARGET / FUTURE)

```bash
# FUTURE COMMAND - Do not run yet
pnpm add @celestial-ui/react
```

- Will automatically install required foundation dependencies as defined by its future manifest.

### Vue (TARGET / FUTURE)

```bash
# FUTURE COMMAND - Do not run yet
pnpm add @celestial-ui/vue
```

- Will automatically install required foundation dependencies as defined by its future manifest.

### Svelte (TARGET / FUTURE)

```bash
# FUTURE COMMAND - Do not run yet
pnpm add @celestial-ui/svelte
```

- Will automatically install required foundation dependencies as defined by its future manifest.
