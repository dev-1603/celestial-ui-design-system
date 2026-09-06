export type PropTypeDescriptor =
  | 'boolean'
  | 'string'
  | 'number'
  | 'enum'
  | 'unknown';

export type PropMapsTo =
  | 'state'
  | 'variant'
  | 'native'
  | 'aria'
  | 'slot'
  | 'event';

export interface PropDefinition {
  readonly name: string;
  readonly type: PropTypeDescriptor;
  readonly enumValues?: readonly string[];
  readonly required?: boolean;
  readonly default?: unknown;
  readonly controlled?: boolean;
  readonly description?: string;
  readonly mapsTo?: PropMapsTo;
}

export interface PropsContract {
  readonly props: Readonly<Record<string, PropDefinition>>;
  readonly nativePassthrough?: 'none' | 'root' | 'control';
}
