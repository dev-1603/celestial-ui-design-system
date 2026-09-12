import { describe, it, expect } from 'vitest';
import { buildTokenConfigForMode, getCanonicalTokenSources } from './catalog';
import { validateTokens } from './validation';

describe('Canonical token catalog', () => {
  it('loads unresolved celestial sources from data/', () => {
    const sources = getCanonicalTokenSources();

    expect(sources.primitives).toBeDefined();
    expect(sources.foundations).toBeDefined();
    expect(sources.components).toBeDefined();
    expect(sources.modes.light).toBeDefined();
    expect(sources.modes.dark).toBeDefined();
    expect(sources.primitives.color).toBeDefined();
    expect(sources.modes.light.surface).toBeDefined();
  });

  it('validates real celestial light and dark mode configs', () => {
    const sources = getCanonicalTokenSources();
    const light = buildTokenConfigForMode(sources, 'light');
    const dark = buildTokenConfigForMode(sources, 'dark');

    const lightReport = validateTokens(light);
    const darkReport = validateTokens(dark);

    expect(lightReport.isValid).toBe(true);
    expect(darkReport.isValid).toBe(true);
  });
});
