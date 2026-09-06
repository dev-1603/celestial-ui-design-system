import { describe, it, expect } from 'vitest';
import { shouldSuppressPointerInteraction } from './pointer-types';

describe('PointerContract semantics', () => {
  it('suppresses interaction when disabled, readonly, or loading', () => {
    expect(shouldSuppressPointerInteraction({ disabled: true })).toBe(true);
    expect(shouldSuppressPointerInteraction({ readonly: true })).toBe(true);
    expect(shouldSuppressPointerInteraction({ loading: true })).toBe(true);
    expect(shouldSuppressPointerInteraction({})).toBe(false);
  });
});

describe('shouldIgnorePointer behavior helper', () => {
  it('aligns with pointer suppression semantics', async () => {
    const { shouldIgnorePointer } = await import('../behavior/disclosure');
    expect(shouldIgnorePointer({ disabled: true })).toBe(true);
    expect(shouldIgnorePointer({ readonly: true })).toBe(true);
    expect(shouldIgnorePointer({ loading: true })).toBe(true);
  });
});
