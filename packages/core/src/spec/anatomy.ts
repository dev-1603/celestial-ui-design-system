import type { CoreError } from '../diagnostics/errors';
import { coreError } from '../diagnostics/errors';
import type { SlotsContract, PartsContract, CompositionContract } from '../slots/types';
import type { RefContract } from '../refs/types';

export interface AnatomyValidationReport {
  readonly isValid: boolean;
  readonly errors: readonly CoreError[];
}

function validateUniqueNames(names: readonly string[], label: string, errors: CoreError[]): void {
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(name)) {
      errors.push(
        coreError('INVALID_CONTRACT', `Duplicate ${label} name: ${name}`, {
          layer: 'contract',
        }),
      );
    }
    seen.add(name);
  }
}

function validateNamedEntries(
  entries: Record<string, { name: string }>,
  label: 'part' | 'slot',
  errors: CoreError[],
): void {
  validateUniqueNames(
    Object.values(entries).map((entry) => entry.name),
    label,
    errors,
  );
  for (const [key, entry] of Object.entries(entries)) {
    if (key !== entry.name) {
      const kind = label === 'part' ? 'Part' : 'Slot';
      errors.push(
        coreError(
          'INVALID_CONTRACT',
          `${kind} key "${key}" must match ${label}.name "${entry.name}".`,
          { layer: 'contract' },
        ),
      );
    }
  }
}

function validateRefTargets(
  refs: RefContract,
  parts: PartsContract | undefined,
  errors: CoreError[],
): void {
  for (const [targetName, target] of Object.entries(refs.targets ?? {})) {
    const partName = target.part;
    if (parts && !parts.parts[partName]) {
      errors.push(
        coreError(
          'INVALID_CONTRACT',
          `Ref target "${targetName}" references unknown part "${partName}".`,
          { layer: 'contract' },
        ),
      );
    }
  }
  if (refs.primary && parts && !parts.parts[refs.primary]) {
    errors.push(
      coreError('INVALID_CONTRACT', `Primary ref "${refs.primary}" is not a declared part.`, {
        layer: 'contract',
      }),
    );
  }
}

export function validateAnatomy(input: {
  parts?: PartsContract;
  slots?: SlotsContract;
  composition?: CompositionContract;
  refs?: RefContract;
}): AnatomyValidationReport {
  const errors: CoreError[] = [];

  if (input.parts) {
    validateNamedEntries(input.parts.parts, 'part', errors);
  }
  if (input.slots) {
    validateNamedEntries(input.slots.slots, 'slot', errors);
  }
  if (input.refs?.targets) {
    validateRefTargets(input.refs, input.parts, errors);
  }
  if (input.composition?.allowedChildren?.length) {
    validateUniqueNames([...input.composition.allowedChildren], 'composition child', errors);
  }

  return { isValid: errors.length === 0, errors };
}
