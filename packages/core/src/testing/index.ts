import type { ComponentSpec } from '../spec/spec';
import { validateComponentSpec } from '../spec/spec';
import type { A11ySnapshot } from '../accessibility/types';
import type { KeyboardIntent } from '../interaction/keyboard';
import { resolveKeyboardIntent } from '../interaction/keyboard';
import type { Direction } from '../directionality/direction';
import { resolveDirectionalIntent } from '../interaction/directional';

export type {
  ConformanceReport,
  ConformanceFailure,
  ConformanceHarness,
  ConformanceImplementationSnapshot,
} from '../conformance/harness';
export { createConformanceHarness, runConformanceChecks } from '../conformance/harness';

export function assertSpecValid(spec: ComponentSpec): void {
  const report = validateComponentSpec(spec);
  if (!report.isValid) {
    throw new Error(report.errors.map((e) => e.reason).join('; '));
  }
}

export interface ContractHarness {
  readonly spec: ComponentSpec;
  assertValid(): void;
}

export function createContractHarness(spec: ComponentSpec): ContractHarness {
  return {
    spec,
    assertValid() {
      assertSpecValid(spec);
    },
  };
}

export function assertA11yProps(actual: A11ySnapshot, expected: Partial<A11ySnapshot>): void {
  for (const [key, value] of Object.entries(expected)) {
    const k = key as keyof A11ySnapshot;
    if (actual[k] !== value) {
      throw new Error(`Expected aria prop ${key} to be ${String(value)}, got ${String(actual[k])}`);
    }
  }
}

export function assertKeyboardIntent(
  key: string,
  expected: KeyboardIntent | null,
  options?: { direction?: Direction },
): void {
  const intent = options?.direction
    ? resolveDirectionalIntent(key, options.direction)
    : resolveKeyboardIntent(key);
  if (intent !== expected) {
    throw new Error(`Expected intent ${String(expected)} for key ${key}, got ${String(intent)}`);
  }
}

export type { ComponentSpec } from '../spec/spec';
