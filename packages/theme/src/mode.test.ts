import { describe, it, expect } from 'vitest';
import { resolveAppearanceMode } from './mode';
import { CELESTIAL_THEME } from './themes/celestial';

describe('Mode resolution', () => {
  it('uses explicit light mode', () => {
    expect(resolveAppearanceMode(CELESTIAL_THEME, { mode: 'light' })).toBe('light');
  });

  it('uses explicit dark mode', () => {
    expect(resolveAppearanceMode(CELESTIAL_THEME, { mode: 'dark' })).toBe('dark');
  });

  it('explicit mode wins over modePreference', () => {
    expect(
      resolveAppearanceMode(CELESTIAL_THEME, { mode: 'dark', modePreference: 'light' }),
    ).toBe('dark');
  });

  it('uses modePreference light', () => {
    expect(resolveAppearanceMode(CELESTIAL_THEME, { modePreference: 'light' })).toBe('light');
  });

  it('uses modePreference dark', () => {
    expect(resolveAppearanceMode(CELESTIAL_THEME, { modePreference: 'dark' })).toBe('dark');
  });

  it('resolves system preference via systemResolvedMode', () => {
    expect(
      resolveAppearanceMode(CELESTIAL_THEME, {
        modePreference: 'system',
        systemResolvedMode: 'dark',
      }),
    ).toBe('dark');
  });

  it('falls back to defaultMode when system preference unresolved', () => {
    expect(resolveAppearanceMode(CELESTIAL_THEME, { modePreference: 'system' })).toBe('light');
  });

  it('falls back to defaultMode when nothing specified', () => {
    expect(resolveAppearanceMode(CELESTIAL_THEME, {})).toBe('light');
  });
});
