export type CoreErrorLayer =
  | 'contract'
  | 'runtime'
  | 'plugin'
  | 'environment'
  | 'a11y'
  | 'behavior'
  | 'collection'
  | 'overlay';

export type CoreErrorCode =
  | 'INVALID_CONTRACT'
  | 'SCHEMA_INCOMPATIBLE'
  | 'INVALID_COMPONENT_ID'
  | 'DUPLICATE_PLUGIN_ID'
  | 'PLUGIN_INSTALL_FAILED'
  | 'DOM_UNAVAILABLE'
  | 'INVALID_STATE'
  | 'CONTROLLED_MODE_SWITCH'
  | 'MISSING_LOCALIZATION_KEY'
  | 'MISSING_ACCESSIBLE_NAME'
  | 'INVALID_POLYMORPHISM'
  | 'RUNTIME_DESTROYED'
  | 'VALIDATION_FAILED';

export interface CoreError {
  readonly id: string;
  readonly code: CoreErrorCode;
  readonly reason: string;
  readonly layer?: CoreErrorLayer;
  readonly componentId?: string;
}

const ERROR_ID_MAP: Record<CoreErrorCode, string> = {
  INVALID_CONTRACT: 'CUI-CORE-001',
  SCHEMA_INCOMPATIBLE: 'CUI-CORE-002',
  INVALID_COMPONENT_ID: 'CUI-CORE-003',
  DUPLICATE_PLUGIN_ID: 'CUI-CORE-004',
  PLUGIN_INSTALL_FAILED: 'CUI-CORE-005',
  DOM_UNAVAILABLE: 'CUI-CORE-006',
  INVALID_STATE: 'CUI-CORE-007',
  CONTROLLED_MODE_SWITCH: 'CUI-CORE-008',
  MISSING_LOCALIZATION_KEY: 'CUI-CORE-009',
  MISSING_ACCESSIBLE_NAME: 'CUI-CORE-010',
  INVALID_POLYMORPHISM: 'CUI-CORE-011',
  RUNTIME_DESTROYED: 'CUI-CORE-012',
  VALIDATION_FAILED: 'CUI-CORE-013',
};

export function coreError(
  code: CoreErrorCode,
  reason: string,
  opts?: { layer?: CoreErrorLayer; componentId?: string },
): CoreError {
  return {
    id: ERROR_ID_MAP[code],
    code,
    reason,
    ...opts,
  };
}

export class CoreContractError extends Error {
  readonly errors: readonly CoreError[];

  constructor(message: string, errors: CoreError | readonly CoreError[]) {
    const list = Array.isArray(errors) ? errors : [errors];
    super(message);
    this.name = 'CoreContractError';
    this.errors = list;
  }
}

export class CoreRuntimeError extends Error {
  readonly code: CoreErrorCode;
  readonly errors: readonly CoreError[];

  constructor(code: CoreErrorCode, message: string, errors?: CoreError | readonly CoreError[]) {
    super(message);
    this.name = 'CoreRuntimeError';
    this.code = code;
    this.errors = errors ? (Array.isArray(errors) ? errors : [errors]) : [coreError(code, message)];
  }
}

let diagnosticsEnabled = true;

export function setDiagnosticsEnabled(enabled: boolean): void {
  diagnosticsEnabled = enabled;
}

export function coreWarn(error: CoreError): void {
  if (!diagnosticsEnabled) return;
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return;
  }
  const prefix = `[${error.id}]`;
  const context = error.componentId ? ` (${error.componentId})` : '';
  console.warn(`${prefix}${context} ${error.reason}`);
}
