import { describe, it, expect } from 'vitest';
import { flattenTokens, resolveAliases } from './resolve';
import { validateTokens } from './validation';
import { TokenConfig } from './types';

describe('Token Validation & Resolution', () => {
  it('should detect circular references', () => {
    const config: TokenConfig = {
      color: {
        a: {
          $type: 'color',
          $value: '{color.b}',
          $extensions: { celestial: { layer: 'primitive' } },
        },
        b: {
          $type: 'color',
          $value: '{color.a}',
          $extensions: { celestial: { layer: 'primitive' } },
        },
      },
    };

    const report = validateTokens(config);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('Circular reference detected');
  });

  it('should detect layer violations', () => {
    const config: TokenConfig = {
      action: {
        primary: {
          $type: 'color',
          $value: '#000000',
          $extensions: { celestial: { layer: 'semantic' } },
        },
      },
      color: {
        // A primitive referencing a semantic token (L0 referencing L2) -> Violation
        bad_primitive: {
          $type: 'color',
          $value: '{action.primary}',
          $extensions: { celestial: { layer: 'primitive' } },
        },
      },
    };

    const report = validateTokens(config);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('Layer violation');
  });

  it('should catch missing references', () => {
    const config: TokenConfig = {
      action: {
        primary: { $type: 'color', $value: '{color.does.not.exist}' },
      },
    };

    const report = validateTokens(config);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('Broken reference');
  });

  it('should validate contrast metadata pairs', () => {
    const config: TokenConfig = {
      surface: {
        canvas: {
          $type: 'color',
          $value: '#000000',
          $extensions: { celestial: { layer: 'semantic' } },
        },
      },
      text: {
        // This is dark gray on black, should fail contrast
        primary: {
          $type: 'color',
          $value: '#111111',
          $extensions: {
            celestial: {
              layer: 'semantic',
              a11ySensitive: true,
              contrastPairs: ['surface.canvas'],
            },
          },
        },
      },
    };

    const report = validateTokens(config);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('A11y violation');
    expect(report.errors[0]).toContain('do not meet WCAG 2.2 AA');
  });
});
