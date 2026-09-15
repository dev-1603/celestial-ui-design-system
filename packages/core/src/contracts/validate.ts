import { CoreContractError, coreError } from '../diagnostics/errors';
import { isValidComponentId } from '../ids';
import { isSchemaCompatible, CONTRACT_SCHEMA_VERSION } from '../version';
import { isPlainObject } from '../internals/is-plain-object';
import type { ComponentContract } from './types';
import type { CoreError } from '../diagnostics/errors';
import type { SizeContract } from '../sizes/types';
import { validateAnatomy } from '../spec/anatomy';

const ALLOWED_TOP_LEVEL_KEYS = new Set([
  'id',
  'version',
  'schemaVersion',
  'props',
  'states',
  'variants',
  'sizes',
  'slots',
  'parts',
  'events',
  'accessibility',
  'behavior',
  'keyboard',
  'pointer',
  'focus',
  'composition',
  'controlled',
  'polymorphism',
  'refs',
  'localization',
  'formField',
  'collection',
  'selection',
  'overlay',
  'environment',
  'conformance',
  'diagnostics',
  'extensions',
]);

function containsNonSerializable(value: unknown, path: string, errors: CoreError[]): void {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'function' || typeof value === 'symbol') {
      errors.push(
        coreError('INVALID_CONTRACT', `Non-serializable value at ${path}`, {
          layer: 'contract',
        }),
      );
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => containsNonSerializable(item, `${path}[${i}]`, errors));
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    containsNonSerializable(child, `${path}.${key}`, errors);
  }
}

function validateSizeContract(
  sizes: SizeContract,
  componentId: string | undefined,
  errors: CoreError[],
): void {
  if (!sizes.sizes.length) {
    errors.push(
      coreError('INVALID_CONTRACT', 'SizeContract requires at least one size.', {
        layer: 'contract',
        componentId,
      }),
    );
  }
  if (!sizes.defaultSize) {
    errors.push(
      coreError('INVALID_CONTRACT', 'SizeContract requires defaultSize.', {
        layer: 'contract',
        componentId,
      }),
    );
  } else if (!sizes.sizes.includes(sizes.defaultSize)) {
    errors.push(
      coreError('INVALID_CONTRACT', 'SizeContract defaultSize must be in sizes.', {
        layer: 'contract',
        componentId,
      }),
    );
  }
  const unique = new Set(sizes.sizes);
  if (unique.size !== sizes.sizes.length) {
    errors.push(
      coreError('INVALID_CONTRACT', 'SizeContract sizes must be unique.', {
        layer: 'contract',
        componentId,
      }),
    );
  }
}

function validateUnknownKeys(contract: Record<string, unknown>, errors: CoreError[]): void {
  for (const key of Object.keys(contract)) {
    if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
      errors.push(
        coreError('INVALID_CONTRACT', `Unknown contract key: ${key}`, {
          layer: 'contract',
        }),
      );
    }
  }
}

function validateIdentity(
  contract: Record<string, unknown>,
  errors: CoreError[],
): string | undefined {
  const id = contract.id;
  if (typeof id !== 'string' || !isValidComponentId(id)) {
    errors.push(
      coreError('INVALID_COMPONENT_ID', 'Contract id must be a valid kebab-case ComponentId.', {
        layer: 'contract',
      }),
    );
  }

  if (typeof contract.version !== 'string' || !contract.version) {
    errors.push(
      coreError('INVALID_CONTRACT', 'Contract version is required.', { layer: 'contract' }),
    );
  }

  const schemaVersion = contract.schemaVersion;
  if (typeof schemaVersion !== 'string' || !schemaVersion) {
    errors.push(
      coreError('INVALID_CONTRACT', 'Contract schemaVersion is required.', {
        layer: 'contract',
      }),
    );
  } else if (!isSchemaCompatible(schemaVersion, CONTRACT_SCHEMA_VERSION)) {
    errors.push(
      coreError(
        'SCHEMA_INCOMPATIBLE',
        `Schema ${schemaVersion} is incompatible with ${CONTRACT_SCHEMA_VERSION}.`,
        {
          layer: 'contract',
          componentId: typeof id === 'string' ? id : undefined,
        },
      ),
    );
  }

  return typeof id === 'string' ? id : undefined;
}

function validatePropsEnums(
  contract: Record<string, unknown>,
  componentId: string | undefined,
  errors: CoreError[],
): void {
  if (!contract.props || !isPlainObject(contract.props)) {
    return;
  }
  const propsContract = contract.props as { props?: Record<string, unknown> };
  if (!propsContract.props) {
    return;
  }
  for (const [name, def] of Object.entries(propsContract.props)) {
    if (!isPlainObject(def)) continue;
    const propDef = def as { controlled?: boolean; type?: string; enumValues?: unknown[] };
    if (propDef.type === 'enum' && (!propDef.enumValues || propDef.enumValues.length === 0)) {
      errors.push(
        coreError('INVALID_CONTRACT', `Enum prop "${name}" requires enumValues.`, {
          layer: 'contract',
          componentId,
        }),
      );
    }
  }
}

function validateControlledFields(
  contract: Record<string, unknown>,
  componentId: string | undefined,
  errors: CoreError[],
): void {
  if (!contract.controlled || !isPlainObject(contract.controlled)) {
    return;
  }
  const controlled = contract.controlled as {
    fields?: Array<{ prop?: string; event?: string }>;
  };
  const props = (contract.props as { props?: Record<string, { name?: string }> })?.props ?? {};
  const events = (contract.events as { events?: Record<string, unknown> })?.events ?? {};
  for (const field of controlled.fields ?? []) {
    if (!field.prop || !field.event) {
      errors.push(
        coreError('INVALID_CONTRACT', 'Controlled field requires prop and event.', {
          layer: 'contract',
        }),
      );
      continue;
    }
    const propName = field.prop;
    const hasProp = Object.values(props).some((p) => p?.name === propName) || propName in props;
    if (!hasProp) {
      errors.push(
        coreError(
          'INVALID_CONTRACT',
          `Controlled prop "${propName}" not found in props contract.`,
          {
            layer: 'contract',
            componentId,
          },
        ),
      );
    }
    if (!(field.event in events)) {
      errors.push(
        coreError(
          'INVALID_CONTRACT',
          `Controlled event "${field.event}" not found in events contract.`,
          {
            layer: 'contract',
            componentId,
          },
        ),
      );
    }
  }
}

function validateContractAnatomy(contract: Record<string, unknown>, errors: CoreError[]): void {
  const typed = contract as unknown as ComponentContract;
  const anatomy = validateAnatomy({
    parts: typed.parts,
    slots: typed.slots,
    composition: typed.composition,
    refs: typed.refs,
  });
  errors.push(...anatomy.errors);
}

export interface ContractValidationReport {
  readonly isValid: boolean;
  readonly errors: readonly CoreError[];
}

export function validateComponentContract(contract: unknown): ContractValidationReport {
  const errors: CoreError[] = [];

  if (!isPlainObject(contract)) {
    return {
      isValid: false,
      errors: [
        coreError('INVALID_CONTRACT', 'Contract must be a plain object.', {
          layer: 'contract',
        }),
      ],
    };
  }

  validateUnknownKeys(contract, errors);
  const componentId = validateIdentity(contract, errors);

  if (contract.sizes && isPlainObject(contract.sizes)) {
    validateSizeContract(contract.sizes as unknown as SizeContract, componentId, errors);
  }

  validatePropsEnums(contract, componentId, errors);
  validateControlledFields(contract, componentId, errors);
  validateContractAnatomy(contract, errors);
  containsNonSerializable(contract, 'contract', errors);

  return { isValid: errors.length === 0, errors };
}

export function assertValidContract(contract: ComponentContract): void {
  const report = validateComponentContract(contract);
  if (!report.isValid) {
    throw new CoreContractError('Invalid component contract.', report.errors);
  }
}
