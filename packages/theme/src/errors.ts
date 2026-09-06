export type ThemeErrorLayer =
  | 'canonical'
  | 'mode'
  | 'theme'
  | 'tenant'
  | 'schema'
  | 'inheritance';

export type ThemeErrorCode =
  | 'SCHEMA_INCOMPATIBLE'
  | 'TOKEN_SYSTEM_INCOMPATIBLE'
  | 'THEME_ID_REQUIRED'
  | 'THEME_NAME_REQUIRED'
  | 'THEME_VERSION_REQUIRED'
  | 'THEME_PARENT_MISSING'
  | 'THEME_PARENT_SELF'
  | 'INHERITANCE_CYCLE'
  | 'INVALID_MODE'
  | 'DEFAULT_MODE_INVALID'
  | 'UNKNOWN_TOKEN_PATH'
  | 'OVERRIDE_FORBIDDEN'
  | 'INVALID_TOKEN_TYPE'
  | 'UNKNOWN_SLOT'
  | 'TENANT_ID_REQUIRED'
  | 'INVALID_OVERRIDE_VALUE'
  | 'THEME_NOT_FOUND'
  | 'MODE_NOT_SUPPORTED'
  | 'VALIDATION_FAILED'
  | 'INVALID_ALIAS'
  | 'DUPLICATE_THEME_ID';

export interface ThemeError {
  code: ThemeErrorCode;
  reason: string;
  path?: string;
  layer?: ThemeErrorLayer;
  field?: string;
}

export function themeError(
  code: ThemeErrorCode,
  reason: string,
  opts?: { path?: string; layer?: ThemeErrorLayer; field?: string },
): ThemeError {
  return { code, reason, ...opts };
}

export class ThemeResolutionError extends Error {
  readonly errors: ThemeError[];

  constructor(message: string, errors: ThemeError[]) {
    super(message);
    this.name = 'ThemeResolutionError';
    this.errors = errors;
  }
}
