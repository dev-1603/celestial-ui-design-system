# Package Selection Guide

Which Celestial UI packages do you actually need? Use this quick decision guide to determine the minimum installation for your use case.

## Decision Guide

**"I only need design tokens."**
→ Install: `@celestial-ui/tokens`
- *Why?* 0 dependencies. You can use our JSON data, CSS variables, or Tailwind preset independently.

**"I need themes and modes (dark/light, tenant themes)."**
→ Install: `@celestial-ui/tokens`, `@celestial-ui/theme`
- *Why?* `@celestial-ui/theme` requires `@celestial-ui/tokens` to resolve design tokens for specific themes.

**"I need the CSS generated from tokens and themes."**
→ Install: `@celestial-ui/tokens`, `@celestial-ui/theme`, `@celestial-ui/styles`
- *Why?* `@celestial-ui/styles` depends on both `tokens` and `theme` to compile and deliver CSS to the browser or SSR environment.

**"I only need icons."**
→ Install: `@celestial-ui/icons`
- *Why?* 0 runtime dependencies. You only need to add an optional peer dependency for the specific icon provider you choose (e.g., `lucide-static`).

**"I am building a framework-independent UI/component system."**
→ Install: `@celestial-ui/core`
- *Why?* `@celestial-ui/core` has 0 runtime dependencies. It provides behavior, accessibility, and component contracts independent of any styling or framework.

**"I am building an in-house React (or Vue/Svelte) component library."**
→ Install: `@celestial-ui/core` + (Your React/Vue/Svelte dependencies)
- *Optional:* Add `tokens`, `theme`, `styles`, or `icons` if you want to use the Celestial design language. But `@celestial-ui/core` alone is sufficient for behavior and semantics.

**"I want to use official Celestial React components."**
→ Install: `@celestial-ui/react` (TARGET / FUTURE) + whatever its manifest requires.
- *Note:* Framework libraries are in development. 

**"I use another UI library (e.g., MUI, Ant Design) but want Celestial icons."**
→ Install: `@celestial-ui/icons`

**"I have my own design system but want Celestial behavioral contracts."**
→ Install: `@celestial-ui/core`

## Key Takeaways

1. **You do not need to install the entire foundation.**
2. **Core is independent.** It does not require `tokens`, `theme`, or `styles`.
3. **Icons are independent.** They do not require any other Celestial packages.
4. **Adopt incrementally.** You can start with `icons`, move to `tokens`, and later adopt `core` for your components as your needs grow.
