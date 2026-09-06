export type Severity = 'BLOCKER' | 'REQUIRED' | 'OPTIONAL' | 'DEFERRED';

export type ValidationCategory =
  | 'build'
  | 'typecheck'
  | 'tests'
  | 'exports'
  | 'api'
  | 'artifacts'
  | 'consumer'
  | 'documentation'
  | 'dependency-graph'
  | 'security'
  | 'registry';

export interface ValidationFinding {
  package: string;
  category: ValidationCategory;
  severity: Severity;
  reason: string;
  remediation: string;
}

export interface CategoryStatus {
  status: 'PASS' | 'FAIL' | 'SKIP';
  findings: ValidationFinding[];
}

export interface ValidationReport {
  generatedAt: string;
  packagesDiscovered: number;
  publicPackages: number;
  privatePackages: number;
  internalPackages: number;
  categories: Record<ValidationCategory, CategoryStatus>;
  overall: 'RELEASE_READY' | 'NOT_RELEASE_READY';
  findings: ValidationFinding[];
}

export interface PackageInfo {
  name: string;
  directory: string;
  version: string;
  private: boolean;
  publishable: boolean;
  packageJson: Record<string, unknown>;
}
