import { buildTokenConfigForMode } from '@celestial-ui/tokens/catalog';
import { flattenTokens, resolveAliases } from '@celestial-ui/tokens/resolve';
import { TOKEN_SYSTEM_VERSION } from '@celestial-ui/tokens/types';
import { validateTokens } from '@celestial-ui/tokens/validation';
import type {
  AppearanceMode,
  ProvenanceSource,
  ResolveThemeOptions,
  ResolvedTheme,
  ThemeOverrides,
  ThemeSlotId,
  TokenProvenance,
} from './types';
import type { ThemeRegistry } from './registry';
import { getCatalogFlatForMode, validateTenantThemeProfile, validateThemeConfig } from './validate';
import { canTenantOverride, canThemeOverride, getEffectivePolicy } from './policy';
import { isPathInSlot, isPolicyAllowedInSlot } from './slots';
import { overrideToToken, setTokenAtPath } from './patch';
import { getCachedCanonicalTokenSources } from './catalog-cache';
import { resolveAppearanceMode } from './mode';
import { ThemeResolutionError, themeError } from './errors';

/**
 * Resolution precedence (lowest → highest; higher wins when policy allows):
 *
 * 1. Canonical token layers (primitives, foundations, components) from `@celestial-ui/tokens`
 * 2. Mode overlay (light | dark)
 * 3. Root/base theme in inheritance chain
 * 4. Inherited child themes (parent → leaf)
 * 5. Approved tenant slot overrides
 *
 * After all patches: flatten → resolveAliases → validateTokens (tokens package).
 */
function applyOverrides(
  config: ReturnType<typeof buildTokenConfigForMode>,
  catalogFlat: ReturnType<typeof getCatalogFlatForMode>,
  overrides: ThemeOverrides | undefined,
  allow: (path: string) => boolean,
  provenance: Record<string, TokenProvenance> | undefined,
  source: ProvenanceSource,
  sourceId?: string,
): ReturnType<typeof buildTokenConfigForMode> {
  if (!overrides) {
    return config;
  }

  let nextConfig = config;
  const nextFlat = { ...catalogFlat };

  for (const [path, override] of Object.entries(overrides)) {
    if (override === null || override === undefined) {
      throw new ThemeResolutionError('Theme resolution failed.', [
        themeError(
          'INVALID_OVERRIDE_VALUE',
          `Override for '${path}' cannot be null or undefined.`,
          { path, layer: source === 'tenant' ? 'tenant' : 'theme' },
        ),
      ]);
    }

    const catalogToken = nextFlat[path];
    if (!catalogToken) {
      throw new ThemeResolutionError('Theme resolution failed.', [
        themeError('UNKNOWN_TOKEN_PATH', `Cannot override unknown token path '${path}'.`, {
          path,
          layer: source === 'tenant' ? 'tenant' : 'theme',
        }),
      ]);
    }
    if (!allow(path)) {
      throw new ThemeResolutionError('Theme resolution failed.', [
        themeError('OVERRIDE_FORBIDDEN', `Override of '${path}' is not permitted by policy.`, {
          path,
          layer: source === 'tenant' ? 'tenant' : 'theme',
        }),
      ]);
    }

    const token = overrideToToken(path, override, catalogToken);
    nextConfig = setTokenAtPath(nextConfig, path, token);
    nextFlat[path] = token;

    if (provenance) {
      provenance[path] = { source, sourceId };
    }
  }

  return nextConfig;
}

function initProvenance(
  catalogFlat: ReturnType<typeof getCatalogFlatForMode>,
  mode: AppearanceMode,
): Record<string, TokenProvenance> {
  const provenance: Record<string, TokenProvenance> = {};
  for (const path of Object.keys(catalogFlat)) {
    provenance[path] = { source: 'mode', sourceId: mode };
  }
  return provenance;
}

export function resolveTheme(registry: ThemeRegistry, options: ResolveThemeOptions): ResolvedTheme {
  const theme = registry.get(options.themeId);
  const mode = resolveAppearanceMode(theme, {
    mode: options.mode,
    modePreference: options.modePreference ?? options.tenantProfile?.modePreference,
    systemResolvedMode: options.systemResolvedMode,
  });

  if (!theme.modes.includes(mode)) {
    throw new ThemeResolutionError('Theme resolution failed.', [
      themeError('MODE_NOT_SUPPORTED', `Mode '${mode}' is not supported by theme '${theme.id}'.`, {
        layer: 'mode',
        field: 'mode',
      }),
    ]);
  }

  const sources = getCachedCanonicalTokenSources();
  let config = buildTokenConfigForMode(sources, mode);
  let catalogFlat = getCatalogFlatForMode(config);
  const provenance = options.includeProvenance ? initProvenance(catalogFlat, mode) : undefined;

  const themeReport = validateThemeConfig(registry, theme, catalogFlat);
  if (!themeReport.isValid) {
    throw new ThemeResolutionError('Theme validation failed.', themeReport.errors);
  }

  if (options.tenantProfile) {
    const tenantReport = validateTenantThemeProfile(registry, options.tenantProfile, catalogFlat);
    if (!tenantReport.isValid) {
      throw new ThemeResolutionError('Tenant profile validation failed.', tenantReport.errors);
    }
  }

  const chain = registry.getInheritanceChain(options.themeId);
  const resolvedTheme = chain[chain.length - 1]!;

  for (const layer of chain) {
    config = applyOverrides(
      config,
      catalogFlat,
      layer.overrides,
      (path) => {
        const token = catalogFlat[path];
        return token ? canThemeOverride(path, token) : false;
      },
      provenance,
      'theme',
      layer.id,
    );
    catalogFlat = getCatalogFlatForMode(config);
  }

  if (options.tenantProfile?.slots) {
    for (const [slotId, slotOverrides] of Object.entries(options.tenantProfile.slots)) {
      config = applyOverrides(
        config,
        catalogFlat,
        slotOverrides,
        (path) => {
          const token = catalogFlat[path];
          if (!token) {
            return false;
          }
          const policy = getEffectivePolicy(path, token);
          return canTenantOverride(
            path,
            token,
            isPathInSlot(path, slotId as ThemeSlotId),
            isPolicyAllowedInSlot(policy, slotId as ThemeSlotId),
          );
        },
        provenance,
        'tenant',
        options.tenantProfile.tenantId,
      );
      catalogFlat = getCatalogFlatForMode(config);
    }
  }

  const validation = validateTokens(config);

  if (!validation.isValid) {
    throw new ThemeResolutionError(
      'Token validation failed after theme resolution.',
      validation.errors.map((reason) =>
        themeError('INVALID_ALIAS', reason, { layer: 'canonical' }),
      ),
    );
  }

  const flat = flattenTokens(config);
  const tokens = resolveAliases(flat);

  const icons = options.tenantProfile?.icons ?? resolvedTheme.icons;

  return {
    themeId: resolvedTheme.id,
    themeVersion: resolvedTheme.version,
    schemaVersion: resolvedTheme.schemaVersion,
    tokenSystemVersion: TOKEN_SYSTEM_VERSION,
    mode,
    tokens,
    validation,
    icons,
    provenance,
  };
}
