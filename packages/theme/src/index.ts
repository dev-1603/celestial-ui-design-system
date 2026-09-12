export type {
  AppearanceMode,
  ModeDefinition,
  ModePreference,
  OverridePolicy,
  ProvenanceSource,
  ResolveThemeOptions,
  ResolvedTheme,
  TenantThemeProfile,
  ThemeConfig,
  ThemeDefinition,
  ThemeOverrides,
  ThemeSlot,
  ThemeSlotDefinition,
  ThemeSlotId,
  ThemeValidationReport,
  TokenOverride,
  TokenOverrideValue,
  TokenProvenance,
} from './types';

export { THEME_SCHEMA_VERSION, SLOT_SCHEMA_VERSION } from './types';

export type { IconProvider, IconProviderConfig } from './icons';

export {
  THEME_SLOT_DEFINITIONS,
  THEME_SLOT_IDS,
  THEME_SLOTS,
  findSlotForPath,
  isPathInSlot,
  isPolicyAllowedInSlot,
} from './slots';

export { getEffectivePolicy, canThemeOverride, canTenantOverride } from './policy';

export { ThemeRegistry, createThemeRegistry, defineTheme } from './registry';

export { validateThemeConfig, validateTenantThemeProfile } from './validate';

export { resolveTheme } from './resolve';
export { resolveAppearanceMode } from './mode';
export { compareSemver, isCompatibleTokenSystem } from './version';

export type { ThemeError, ThemeErrorCode, ThemeErrorLayer } from './errors';
export { ThemeResolutionError, themeError } from './errors';

export { CELESTIAL_THEME } from './themes/celestial';
