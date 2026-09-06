export interface RefTargetDefinition {
  readonly part: string;
  readonly description?: string;
}

export interface RefContract {
  readonly targets: Readonly<Record<string, RefTargetDefinition>>;
  readonly primary: string;
}

export type RefTargets = Record<string, unknown>;

export interface RefExposure {
  readonly primary: string;
  readonly targets: RefTargets;
}

export function createRefExposure(
  contract: RefContract,
  resolved: RefTargets,
): RefExposure {
  return {
    primary: contract.primary,
    targets: resolved,
  };
}
