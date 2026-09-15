import { describe, it, expect } from 'vitest';
import { flattenTokens, resolveAliases } from './resolve';
import type { ShadowValue, TokenConfig, TypographyValue } from './types';

describe('Token Resolution', () => {
  it('should flatten and resolve basic aliases', () => {
    const config: TokenConfig = {
      color: {
        blue: {
          500: {
            $type: 'color',
            $value: '#3B82F6',
            $extensions: { celestial: { layer: 'primitive' } },
          },
        },
      },
      action: {
        primary: {
          $type: 'color',
          $value: '{color.blue.500}',
          $extensions: { celestial: { layer: 'semantic' } },
        },
      },
    };

    const flat = flattenTokens(config);
    expect(flat['color.blue.500']).toBeDefined();

    const resolved = resolveAliases(flat);
    expect(resolved['action.primary'].$value).toBe('#3B82F6');
  });

  it('should resolve nested references inside composite tokens', () => {
    const config: TokenConfig = {
      fontFamily: {
        sans: { $type: 'fontFamily', $value: 'Inter, sans-serif' },
      },
      typography: {
        heading: {
          $type: 'typography',
          $value: {
            fontFamily: '{fontFamily.sans}',
            fontSize: '2rem',
            fontWeight: '700',
          },
        },
      },
    };

    const flat = flattenTokens(config);
    const resolved = resolveAliases(flat);

    expect((resolved['typography.heading'].$value as TypographyValue).fontFamily).toBe(
      'Inter, sans-serif',
    );
  });

  it('should resolve references inside arrays (e.g. shadows)', () => {
    const config: TokenConfig = {
      color: {
        shadowBase: { $type: 'color', $value: 'rgba(0,0,0,0.1)' },
      },
      shadow: {
        sm: {
          $type: 'shadow',
          $value: [
            {
              offsetX: '0px',
              offsetY: '1px',
              blur: '2px',
              spread: '0px',
              color: '{color.shadowBase}',
            },
          ],
        },
      },
    };

    const flat = flattenTokens(config);
    const resolved = resolveAliases(flat);

    expect((resolved['shadow.sm'].$value as ShadowValue[])[0]?.color).toBe('rgba(0,0,0,0.1)');
  });

  it('resolves multiple aliases in one string', () => {
    const config: TokenConfig = {
      color: {
        a: {
          $type: 'color',
          $value: '#111111',
          $extensions: { celestial: { layer: 'primitive' } },
        },
        b: {
          $type: 'color',
          $value: '#222222',
          $extensions: { celestial: { layer: 'primitive' } },
        },
      },
      mixed: {
        pair: {
          $type: 'color',
          $value: '{color.a} / {color.b}',
          $extensions: { celestial: { layer: 'semantic' } },
        },
      },
    };

    const resolved = resolveAliases(flattenTokens(config));
    expect(resolved['mixed.pair']?.$value).toBe('#111111 / #222222');
  });

  it('leaves empty braces and unmatched braces as literal text', () => {
    const config: TokenConfig = {
      color: {
        literal: {
          $type: 'color',
          $value: 'prefix{}suffix{unclosed',
          $extensions: { celestial: { layer: 'primitive' } },
        },
      },
    };

    const resolved = resolveAliases(flattenTokens(config));
    expect(resolved['color.literal']?.$value).toBe('prefix{}suffix{unclosed');
  });

  it('throws on nested braces that form a missing alias path', () => {
    const config: TokenConfig = {
      color: {
        nested: {
          $type: 'color',
          $value: '{a{b}',
          $extensions: { celestial: { layer: 'primitive' } },
        },
      },
    };

    expect(() => resolveAliases(flattenTokens(config))).toThrow(/Broken reference/);
  });

  it('resolves aliases in long interpolated strings', () => {
    const padding = 'x'.repeat(4000);
    const config: TokenConfig = {
      color: {
        blue: {
          500: {
            $type: 'color',
            $value: '#3B82F6',
            $extensions: { celestial: { layer: 'primitive' } },
          },
        },
        padded: {
          $type: 'color',
          $value: `${padding}{color.blue.500}${padding}`,
          $extensions: { celestial: { layer: 'semantic' } },
        },
      },
    };

    const resolved = resolveAliases(flattenTokens(config));
    expect(resolved['color.padded']?.$value).toBe(`${padding}#3B82F6${padding}`);
  });
});
