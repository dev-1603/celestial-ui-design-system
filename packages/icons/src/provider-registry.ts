/**
 * Runtime provider registry.
 *
 * Holds all registered `IconProviderAdapter` instances.
 * Pattern mirrors `ThemeRegistry` from @celestial-ui/theme.
 *
 * INVARIANTS:
 * - Duplicate provider IDs throw at registration time.
 * - The registry is the single source of truth for available providers.
 * - The registry itself does not perform resolution — it only stores adapters.
 */
import type { IconProviderAdapter, ProviderId } from './types';
import {
  IconProviderRegistrationError,
  iconError,
} from './errors';
import { PROVIDER_CONTRACT_VERSION } from './version';
import { isValidProviderId } from './ids';

const REQUIRED_ADAPTER_FIELDS: Array<keyof IconProviderAdapter> = [
  'id',
  'displayName',
  'version',
  'catalogueSchemaVersion',
  'capabilities',
  'resolveNativeName',
  'canSatisfyVariant',
  'resolve',
];

function validateAdapter(adapter: IconProviderAdapter): void {
  const errors: ReturnType<typeof iconError>[] = [];

  for (const field of REQUIRED_ADAPTER_FIELDS) {
    if (adapter[field] === undefined || adapter[field] === null) {
      errors.push(
        iconError(
          'INVALID_PROVIDER_ADAPTER',
          `Adapter is missing required field '${String(field)}'.`,
          { layer: 'provider', providerId: adapter.id },
        ),
      );
    }
  }

  if (!adapter.id?.trim()) {
    errors.push(
      iconError('INVALID_PROVIDER_ADAPTER', 'Adapter id must be a non-empty string.', {
        layer: 'provider',
      }),
    );
  } else if (!isValidProviderId(adapter.id)) {
    errors.push(
      iconError(
        'INVALID_PROVIDER_ADAPTER',
        `Adapter id '${adapter.id}' is invalid. IDs must start with a letter and contain only alphanumeric characters, hyphens, or underscores.`,
        { layer: 'provider', providerId: adapter.id },
      ),
    );
  }

  if (typeof adapter.resolveNativeName !== 'function') {
    errors.push(
      iconError(
        'INVALID_PROVIDER_ADAPTER',
        'Adapter resolveNativeName must be a function.',
        { layer: 'provider', providerId: adapter.id },
      ),
    );
  }

  if (typeof adapter.canSatisfyVariant !== 'function') {
    errors.push(
      iconError(
        'INVALID_PROVIDER_ADAPTER',
        'Adapter canSatisfyVariant must be a function.',
        { layer: 'provider', providerId: adapter.id },
      ),
    );
  }

  if (typeof adapter.resolve !== 'function') {
    errors.push(
      iconError(
        'INVALID_PROVIDER_ADAPTER',
        'Adapter resolve must be a function.',
        { layer: 'provider', providerId: adapter.id },
      ),
    );
  }

  if (errors.length > 0) {
    throw new IconProviderRegistrationError(
      `Invalid adapter '${adapter.id}': ${errors[0]!.reason}`,
      errors,
    );
  }
}

export class IconProviderRegistry {
  private readonly adapters = new Map<ProviderId, IconProviderAdapter>();

  /**
   * Register an icon provider adapter.
   *
   * @throws {IconProviderRegistrationError} if the adapter is invalid or the id is already registered.
   */
  register(adapter: IconProviderAdapter): void {
    validateAdapter(adapter);

    if (this.adapters.has(adapter.id)) {
      throw new IconProviderRegistrationError(
        `Provider '${adapter.id}' is already registered. Use a unique provider id.`,
        iconError('DUPLICATE_PROVIDER_ID', `Provider '${adapter.id}' is already registered.`, {
          layer: 'provider',
          providerId: adapter.id,
        }),
      );
    }

    this.adapters.set(adapter.id, adapter);
  }

  /** Returns true if a provider with the given id is registered. */
  has(providerId: ProviderId): boolean {
    return this.adapters.has(providerId);
  }

  /**
   * Returns the adapter for the given provider id.
   * @throws {Error} if the provider is not registered.
   */
  get(providerId: ProviderId): IconProviderAdapter {
    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      throw new Error(
        `Icon provider '${providerId}' is not registered. ` +
          `Register it before resolving icons: import the provider and call registry.register(adapter).`,
      );
    }
    return adapter;
  }

  /** Returns all registered adapters. */
  list(): readonly IconProviderAdapter[] {
    return [...this.adapters.values()];
  }

  /** Returns all registered provider IDs. */
  listIds(): readonly ProviderId[] {
    return [...this.adapters.keys()];
  }

  /**
   * Removes a provider from the registry.
   * Intended for testing and dynamic provider lifecycle management.
   */
  unregister(providerId: ProviderId): void {
    this.adapters.delete(providerId);
  }

  /** Clears all registered providers. Intended for testing only. */
  clear(): void {
    this.adapters.clear();
  }

  /**
   * Returns the installed provider contract version this registry enforces.
   * Useful for diagnostic tooling.
   */
  get contractVersion(): string {
    return PROVIDER_CONTRACT_VERSION;
  }
}

/**
 * The module-level default registry.
 * Most applications use this single instance.
 * Framework adapters may supply an explicit registry instance for isolation.
 */
export const defaultIconProviderRegistry = new IconProviderRegistry();

/**
 * Register a provider in the default registry.
 * Convenience wrapper for `defaultIconProviderRegistry.register(adapter)`.
 */
export function registerIconProvider(adapter: IconProviderAdapter): void {
  defaultIconProviderRegistry.register(adapter);
}
