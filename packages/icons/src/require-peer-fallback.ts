/**
 * Node ESM fallback when a static `require('…')` call site is not defined.
 *
 * Adapters must still `require('package-name')` with a string literal so
 * bundlers can see the specifier. This helper is only the catch path.
 *
 * Uses `process.getBuiltinModule` (Node 22+) so this file does not import
 * `module` / `fs` (those imports are not browser-safe).
 */
export function requirePeerFallback(specifier: string): unknown {
  try {
    const proc = globalThis.process as
      | {
          cwd?: () => string;
          getBuiltinModule?: (name: string) => {
            createRequire?: (filename: string) => (id: string) => unknown;
          };
        }
      | undefined;
    const createRequire = proc?.getBuiltinModule?.('module')?.createRequire;
    if (typeof createRequire !== 'function') return undefined;
    const root = typeof proc?.cwd === 'function' ? proc.cwd() : '.';
    return createRequire(`${root}/package.json`)(specifier);
  } catch {
    return undefined;
  }
}
