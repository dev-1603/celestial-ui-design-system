import { describe, it, expect } from 'vitest';
import { validateCanonicalCatalogue, validateProviderCatalogue } from './validate';

describe('[Unit] validateCanonicalCatalogue', () => {
  it('should pass for a valid catalogue', () => {
    const result = validateCanonicalCatalogue({
      schemaVersion: '1.0.0',
      updatedAt: '2026-01-01',
      entries: [
        { name: 'search', category: 'action' },
        { name: 'close', category: 'action' },
      ],
    });
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should fail if schemaVersion is missing', () => {
    const result = validateCanonicalCatalogue({
      updatedAt: '2026-01-01',
      entries: [],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('schemaVersion'))).toBe(true);
  });

  it('should fail if entries is not an array', () => {
    const result = validateCanonicalCatalogue({
      schemaVersion: '1.0.0',
      updatedAt: '2026-01-01',
      entries: 'bad',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('entries'))).toBe(true);
  });

  it('should fail on duplicate canonical names', () => {
    const result = validateCanonicalCatalogue({
      schemaVersion: '1.0.0',
      updatedAt: '2026-01-01',
      entries: [{ name: 'search' }, { name: 'search' }],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('search'))).toBe(true);
  });

  it('should warn on non-matching schemaVersion', () => {
    const result = validateCanonicalCatalogue({
      schemaVersion: '2.0.0',
      updatedAt: '2026-01-01',
      entries: [{ name: 'search' }],
    });
    expect(result.isValid).toBe(true); // warnings don't fail
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should fail on non-object input', () => {
    const result = validateCanonicalCatalogue('not an object');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should fail when an alias collides with a canonical name', () => {
    const result = validateCanonicalCatalogue({
      schemaVersion: '1.0.0',
      updatedAt: '2026-01-01',
      entries: [
        { name: 'notification', category: 'status' },
        { name: 'bell', aliases: ['notification'], category: 'status' },
      ],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('collides'))).toBe(true);
  });
});

describe('[Unit] validateProviderCatalogue', () => {
  it('should pass for a valid provider catalogue', () => {
    const result = validateProviderCatalogue({
      providerId: 'lucide',
      providerVersion: '0.460.0',
      catalogueSchemaVersion: '1.0.0',
      generatedAt: '2026-01-01',
      entries: [{ canonicalName: 'search', nativeName: 'Search' }],
    });
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should fail if providerId is missing', () => {
    const result = validateProviderCatalogue({
      providerVersion: '0.460.0',
      catalogueSchemaVersion: '1.0.0',
      generatedAt: '2026-01-01',
      entries: [],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('providerId'))).toBe(true);
  });

  it('should fail if entry is missing nativeName', () => {
    const result = validateProviderCatalogue({
      providerId: 'lucide',
      providerVersion: '0.460.0',
      catalogueSchemaVersion: '1.0.0',
      generatedAt: '2026-01-01',
      entries: [{ canonicalName: 'search' }], // no nativeName
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('nativeName'))).toBe(true);
  });

  it('should fail on duplicate canonicalName entries', () => {
    const result = validateProviderCatalogue({
      providerId: 'lucide',
      providerVersion: '0.460.0',
      catalogueSchemaVersion: '1.0.0',
      generatedAt: '2026-01-01',
      entries: [
        { canonicalName: 'search', nativeName: 'Search' },
        { canonicalName: 'search', nativeName: 'Search2' },
      ],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('search'))).toBe(true);
  });

  it('should warn when canonicalName is not in the canonical catalogue', () => {
    const knownNames = new Set(['close']);
    const result = validateProviderCatalogue(
      {
        providerId: 'lucide',
        providerVersion: '0.460.0',
        catalogueSchemaVersion: '1.0.0',
        generatedAt: '2026-01-01',
        entries: [{ canonicalName: 'unknown-name', nativeName: 'SomeThing' }],
      },
      knownNames,
    );
    expect(result.isValid).toBe(true);
    expect(result.warnings.some((w) => w.includes('unknown-name'))).toBe(true);
  });
});
