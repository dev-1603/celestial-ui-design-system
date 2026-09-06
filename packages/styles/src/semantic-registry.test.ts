import { describe, it, expect } from 'vitest';
import {
  SEMANTIC_CSS_REGISTRY,
  validateSemanticRegistry,
  SEMANTIC_CSS_API_VERSION,
} from './semantic-registry';

describe('semantic registry', () => {
  it('has a stable API version', () => {
    expect(SEMANTIC_CSS_API_VERSION).toBe('1.0.0');
  });

  it('passes structural validation', () => {
    expect(validateSemanticRegistry()).toEqual([]);
  });

  it('has no duplicate aliases', () => {
    const aliases = Object.keys(SEMANTIC_CSS_REGISTRY);
    expect(new Set(aliases).size).toBe(aliases.length);
  });

  it('maps all aliases to token paths', () => {
    for (const [alias, path] of Object.entries(SEMANTIC_CSS_REGISTRY)) {
      expect(alias).toMatch(/^--cui-/);
      expect(path).toMatch(/^[a-z][a-z0-9.]*$/);
    }
  });
});
