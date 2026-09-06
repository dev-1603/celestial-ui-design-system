import { describe, it, expect } from 'vitest';
import { createNativeNameLookup } from './mapping';
import { IconResolutionError } from './errors';
import lucideCatalogue from './data/mappings/lucide.json';
import faCatalogue from './data/mappings/fa.json';

describe('[Unit] mapping engine', () => {
  it('should map search to Lucide Search from the Lucide catalogue', () => {
    const lookup = createNativeNameLookup(lucideCatalogue);
    expect(lookup('search')).toBe('Search');
  });

  it('should map search to Font Awesome magnifying-glass from the FA catalogue', () => {
    const lookup = createNativeNameLookup(faCatalogue);
    expect(lookup('search')).toBe('magnifying-glass');
  });

  it('should return undefined for an unmapped canonical name', () => {
    const lookup = createNativeNameLookup(lucideCatalogue);
    expect(lookup('not-in-catalogue-zzzz')).toBeUndefined();
  });

  it('should throw when the catalogue is invalid', () => {
    expect(() => createNativeNameLookup({ providerId: 'acme' })).toThrow(IconResolutionError);
  });
});
