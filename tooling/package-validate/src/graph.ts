import type { PackageInfo, ValidationFinding } from './types.js';

const FRAMEWORK_RE = /\b(react|vue|svelte|angular|next|nuxt|sveltekit)\b/i;

const ALLOWED_EDGES: Record<string, string[]> = {
  '@celestial-ui/tokens': [],
  '@celestial-ui/theme': ['@celestial-ui/tokens'],
  '@celestial-ui/styles': ['@celestial-ui/tokens', '@celestial-ui/theme'],
  '@celestial-ui/icons': [],
  '@celestial-ui/core': [],
};

const FORBIDDEN_CORE_DEPS = [
  '@celestial-ui/tokens',
  '@celestial-ui/theme',
  '@celestial-ui/styles',
  '@celestial-ui/icons',
  'react',
  'react-dom',
  'vue',
  'svelte',
];

function collectDeps(pkg: PackageInfo): string[] {
  const deps = pkg.packageJson.dependencies as Record<string, string> | undefined;
  const peers = pkg.packageJson.peerDependencies as Record<string, string> | undefined;
  return [...Object.keys(deps ?? {}), ...Object.keys(peers ?? {})];
}

function collectRuntimeDeps(pkg: PackageInfo): Record<string, string> {
  return (pkg.packageJson.dependencies as Record<string, string> | undefined) ?? {};
}

export function validateDependencyGraph(packages: PackageInfo[]): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));

  const edges: Array<{ from: string; to: string }> = [];
  for (const pkg of packages) {
    const runtimeDeps = collectRuntimeDeps(pkg);
    for (const [dep, version] of Object.entries(runtimeDeps)) {
      edges.push({ from: pkg.name, to: dep });

      if (version.startsWith('workspace:') && !byName.has(dep)) {
        findings.push({
          package: pkg.name,
          category: 'dependency-graph',
          severity: 'BLOCKER',
          reason: `Workspace dependency ${dep} is not a workspace package`,
          remediation: 'Add the dependency package to the workspace or use a registry version',
        });
      }
    }
  }

  const adjacency = new Map<string, string[]>();
  for (const { from, to } of edges) {
    if (!byName.has(to)) continue;
    const list = adjacency.get(from) ?? [];
    list.push(to);
    adjacency.set(from, list);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(node: string, stack: string[]): void {
    if (visiting.has(node)) {
      findings.push({
        package: node,
        category: 'dependency-graph',
        severity: 'BLOCKER',
        reason: `Circular dependency detected: ${[...stack, node].join(' -> ')}`,
        remediation: 'Remove the circular workspace dependency edge',
      });
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of adjacency.get(node) ?? []) {
      dfs(next, [...stack, node]);
    }
    visiting.delete(node);
    visited.add(node);
  }

  for (const pkg of packages) {
    dfs(pkg.name, []);
  }

  for (const pkg of packages) {
    if (pkg.private) continue;
    const runtimeDeps = collectRuntimeDeps(pkg);
    for (const dep of Object.keys(runtimeDeps)) {
      if (dep.startsWith('@celestial-ui/') && dep.includes('eslint-config')) {
        findings.push({
          package: pkg.name,
          category: 'dependency-graph',
          severity: 'BLOCKER',
          reason: `Runtime dependency on internal tooling ${dep}`,
          remediation: 'Move tooling packages to devDependencies only',
        });
      }
      if (['typescript', 'vitest', 'eslint'].includes(dep)) {
        findings.push({
          package: pkg.name,
          category: 'dependency-graph',
          severity: 'REQUIRED',
          reason: `${dep} must not be a runtime dependency of ${pkg.name}`,
          remediation: `Move ${dep} to devDependencies`,
        });
      }
    }
  }

  if (byName.has('@celestial-ui/core')) {
    const coreDeps = collectDeps(byName.get('@celestial-ui/core')!);
    for (const dep of coreDeps) {
      if (FORBIDDEN_CORE_DEPS.some((forbidden) => dep === forbidden || dep.includes(forbidden))) {
        findings.push({
          package: '@celestial-ui/core',
          category: 'dependency-graph',
          severity: 'BLOCKER',
          reason: `Core must not depend on ${dep}`,
          remediation: 'Remove the dependency from @celestial-ui/core',
        });
      }
      if (FRAMEWORK_RE.test(dep)) {
        findings.push({
          package: '@celestial-ui/core',
          category: 'dependency-graph',
          severity: 'BLOCKER',
          reason: `Core must not depend on framework package ${dep}`,
          remediation: 'Remove framework dependency from core',
        });
      }
    }
  }

  for (const [pkgName, allowed] of Object.entries(ALLOWED_EDGES)) {
    const pkg = byName.get(pkgName);
    if (!pkg) continue;
    const runtimeDeps = Object.keys(collectRuntimeDeps(pkg)).filter((dep) =>
      dep.startsWith('@celestial-ui/'),
    );
    for (const dep of runtimeDeps) {
      if (!allowed.includes(dep)) {
        findings.push({
          package: pkgName,
          category: 'dependency-graph',
          severity: 'BLOCKER',
          reason: `Unexpected @celestial-ui dependency ${dep} on ${pkgName}`,
          remediation: `Allowed deps for ${pkgName}: ${allowed.join(', ') || 'none'}`,
        });
      }
    }
  }

  return findings;
}
