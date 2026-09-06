/**
 * Application-level icon configuration store.
 *
 * Provides `configureCelestialIcons()` for CSR applications and
 * `getIconConfig()` for the resolver to read the effective configuration.
 *
 * SSR note: The module-level singleton is shared across requests in SSR
 * environments. Framework adapters should pass explicit `IconConfig` to
 * `resolveIcon()` rather than relying on this singleton for per-request
 * configuration.
 */
import type { IconConfig, IconThemeHint } from './types';
import { iconError, IconResolutionError } from './errors';
import { isValidProviderId } from './ids';

const DEFAULT_CONFIG: IconConfig = {
  provider: 'lucide',
  fallback: [],
  missingIconPolicy: { kind: 'empty' },
  explicitProviderPolicy: 'apply-missing-policy',
  diagnostics: false,
};

/** @internal — module-level config state */
let _config: IconConfig = { ...DEFAULT_CONFIG };

function validateConfig(config: Partial<IconConfig>): void {
  if ('provider' in config && config.provider !== undefined) {
    if (!isValidProviderId(config.provider)) {
      throw new IconResolutionError(
        'Invalid icon configuration.',
        iconError(
          'INVALID_CONFIG',
          `Invalid provider id '${config.provider}': must start with a letter and contain only alphanumeric characters, hyphens, or underscores.`,
          { layer: 'config' },
        ),
      );
    }
  }

  if ('fallback' in config && config.fallback !== undefined) {
    for (const id of config.fallback) {
      if (!isValidProviderId(id)) {
        throw new IconResolutionError(
          'Invalid icon configuration.',
          iconError(
            'INVALID_CONFIG',
            `Invalid fallback provider id '${id}': must start with a letter and contain only alphanumeric characters, hyphens, or underscores.`,
            { layer: 'config' },
          ),
        );
      }
    }
  }

  if ('explicitProviderPolicy' in config && config.explicitProviderPolicy !== undefined) {
    const valid = ['apply-missing-policy', 'allow-fallback'];
    if (!valid.includes(config.explicitProviderPolicy)) {
      throw new IconResolutionError(
        'Invalid icon configuration.',
        iconError(
          'INVALID_CONFIG',
          `Invalid explicitProviderPolicy '${config.explicitProviderPolicy}'. Must be one of: ${valid.join(', ')}.`,
          { layer: 'config' },
        ),
      );
    }
  }
}

/**
 * Configure the Celestial icon system at application level.
 *
 * Call once at application startup (before any icon resolution occurs).
 * Subsequent calls overwrite the previous configuration.
 *
 * @example
 * ```ts
 * configureCelestialIcons({
 *   provider: 'lucide',
 *   fallback: ['phosphor', 'material'],
 * });
 * ```
 */
export function configureCelestialIcons(config: Partial<IconConfig>): void {
  validateConfig(config);
  _config = { ...DEFAULT_CONFIG, ...config };
}

/**
 * Returns the current effective icon configuration.
 * The resolver calls this on every resolution pass.
 */
export function getIconConfig(): Readonly<IconConfig> {
  return _config;
}

/**
 * Resets icon configuration to defaults.
 *
 * @internal — intended for testing only.
 * Do not call from application code.
 */
export function _resetIconConfig(): void {
  _config = { ...DEFAULT_CONFIG };
}

/**
 * Build an `IconConfig` from a theme-layer hint (`ResolvedTheme.icons`)
 * without depending on `@celestial-ui/theme`.
 *
 * Theme never resolves icons. Framework adapters should pass the returned
 * config into `resolveIcon()` (SSR-safe) rather than mutating the singleton.
 */
export function iconConfigFromThemeHint(
  hint: IconThemeHint | undefined,
  overrides: Partial<IconConfig> = {},
): IconConfig {
  const merged: IconConfig = {
    ...DEFAULT_CONFIG,
    ...(hint?.provider !== undefined ? { provider: hint.provider } : {}),
    ...overrides,
  };
  validateConfig(merged);
  return merged;
}

/**
 * Map a resolved-theme-shaped object (`{ icons?: IconThemeHint }`) to IconConfig.
 * Structural typing only — this package does not import `@celestial-ui/theme`.
 * Theme `options` (e.g. Iconify collection) are adapter setup, not resolver config.
 */
export function iconConfigFromResolvedTheme(
  theme: { icons?: IconThemeHint } | undefined,
  overrides: Partial<IconConfig> = {},
): IconConfig {
  return iconConfigFromThemeHint(theme?.icons, overrides);
}
