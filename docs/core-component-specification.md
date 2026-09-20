# Core Component Specification Model

A `ComponentSpec` describes a Celestial UI component **without implementing it**.

## Structure

```ts
interface ComponentSpec {
  specSchemaVersion: string; // e.g. '1.1.0'
  contract: ComponentContract; // semantic capabilities
  metadata: ComponentMetadata; // catalog + taxonomy
  defaults?: ComponentDefaults; // props, variants, size
  environment?: EnvironmentRequirements;
}
```

## Metadata fields

| Field               | Required      | Purpose                                              |
| ------------------- | ------------- | ---------------------------------------------------- |
| `displayName`       | yes           | Human-readable name                                  |
| `status`            | yes           | `stable` \| `preview` \| `deprecated` \| `draft`     |
| `purpose`           | recommended   | One-line semantic purpose                            |
| `taxonomy`          | catalog specs | `atomic` → `advanced` (classification only)          |
| `engineeringFamily` | catalog specs | e.g. `forms`, `overlays`, `collections`              |
| `capabilities`      | catalog specs | Declared capability flags validated against contract |
| `complexity`        | optional      | `simple` \| `moderate` \| `complex`                  |

Taxonomy and engineering family **do not** determine package architecture.

## Defaults

```ts
defaults: {
  props: { disabled: false },
  variants: { variant: 'primary' },
  size: 'md',  // must be in contract.sizes.sizes
}
```

## Defining a spec

```ts
import { defineComponentSpec, CONTRACT_SCHEMA_VERSION } from '@celestial-ui/core/contracts';

export const mySpec = defineComponentSpec({
  contract: {
    id: 'my-component',
    version: '1.0.0',
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    // ... applicable contract sections only
  },
  metadata: {
    displayName: 'My Component',
    status: 'preview',
    purpose: 'Does one thing well.',
    taxonomy: 'atomic',
    engineeringFamily: 'primitives',
    capabilities: ['identity', 'props', 'parts'],
  },
});
```

`defineComponentSpec` validates, then **deep-freezes** the result.

## Catalog vs spec files

| API                               | Loads                  | Use when                     |
| --------------------------------- | ---------------------- | ---------------------------- |
| `@celestial-ui/core/catalog`      | Metadata registry only | Discovery, docs, tooling     |
| `@celestial-ui/core/specs/button` | Full frozen spec       | Conformance, code generation |

This avoids eager loading of all specs when querying the catalog.

## Reference specifications

Nine reference specs ship with Core:

| ID            | Family       | Exercises                              |
| ------------- | ------------ | -------------------------------------- |
| `button`      | primitives   | variants, sizes, pointer, keyboard     |
| `input`       | forms        | controlled state, form field           |
| `checkbox`    | forms        | checked/indeterminate states           |
| `select`      | collections  | collection, selection, overlay anatomy |
| `dialog`      | overlays     | focus trap, modal overlay              |
| `table`       | data-display | grid role, multi-select collection     |
| `label`       | forms        | native label association (`htmlFor`)   |
| `switch`      | forms        | binary checked state, switch role      |
| `radio-group` | forms        | single selection, roving collection    |

## Conformance

```ts
import { createConformanceHarness } from '@celestial-ui/core/testing';

createConformanceHarness(mySpec).assertCompliant();
```

Optional implementation snapshots verify runtime semantics (role, states, parts, size) without framework rendering.

## Serialization

```ts
import { serializeComponentSpec, parseComponentSpec } from '@celestial-ui/core/contracts';

const json = serializeComponentSpec(mySpec);
const restored = parseComponentSpec(json);
```

## What a spec is not

- Not a React/Vue/Svelte component
- Not CSS or visual design
- Not a Storybook story
- Not a rendered DOM tree

Framework libraries consume specs; they do not redefine them.
