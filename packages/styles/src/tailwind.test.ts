import { describe, it, expect } from 'vitest';
import { generateTailwindBridge, DEFAULT_TAILWIND_BRIDGE } from './tailwind';
import { compileResolvedTheme } from './compiler';
import { resolveCelestialLight } from './test/fixtures';

describe('tailwind bridge', () => {
  it('generates @theme inline block', () => {
    const css = generateTailwindBridge();
    expect(css).toContain('@theme inline {');
    expect(css).toContain('--color-primary: var(--cui-primary);');
    expect(css).toContain('--spacing-4: var(--cui-space-4);');
    expect(css).toContain('--radius-md: var(--cui-radius-md);');
  });

  it('is deterministic', () => {
    expect(generateTailwindBridge()).toBe(generateTailwindBridge());
  });

  it('maps colors to semantic variables not raw token paths', () => {
    const css = generateTailwindBridge();
    expect(css).toContain('var(--cui-primary)');
    expect(css).not.toContain('action.primary.background');
  });

  it('maps Tailwind theme keys to variables that exist on a compiled celestial theme', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    for (const cuiRef of Object.values(DEFAULT_TAILWIND_BRIDGE)) {
      const match = cuiRef.match(/^var\((--cui-[a-zA-Z0-9-]+)\)$/);
      expect(match).not.toBeNull();
      expect(compiled.variables[match![1]]).toBeDefined();
    }
  });
});
