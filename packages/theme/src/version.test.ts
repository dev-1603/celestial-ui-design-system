import { describe, it, expect } from 'vitest';
import { compareSemver, isCompatibleTokenSystem } from './version';

describe('Version compatibility', () => {
  it('compares semver strings', () => {
    expect(compareSemver('0.1.0', '0.1.0')).toBe(0);
    expect(compareSemver('0.2.0', '0.1.0')).toBeGreaterThan(0);
    expect(compareSemver('0.1.0', '0.2.0')).toBeLessThan(0);
  });

  it('checks token system compatibility', () => {
    expect(isCompatibleTokenSystem('0.1.0', '0.1.0')).toBe(true);
    expect(isCompatibleTokenSystem('0.1.0', '0.2.0')).toBe(true);
    expect(isCompatibleTokenSystem('0.2.0', '0.1.0')).toBe(false);
  });
});
