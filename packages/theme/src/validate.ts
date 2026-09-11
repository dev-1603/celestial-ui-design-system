import type { Token, TokenConfig } from '@celestial-ui/tokens';
import { flattenTokens } from '@celestial-ui/tokens/resolve';
import { TOKEN_SYSTEM_VERSION } from '@celestial-ui/tokens/types';
import type {
  TenantThemeProfile,
  ThemeConfig,
  ThemeOverrides,
  ThemeSlotId,
  ThemeValidationReport,
  TokenOverride,
  TokenOverrideValue,
} from './types';
import { SLOT_SCHEMA_VERSION, THEME_SCHEMA_VERSION } from './types';
import { canTenantOverride, canThemeOverride, getEffectivePolicy } from './policy';
import { isPathInSlot, isPolicyAllowedInSlot, THEME_SLOT_IDS } from './slots';
import type { ThemeRegistry } from './registry';
import { themeError } from './errors';
import { isCompatibleTokenSystem } from './version';
import { normalizeOverrideValue } from './patch';

function isTokenOverride(value: TokenOverride | TokenOverrideValue): value is TokenOverride {
  return typeof value === 'object' && value !== null && '$value' in value;
}

function validateRequiredThemeFields(theme: ThemeConfig, report: ThemeValidationReport): void {
  if (!theme.id?.trim()) {
    report.errors.push(
      themeError('THEME_ID_REQUIRED', 'Theme id is required.', { field: 'id', layer: 'schema' }),
    );
    report.isValid = false;
  }
  if (!theme.name?.trim()) {
    report.errors.push(
      themeError('THEME_NAME_REQUIRED', 'Theme name is required.', {
        field: 'name',
        layer: 'schema',
      }),
    );
    report.isValid = false;
  }
  if (!theme.version?.trim()) {
    report.errors.push(
      themeError('THEME_VERSION_REQUIRED', 'Theme version is required.', {
        field: 'version',
        layer: 'schema',
      }),
    );
    report.isValid = false;
  }
  if (!theme.schemaVersion?.trim()) {
    report.errors.push(
      themeError('SCHEMA_INCOMPATIBLE', 'Theme schemaVersion is required.', {
        field: 'schemaVersion',
        layer: 'schema',
      }),
    );
    report.isValid = false;
  } else if (theme.schemaVersion !== THEME_SCHEMA_VERSION) {
    report.warnings.push(
      themeError(
        'SCHEMA_INCOMPATIBLE',
        `Theme schemaVersion '${theme.schemaVersion}' differs from supported '${THEME_SCHEMA_VERSION}'.`,
        { field: 'schemaVersion', layer: 'schema' },
      ),
    );
  }

  if (
    theme.minTokenSystemVersion &&
    !isCompatibleTokenSystem(theme.minTokenSystemVersion, TOKEN_SYSTEM_VERSION)
  ) {
    report.errors.push(
      themeError(
        'TOKEN_SYSTEM_INCOMPATIBLE',
        `Theme requires token system >= '${theme.minTokenSystemVersion}' but current is '${TOKEN_SYSTEM_VERSION}'.`,
        { field: 'minTokenSystemVersion', layer: 'schema' },
      ),
    );
    report.isValid = false;
  }

  if (!theme.modes?.length) {
    report.errors.push(
      themeError('INVALID_MODE', 'Theme must declare at least one mode.', {
        field: 'modes',
        layer: 'schema',
      }),
    );
    report.isValid = false;
  }
  if (!theme.defaultMode) {
    report.errors.push(
      themeError('DEFAULT_MODE_INVALID', 'Theme defaultMode is required.', {
        field: 'defaultMode',
        layer: 'schema',
      }),
    );
    report.isValid = false;
  } else if (!theme.modes?.includes(theme.defaultMode)) {
    report.errors.push(
      themeError(
        'DEFAULT_MODE_INVALID',
        `Theme defaultMode '${theme.defaultMode}' is not listed in modes [${theme.modes.join(', ')}].`,
        { field: 'defaultMode', layer: 'schema' },
      ),
    );
    report.isValid = false;
  }
}

function validateThemeOverrides(
  overrides: ThemeOverrides | undefined,
  catalogFlat: Record<string, Token>,
  report: ThemeValidationReport,
  layer: 'theme' | 'tenant',
  context: string,
  allowFn: (path: string, token: Token, slotId?: ThemeSlotId) => boolean,
  slotId?: ThemeSlotId,
): void {
  if (!overrides) {
    return;
  }

  for (const [path, override] of Object.entries(overrides)) {
    if (override === null || override === undefined) {
      report.errors.push(
        themeError(
          'INVALID_OVERRIDE_VALUE',
          `${context}: override for '${path}' cannot be null or undefined — omit the key instead.`,
          { path, layer },
        ),
      );
      report.isValid = false;
      continue;
    }

    const catalogToken = catalogFlat[path];
    if (!catalogToken) {
      report.errors.push(
        themeError(
          'UNKNOWN_TOKEN_PATH',
          `${context}: token path '${path}' does not exist in the canonical catalog.`,
          { path, layer },
        ),
      );
      report.isValid = false;
      continue;
    }

    if (!allowFn(path, catalogToken, slotId)) {
      report.errors.push(
        themeError(
          'OVERRIDE_FORBIDDEN',
          `${context}: override of '${path}' is not permitted by policy.`,
          { path, layer },
        ),
      );
      report.isValid = false;
      continue;
    }

    const value = normalizeOverrideValue(override);
    if (typeof value === 'string' && value.includes('{')) {
      continue;
    }

    const explicitType = isTokenOverride(override) ? override.$type : undefined;
    if (explicitType && explicitType !== catalogToken.$type) {
      report.errors.push(
        themeError(
          'INVALID_TOKEN_TYPE',
          `${context}: token '${path}' type mismatch — expected '${catalogToken.$type}', got '${explicitType}'.`,
          { path, layer },
        ),
      );
      report.isValid = false;
    }
  }
}

export function validateThemeConfig(
  registry: ThemeRegistry,
  theme: ThemeConfig,
  catalogFlat: Record<string, Token>,
): ThemeValidationReport {
  const report: ThemeValidationReport = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  validateRequiredThemeFields(theme, report);

  if (theme.parentId) {
    if (theme.parentId === theme.id) {
      report.errors.push(
        themeError('THEME_PARENT_SELF', `Theme '${theme.id}' cannot be its own parent.`, {
          field: 'parentId',
          layer: 'inheritance',
        }),
      );
      report.isValid = false;
    } else if (!registry.has(theme.parentId)) {
      report.errors.push(
        themeError(
          'THEME_PARENT_MISSING',
          `Theme parent '${theme.parentId}' does not exist in the registry.`,
          { field: 'parentId', layer: 'inheritance' },
        ),
      );
      report.isValid = false;
    } else {
      try {
        registry.getInheritanceChain(theme.id);
      } catch (error) {
        report.errors.push(
          themeError('INHERITANCE_CYCLE', (error as Error).message, { layer: 'inheritance' }),
        );
        report.isValid = false;
      }
    }
  }

  for (const mode of theme.modes) {
    if (mode !== 'light' && mode !== 'dark') {
      report.errors.push(
        themeError(
          'INVALID_MODE',
          `Invalid mode '${mode}' — only 'light' and 'dark' are supported.`,
          {
            field: 'modes',
            layer: 'mode',
          },
        ),
      );
      report.isValid = false;
    }
  }

  validateThemeOverrides(
    theme.overrides,
    catalogFlat,
    report,
    'theme',
    `Theme '${theme.id}'`,
    (path, token) => canThemeOverride(path, token),
  );

  return report;
}

export function validateTenantThemeProfile(
  registry: ThemeRegistry,
  profile: TenantThemeProfile,
  catalogFlat: Record<string, Token>,
): ThemeValidationReport {
  const report: ThemeValidationReport = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!profile.tenantId?.trim()) {
    report.errors.push(
      themeError('TENANT_ID_REQUIRED', 'Tenant profile tenantId is required.', {
        field: 'tenantId',
        layer: 'tenant',
      }),
    );
    report.isValid = false;
  }
  if (!profile.baseThemeId?.trim()) {
    report.errors.push(
      themeError('VALIDATION_FAILED', 'Tenant profile baseThemeId is required.', {
        field: 'baseThemeId',
        layer: 'tenant',
      }),
    );
    report.isValid = false;
  }
  if (!profile.schemaVersion?.trim()) {
    report.errors.push(
      themeError('SCHEMA_INCOMPATIBLE', 'Tenant profile schemaVersion is required.', {
        field: 'schemaVersion',
        layer: 'tenant',
      }),
    );
    report.isValid = false;
  }
  if (profile.slotSchemaVersion && profile.slotSchemaVersion !== SLOT_SCHEMA_VERSION) {
    report.warnings.push(
      themeError(
        'SCHEMA_INCOMPATIBLE',
        `Tenant slotSchemaVersion '${profile.slotSchemaVersion}' differs from supported '${SLOT_SCHEMA_VERSION}'.`,
        { field: 'slotSchemaVersion', layer: 'tenant' },
      ),
    );
  }
  if (profile.baseThemeId && !registry.has(profile.baseThemeId)) {
    report.errors.push(
      themeError(
        'THEME_NOT_FOUND',
        `Tenant baseThemeId '${profile.baseThemeId}' is not registered.`,
        { field: 'baseThemeId', layer: 'tenant' },
      ),
    );
    report.isValid = false;
  }
  if (
    profile.modePreference &&
    profile.modePreference !== 'light' &&
    profile.modePreference !== 'dark' &&
    profile.modePreference !== 'system'
  ) {
    report.errors.push(
      themeError('INVALID_MODE', `Invalid modePreference '${profile.modePreference}'.`, {
        field: 'modePreference',
        layer: 'mode',
      }),
    );
    report.isValid = false;
  }

  if (profile.slots) {
    for (const [slotId, overrides] of Object.entries(profile.slots)) {
      if (!THEME_SLOT_IDS.includes(slotId as ThemeSlotId)) {
        report.errors.push(
          themeError('UNKNOWN_SLOT', `Tenant profile references unknown slot '${slotId}'.`, {
            field: 'slots',
            layer: 'tenant',
          }),
        );
        report.isValid = false;
        continue;
      }
      if (!overrides) {
        continue;
      }
      validateThemeOverrides(
        overrides,
        catalogFlat,
        report,
        'tenant',
        `Tenant '${profile.tenantId}' slot '${slotId}'`,
        (path, token, declaredSlot) =>
          canTenantOverride(
            path,
            token,
            isPathInSlot(path, declaredSlot!),
            isPolicyAllowedInSlot(getEffectivePolicy(path, token), declaredSlot!),
          ),
        slotId as ThemeSlotId,
      );
    }
  }

  return report;
}

export function getCatalogFlatForMode(catalogConfig: TokenConfig): Record<string, Token> {
  return flattenTokens(catalogConfig);
}
