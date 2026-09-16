import { createEnvironment } from '../environment/environment';
import { CoreRuntimeError, coreError } from '../diagnostics/errors';
import { createId } from '../ids';
import { PLUGIN_CONTRACT_VERSION } from '../version';
import type {
  CelestialPlugin,
  CelestialPluginContext,
  CelestialRuntime,
  CelestialRuntimeConfig,
  CreateRuntimeOptions,
  PluginRegistryView,
} from './types';

let defaultRuntime: CelestialRuntime | null = null;

function ignoreCleanupError(): void {
  // Plugin dispose() must not fail destroy(); cleanup is best-effort.
}

export function createCelestialRuntime(options: CreateRuntimeOptions = {}): CelestialRuntime {
  const services = new Map<string, unknown>();
  const installedPlugins: string[] = [];
  const disposers: Array<() => void> = [];
  let destroyed = false;

  const config: CelestialRuntimeConfig = Object.freeze({
    direction: options.direction ?? options.config?.direction ?? 'ltr',
    diagnostics: options.config?.diagnostics ?? true,
    locale: options.config?.locale,
    messages: options.config?.messages,
    defaultProps: options.config?.defaultProps,
  });

  const environment = options.environment ?? createEnvironment();

  const pluginContext: CelestialPluginContext = {
    pluginContractVersion: PLUGIN_CONTRACT_VERSION,
    registerService(id, service) {
      if (destroyed) return;
      services.set(id, service);
    },
    registerDefaultProps(_componentId, _props) {
      if (destroyed) return;
      // Reserved no-op: config.defaultProps is immutable after create.
      // Full default-props merge remains an adapter concern (v0.1).
    },
    registerDiagnosticSink(sink) {
      if (destroyed) return;
      disposers.push(() => sink(''));
    },
  };

  function installPlugin(plugin: CelestialPlugin): void {
    if (installedPlugins.includes(plugin.id)) {
      throw new CoreRuntimeError(
        'DUPLICATE_PLUGIN_ID',
        `Plugin "${plugin.id}" is already installed.`,
        coreError('DUPLICATE_PLUGIN_ID', `Duplicate plugin id: ${plugin.id}`, {
          layer: 'plugin',
        }),
      );
    }
    try {
      const dispose = plugin.install(pluginContext);
      installedPlugins.push(plugin.id);
      if (typeof dispose === 'function') {
        disposers.push(dispose);
      }
    } catch (err) {
      for (const dispose of disposers.splice(0)) {
        dispose();
      }
      installedPlugins.length = 0;
      services.clear();
      throw new CoreRuntimeError(
        'PLUGIN_INSTALL_FAILED',
        `Plugin "${plugin.id}" failed to install.`,
        coreError('PLUGIN_INSTALL_FAILED', err instanceof Error ? err.message : String(err), {
          layer: 'plugin',
        }),
      );
    }
  }

  for (const plugin of options.plugins ?? []) {
    installPlugin(plugin);
  }

  const runtime: CelestialRuntime = {
    id: options.id ?? createId('runtime'),
    config,
    environment,
    direction: config.direction ?? 'ltr',
    plugins: {
      get installed() {
        return [...installedPlugins];
      },
    } as PluginRegistryView,
    getService<T>(id: string): T | undefined {
      if (destroyed) return undefined;
      return services.get(id) as T | undefined;
    },
    getMessage(key: string): string | undefined {
      return config.messages?.[key];
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const dispose of disposers.splice(0).reverse()) {
        try {
          dispose();
        } catch {
          ignoreCleanupError();
        }
      }
      services.clear();
      installedPlugins.length = 0;
    },
  };

  return runtime;
}

/**
 * Optional CSR-only default runtime. **Unsafe for SSR / multi-tenant** —
 * prefer explicit `createCelestialRuntime()` per app or request.
 */
export function getDefaultRuntime(): CelestialRuntime {
  defaultRuntime ??= createCelestialRuntime();
  return defaultRuntime;
}

/** @internal Reset default runtime for tests. */
export function _resetDefaultRuntime(): void {
  defaultRuntime?.destroy();
  defaultRuntime = null;
}
