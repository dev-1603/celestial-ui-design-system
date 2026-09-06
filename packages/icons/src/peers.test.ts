import { describe, it, expect } from 'vitest';
import { readOptionalPeerAsset, isAllowlistedPeer } from './peers';

describe('[Unit] peer asset loader', () => {
  it('should reject non-allowlisted packages', () => {
    expect(isAllowlistedPeer('fs')).toBe(false);
    expect(isAllowlistedPeer('../evil')).toBe(false);
    expect(readOptionalPeerAsset('fs', 'x.svg')).toBeUndefined();
  });

  it('should reject path traversal in relative assets', () => {
    expect(readOptionalPeerAsset('heroicons', '../package.json')).toBeUndefined();
    expect(readOptionalPeerAsset('heroicons', '..\\passwd.svg')).toBeUndefined();
  });
});
