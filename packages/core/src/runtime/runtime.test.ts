import { describe, it, expect, afterEach } from 'vitest';
import { createCelestialRuntime, _resetDefaultRuntime } from '../runtime/runtime';
import { CoreRuntimeError } from '../diagnostics/errors';
import { PLUGIN_CONTRACT_VERSION } from '../version';

describe('plugins', () => {
  afterEach(() => {
    _resetDefaultRuntime();
  });

  it('rejects duplicate plugin ids', () => {
    const plugin = {
      id: 'test-plugin',
      version: '1.0.0',
      install() {},
    };
    expect(() => createCelestialRuntime({ plugins: [plugin, plugin] })).toThrow(CoreRuntimeError);
  });

  it('rolls back on failed install', () => {
    const good = { id: 'good', version: '1.0.0', install() {} };
    const bad = {
      id: 'bad',
      version: '1.0.0',
      install() {
        throw new Error('fail');
      },
    };
    expect(() => createCelestialRuntime({ plugins: [good, bad] })).toThrow(CoreRuntimeError);
  });

  it('accepts registerDefaultProps without mutating config.defaultProps', () => {
    const initial = { button: { size: 'md' } };
    const runtime = createCelestialRuntime({
      config: { defaultProps: initial },
      plugins: [
        {
          id: 'defaults-probe',
          version: '1.0.0',
          install(ctx) {
            ctx.registerDefaultProps('button', { size: 'lg' });
            expect(ctx.pluginContractVersion).toBe(PLUGIN_CONTRACT_VERSION);
          },
        },
      ],
    });
    expect(runtime.plugins.installed).toEqual(['defaults-probe']);
    expect(runtime.config.defaultProps).toBe(initial);
    expect(runtime.config.defaultProps).toEqual({ button: { size: 'md' } });
  });
});
