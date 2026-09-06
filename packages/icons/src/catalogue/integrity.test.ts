import { describe, it, expect } from 'vitest';
import { validateCanonicalCatalogue, validateProviderCatalogue } from './validate';
import canonical from '../data/canonical.json';
import lucide from '../data/mappings/lucide.json';
import fa from '../data/mappings/fa.json';
import material from '../data/mappings/material.json';
import heroicons from '../data/mappings/heroicons.json';
import phosphor from '../data/mappings/phosphor.json';
import iconify from '../data/mappings/iconify.json';

const catalogues = { lucide, fa, material, heroicons, phosphor, iconify };

describe('[Catalogue] integrity', () => {
  it('should have a unique, valid canonical catalogue', () => {
    const report = validateCanonicalCatalogue(canonical);
    expect(report.errors).toEqual([]);
    expect(report.isValid).toBe(true);
    expect(canonical.entries.length).toBe(103);
  });

  it('should map every canonical name in every built-in provider catalogue', () => {
    const names = new Set(canonical.entries.map((entry) => entry.name));
    expect(names.size).toBe(canonical.entries.length);

    for (const [id, file] of Object.entries(catalogues)) {
      const report = validateProviderCatalogue(file, names);
      expect(report.errors, id).toEqual([]);
      expect(report.isValid, id).toBe(true);
      expect(file.entries.length, id).toBe(names.size);
      const mapped = new Set(file.entries.map((entry) => entry.canonicalName));
      for (const name of names) {
        expect(mapped.has(name), `${id} missing ${name}`).toBe(true);
      }
    }
  });
});
