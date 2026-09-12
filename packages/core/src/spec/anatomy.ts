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

export function validateAnatomy(input: {
  parts?: PartsContract;
  slots?: SlotsContract;
  composition?: CompositionContract;
  refs?: RefContract;
}): AnatomyValidationReport {
  const errors: CoreError[] = [];

  if (input.parts) {
    const partEntries = Object.values(input.parts.parts);
    validateUniqueNames(
      partEntries.map((p) => p.name),
      'part',
      errors,
    );
    for (const [key, part] of Object.entries(input.parts.parts)) {
      if (key !== part.name) {
        errors.push(
          coreError('INVALID_CONTRACT', `Part key "${key}" must match part.name "${part.name}".`, {
            layer: 'contract',
          }),
        );
      }
    }
  }

  if (input.slots) {
    const slotEntries = Object.values(input.slots.slots);
    validateUniqueNames(
      slotEntries.map((s) => s.name),
      'slot',
      errors,
    );
    for (const [key, slot] of Object.entries(input.slots.slots)) {
      if (key !== slot.name) {
        errors.push(
          coreError('INVALID_CONTRACT', `Slot key "${key}" must match slot.name "${slot.name}".`, {
            layer: 'contract',
          }),
        );
      }
    }
  }

  if (input.refs?.targets) {
    for (const [targetName, target] of Object.entries(input.refs.targets)) {
      const partName = target.part;
      if (input.parts && !input.parts.parts[partName]) {
        errors.push(
          coreError(
            'INVALID_CONTRACT',
            `Ref target "${targetName}" references unknown part "${partName}".`,
            { layer: 'contract' },
          ),
        );
      }
    }
    if (input.refs.primary && input.parts && !input.parts.parts[input.refs.primary]) {
      errors.push(
        coreError(
          'INVALID_CONTRACT',
          `Primary ref "${input.refs.primary}" is not a declared part.`,
          { layer: 'contract' },
        ),
      );
    }
  }

  if (input.composition?.allowedChildren?.length) {
    validateUniqueNames([...input.composition.allowedChildren], 'composition child', errors);
  }

  return { isValid: errors.length === 0, errors };
}
