import { describe, it, expect } from 'vitest';
import { formatTokenDeclarations } from './format-value';
import { compileResolvedTheme } from './compiler';
import { renderThemeStyleTag, createModeBootstrapScript } from './ssr';
import { validateScopeId } from './scope';
import { StyleRuntimeError } from './errors';
import type { Token } from '@celestial-ui/tokens';
import { resolveCelestialLight } from './test/fixtures';

describe('security', () => {
  it('rejects semicolon injection in color values', () => {
    const token: Token = { $type: 'color', $value: '#fff; color: red' };
    expect(() => formatTokenDeclarations('color.bad', token)).toThrow();
  });

  it('rejects brace injection', () => {
    const token: Token = { $type: 'color', $value: '#fff} body { background: red' };
    expect(() => formatTokenDeclarations('color.bad', token)).toThrow();
  });

  it('rejects style tag injection in SSR output', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const tag = renderThemeStyleTag({
      ...compiled,
      cssText: 'x</style><script>alert(1)</script>',
    });
    expect(tag).not.toMatch(/<\/style><script>/);
  });

  it('rejects invalid scope ids with special characters', () => {
    expect(() => validateScopeId('bad id!')).toThrow(StyleRuntimeError);
    expect(() => validateScopeId('')).toThrow(StyleRuntimeError);
  });

  it('rejects script injection in bootstrap themeId', () => {
    expect(() =>
      createModeBootstrapScript({ themeId: '"><script>', defaultMode: 'light' }),
    ).toThrow();
  });

  it('rejects javascript: and expression() values', () => {
    expect(() =>
      formatTokenDeclarations('color.bad', {
        $type: 'color',
        $value: 'javascript:alert(1)',
      }),
    ).toThrow();
    expect(() =>
      formatTokenDeclarations('color.bad', {
        $type: 'color',
        $value: 'expression(alert(1))',
      }),
    ).toThrow();
  });

  it('escapes quotes in theme ids used as selectors', () => {
    const theme = resolveCelestialLight();
    const compiled = compileResolvedTheme(
      { ...theme, themeId: 'acme"evil' },
      { scope: { kind: 'document' } },
    );
    expect(compiled.selector).toContain('data-cui-theme="acme\\"evil"');
    expect(compiled.cssText).not.toContain('</style');
  });
});
