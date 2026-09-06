import type { StyleScope } from './types';

export type StyleErrorCode =
  | 'INVALID_RESOLVED_THEME'
  | 'UNRESOLVED_ALIAS'
  | 'UNSUPPORTED_TOKEN_TYPE'
  | 'INVALID_CSS_VALUE'
  | 'SEMANTIC_TOKEN_MISSING'
  | 'VARIABLE_COLLISION'
  | 'INVALID_SCOPE'
  | 'SCOPE_NESTING_INVALID'
  | 'MODE_SET_INCOMPLETE'
  | 'SSR_HYDRATION_MISMATCH'
  | 'DOM_UNAVAILABLE'
  | 'STYLE_ATTACHMENT_FAILED'
  | 'CSP_NONCE_INVALID';

export interface StyleError {
  code: StyleErrorCode;
  reason: string;
  path?: string;
  tokenType?: string;
  scope?: StyleScope;
}

export function styleError(
  code: StyleErrorCode,
  reason: string,
  details?: Pick<StyleError, 'path' | 'tokenType' | 'scope'>,
): StyleError {
  return { code, reason, ...details };
}

export class StyleCompilationError extends Error {
  readonly errors: readonly StyleError[];

  constructor(errors: StyleError | StyleError[]) {
    const list = Array.isArray(errors) ? errors : [errors];
    super(list.map((e) => `[${e.code}] ${e.reason}`).join('; '));
    this.name = 'StyleCompilationError';
    this.errors = list;
  }
}

export class StyleRuntimeError extends Error {
  readonly code: StyleErrorCode;
  readonly scope?: StyleScope;

  constructor(code: StyleErrorCode, reason: string, scope?: StyleScope) {
    super(reason);
    this.name = 'StyleRuntimeError';
    this.code = code;
    this.scope = scope;
  }
}
