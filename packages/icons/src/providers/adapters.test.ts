import { describe, it, expect } from 'vitest';
import { LucideAdapter, lucide } from './lucide';
import { FontAwesomeAdapter } from './font-awesome';
import { MaterialSymbolsAdapter } from './material';
import { HeroiconsAdapter } from './heroicons';
import { PhosphorAdapter } from './phosphor';
import { IconifyAdapter, createIconifyAdapter } from './iconify';

describe('[Unit] built-in provider adapters', () => {
  it('should expose lucide as an alias of LucideAdapter', () => {
    expect(lucide).toBe(LucideAdapter);
    expect(lucide.id).toBe('lucide');
  });

  it('should expose stable built-in ids', () => {
    expect(LucideAdapter.id).toBe('lucide');
    expect(FontAwesomeAdapter.id).toBe('fa');
    expect(MaterialSymbolsAdapter.id).toBe('material');
    expect(HeroiconsAdapter.id).toBe('heroicons');
    expect(PhosphorAdapter.id).toBe('phosphor');
    expect(IconifyAdapter.id).toBe('iconify');
  });

  it('should resolve canonical search via the shared mapping catalogue', () => {
    expect(LucideAdapter.resolveNativeName('search')).toBe('Search');
    expect(FontAwesomeAdapter.resolveNativeName('search')).toBe('magnifying-glass');
    expect(MaterialSymbolsAdapter.resolveNativeName('search')).toBe('search');
  });

  it('should return a font-class payload for Material without optional peers', () => {
    const payload = MaterialSymbolsAdapter.resolve('search', { style: 'outlined' });
    expect(payload?.kind).toBe('font-class');
    expect(String(payload?.data)).toBe('material-symbols-outlined search');
  });

  it('should reject Material ligatures that are not allowlisted', () => {
    expect(MaterialSymbolsAdapter.resolve('search<script>', { style: 'outlined' })).toBeUndefined();
    expect(MaterialSymbolsAdapter.resolve('../passwd', { style: 'outlined' })).toBeUndefined();
  });
});

describe('[Unit] createIconifyAdapter collection override', () => {
  it('should default to the catalogue prefix', () => {
    expect(IconifyAdapter.resolveNativeName('search')).toBe('ph:magnifying-glass');
  });

  it('should rewrite the collection prefix on a new adapter instance', () => {
    const mdi = createIconifyAdapter({ collection: 'mdi' });
    expect(mdi.resolveNativeName('search')).toBe('mdi:magnifying-glass');
    expect(IconifyAdapter.resolveNativeName('search')).toBe('ph:magnifying-glass');
  });

  it('should not leak collection override across instances', () => {
    const a = createIconifyAdapter({ collection: 'mdi' });
    const b = createIconifyAdapter({ collection: 'tabler' });
    expect(a.resolveNativeName('search')).toBe('mdi:magnifying-glass');
    expect(b.resolveNativeName('search')).toBe('tabler:magnifying-glass');
  });
});
