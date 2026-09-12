/**
 * Optional peer loading for provider adapters.
 *
 * Specifiers are allowlisted. Adapters never `require()` caller-controlled
 * paths. Bundlers see a small fixed set of peer package names and can
 * externalize them. File-based peers (Heroicons, Phosphor SVGs) are read
 * from the resolved package root after the relative path is validated.
 */
import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { dirname, join, normalize, relative, sep } from 'path';

const nodeRequire = createRequire(__filename);

/** npm packages adapters may load. Includes Iconify collection packages. */
const PEER_PACKAGE_PATTERN =
  /^(lucide-static|@fortawesome\/fontawesome-svg-core|@fortawesome\/free-solid-svg-icons|@fortawesome\/free-regular-svg-icons|@phosphor-icons\/core|@iconify\/utils|heroicons|@iconify-json\/[a-z][a-z0-9-]*)$/;

const RELATIVE_ASSET_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9/_.-]*\.svg$/;

export function isAllowlistedPeer(packageName: string): boolean {
  return PEER_PACKAGE_PATTERN.test(packageName);
}

export function isPeerInstalled(packageName: string): boolean {
  return resolvePeerPackageRoot(packageName) !== undefined;
}

export function loadOptionalPeer<T>(packageName: string): T | undefined {
  if (!isAllowlistedPeer(packageName)) return undefined;
  try {
    return nodeRequire(packageName) as T;
  } catch {
    return undefined;
  }
}

export function readPeerPackageVersion(packageName: string): string | undefined {
  const root = resolvePeerPackageRoot(packageName);
  if (!root) return undefined;
  try {
    const raw = readFileSync(join(root, 'package.json'), 'utf8');
    const parsed = JSON.parse(raw) as { version?: unknown };
    return typeof parsed.version === 'string' ? parsed.version : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Read a relative SVG (or other text) asset from an installed peer package.
 * Rejects path traversal and non-allowlisted package names.
 */
export function readOptionalPeerAsset(
  packageName: string,
  relativePath: string,
): string | undefined {
  if (!isAllowlistedPeer(packageName)) return undefined;
  if (!RELATIVE_ASSET_PATTERN.test(relativePath)) return undefined;

  const root = resolvePeerPackageRoot(packageName);
  if (!root) return undefined;

  const resolved = normalize(join(root, relativePath));
  const rel = relative(root, resolved);
  if (rel.startsWith('..') || rel.startsWith(`..${sep}`) || rel.includes(`..${sep}`)) {
    return undefined;
  }

  try {
    return readFileSync(resolved, 'utf8');
  } catch {
    return undefined;
  }
}

export function resolvePeerPackageRoot(packageName: string): string | undefined {
  if (!isAllowlistedPeer(packageName)) return undefined;

  const candidates = [`${packageName}/package.json`, packageName];
  for (const specifier of candidates) {
    try {
      const resolved = nodeRequire.resolve(specifier);
      if (specifier.endsWith('/package.json')) {
        return dirname(resolved);
      }
      return findPackageRoot(dirname(resolved), packageName);
    } catch {
      continue;
    }
  }
  return undefined;
}

function findPackageRoot(startDir: string, packageName: string): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 8; i++) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const parsed = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string };
        if (parsed.name === packageName) return dir;
      } catch {
        /* continue walking */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}
