export type ConformanceArea =
  | 'identity'
  | 'props'
  | 'defaults'
  | 'variants'
  | 'sizes'
  | 'states'
  | 'events'
  | 'slots'
  | 'parts'
  | 'controlled-state'
  | 'accessibility'
  | 'keyboard'
  | 'pointer'
  | 'focus'
  | 'composition'
  | 'refs'
  | 'polymorphism'
  | 'directionality'
  | 'form-field'
  | 'collection'
  | 'selection'
  | 'overlay'
  | 'environment'
  | 'diagnostics';

export interface ConformanceRequirement {
  readonly area: ConformanceArea;
  readonly required: boolean;
  readonly description?: string;
}

export interface ConformanceContract {
  readonly requirements: readonly ConformanceRequirement[];
}

export interface EnvironmentRequirements {
  readonly ssr?: boolean;
  readonly browser?: boolean;
  readonly node?: boolean;
}

export interface EnvironmentContract {
  readonly requirements?: EnvironmentRequirements;
}

export interface DiagnosticsContract {
  readonly structuredErrors?: boolean;
  readonly warnInDevelopment?: boolean;
}
