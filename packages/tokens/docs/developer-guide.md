# Celestial UI Tokens: Developer Guide

Welcome to the `@celestial-ui/tokens` package. This document is a comprehensive guide for developers consuming the design tokens in the Celestial UI ecosystem. It explains the structure of the tokens, the formats available for consumption, and how to use them effectively across your frontend applications.

## 1. Core Concepts & Taxonomy

Our design token system is strictly separated into **four layers** to enforce consistency, maintainability, and accessibility.

| Layer | Purpose | Examples | Allowed References |
|-------|---------|----------|--------------------|
| **0. Primitive** | Absolute base values (hex codes, rems, ms). No semantic meaning. | `color.blue.500`, `space.4`, `fontFamily.sans` | None (raw values only) |
| **1. Foundation** | Scalable fundamentals (radii, shadows, z-index, opacities). | `radius.md`, `shadow.sm`, `z.dropdown` | Primitives (L0) |
| **2. Semantic** | Context-aware design decisions linked to brand identity (Themes) and context (Modes). | `surface.canvas`, `text.muted`, `action.primary.background` | Foundations (L1), Primitives (L0) |
| **3. Component** | Extremely scoped design decisions specific to a single UI component. | `button.primary.background`, `input.paddingX` | Semantics (L2), Foundations (L1) |

*Rule of Thumb: Never use Primitives directly in your application code. Always use Semantics or Components.*

---

## 2. Themes vs. Modes

The Celestial Design System strictly distinguishes between **Themes** (brand identity) and **Modes** (appearance contexts like light or dark).

- **Theme**: "Celestial"
- **Modes**: "Light", "Dark"

When you use a semantic token like `surface.canvas`, the build system automatically resolves what that means in both Light and Dark modes. As a developer, you only ever reference `surface.canvas`, and the underlying CSS handles the switch.

---

## 3. How to Consume Tokens

The tokens are automatically built into multiple formats. Choose the integration that matches your stack.

**Application:** import CSS (or `@celestial-ui/styles/css`) once in the product shell.

**Component library:** style components with semantic variables such as `var(--cui-surface-elevated)`. Do not import the token catalog or resolve themes inside `CButton` / `CCard`.

Published import paths (prefer these over `/dist/...`):

```css
@import '@celestial-ui/tokens/css';
@import '@celestial-ui/tokens/shadcn';
```

```js
require('@celestial-ui/tokens/tailwind');
```

New apps should prefer `@celestial-ui/styles/css` and `@celestial-ui/styles/tailwind` (v4). See the [package README](../README.md) for application and component-library examples.

### Option A: CSS Variables (Recommended)

All tokens are exported as standard CSS variables prefixed with `--cui-`. 

- **Base values** (Primitives & Foundations) are defined in the `:root` scope.
- **Semantic values** (Light mode) are defined in `:root` and `.light` scopes.
- **Semantic values** (Dark mode) are defined in the `.dark` scope.

**Importing:**
```css
/* Import in your global CSS */
@import '@celestial-ui/tokens/dist/css/tokens.css';
```

**Usage:**
```css
.my-card {
  /* GOOD: Using semantic tokens */
  background-color: var(--cui-surface-elevated);
  color: var(--cui-text-primary);
  border-radius: var(--cui-radius-md);
  padding: var(--cui-space-4);
  
  /* BAD: Do not use primitive tokens directly */
  /* background-color: var(--cui-color-gray-900); */
}
```

### Option B: Tailwind CSS

We provide a complete Tailwind preset that automatically maps the token taxonomy to Tailwind's utility classes.

**Configuration (`tailwind.config.js`):**
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [
    require('@celestial-ui/tokens/dist/tailwind.preset.js')
  ],
  // ...
};
```

**Usage:**
- **Colors**: `bg-surface-canvas`, `text-text-muted`, `bg-action-primary-background`
- **Spacing**: `p-space-4`, `gap-space-2` (mapped to `space.4`, `space.2`)
- **Radius**: `rounded-radius-md`
- **Shadows**: `shadow-shadow-sm`
- **Typography**: `font-fontFamily-sans`, `text-fontSize-base`

*Note: Since the preset maps to CSS variables, Tailwind's `dark:` modifier is **not needed** for colors. Simply write `bg-surface-canvas`, and it will automatically adapt when `.dark` is applied to your HTML.*

### Option C: Shadcn UI / Radix

If you are using `shadcn/ui`, we provide a mapped stylesheet that automatically wires Celestial's semantic tokens to Shadcn's expected CSS variables (e.g., `--background`, `--card`, `--primary`).

**Importing:**
```css
/* Import alongside your base tokens */
@import '@celestial-ui/tokens/dist/css/tokens.css';
@import '@celestial-ui/tokens/dist/css/shadcn-mapping.css';
```

With this included, Shadcn components will natively inherit Celestial's design language.

### Option D: TypeScript / JavaScript

If you need token values in JS (e.g., for charting libraries, canvas drawing, or CSS-in-JS), you can import the resolved dictionary.

```typescript
import { tokens, cssVars } from '@celestial-ui/tokens/dist/resolved';

// Getting the raw CSS variable name string
console.log(cssVars['surface.canvas']); // "var(--cui-surface-canvas)"

// Getting the raw hex/pixel value (Note: This is strictly the Light mode value)
console.log(tokens['surface.canvas']); // "#FFFFFF"
```

---

## 4. Understanding Composite Tokens

Some tokens define multiple properties at once (like Typography or complex Shadows). 

When generating CSS, composite tokens are automatically "unrolled". 
For example, if we add a `typography.heading` token, it will generate:
- `var(--cui-typography-heading-fontFamily)`
- `var(--cui-typography-heading-fontSize)`
- `var(--cui-typography-heading-fontWeight)`

---

## 5. Token Reference Guide

Here is a quick lookup for the most commonly used Semantic and Foundation tokens.

### Surfaces (Backgrounds)
Used for container backgrounds.
- `surface.canvas`: The main app background.
- `surface.elevated`: Cards, modals, dropdowns.
- `surface.subtle`: Secondary sections, table headers, distinct regions.
- `surface.inverse`: Dark surfaces in light mode (e.g., tooltips, toasts).

### Text (Foregrounds)
Used for typography color.
- `text.primary`: Standard reading text.
- `text.secondary`: Slightly less prominent text (metadata, subtitles).
- `text.muted`: Disabled text, placeholders.
- `text.inverse`: Text sitting on top of `surface.inverse` or `action.primary`.

### Actions (Buttons, Links, Interactive Elements)
- `action.primary.background` / `hover` / `active` / `text`
- `action.secondary.background` / `hover` / `active` / `text`
- `action.danger.background` / `hover` / `active` / `text`

### Statuses
- `status.success`: Positive feedback, success states.
- `status.warning`: Warnings, caution states.
- `status.error`: Failures, destructive actions.
- `status.info`: Neutral information.

### Borders
- `border.default`: Standard dividers and input outlines.
- `border.strong`: Hover states for inputs, darker dividers.

### Foundations (Spacing & Radius)
- **Spacing**: `space.1` through `space.12`. Use for padding, margins, and gaps.
- **Radius**: `radius.sm`, `radius.md` (default for inputs/buttons), `radius.lg` (modals), `radius.full` (pills/avatars).

---

## 6. Accessibility Guarantee (WCAG 2.2 AA)

You can confidently use Semantic tokens without worrying about color contrast. 

The build pipeline enforces mathematical checks during compilation. If a foreground color (e.g., `text.muted`) does not meet a `4.5:1` contrast ratio against its designated background (e.g., `surface.canvas`), the token build will **fail**. Alpha transparency (`rgba`) is accurately composited during this check.

By exclusively using Semantic tokens, you guarantee your UI remains accessible in both Light and Dark modes.
