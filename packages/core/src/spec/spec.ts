import type { ComponentContract } from '../contracts/types';
import { assertValidContract, validateComponentContract } from '../contracts/validate';
import { assertComponentId } from '../ids';
import { deepFreeze } from '../internals/freeze';
import { isPlainObject } from '../internals/is-plain-object';
import { CoreContractError, coreError } from '../diagnostics/errors';
import type { CoreError } from '../diagnostics/errors';
import { SPEC_SCHEMA_VERSION, isSchemaCompatible } from '../version';
import type { ComponentCapability } from '../capabilities/types';
import type { ComponentMetadata } from '../catalog/types';
import { validateAnatomy } from './anatomy';
import { validateCapabilitiesAgainstContract } from '../capabilities/validate';
import type { EnvironmentRequirements } from '../conformance/types';

export type {
  ComponentMetadata,
  ComponentMetadataStatus,
  ComponentTaxonomy,
  EngineeringFamily,
} from '../catalog/types';

export interface ComponentDefaults {
  readonly props?: Readonly<Record<string, unknown>>;
  readonly variants?: Readonly<Record<string, string>>;
  readonly size?: string;
}

export interface ComponentSpec {
  readonly specSchemaVersion: string;
  readonly contract: ComponentContract;
  readonly metadata: ComponentMetadata & {
    readonly capabilities?: readonly ComponentCapability[];
  };
  readonly defaults?: ComponentDefaults;
  readonly environment?: EnvironmentRequirements;
}

export interface SpecValidationReport {
  readonly isValid: boolean;
  readonly errors: readonly CoreError[];
}

function validateSizeDefault(
  contract: ComponentContract,
  defaults: ComponentDefaults | undefined,
  errors: CoreError[],
): void {
  if (!contract.sizes) return;
  if (defaults?.size && !contract.sizes.sizes.includes(defaults.size)) {
    errors.push(
      coreError('INVALID_CONTRACT', `Default size "${defaults.size}" is not declared.`, {
        layer: 'contract',
        componentId: contract.id,
      }),
    );
  }
  if (!contract.sizes.sizes.includes(contract.sizes.defaultSize)) {
    errors.push(
      coreError('INVALID_CONTRACT', 'sizes.defaultSize must be a member of sizes.sizes.', {
        layer: 'contract',
        componentId: contract.id,
      }),
    );
  }
}

function validateMetadata(metadata: unknown, errors: CoreError[]): void {
  if (!isPlainObject(metadata)) {
    errors.push(coreError('INVALID_CONTRACT', 'metadata is required.', { layer: 'contract' }));
    return;
  }
  const meta = metadata as { displayName?: unknown; status?: unknown };
  if (typeof meta.displayName !== 'string' || !meta.displayName) {
    errors.push(
      coreError('INVALID_CONTRACT', 'metadata.displayName is required.', {
        layer: 'contract',
      }),
    );
  }
  const validStatus = ['stable', 'preview', 'deprecated', 'draft'];
  if (!validStatus.includes(String(meta.status))) {
    errors.push(
      coreError(
        'INVALID_CONTRACT',
        'metadata.status must be stable, preview, deprecated, or draft.',
        { layer: 'contract' },
      ),
    );
  }
}

function validateSpecCapabilities(
  spec: Record<string, unknown>,
  contract: ComponentContract,
  errors: CoreError[],
): void {
  const capabilities = (spec.metadata as { capabilities?: ComponentCapability[] } | undefined)
    ?.capabilities;
  if (!capabilities?.length) {
    return;
  }
  const capFailures = validateCapabilitiesAgainstContract(
    capabilities,
    contract as unknown as Record<string, unknown>,
  );
  for (const failure of capFailures) {
    errors.push(
      coreError('INVALID_CONTRACT', failure.message, {
        layer: 'contract',
        componentId: contract.id,
      }),
    );
  }
}

export function validateComponentSpec(spec: unknown): SpecValidationReport {
  const errors: CoreError[] = [];

  if (!isPlainObject(spec)) {
    return {
      isValid: false,
      errors: [
        coreError('INVALID_CONTRACT', 'ComponentSpec must be a plain object.', {
          layer: 'contract',
        }),
      ],
    };
  }

  if (
    typeof spec.specSchemaVersion !== 'string' ||
    !isSchemaCompatible(spec.specSchemaVersion, SPEC_SCHEMA_VERSION)
  ) {
    errors.push(
      coreError('SCHEMA_INCOMPATIBLE', 'Invalid specSchemaVersion.', { layer: 'contract' }),
    );
  }

  validateMetadata(spec.metadata, errors);

  const contractResult = validateComponentContract(spec.contract);
  errors.push(...contractResult.errors);

  if (isPlainObject(spec.contract)) {
    const contract = spec.contract as unknown as ComponentContract;
    validateSizeDefault(contract, spec.defaults as ComponentDefaults | undefined, errors);
    const anatomy = validateAnatomy({
      parts: contract.parts,
      slots: contract.slots,
      composition: contract.composition,
      refs: contract.refs,
    });
    errors.push(...anatomy.errors);
    validateSpecCapabilities(spec, contract, errors);
  }

  return { isValid: errors.length === 0, errors };
}

export function defineComponentSpec(input: {
  contract: Omit<ComponentContract, 'id'> & { id: string };
  metadata: ComponentMetadata & { capabilities?: readonly ComponentCapability[] };
  defaults?: ComponentDefaults;
  specSchemaVersion?: string;
  environment?: EnvironmentRequirements;
}): ComponentSpec {
  const contract = {
    ...input.contract,
    id: assertComponentId(input.contract.id),
  } as ComponentContract;

  assertValidContract(contract);

  const spec: ComponentSpec = {
    specSchemaVersion: input.specSchemaVersion ?? SPEC_SCHEMA_VERSION,
    contract,
    metadata: input.metadata,
    defaults: input.defaults,
    environment: input.environment,
  };

  const report = validateComponentSpec(spec);
  if (!report.isValid) {
    throw new CoreContractError('Invalid component spec.', report.errors);
  }

  return deepFreeze(spec) as ComponentSpec;
}

export function serializeComponentSpec(spec: ComponentSpec): string {
  return JSON.stringify(spec);
}

export function parseComponentSpec(json: string): ComponentSpec {
  const parsed: unknown = JSON.parse(json);
  const report = validateComponentSpec(parsed);
  if (!report.isValid) {
    throw new CoreContractError('Invalid component spec JSON.', report.errors);
  }
  return deepFreeze(parsed) as ComponentSpec;
}
