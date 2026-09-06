import { describe, it, expect, afterEach } from 'vitest';
import { createCelestialRuntime, _resetDefaultRuntime } from '../runtime/runtime';
import { CoreRuntimeError } from '../diagnostics/errors';

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
    expect(() =>
      createCelestialRuntime({ plugins: [plugin, plugin] }),
    ).toThrow(CoreRuntimeError);
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
    expect(() => createCelestialRuntime({ plugins: [good, bad] })).toThrow(
      CoreRuntimeError,
    );
  });
});
