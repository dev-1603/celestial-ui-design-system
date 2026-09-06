import { describe, it, expect } from 'vitest';
import { tokenPathToVariableName, tokenSubPathToVariableName } from './variable-registry';

describe('variable registry', () => {
  it('maps token paths deterministically', () => {
    expect(tokenPathToVariableName('action.primary.background')).toBe(
      '--cui-action-primary-background',
    );
    expect(tokenPathToVariableName('radius.md')).toBe('--cui-radius-md');
  });

  it('rejects invalid token paths', () => {
    expect(() => tokenPathToVariableName('1bad')).toThrow();
    expect(() => tokenPathToVariableName('has space')).toThrow();
  });

  it('can collide distinct hyphenated vs dotted paths onto one CSS name', () => {
    expect(tokenPathToVariableName('foo.bar-baz')).toBe(tokenPathToVariableName('foo.bar.baz'));
  });

  it('rejects unsafe composite sub-keys instead of silently stripping them', () => {
    expect(() => tokenSubPathToVariableName('typography.body', 'font Size')).toThrow();
  });
});
