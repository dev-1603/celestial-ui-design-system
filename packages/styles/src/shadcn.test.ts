import { describe, it, expect } from 'vitest';
import { generateShadcnAdapter, DEFAULT_SHADCN_REGISTRY } from './shadcn';

describe('shadcn adapter', () => {
  it('generates scoped generic variable mappings', () => {
    const css = generateShadcnAdapter();
    expect(css).toContain('--primary: var(--cui-primary);');
    expect(css).toContain('--background: var(--cui-background);');
    expect(css).toContain('data-cui-theme="celestial"');
  });

  it('maps to stable semantic variables not token paths', () => {
    const css = generateShadcnAdapter();
    expect(css).toContain('var(--cui-primary)');
    expect(css).not.toContain('action.primary.background');
  });

  it('supports sandbox scoping', () => {
    const css = generateShadcnAdapter(DEFAULT_SHADCN_REGISTRY, {
      scope: { kind: 'sandbox', id: 'preview' },
      themeId: 'acme',
      mode: 'dark',
    });
    expect(css).toContain('data-cui-sandbox="preview"');
    expect(css).toContain('data-cui-theme="acme"');
    expect(css).toContain('data-cui-mode="dark"');
  });

  it('includes all default registry entries', () => {
    const css = generateShadcnAdapter();
    for (const key of Object.keys(DEFAULT_SHADCN_REGISTRY)) {
      expect(css).toContain(key);
    }
  });
});
