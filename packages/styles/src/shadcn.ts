import { buildScopeSelector } from './scope';
import type { AppearanceMode, ShadcnRegistry, StyleScope } from './types';

/**
 * shadcn generic variable mappings → stable Celestial semantic variables.
 * Core styles never emit these; this is an optional adapter.
 */
export const DEFAULT_SHADCN_REGISTRY: Readonly<ShadcnRegistry> = {
  '--background': 'var(--cui-background)',
  '--foreground': 'var(--cui-foreground)',
  '--card': 'var(--cui-surface)',
  '--card-foreground': 'var(--cui-foreground)',
  '--popover': 'var(--cui-surface-subtle)',
  '--popover-foreground': 'var(--cui-foreground)',
  '--primary': 'var(--cui-primary)',
  '--primary-foreground': 'var(--cui-primary-foreground)',
  '--secondary': 'var(--cui-secondary)',
  '--secondary-foreground': 'var(--cui-secondary-foreground)',
  '--muted': 'var(--cui-surface-subtle)',
  '--muted-foreground': 'var(--cui-muted-foreground)',
  '--accent': 'var(--cui-surface)',
  '--accent-foreground': 'var(--cui-foreground)',
  '--destructive': 'var(--cui-danger)',
  '--destructive-foreground': 'var(--cui-danger-foreground)',
  '--border': 'var(--cui-border)',
  '--input': 'var(--cui-border)',
  '--ring': 'var(--cui-focus-ring)',
  '--radius': 'var(--cui-radius-md)',
} as const;

export interface GenerateShadcnOptions {
  scope?: StyleScope;
  themeId?: string;
  mode?: AppearanceMode;
}

/**
 * Generate optional shadcn variable adapter CSS scoped to the active root.
 */
export function generateShadcnAdapter(
  registry: ShadcnRegistry = DEFAULT_SHADCN_REGISTRY,
  options: GenerateShadcnOptions = {},
): string {
  const scope = options.scope ?? { kind: 'document' };
  const themeId = options.themeId ?? 'celestial';
  const mode = options.mode ?? 'light';
  const selector = buildScopeSelector(scope, themeId, mode);

  const lines = ['/* Celestial shadcn adapter — @celestial-ui/styles/shadcn */'];
  const sorted = Object.entries(registry).sort(([a], [b]) => a.localeCompare(b));
  const decls = sorted.map(([shadcnVar, value]) => `  ${shadcnVar}: ${value};`).join('\n');
  lines.push(`${selector} {`);
  lines.push(decls);
  lines.push('}');
  return lines.join('\n') + '\n';
}
