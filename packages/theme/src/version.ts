/** Compares semver-like `major.minor.patch` strings. Returns negative if a < b. */
export function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const pb = b.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(pa.length, pb.length, 3);

  for (let i = 0; i < length; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

/** True when `current` satisfies `minRequired` (current >= minRequired). */
export function isCompatibleTokenSystem(minRequired: string, current: string): boolean {
  return compareSemver(current, minRequired) >= 0;
}
