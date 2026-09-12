import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureCelestialIcons,
  getIconConfig,
  _resetIconConfig,
  iconConfigFromThemeHint,
  iconConfigFromResolvedTheme,
} from './config';
import { IconResolutionError } from './errors';

describe('[Unit] configureCelestialIcons', () => {
  beforeEach(() => {
    _resetIconConfig();
  });

  it('should return default config when nothing is configured', () => {
    const config = getIconConfig();
    expect(config.provider).toBe('lucide');
    expect(config.diagnostics).toBe(false);
    expect(config.missingIconPolicy).toEqual({ kind: 'empty' });
    expect(config.explicitProviderPolicy).toBe('apply-missing-policy');
  });

  it('should override provider when configured', () => {
    configureCelestialIcons({ provider: 'phosphor' });
    expect(getIconConfig().provider).toBe('phosphor');
  });

  it('should merge config with defaults', () => {
    configureCelestialIcons({ provider: 'heroicons', diagnostics: true });
    const config = getIconConfig();
    expect(config.provider).toBe('heroicons');
    expect(config.diagnostics).toBe(true);
    expect(config.missingIconPolicy).toEqual({ kind: 'empty' }); // default preserved
  });

  it('should accept valid fallback providers', () => {
    configureCelestialIcons({ provider: 'lucide', fallback: ['phosphor', 'fa'] });
    expect(getIconConfig().fallback).toEqual(['phosphor', 'fa']);
  });

  it('should throw on invalid provider id format', () => {
    expect(() => configureCelestialIcons({ provider: 'bad id!' })).toThrow(IconResolutionError);
  });

  it('should throw on invalid fallback provider id', () => {
    expect(() => configureCelestialIcons({ provider: 'lucide', fallback: ['bad!id'] })).toThrow(
      IconResolutionError,
    );
  });

  it('should throw on invalid explicitProviderPolicy', () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      configureCelestialIcons({ explicitProviderPolicy: 'invalid' as any }),
    ).toThrow(IconResolutionError);
  });

  it('should accept missingIconPolicy: error', () => {
    configureCelestialIcons({ missingIconPolicy: { kind: 'error' } });
    expect(getIconConfig().missingIconPolicy).toEqual({ kind: 'error' });
  });

  it('should accept missingIconPolicy: fallback-icon', () => {
    configureCelestialIcons({
      missingIconPolicy: { kind: 'fallback-icon', canonicalName: 'help' },
    });
    expect(getIconConfig().missingIconPolicy).toEqual({
      kind: 'fallback-icon',
      canonicalName: 'help',
    });
  });

  it('should reset config to defaults', () => {
    configureCelestialIcons({ provider: 'fa' });
    _resetIconConfig();
    expect(getIconConfig().provider).toBe('lucide');
  });
});

describe('[Unit] iconConfigFromThemeHint', () => {
  it('should map a theme hint provider onto defaults', () => {
    const config = iconConfigFromThemeHint({ provider: 'phosphor' });
    expect(config.provider).toBe('phosphor');
    expect(config.missingIconPolicy).toEqual({ kind: 'empty' });
  });

  it('should allow fallback and diagnostics overrides without a theme hint', () => {
    const config = iconConfigFromThemeHint(undefined, {
      fallback: ['fa'],
      diagnostics: true,
    });
    expect(config.provider).toBe('lucide');
    expect(config.fallback).toEqual(['fa']);
    expect(config.diagnostics).toBe(true);
  });

  it('should throw on an invalid theme hint provider id', () => {
    expect(() => iconConfigFromThemeHint({ provider: 'bad id!' })).toThrow(IconResolutionError);
  });
});

describe('[Unit] iconConfigFromResolvedTheme', () => {
  it('should map ResolvedTheme.icons without importing theme', () => {
    const config = iconConfigFromResolvedTheme(
      { icons: { provider: 'fa', options: { collection: 'ignored-by-resolver' } } },
      { fallback: ['phosphor'] },
    );
    expect(config.provider).toBe('fa');
    expect(config.fallback).toEqual(['phosphor']);
  });
});
