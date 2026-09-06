import { coreWarn, coreError } from '../diagnostics/errors';

export type LocalizationKey =
  | 'closeLabel'
  | 'emptyMessage'
  | 'loadingMessage'
  | 'noResultsMessage'
  | 'ariaLabel'
  | (string & {});

export interface LocalizationKeysContract {
  readonly keys: readonly LocalizationKey[];
  readonly required?: readonly LocalizationKey[];
}

export interface MessageResolverOptions {
  readonly messages?: Readonly<Record<string, string>>;
  readonly componentId?: string;
}

export function resolveMessage(
  key: LocalizationKey,
  options: MessageResolverOptions = {},
): string {
  const value = options.messages?.[key];
  if (value !== undefined) return value;
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    coreWarn(
      coreError('MISSING_LOCALIZATION_KEY', `Missing localization key: ${key}`, {
        layer: 'contract',
        componentId: options.componentId,
      }),
    );
  }
  return '';
}

export function createMessageResolver(
  messages?: Readonly<Record<string, string>>,
): (key: LocalizationKey) => string {
  return (key) => resolveMessage(key, { messages });
}
