import type { TailwindBridgeRegistry } from './types';

/** Explicit Tailwind v4 `@theme inline` bridge mappings. */
export const DEFAULT_TAILWIND_BRIDGE: Readonly<TailwindBridgeRegistry> = {
  '--color-primary': 'var(--cui-primary)',
  '--color-primary-foreground': 'var(--cui-primary-foreground)',
  '--color-secondary': 'var(--cui-secondary)',
  '--color-secondary-foreground': 'var(--cui-secondary-foreground)',
  '--color-destructive': 'var(--cui-danger)',
  '--color-destructive-foreground': 'var(--cui-danger-foreground)',
  '--color-background': 'var(--cui-background)',
  '--color-foreground': 'var(--cui-foreground)',
  '--color-muted': 'var(--cui-surface-subtle)',
  '--color-muted-foreground': 'var(--cui-muted-foreground)',
  '--color-border': 'var(--cui-border)',
  '--color-ring': 'var(--cui-focus-ring)',
  '--color-surface': 'var(--cui-surface)',
  '--spacing-1': 'var(--cui-space-1)',
  '--spacing-2': 'var(--cui-space-2)',
  '--spacing-3': 'var(--cui-space-3)',
  '--spacing-4': 'var(--cui-space-4)',
  '--spacing-5': 'var(--cui-space-5)',
  '--spacing-6': 'var(--cui-space-6)',
  '--spacing-8': 'var(--cui-space-8)',
  '--spacing-10': 'var(--cui-space-10)',
  '--spacing-12': 'var(--cui-space-12)',
  '--spacing-16': 'var(--cui-space-16)',
  '--font-sans': 'var(--cui-fontFamily-sans)',
  '--font-mono': 'var(--cui-fontFamily-mono)',
  '--text-sm': 'var(--cui-fontSize-sm)',
  '--text-base': 'var(--cui-fontSize-base)',
  '--text-lg': 'var(--cui-fontSize-lg)',
  '--text-xl': 'var(--cui-fontSize-xl)',
  '--font-weight-normal': 'var(--cui-fontWeight-normal)',
  '--font-weight-medium': 'var(--cui-fontWeight-medium)',
  '--font-weight-semibold': 'var(--cui-fontWeight-semibold)',
  '--font-weight-bold': 'var(--cui-fontWeight-bold)',
  '--leading-tight': 'var(--cui-lineHeight-tight)',
  '--leading-normal': 'var(--cui-lineHeight-normal)',
  '--leading-relaxed': 'var(--cui-lineHeight-relaxed)',
  '--tracking-tight': 'var(--cui-letterSpacing-tight)',
  '--tracking-normal': 'var(--cui-letterSpacing-normal)',
  '--radius-sm': 'var(--cui-radius-sm)',
  '--radius-md': 'var(--cui-radius-md)',
  '--radius-lg': 'var(--cui-radius-lg)',
  '--radius-full': 'var(--cui-radius-full)',
  '--shadow-sm': 'var(--cui-shadow-sm)',
  '--shadow-md': 'var(--cui-shadow-md)',
  '--shadow-lg': 'var(--cui-shadow-lg)',
  '--shadow-none': 'var(--cui-shadow-none)',
  '--duration-fast': 'var(--cui-motion-duration-fast)',
  '--duration-normal': 'var(--cui-motion-duration-normal)',
  '--duration-slow': 'var(--cui-motion-duration-slow)',
  '--ease-default': 'var(--cui-motion-easing-standard)',
  '--ease-in': 'var(--cui-motion-easing-enter)',
  '--ease-out': 'var(--cui-motion-easing-exit)',
  '--breakpoint-sm': 'var(--cui-breakpoint-sm)',
  '--breakpoint-md': 'var(--cui-breakpoint-md)',
  '--breakpoint-lg': 'var(--cui-breakpoint-lg)',
  '--breakpoint-xl': 'var(--cui-breakpoint-xl)',
} as const;

/**
 * Generate Tailwind v4 `@theme inline` bridge CSS.
 * Maps Tailwind theme tokens to stable Celestial semantic/scale variables.
 */
export function generateTailwindBridge(
  registry: TailwindBridgeRegistry = DEFAULT_TAILWIND_BRIDGE,
): string {
  const lines = ['/* Celestial Tailwind v4 bridge — @celestial-ui/styles/tailwind */', '@theme inline {'];
  const sorted = Object.entries(registry).sort(([a], [b]) => a.localeCompare(b));
  for (const [twVar, cuiVar] of sorted) {
    lines.push(`  ${twVar}: ${cuiVar};`);
  }
  lines.push('}');
  return lines.join('\n') + '\n';
}
