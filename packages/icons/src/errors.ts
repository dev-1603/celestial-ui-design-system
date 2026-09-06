/**
 * Typed error layer for @celestial-ui/icons.
 * Mirrors the pattern established in @celestial-ui/theme/src/errors.ts.
 */

export type IconErrorLayer =
  | 'request'
  | 'canonical'
  | 'provider'
  | 'mapping'
  | 'capability'
  | 'fallback'
  | 'catalogue'
  | 'config';

export type IconErrorCode =
  // Request errors
  | 'INVALID_ICON_NAME'
  | 'INVALID_PROVIDER_ID'
  | 'INVALID_VARIANT'
  // Resolution errors
  | 'CANONICAL_NOT_FOUND'
  | 'PROVIDER_NOT_REGISTERED'
  | 'PROVIDER_MAPPING_MISSING'
  | 'CAPABILITY_MISMATCH'
  | 'EXPLICIT_PROVIDER_FAILED'
  | 'ALL_PROVIDERS_FAILED'
  // Registry errors
  | 'DUPLICATE_PROVIDER_ID'
  | 'INVALID_PROVIDER_ADAPTER'
  // Catalogue errors
  | 'CATALOGUE_SCHEMA_MISMATCH'
  | 'CATALOGUE_INVALID'
  | 'CATALOGUE_LOAD_FAILED'
  // Config errors
  | 'INVALID_CONFIG'
  | 'NO_DEFAULT_PROVIDER';

export interface IconError {
  readonly code: IconErrorCode;
  readonly reason: string;
  readonly layer?: IconErrorLayer;
  readonly iconName?: string;
  readonly providerId?: string;
}

export function iconError(
  code: IconErrorCode,
  reason: string,
  opts?: Pick<IconError, 'layer' | 'iconName' | 'providerId'>,
): IconError {
  return { code, reason, ...opts };
}

/**
 * Thrown when icon resolution fails unrecoverably
 * (e.g. `missingIconPolicy: { kind: 'error' }` or invalid adapter).
 */
export class IconResolutionError extends Error {
  readonly errors: readonly IconError[];

  constructor(message: string, errors: IconError | readonly IconError[]) {
    const list = Array.isArray(errors) ? errors : [errors];
    super(message);
    this.name = 'IconResolutionError';
    this.errors = list as readonly IconError[];
  }
}

/**
 * Thrown during provider registration when the adapter is structurally invalid.
 */
export class IconProviderRegistrationError extends Error {
  readonly errors: readonly IconError[];

  constructor(message: string, errors: IconError | readonly IconError[]) {
    const list = Array.isArray(errors) ? errors : [errors];
    super(message);
    this.name = 'IconProviderRegistrationError';
    this.errors = list as readonly IconError[];
  }
}
