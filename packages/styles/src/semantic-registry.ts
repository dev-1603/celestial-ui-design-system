import { SEMANTIC_CSS_API_VERSION } from './types';

/**
 * Stable semantic CSS API registry (SEMANTIC_CSS_API_VERSION).
 *
 * Aliases are the public developer-facing contract. Values are canonical
 * token paths on ResolvedTheme. When an alias equals `--cui-{token-path}`
 * (identity mapping), the compiler keeps the resolved value rather than
 * emitting a circular `var()` self-reference.
 *
 * `--cui-{token-path}` compatibility variables are generated separately and
 * are not a stable public API.
 */
export const SEMANTIC_CSS_REGISTRY: Readonly<Record<string, string>> = {
  '--cui-primary': 'action.primary.background',
  '--cui-primary-hover': 'action.primary.hover',
  '--cui-primary-active': 'action.primary.active',
  '--cui-primary-foreground': 'action.primary.text',
  '--cui-secondary': 'action.secondary.background',
  '--cui-secondary-hover': 'action.secondary.hover',
  '--cui-secondary-active': 'action.secondary.active',
  '--cui-secondary-foreground': 'action.secondary.text',
  '--cui-danger': 'action.danger.background',
  '--cui-danger-hover': 'action.danger.hover',
  '--cui-danger-active': 'action.danger.active',
  '--cui-danger-foreground': 'action.danger.text',
  '--cui-background': 'surface.canvas',
  '--cui-foreground': 'text.primary',
  '--cui-surface': 'surface.elevated',
  '--cui-surface-subtle': 'surface.subtle',
  '--cui-surface-inverse': 'surface.inverse',
  '--cui-muted-foreground': 'text.muted',
  '--cui-border': 'border.default',
  '--cui-border-strong': 'border.strong',
  '--cui-focus-ring': 'focus.color',
  '--cui-radius-md': 'radius.md',
} as const;

export { SEMANTIC_CSS_API_VERSION };

export function getSemanticRegistryEntries(): ReadonlyArray<readonly [string, string]> {
  return Object.entries(SEMANTIC_CSS_REGISTRY).sort(([a], [b]) => a.localeCompare(b));
}

export function validateSemanticRegistry(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const [alias, path] of Object.entries(SEMANTIC_CSS_REGISTRY)) {
    if (!alias.startsWith('--cui-')) {
      errors.push(`Semantic alias must start with --cui-: ${alias}`);
    }
    if (seen.has(alias)) {
      errors.push(`Duplicate semantic alias: ${alias}`);
    }
    seen.add(alias);
    if (!path || path.includes(' ')) {
      errors.push(`Invalid token path for ${alias}: ${path}`);
    }
  }
  return errors;
}
