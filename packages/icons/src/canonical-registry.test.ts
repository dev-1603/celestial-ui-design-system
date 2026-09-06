import { describe, it, expect } from 'vitest';
import { canonicalRegistry, CanonicalRegistry } from './canonical-registry';
import type { CanonicalCatalogueFile } from './types';

describe('[Unit] CanonicalRegistry (default)', () => {
  it('should contain the canonical icon "search"', () => {
    expect(canonicalRegistry.has('search')).toBe(true);
  });

  it('should contain at least 50 canonical icons', () => {
    expect(canonicalRegistry.size).toBeGreaterThanOrEqual(50);
  });

  it('should resolve a known canonical name to itself', () => {
    expect(canonicalRegistry.resolve('search')).toBe('search');
  });

  it('should resolve a known alias to its canonical name', () => {
    expect(canonicalRegistry.resolve('alerts')).toBe('notification');
  });

  it('should return undefined for an unknown name', () => {
    expect(canonicalRegistry.resolve('nonexistent-icon-xyz')).toBeUndefined();
  });

  it('should return false for has() on unknown name', () => {
    expect(canonicalRegistry.has('nonexistent-icon-xyz')).toBe(false);
  });

  it('should return the catalogue entry for a known icon', () => {
    const entry = canonicalRegistry.get('search');
    expect(entry).toBeDefined();
    expect(entry!.name).toBe('search');
    expect(entry!.category).toBe('action');
  });

  it('should return undefined for get() on unknown icon', () => {
    expect(canonicalRegistry.get('nonexistent-xyz')).toBeUndefined();
  });

  it('should list all canonical names', () => {
    const names = canonicalRegistry.list();
    expect(names).toContain('search');
    expect(names).toContain('close');
    expect(names).toContain('check');
    expect(names.length).toBeGreaterThanOrEqual(50);
  });
});

describe('[Unit] CanonicalRegistry (custom data)', () => {
  const testCatalogue: CanonicalCatalogueFile = {
    schemaVersion: '1.0.0',
    updatedAt: '2026-01-01',
    entries: [
      { name: 'my-icon', description: 'Test icon', aliases: ['my-alias'], category: 'test' },
      { name: 'another-icon', description: 'Another', category: 'test' },
    ],
  };

  it('should build registry from custom data', () => {
    const reg = new CanonicalRegistry(testCatalogue);
    expect(reg.has('my-icon')).toBe(true);
    expect(reg.has('another-icon')).toBe(true);
    expect(reg.size).toBe(2);
  });

  it('should resolve alias to canonical', () => {
    const reg = new CanonicalRegistry(testCatalogue);
    expect(reg.resolve('my-alias')).toBe('my-icon');
  });

  it('should throw on invalid catalogue (missing schemaVersion)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => new CanonicalRegistry({ entries: [] } as any)).toThrow();
  });

  it('should throw on duplicate canonical names', () => {
    const duplicateCatalogue: CanonicalCatalogueFile = {
      schemaVersion: '1.0.0',
      updatedAt: '2026-01-01',
      entries: [
        { name: 'dup-icon', category: 'test' },
        { name: 'dup-icon', category: 'test' }, // duplicate
      ],
    };
    expect(() => new CanonicalRegistry(duplicateCatalogue)).toThrow();
  });
});
