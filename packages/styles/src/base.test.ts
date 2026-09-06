import { describe, it, expect } from 'vitest';
import { generateBaseCss } from './base';

describe('base css', () => {
  it('generates color-scheme and focus-visible rules', () => {
    const css = generateBaseCss();
    expect(css).toContain('color-scheme: light');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('var(--cui-focus-ring)');
  });

  it('includes reduced-motion overrides', () => {
    const css = generateBaseCss();
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('--cui-motion-duration-fast: 0.01ms');
  });

  it('includes forced-colors overrides', () => {
    const css = generateBaseCss();
    expect(css).toContain('forced-colors: active');
    expect(css).toContain('--cui-focus-ring: Highlight');
  });

  it('scopes to sandbox when requested', () => {
    const css = generateBaseCss({
      scope: { kind: 'sandbox', id: 'preview' },
      themeId: 'acme',
      mode: 'dark',
    });
    expect(css).toContain('data-cui-sandbox="preview"');
    expect(css).toContain('color-scheme: dark');
  });
});
