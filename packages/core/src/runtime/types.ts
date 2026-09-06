import { PLUGIN_CONTRACT_VERSION } from '../version';
import type { Environment } from '../environment/environment';
import type { Direction } from '../directionality/direction';
import type { ComponentId } from '../ids';

export interface CelestialPlugin {
  readonly id: string;
  readonly version: string;
  install(ctx: CelestialPluginContext): void | (() => void);
}

export interface CelestialPluginContext {
  readonly pluginContractVersion: string;
  registerService<T>(id: string, service: T): void;
  registerDefaultProps(componentId: ComponentId, props: Record<string, unknown>): void;
  registerDiagnosticSink(sink: (message: string) => void): void;
}

export interface CelestialRuntimeConfig {
  readonly direction?: Direction;
  readonly diagnostics?: boolean;
  readonly locale?: string;
  readonly messages?: Readonly<Record<string, string>>;
  readonly defaultProps?: Readonly<Record<string, Record<string, unknown>>>;
}

export interface CreateRuntimeOptions {
  readonly id?: string;
  readonly environment?: Environment;
  readonly direction?: Direction;
  readonly config?: Partial<CelestialRuntimeConfig>;
  readonly plugins?: readonly CelestialPlugin[];
}

export interface PluginRegistryView {
  readonly installed: readonly string[];
}

export interface CelestialRuntime {
  readonly id: string;
  readonly config: Readonly<CelestialRuntimeConfig>;
  readonly environment: Environment;
  readonly direction: Direction;
  readonly plugins: PluginRegistryView;
  getService<T>(id: string): T | undefined;
  getMessage(key: string): string | undefined;
  destroy(): void;
}
