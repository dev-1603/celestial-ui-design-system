import { describe, it, expect } from 'vitest';
import {
  generateCSS,
  generateTailwindPreset,
  generateTS,
  generateShadcnMapping,
} from './generators';
import { FlatTokenMap } from './resolve';

describe('Token Generators', () => {
  const mockTokens: FlatTokenMap = {
    'color.blue.500': { $type: 'color', $value: '#3B82F6' },
    'space.4': { $type: 'dimension', $value: '1rem' },
    'typography.heading': {
      $type: 'typography',
      $value: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '2rem',
        fontWeight: '700',
      },
    },
    'shadow.sm': {
      $type: 'shadow',
      $value: [
        { offsetX: '0px', offsetY: '1px', blur: '2px', spread: '0px', color: 'rgba(0,0,0,0.05)' },
      ],
    },
    'surface.canvas': { $type: 'color', $value: '#FFFFFF' },
  };

  it('should generate valid CSS variables, unrolling composite types', () => {
    const css = generateCSS(mockTokens);

    // Standard tokens
    expect(css).toContain('--cui-color-blue-500: #3B82F6;');
    expect(css).toContain('--cui-space-4: 1rem;');

    // Composite tokens unrolled
    expect(css).toContain('--cui-typography-heading-fontFamily: Inter, sans-serif;');
    expect(css).toContain('--cui-typography-heading-fontSize: 2rem;');
    expect(css).toContain('--cui-typography-heading-fontWeight: 700;');

    // Arrays flattened (shadows)
    expect(css).toContain('--cui-shadow-sm: 0px 1px 2px 0px rgba(0,0,0,0.05);');
  });

  it('should generate a Shadcn mapping CSS file', () => {
    const shadcnCss = generateShadcnMapping(mockTokens);

    // Maps standard celestial token to shadcn variable
    expect(shadcnCss).toContain('--background: var(--cui-surface-canvas);');
  });

  it('should generate a valid Tailwind preset object', () => {
    const preset = generateTailwindPreset(mockTokens);

    // It outputs raw js as string
    expect(preset).toContain('module.exports = {');
    expect(preset).toContain('theme: {');

    // Expect correct mapping
    expect(preset).toContain('"blue-500": "var(--cui-color-blue-500)"');
    expect(preset).toContain('"4": "var(--cui-space-4)"');
    expect(preset).toContain('"sm": "var(--cui-shadow-sm)"');
  });

  it('should generate TypeScript types and vars export', () => {
    const ts = generateTS(mockTokens);

    // Values
    expect(ts).toContain('"color.blue.500": "#3B82F6"');

    // CSS Vars map
    expect(ts).toContain('"color.blue.500": "var(--cui-color-blue-500)"');
    expect(ts).toContain(
      '"typography.heading-fontFamily": "var(--cui-typography-heading-fontFamily)"',
    );
  });
});
