import type { ComponentSpec } from '../spec/spec';
import type { ComponentCapability } from '../capabilities/types';
import { validateCapabilitiesAgainstContract } from '../capabilities/validate';
import type { CoreError } from '../diagnostics/errors';
import { coreError } from '../diagnostics/errors';
import { validateComponentSpec } from '../spec/spec';
import { validateAnatomy } from '../spec/anatomy';
import type { ConformanceArea } from '../conformance/types';
import type { A11ySnapshot } from '../accessibility/types';
import type { ComponentState } from '../state/state';

export interface ConformanceFailure {
  readonly area: ConformanceArea | 'capability' | 'anatomy';
  readonly message: string;
}

export interface ConformanceReport {
  readonly passed: boolean;
  readonly failures: readonly ConformanceFailure[];
}

/** Optional semantic snapshot a framework implementation may provide for verification. */
export interface ConformanceImplementationSnapshot {
  readonly props?: Readonly<Record<string, unknown>>;
  readonly states?: readonly ComponentState[];
  readonly aria?: Partial<A11ySnapshot>;
  readonly parts?: readonly string[];
  readonly size?: string;
}

export interface ConformanceHarness {
  readonly spec: ComponentSpec;
  validateSpec(): ConformanceReport;
  validateCapabilities(): ConformanceReport;
  validateImplementation(snapshot: ConformanceImplementationSnapshot): ConformanceReport;
  assertCompliant(snapshot?: ConformanceImplementationSnapshot): void;
}

function reportFromErrors(
  area: ConformanceFailure['area'],
  errors: readonly CoreError[],
): ConformanceFailure[] {
  return errors.map((e) => ({ area, message: e.reason }));
}

export function createConformanceHarness(spec: ComponentSpec): ConformanceHarness {
  return {
    spec,
    validateSpec() {
      const result = validateComponentSpec(spec);
      if (result.isValid) {
        return { passed: true, failures: [] };
      }
      return {
        passed: false,
        failures: reportFromErrors('identity', result.errors),
      };
    },
    validateCapabilities() {
      const caps = spec.metadata.capabilities ?? [];
      const capFailures = validateCapabilitiesAgainstContract(
        caps,
        spec.contract as unknown as Record<string, unknown>,
      );
      const failures: ConformanceFailure[] = capFailures.map((f) => ({
        area: 'capability' as const,
        message: f.message,
      }));
      const anatomy = validateAnatomy({
        parts: spec.contract.parts,
        slots: spec.contract.slots,
        composition: spec.contract.composition,
        refs: spec.contract.refs,
      });
      failures.push(...reportFromErrors('anatomy', anatomy.errors));
      return { passed: failures.length === 0, failures };
    },
    validateImplementation(snapshot) {
      const failures: ConformanceFailure[] = [];
      const contract = spec.contract;

      if (contract.accessibility?.role && snapshot.aria?.role) {
        if (snapshot.aria.role !== contract.accessibility.role) {
          failures.push({
            area: 'accessibility',
            message: `Expected role ${contract.accessibility.role}, got ${snapshot.aria.role}`,
          });
        }
      }

      if (contract.sizes && snapshot.size) {
        if (!contract.sizes.sizes.includes(snapshot.size)) {
          failures.push({
            area: 'sizes',
            message: `Invalid size "${snapshot.size}" for component ${contract.id}`,
          });
        }
      }

      if (contract.states && snapshot.states) {
        for (const state of snapshot.states) {
          if (!contract.states.allowed.includes(state)) {
            failures.push({
              area: 'states',
              message: `State "${state}" is not allowed for ${contract.id}`,
            });
          }
        }
      }

      if (contract.parts && snapshot.parts) {
        const allowed = new Set(Object.keys(contract.parts.parts));
        for (const part of snapshot.parts) {
          if (!allowed.has(part)) {
            failures.push({
              area: 'parts',
              message: `Unknown part "${part}" on ${contract.id}`,
            });
          }
        }
      }

      return { passed: failures.length === 0, failures };
    },
    assertCompliant(snapshot) {
      const reports = [this.validateSpec(), this.validateCapabilities()];
      if (snapshot) {
        reports.push(this.validateImplementation(snapshot));
      }
      const failures = reports.flatMap((r) => r.failures);
      if (failures.length > 0) {
        throw new Error(
          `Conformance failed for ${spec.contract.id}: ${failures.map((f) => f.message).join('; ')}`,
        );
      }
    },
  };
}

export function runConformanceChecks(
  spec: ComponentSpec,
  snapshot?: ConformanceImplementationSnapshot,
): ConformanceReport {
  const harness = createConformanceHarness(spec);
  const parts = [harness.validateSpec(), harness.validateCapabilities()];
  if (snapshot) {
    parts.push(harness.validateImplementation(snapshot));
  }
  const failures = parts.flatMap((p) => p.failures);
  return { passed: failures.length === 0, failures };
}
