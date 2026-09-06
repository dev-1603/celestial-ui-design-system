import type { FlatTokenMap, OverridePolicy, TokenType, ValidationReport } from '@celestial-ui/tokens';
import type { IconProviderConfig } from './icons';
import type { ThemeError } from './errors';

/** Theme configuration schema version. */
export const THEME_SCHEMA_VERSION = '1.0.0';

/** Theme slot contract schema version (for generator / tenant profile migration). */
export const SLOT_SCHEMA_VERSION = '1.0.0';

export type AppearanceMode = 'light' | 'dark';
export type ModePreference = AppearanceMode | 'system';

export type ThemeSlotId =
  | 'brand'
  | 'typography'
  | 'shape'
  | 'density'
  | 'color'
  | 'surface'
  | 'elevation'
  | 'motion'
  | 'accessibility'
  | 'icons';

export type TokenOverrideValue = string | number | Record<string, unknown> | unknown[];

export interface TokenOverride {
  $type?: TokenType;
  $value: TokenOverrideValue;
}

export type ThemeOverrides = Record<string, TokenOverride | TokenOverrideValue>;

/**
 * Theme identity, inheritance, and approved overrides.
 * Does not contain raw token catalogs, CSS, or framework classes.
 */
export interface ThemeConfig {
  id: string;
  name: string;
  /** Theme definition version (brand release). */
  version: string;
  /** Theme configuration schema version. */
  schemaVersion: string;
  /** Minimum compatible `@celestial-ui/tokens` system version. */
  minTokenSystemVersion?: string;
  parentId?: string;
  defaultMode: AppearanceMode;
  modes: AppearanceMode[];
  overrides?: ThemeOverrides;
  icons?: IconProviderConfig;
}

export type ThemeDefinition = ThemeConfig;

export interface ModeDefinition {
  id: AppearanceMode;
  overrides?: ThemeOverrides;
}

/**
 * Formal theme slot contract.
 * Each slot lists explicit allowed path prefixes — no wildcard `color.*` access.
 */
export interface ThemeSlotDefinition {
  id: ThemeSlotId;
  description: string;
  /** Token paths must start with one of these prefixes. */
  allowedTokenPaths: readonly string[];
  /** Override policies permitted through this slot (tenant layer). */
  allowedOverridePolicies: readonly OverridePolicy[];
}

/** @deprecated Use `ThemeSlotDefinition`. */
export interface ThemeSlot {
  id: ThemeSlotId;
  pathPrefixes: readonly string[];
}

/**
 * Restricted tenant customization contract.
 * Tenants may only patch tokens through approved slots — never arbitrary paths.
 */
export interface TenantThemeProfile {
  tenantId: string;
  baseThemeId: string;
  schemaVersion: string;
  /** Slot contract version this profile was authored against. */
  slotSchemaVersion?: string;
  modePreference?: ModePreference;
  slots?: Partial<Record<ThemeSlotId, ThemeOverrides>>;
  icons?: IconProviderConfig;
}

export type { OverridePolicy };

export interface ThemeValidationReport {
  isValid: boolean;
  errors: ThemeError[];
  warnings: ThemeError[];
}

export type ProvenanceSource = 'canonical' | 'mode' | 'theme' | 'tenant';

export interface TokenProvenance {
  source: ProvenanceSource;
  sourceId?: string;
}

export interface ResolvedTheme {
  themeId: string;
  themeVersion: string;
  schemaVersion: string;
  tokenSystemVersion: string;
  mode: AppearanceMode;
  tokens: FlatTokenMap;
  validation: ValidationReport;
  icons?: IconProviderConfig;
  /** Optional debug provenance — enable via `includeProvenance` on resolve options. */
  provenance?: Record<string, TokenProvenance>;
}

export interface ResolveThemeOptions {
  themeId: string;
  /** Explicit appearance mode; takes precedence over `modePreference`. */
  mode?: AppearanceMode;
  /** Selection preference (`system` is not a visual mode — pass `systemResolvedMode`). */
  modePreference?: ModePreference;
  /** Resolved OS/browser mode when `modePreference` is `system`. */
  systemResolvedMode?: AppearanceMode;
  tenantProfile?: TenantThemeProfile;
  /** When true, includes per-token provenance in the result (debug / generator tooling). */
  includeProvenance?: boolean;
}
