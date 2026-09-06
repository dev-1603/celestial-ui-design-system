import { describe, it, expect } from 'vitest';
import { formatTokenDeclarations } from './format-value';
import type { Token } from '@celestial-ui/tokens';

describe('format-value', () => {
  it('formats scalar color tokens', () => {
    const token: Token = { $type: 'color', $value: '#ff0000' };
    const result = formatTokenDeclarations('color.red.500', token);
    expect(result.__single__).toBe('#ff0000');
  });

  it('formats shadow object as single box-shadow value', () => {
    const token: Token = {
      $type: 'shadow',
      $value: {
        offsetX: '0',
        offsetY: '1px',
        blur: '2px',
        spread: '0',
        color: 'rgba(0,0,0,0.1)',
      },
    };
    const result = formatTokenDeclarations('shadow.xs', token);
    expect(result.__single__).toBe('0 1px 2px 0 rgba(0,0,0,0.1)');
  });

  it('formats shadow array as comma-separated layers', () => {
    const token: Token = {
      $type: 'shadow',
      $value: [
        { offsetX: '0', offsetY: '1px', blur: '2px', spread: '0', color: '#000' },
        { offsetX: '0', offsetY: '2px', blur: '4px', spread: '0', color: '#111', inset: true },
      ],
    };
    const result = formatTokenDeclarations('shadow.md', token);
    expect(result.__single__).toBe('0 1px 2px 0 #000, inset 0 2px 4px 0 #111');
  });

  it('formats typography into sub-properties', () => {
    const token: Token = {
      $type: 'typography',
      $value: {
        fontFamily: 'Inter',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.5',
      },
    };
    const result = formatTokenDeclarations('typography.body', token);
    expect(result.fontFamily).toBe('Inter');
    expect(result.fontSize).toBe('16px');
    expect(result.fontWeight).toBe('400');
    expect(result.lineHeight).toBe('1.5');
  });

  it('rejects unresolved aliases', () => {
    const token: Token = { $type: 'color', $value: '{color.blue.500}' };
    expect(() => formatTokenDeclarations('action.primary.background', token)).toThrow();
  });

  it('rejects unsafe CSS injection', () => {
    const token: Token = { $type: 'color', $value: '#fff; background: url(javascript:alert(1))' };
    expect(() => formatTokenDeclarations('color.bad', token)).toThrow();
  });

  it('formats cubicBezier arrays', () => {
    const token: Token = { $type: 'cubicBezier', $value: [0.4, 0, 0.2, 1] };
    const result = formatTokenDeclarations('motion.easing.default', token);
    expect(result.__single__).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
  });

  it('rejects untyped composite objects instead of emitting [object Object]', () => {
    const token: Token = { $type: 'color', $value: { nested: true } as unknown as string };
    expect(() => formatTokenDeclarations('color.bad', token)).toThrow();
  });
});
