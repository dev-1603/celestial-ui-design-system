import type { ComponentId } from '../ids';

export interface IdentityContract {
  readonly id: ComponentId;
  readonly version: string;
  readonly schemaVersion: string;
  readonly displayName?: string;
}

export interface DefaultsContract {
  readonly props?: Readonly<Record<string, unknown>>;
  readonly variants?: Readonly<Record<string, string>>;
  readonly size?: string;
}
