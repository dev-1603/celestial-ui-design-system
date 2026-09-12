import { describe, it, expect } from 'vitest';
import { flattenTokens, resolveAliases } from './resolve';
import { TokenConfig } from './types';

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

    // The composite should have the resolved font family
    expect((resolved['typography.heading'].$value as any).fontFamily).toBe('Inter, sans-serif');
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

    expect((resolved['shadow.sm'].$value as any)[0].color).toBe('rgba(0,0,0,0.1)');
  });
});
