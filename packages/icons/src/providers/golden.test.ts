import { describe, it, expect } from 'vitest';
import { resolveIcon } from '../resolver';
import { IconProviderRegistry } from '../provider-registry';
import { canonicalRegistry } from '../canonical-registry';
import { isPeerInstalled } from '../peers';
import { LucideAdapter } from './lucide';
import { FontAwesomeAdapter } from './font-awesome';
import { MaterialSymbolsAdapter } from './material';
import { HeroiconsAdapter } from './heroicons';
import { PhosphorAdapter } from './phosphor';
import { IconifyAdapter } from './iconify';
import type { IconConfig, IconProviderAdapter } from '../types';

function requirePeer(packageName: string): void {
  if (!isPeerInstalled(packageName)) {
    throw new Error(
      `GOLDEN_PEER_MISSING: '${packageName}' is not installed. Golden tests cannot distinguish a missing peer from a broken adapter.`,
    );
  }
}

function assertSvgString(data: unknown, label: string): void {
  expect(data, `${label} payload must be a string`).toEqual(expect.any(String));
  expect(String(data), `${label} must contain an <svg> root`).toMatch(/<svg[\s>]/i);
}

const searchConfig = (provider: string): IconConfig => ({
  provider,
  missingIconPolicy: { kind: 'empty' },
  explicitProviderPolicy: 'apply-missing-policy',
  diagnostics: true,
});

function resolveSearch(adapter: IconProviderAdapter) {
  const registry = new IconProviderRegistry();
  registry.register(adapter);
  return resolveIcon({ name: 'search' }, searchConfig(adapter.id), {
    registry,
    canonicalRegistry,
  });
}

describe('[Golden] real provider payloads for canonical search', () => {
  it('Lucide returns svg-string when lucide-static is installed', () => {
    requirePeer('lucide-static');
    const result = resolveSearch(LucideAdapter);
    expect(result.status, 'adapter installed but failed to resolve').toBe('resolved');
    expect(result.payload?.kind).toBe('svg-string');
    expect(result.nativeName).toBe('Search');
    assertSvgString(result.payload?.data, 'lucide');
  });

  it('Font Awesome Free solid returns svg-string when packs are installed', () => {
    requirePeer('@fortawesome/fontawesome-svg-core');
    requirePeer('@fortawesome/free-solid-svg-icons');
    const result = resolveSearch(FontAwesomeAdapter);
    expect(result.status, 'adapter installed but failed to resolve').toBe('resolved');
    expect(result.payload?.kind).toBe('svg-string');
    expect(result.nativeName).toBe('magnifying-glass');
    assertSvgString(result.payload?.data, 'fa');
  });

  it('Material Symbols returns a validated font-class payload', () => {
    const result = resolveSearch(MaterialSymbolsAdapter);
    expect(result.status).toBe('resolved');
    expect(result.payload?.kind).toBe('font-class');
    expect(result.payload?.data).toBe('material-symbols-outlined search');
  });

  it('Heroicons returns svg-string when heroicons is installed', () => {
    requirePeer('heroicons');
    const result = resolveSearch(HeroiconsAdapter);
    expect(result.status, 'adapter installed but failed to resolve').toBe('resolved');
    expect(result.payload?.kind).toBe('svg-string');
    assertSvgString(result.payload?.data, 'heroicons');
  });

  it('Phosphor returns svg-string when @phosphor-icons/core is installed', () => {
    requirePeer('@phosphor-icons/core');
    const result = resolveSearch(PhosphorAdapter);
    expect(result.status, 'adapter installed but failed to resolve').toBe('resolved');
    expect(result.payload?.kind).toBe('svg-string');
    assertSvgString(result.payload?.data, 'phosphor');
  });

  it('Iconify returns svg-string when @iconify/utils and @iconify-json/ph are installed', () => {
    requirePeer('@iconify/utils');
    requirePeer('@iconify-json/ph');
    const result = resolveSearch(IconifyAdapter);
    expect(result.status, 'adapter installed but failed to resolve').toBe('resolved');
    expect(result.payload?.kind).toBe('svg-string');
    expect(result.nativeName).toBe('ph:magnifying-glass');
    assertSvgString(result.payload?.data, 'iconify');
  });
});
