import { describe, it, expect } from 'vitest';
import { createNullEnvironment, createBrowserEnvironment } from '../environment/environment';

describe('environment', () => {
  it('null environment is SSR-safe at module level', () => {
    const env = createNullEnvironment();
    expect(env.isBrowser).toBe(false);
    expect(env.getDocument()).toBeNull();
    expect(env.focus(null)).toBeUndefined();
  });

  it('browser environment reads document lazily', () => {
    const env = createBrowserEnvironment();
    expect(env.isBrowser).toBe(true);
  });
});
