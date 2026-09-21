---
name: P0/P1 Contract Readiness Plan
overview: Execution-ready Phase 1 Contract Engineering plan. Freeze 82 P0/P1 Core contracts before component implementation. Priority stays a planning artifact (36/46/16/5), not a runtime ComponentContract field.
todos:
  - id: adr1-priority
    content: Record the approved CN 36/46/16/5 map in docs/phase1-component-priority-map.md and add CI count/coverage tests (no Core schema change)
    status: completed
  - id: adr2-consistency
    content: Lock canonical rules for requiresRole, keyboard source of truth, formField trigger, polymorphism, then normalize the 9 reference specs
    status: completed
  - id: adr3-tokens
    content: Record ADR-3 Option B — Core stays token-agnostic; token/theme linkage lives in tokens/theme/styles
    status: completed
  - id: adr4-composition
    content: Apply composition adoption criteria (typed catalog children vs leaf/unconstrained) to P0/P1 specs
    status: completed
  - id: fix-capability-bug
    content: Derive CANONICAL_CATALOG capabilities from hand-authored specs for profile:reference entries
    status: completed
  - id: source-of-truth
    content: Document ContractSpec authority vs generated docs vs adapters; add freeze/change-control process
    status: completed
  - id: canonical-template
    content: Finalize docs/contracts/<id>.md split (machine-derived vs narrative) and apply to 9 reference specs
    status: completed
  - id: matrix-generator
    content: Generate contract matrix from listComponentSpecs() + priority map; add drift detection (integrity, not a blocker)
    status: completed
  - id: p0-contracts
    content: Refine and validate all 36 P0 specs to PHASE-1 READY
    status: completed
  - id: p1-contracts
    content: Refine and validate all 46 P1 specs to PHASE-1 READY; keep P2/P3 deferred
    status: completed
  - id: qa-validation
    content: Extend existing validators/tests for priority, capability derivation, keyboard SoT, composition, freeze gate
    status: completed
isProject: false
---

# Celestial UI — Phase 1 Contract Engineering Plan (P0/P1 Freeze)

## Development boundary

```text
PHASE 1  CONTRACT ENGINEERING
  global architecture → cross-cutting rules → P0 contracts → P1 contracts
  → validation → conformance → readiness
        ↓
🔒 CONTRACT FREEZE
        ↓
PHASE 2  COMPONENT IMPLEMENTATION  (React/Vue adapters consume frozen Core)
```

**Invariant:** Component implementation must consume a stable, validated, framework-agnostic contract. Implementation must not invent or silently redesign Core contracts.

```text
DO NOT BEGIN SERIOUS P0/P1 COMPONENT IMPLEMENTATION
UNTIL PHASE 1 CONTRACT FREEZE.

Proof-of-concept code may validate an architectural decision only.
PoC must not become production implementation.
```

---

## 0. How this plan was produced

Refinement of the existing repository-first plan. Valid evidence is preserved. New work is governance, consistency rules, readiness matrices, and freeze process — not a Core rewrite.

- **Architect:** Core is the bounded context for _component semantics_. Tenant isolation stays in `@celestial-ui/theme` (slot policy / tenant profiles), not in `ComponentContract`.
- **Frontend:** Every dimension uses the component-contract dry-run (props, state matrix, composition, a11y, controlled/uncontrolled).
- **QA:** READY only if testable. No subjective scores.
- **Open-source library:** Smallest additive change. Hot-path stays lean. Planning metadata stays out of the runtime contract.
- **DDD:** `Component Contract ≠ Product Implementation Priority`.

---

## 1. Source-of-truth hierarchy (required)

```text
                 CONTRACT AUTHORITY
                        │
              ComponentSpec / ComponentContract
                        │
              ┌─────────┴─────────┐
              │                   │
       Machine validation    Human documentation
       schemas + tests       generated + narrative
              │                   │
              └─────────┬─────────┘
                        │
                  Implementation
              ┌─────────┴─────────┐
             React               Vue
```

1. **Machine-readable contract** — `ComponentSpec` is authoritative.
2. **Validation** — schema, capability, anatomy, conformance harness.
3. **Documentation** — generated mechanical sections + human narrative. If Markdown disagrees with `ComponentSpec`, the spec wins and the doc is stale.
4. **Adapters** — `@celestial-ui/react` / `vue` (not in this repo) translate Core; they do not redefine it.

Priority, token-namespace planning notes, and readiness matrices are **governance artifacts**, not a second contract.

---

## 2. Repository baseline (preserved evidence)

Verified unless marked `REQUIRES_REPOSITORY_VERIFICATION`.

| Area                      | Current state                                                               | Evidence                                                                                                                                           | Ready?                                 | Gap                                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract architecture     | 26 optional composable sections + `ComponentSpec`, schema **1.1.0**, LOCKED | [docs/core-component-contract.md](docs/core-component-contract.md), [docs/core-lock.md](docs/core-lock.md), `packages/core/src/contracts/types.ts` | READY                                  | None                                                                                                                                                                   |
| Identity                  | `id` / `version` / `schemaVersion` + metadata                               | `packages/core/src/spec/spec.ts`                                                                                                                   | READY                                  | No runtime `priority` field — **correct**; priority is planning-only (ADR-1)                                                                                           |
| Catalog                   | 103 IDs; 9 hand-authored; 94 profile-generated                              | `generic-component-inventory.json`, `REFERENCE_COMPONENT_IDS`                                                                                      | READY (structural)                     | Generated specs are schema-valid, not semantically reviewed                                                                                                            |
| Props / states / events   | Typed contracts; validated                                                  | 9 reference specs; `contracts/validate.ts`                                                                                                         | PARTIAL                                | 94 specs are profile templates                                                                                                                                         |
| Anatomy                   | Parts/slots/refs validated                                                  | `contracts/anatomy.ts`                                                                                                                             | READY (mechanism)                      | `slots` unused on inspected references; `composition` unused on **all 103**                                                                                            |
| Accessibility             | Role, name, keyboard, focus, ARIA helpers                                   | `packages/core/src/accessibility/*`                                                                                                                | READY (mechanism)                      | Dual keyboard declarations; inconsistent `requiresRole`                                                                                                                |
| Composition               | `CompositionContract.allowedChildren?: ComponentId[]`                       | `packages/core/src/slots/types.ts:24-26`                                                                                                           | MISSING (unused)                       | No adoption criteria until ADR-4                                                                                                                                       |
| Controlled / uncontrolled | `ControlledStateContract` + `createControllableState`                       | `switch.ts`, `radio-group.ts`, `input.ts`, `dialog.ts`                                                                                             | READY (mechanism), PARTIAL (coverage)  | No written trigger rule                                                                                                                                                |
| Forms                     | `FormFieldContract`                                                         | `packages/core/src/forms/types.ts`                                                                                                                 | PARTIAL                                | Label is forms-family but not a field — undocumented                                                                                                                   |
| Polymorphism              | `nativeTag`, `allowedAs` — **no `asChild` in Core**                         | `packages/core/src/polymorphism/types.ts`; adapter `refs: adapter-translates`                                                                      | READY (mechanism)                      | Inconsistent application                                                                                                                                               |
| Tokens / theme / styles   | Separate packages; Core must not import them                                | `docs/core-architecture.md:30-38`, `docs/core-lock.md:61-65`; `packages/tokens/data/components.json` already has `button` + `input`                | READY as packages                      | Linkage is a **boundary decision** (ADR-3), not a missing Core field                                                                                                   |
| Adapter                   | `FrameworkAdapterContract`; no react/vue packages here                      | `packages/core/src/adapter/contract.ts`; [docs/package-usage.md](docs/package-usage.md)                                                            | READY (contract)                       | Adapter implementation is Phase 2 / downstream                                                                                                                         |
| Versioning                | Changesets + Core lock 1.1.0                                                | `.changeset/config.json`, `docs/core-lock.md`                                                                                                      | READY (package)                        | No **contract change-request** workflow yet                                                                                                                            |
| Tests                     | Inventory, spec, capability, framework-leak, conformance harness            | `registry.test.ts`, `specs.test.ts`                                                                                                                | READY (structural), PARTIAL (semantic) | No priority / freeze / keyboard-SoT tests                                                                                                                              |
| Docs matrix               | Hand-maintained                                                             | [docs/component-contract-matrix.md](docs/component-contract-matrix.md)                                                                             | **STALE**                              | Header says 6 reference / 97 generated; code is **9 / 94**. Reference rows (button, checkbox, dialog, input, select, table) are mostly N/A and **must not be trusted** |

**Headline (unchanged):** Global schema is strong and locked. Gaps are consistency, unused composition, stale docs, capability derivation for `profile: "reference"`, and the absence of a recorded CN priority **map** (counts are approved; per-ID artifact is not in the repo yet).

---

## 3. ADR-1 — CN priority map as planning artifact (not Core)

**Status:** Accepted (architecture). Artifact still to be written.

**Context:** Approved Celestial Nexus baseline is **36 P0 / 46 P1 / 16 P2 / 5 P3 = 103**. Priority is platform criticality, not generic design-system popularity. `GenericInventoryEntry` has no `priority` field. `docs/core-lock.md` forbids coupling Core to product planning.

**Decision:** Keep priority **out of** `ComponentContract` and inventory JSON.

```text
docs/phase1-component-priority-map.md   ← authoritative planning source
ComponentContract                       ← must not gain a priority field
```

Why: Core is framework-agnostic semantics. Priority can change without a contract major version. Open-source consumers must not inherit CN product ranking.

**Authoritative source:** The map below, recorded into `docs/phase1-component-priority-map.md` during STEP 1. Every row must match a catalog `id`. Catalog has **103 IDs and no extras** — no mapping discrepancy.

**Validation (CI, extend existing tests — do not replace):**

- Exactly 36 P0, 46 P1, 16 P2, 5 P3
- Union equals `GENERIC_COMPONENT_IDS` (103)
- No duplicates, no unknown IDs, no missing IDs
- Readiness matrices join this map by `id`

**Governance of future changes:** change request + impact analysis (which contracts were authored against the old tier) + update map + tests. Changing priority does **not** by itself change `ComponentSpec`.

**P2/P3:** remain in the map so the catalog stays 103. They **do not block** Phase 1 freeze.

### 3.1 Approved CN map (STEP 1 content)

Rationale tags: `foundational chrome`, `form field`, `overlay`, `data`, `navigation`, `feedback`, `layout`, `enterprise`, `deferred specialist`, `deferred duplicate/prose`.

**P0 — 36 (Phase 1 must freeze)**

- `button`, `link`, `text`, `heading`, `icon` — foundational chrome
- `input`, `textarea`, `label`, `checkbox`, `switch`, `radio-group`, `select`, `form`, `search-input` — form field
- `dialog`, `alert-dialog`, `popover`, `tooltip`, `dropdown-menu`, `drawer` — overlay
- `alert`, `toast`, `spinner`, `skeleton`, `badge`, `empty-state`, `progress` — feedback
- `card`, `separator`, `stack`, `box` — layout
- `table`, `tabs`, `pagination` — data / navigation
- `avatar`, `accordion` — identity / collection chrome

**P1 — 46 (Phase 1 must freeze)**

- Forms / enterprise: `combobox`, `date-picker`, `calendar`, `time-picker`, `number-input`, `password-input`, `file-upload`, `slider`, `rating`, `input-otp`, `toggle`, `toggle-group`, `segmented-control`
- Data / command: `data-table`, `command`
- Overlays: `context-menu`, `hover-card`, `sheet`
- Navigation / chrome: `menubar`, `navigation-menu`, `breadcrumb`, `sidebar`, `stepper`, `toolbar`, `action-bar`, `app-shell`, `page-header`
- Collections / layout: `collapsible`, `scroll-area`, `resizable`, `grid`, `flex`, `center`, `container`, `list`, `list-item`, `panel`
- Feedback / display: `banner`, `notice`, `callout`, `tag`, `chip`, `stat`, `meter`, `image`, `code`

**P2 — 16 (deferred)**

`date-range-picker`, `color-picker`, `phone-input`, `pin-input`, `dropzone`, `chart`, `carousel`, `video`, `figure`, `tree`, `tree-view`, `transfer-list`, `timeline`, `aspect-ratio`, `spacer`, `page-layout`

**P3 — 5 (deferred)**

- `sonner` — vendor-named duplicate of `toast`
- `divider` — duplicate of `separator`
- `blockquote` — prose, not CN app chrome
- `kbd` — documentation primitive
- `hero` — marketing template

Do not re-rank these lists unless a catalog ID cannot map. None currently fail that test.

---

## 4. ADR-2 — Global contract consistency (one source of truth)

**Status:** Proposed rules below; apply to the 9 reference specs then to P0/P1 generated specs.

### 4.1 `requiresRole`

|             |                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current     | `behavior.requiresRole: true` on button, switch, radio-group, select, dialog, table. Checkbox has `accessibility.role: 'checkbox'` but **omits** `requiresRole`. Label omits both (native `<label>`).                                |
| Conflict    | Flag vs actual role live in two places; siblings disagree.                                                                                                                                                                           |
| Canonical   | `accessibility.role` is the role. `behavior.requiresRole` means “adapters must emit that role; omitting it is invalid.”                                                                                                              |
| Rule        | If `requiresRole === true`, `accessibility.role` is **required** (validator). If the host is a native element whose implicit role is sufficient (label), omit both. Checkbox **adds** `requiresRole: true` (additive, non-breaking). |
| Change type | Additive cleanup + validation. Not a schema break.                                                                                                                                                                                   |

### 4.2 Keyboard bindings

|             |                                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current     | Same intents declared in `accessibility.keyboard` **and** `keyboard.bindings`. Radio-group `keyboard.bindings` is a superset (adds Home/End). Profiles duplicate the same pattern (`spec-profiles.ts`). |
| Canonical   | **`keyboard.bindings` (`KeyboardContract`) is the only authoritative key → intent map.** `accessibility.keyboard` is not independently authoritative.                                                   |
| Migration   | Union unique bindings into `keyboard.bindings`. Stop writing `accessibility.keyboard` on new/normalized specs. Until removed, validator **errors** if the two lists diverge.                            |
| Change type | Additive validation now; optional field removal later (non-breaking while optional).                                                                                                                    |

### 4.3 `formField`

|             |                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current     | Present on switch, radio-group, checkbox, input. Absent on label despite `engineeringFamily: 'forms'`.                                                                                                                                                                                                                               |
| Canonical   | `engineeringFamily` is **classification only**. `formField` is required iff the component participates in form **value registration** (`name` / `value` / validity).                                                                                                                                                                 |
| Rule        | Label, helper text, descriptions: `formField` = **NOT_APPLICABLE** (explicit). Input, textarea, checkbox, switch, radio-group, select, combobox, sliders, file-upload, etc.: **REQUIRED**. Form container (`form`) declares submission/association, not per-control `formField` fields — treat as composition + events, not a field. |
| Change type | Documentation + validation of N/A vs required. No schema break.                                                                                                                                                                                                                                                                      |

### 4.4 Polymorphism

|             |                                                                                                                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current     | Label: `nativeTag: 'label'`. Button: `nativeTag: 'button'`, `allowedAs: ['button','a']`. Switch / radio-group omit the section. **No `asChild` / `forwardRef` in Core** (adapter translates refs).                                                                                     |
| Canonical   | Core declares `nativeTag` + optional `allowedAs` only. **`as` / `asChild` syntax is adapter-owned.**                                                                                                                                                                                   |
| Rule        | Required when the host element may change tag without changing the contract (button→anchor). Composite widgets whose root is always a generic container: `nativeTag: 'div'` (or equivalent) **or** NOT_APPLICABLE if no host substitution is allowed. Do not invent `asChild` in Core. |
| Change type | Additive on specs that omit it; no Core API change.                                                                                                                                                                                                                                    |

### 4.5 Capability derivation bug

**Root cause:** [`packages/core/src/catalog/registry.ts`](packages/core/src/catalog/registry.ts) line 27:

```ts
capabilities: SPEC_PROFILES[entry.profile].capabilities;
```

`SPEC_PROFILES.reference.capabilities` is `['identity']` only. Hand-authored specs declare 6–15 real capabilities. Catalog metadata **understates** reference components.

**Fix:** If `entry.referenceSpec`, copy `metadata.capabilities` from the resolved `ComponentSpec` (lazy or build-time). Do not use the stub profile.

**Regression test:** For every `REFERENCE_COMPONENT_IDS` entry, catalog capabilities equal spec metadata capabilities (set equality).

**Change type:** Bug fix; no contract semantic change. Allowed under lock (“bug fixes that do not change contract semantics”).

---

## 5. ADR-3 — Token / theme boundary

**Question:** Does semantic token dependency belong inside the framework-agnostic Core contract?

### Option A — Additive `tokens` section on `ComponentContract`

- Pros: Single artifact lists semantic slots.
- Cons: Couples Core to token vocabulary; lock forbids production deps on tokens/theme/styles; invites CSS/theme leakage into specs.

### Option B — Keep linkage outside Core (selected)

- Core stays WHAT (behavior, a11y, anatomy). Tokens/theme/styles stay HOW (visual).
- Evidence: `docs/core-architecture.md` non-responsibilities; `docs/core-lock.md` forbidden deps; `packages/tokens/data/components.json` already names `button` and `input` component namespaces; `THEME_SLOT_DEFINITIONS` already constrains theme slots.

**Decision: Option B.**

Per-component “Token / Theme Relationship” in Phase 1 means:

- Explicit statement: Core does not own tokens.
- Visual P0/P1 components **must** have (or gain) a component namespace in `@celestial-ui/tokens` **or** an explicit `NOT_APPLICABLE` (e.g. `separator` uses semantic border tokens only).
- Adapters consume tokens via theme/styles, not via Core.

Do **not** add a `tokens` field to `ComponentContract` in Phase 1.

Readiness column `Tokens/Theme`: after ADR-3 is recorded, score against the **tokens package / theme slots**, not against Core. Until namespaces exist, status is `PARTIAL`, not a reason to change Core.

---

## 6. ADR-4 — Composition adoption criteria

**Anatomy (`parts` / `slots`)** = internal regions of one component.

**Composition (`allowedChildren`)** = public, typed relationships to **other catalog `ComponentId`s**.

`CompositionContract` today is only `allowedChildren?: ComponentId[]`. Use that; do not invent a parallel model.

| Class                                                      | Composition        | Examples                                                                                                                                                                                                           |
| ---------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Atomic / leaf (text or one host)                           | **NOT_APPLICABLE** | Button, Input, Label, Checkbox, Switch, Badge, Spinner, Icon, Text, Heading, Separator, Avatar                                                                                                                     |
| Unconstrained layout (any children, not typed catalog IDs) | **NOT_APPLICABLE** | Box, Stack, Flex, Grid, Center, Container, Panel, Scroll Area                                                                                                                                                      |
| Compound / typed children                                  | **REQUIRED**       | Dialog, Alert Dialog, Accordion, Tabs, Select, Combobox, Data Table, Date Picker, Form, Dropdown Menu, Command, Table, Card (if header/content/footer are catalog children), App Shell, Page Header, Drawer, Sheet |

**P0 REQUIRED:** `dialog`, `alert-dialog`, `accordion`, `select`, `form`, `dropdown-menu`, `table`, `tabs`, `drawer`, `card` (if compound; if card is parts-only, N/A — decide per spec, do not leave implicit).

**P1 REQUIRED:** `combobox`, `date-picker`, `data-table`, `command`, `menubar`, `navigation-menu`, `sidebar`, `app-shell`, `context-menu`, `sheet`, plus others that declare catalog children.

**Validation:** If taxonomy is `organism` or profile is overlay/collection/form-group/template **and** the spec lists item/trigger/content parts that map to child components, `composition.allowedChildren` must be present. Leaf atomics must not invent fake children.

---

## 7. ADR-5 — Generated contract matrix (integrity, not a blocker)

Never hand-maintain the machine-derived matrix.

Generator inputs: `listComponentSpecs()` + `docs/phase1-component-priority-map.md`.

Output: replace stale [docs/component-contract-matrix.md](docs/component-contract-matrix.md). CI fails on drift.

**Not a blocker** for authoring or freeze of individual specs. It is contract-integrity infrastructure. Authoring proceeds from `ComponentSpec` even if the generator ships later in Phase 1D.

---

## 8. Contract dimensions and readiness rules

Evaluate every P0/P1 component. **Omission is invalid.** Each applicable dimension is `READY` or `NOT_APPLICABLE`. Incomplete applicable dimensions are `PARTIAL`, `MISSING`, or `BLOCKED`.

Dimensions: Identity, Purpose, Scope, Anatomy, Props, Variants, Sizes, States, Events, Controlled/Uncontrolled, Keyboard, Focus, Accessibility, Composition, Form Integration, Validation, Token/Theme relationship, Styling boundary, Polymorphism, Content constraints, Loading, Error, Responsive, RTL, Framework adapter requirements, Dependencies, Edge cases, Contract tests.

**PHASE-1 READY** iff every applicable dimension is `READY` or `NOT_APPLICABLE`. No partial credit.

| Status         | Meaning                                                  |
| -------------- | -------------------------------------------------------- |
| READY          | Present, validated, reviewed (not merely profile-copied) |
| PARTIAL        | Present via profile template or missing narrative        |
| MISSING        | Applicable but absent                                    |
| NOT_APPLICABLE | Explicitly does not apply                                |
| BLOCKED        | Waiting on ADR or a contract dependency                  |

---

## 9. Two dependency graphs (do not mix)

### A. Contract-dimension graph (authoring order for sections)

```text
Identity → Props → States → Events → Controlled/Uncontrolled → FormField
Anatomy → Composition → Accessibility → Keyboard/Focus
Styling boundary (ADR-3) is documented beside Core, not inside it
```

### B. Component graph (authoring order for P0 then P1)

```text
label, button, input, checkbox, switch, radio-group
  → form, textarea, search-input, select
popover, dialog, tooltip
  → dropdown-menu, alert-dialog, drawer
table → pagination → (P1) data-table
tabs, accordion, card, stack, box, separator
calendar + input + popover → (P1) date-picker → (P2) date-range-picker
select + popover → (P1) combobox
```

P1 may depend on P0. P1 must **not** depend on unfinished P2/P3 **contracts**. If a P1 component conceptually uses a P2 ID (e.g. date-picker vs date-range-picker), treat the P2 piece as **deferrable / out of Phase 1 scope**, not blocking.

Notable P1 → P0 contract deps: `data-table` → `table` + `checkbox` + `pagination`; `date-picker` → `input` + `popover` (+ `calendar` which is P1 — author `calendar` before `date-picker`); `combobox` → `popover` + `input`; `app-shell` → `sidebar` (both P1) + P0 layout.

---

## 10. Canonical `docs/contracts/<id>.md`

Do not duplicate the schema by hand.

**Machine-derived (generated from `ComponentSpec`):** Identity, Props, Variants, Sizes, States, Events, Anatomy, Accessibility metadata, Composition metadata, Form metadata, Polymorphism metadata.

**Human-authored (required where schema cannot capture behavior):** Purpose, Scope, Non-goals, Keyboard explanation, Focus explanation, Content constraints, RTL, Responsive, Adapter notes, Edge cases, Interaction examples, Open decisions, Readiness.

Narrative must not contradict the spec. Drift tests compare generated sections to the spec.

---

## 11. Validation vs conformance

**Schema / contract validation:** Is the spec structurally valid?

Already exists: schema compatibility, allowed keys, size default ∈ sizes, controlled prop/event refs, anatomy, serializability, capability↔section alignment, framework-leak scan, inventory count/uniqueness, conformance `validateSpec` + `validateCapabilities`.

**To add (extend, do not replace):**

- Priority map integrity (36/46/16/5, catalog bijection)
- Reference capability derivation
- Keyboard SoT (no divergent `accessibility.keyboard`)
- `requiresRole` ⇒ `accessibility.role`
- Composition required vs N/A
- Invalid `NOT_APPLICABLE` (e.g. Input without `formField`)
- Documentation drift
- Freeze gate: 36 P0 + 46 P1 PHASE-1 READY

**Conformance (behavior):** Does an implementation match the frozen contract?

Today: `createConformanceHarness` + optional snapshots (`props`, `states`, `aria`, `parts`, `size`). Framework runners are **P2 in `core-lock.md`** and stay downstream of freeze.

```text
ComponentSpec → schema validation → (Phase 2) implementation
  → Core conformance snapshots → React/Vue adapter tests
```

Phase 1 freeze requires **strategy + harness on specs**, not React/Vue implementations.

---

## 12. Freeze policy

After freeze, P0/P1 behavioral contracts are authoritative for implementation.

```text
Contract Change Request
  → Impact analysis
  → Breaking / non-breaking
  → ADR / version (schema 1.x additive vs major)
  → Approval
  → Contract update
```

Implementation must never silently edit a frozen spec to “make the component work.”

---

## 13. P0 readiness matrix (36)

**Legend:** R READY · P PARTIAL (profile or unreviewed) · M MISSING · N NOT_APPLICABLE · B BLOCKED (global ADR). **Overall = PARTIAL for all 36** — none are PHASE-1 READY.

Data: inventory + 9 reference spec files. Generated rows use profile presence, not the stale matrix’s reference N/A rows.

| ID            | Profile               | Contract | Props | States | Events | Anatomy | A11y | Comp | Forms | Tokens | Poly | Tests | Status  |
| ------------- | --------------------- | -------- | ----- | ------ | ------ | ------- | ---- | ---- | ----- | ------ | ---- | ----- | ------- |
| button        | reference             | P        | R     | R      | P      | R       | P    | N    | N     | P      | R    | P     | PARTIAL |
| input         | reference             | P        | R     | R      | R      | R       | P    | N    | R     | P      | N    | P     | PARTIAL |
| checkbox      | reference             | P        | R     | R      | R      | R       | P    | N    | R     | P      | N    | P     | PARTIAL |
| switch        | reference             | P        | R     | R      | R      | R       | P    | N    | R     | P      | M    | P     | PARTIAL |
| radio-group   | reference             | P        | R     | R      | R      | R       | P    | N    | R     | R/P    | M    | P     | PARTIAL |
| label         | reference             | P        | R     | N      | N      | R       | P    | N    | N     | N      | R    | P     | PARTIAL |
| select        | reference             | P        | R     | R      | R      | R       | P    | M    | P     | P      | N    | P     | PARTIAL |
| dialog        | reference             | P        | R     | R      | R      | R       | P    | M    | N     | P      | N    | P     | PARTIAL |
| table         | reference             | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| textarea      | form-text             | P        | P     | P      | P      | P       | P    | N    | P     | P      | N    | P     | PARTIAL |
| form          | form-group            | P        | P     | N      | P      | P       | P    | M    | P     | P      | N    | P     | PARTIAL |
| search-input  | form-text             | P        | P     | P      | P      | P       | P    | N    | P     | P      | N    | P     | PARTIAL |
| popover       | overlay-floating      | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| tooltip       | overlay-floating      | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| dropdown-menu | overlay-menu          | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| alert-dialog  | overlay-modal         | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| drawer        | overlay-modal         | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| alert         | feedback              | P        | P     | P      | P      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| toast         | feedback              | P        | P     | P      | P      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| spinner       | feedback              | P        | P     | P      | P      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| skeleton      | minimal               | P        | N     | N      | N      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| badge         | primitive-display     | P        | P     | N      | N      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| empty-state   | feedback              | P        | P     | P      | P      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| progress      | feedback              | P        | P     | P      | P      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| card          | layout                | P        | N     | N      | N      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| separator     | minimal               | P        | N     | N      | N      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| stack         | layout                | P        | N     | N      | N      | P       | P    | N    | N     | N      | N    | P     | PARTIAL |
| box           | layout                | P        | N     | N      | N      | P       | P    | N    | N     | N      | N    | P     | PARTIAL |
| tabs          | collection-tabs       | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| pagination    | navigation            | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |
| avatar        | primitive-display     | P        | P     | N      | N      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| icon          | primitive-display     | P        | P     | N      | N      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| heading       | primitive-display     | P        | P     | N      | N      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| text          | primitive-display     | P        | P     | N      | N      | P       | P    | N    | N     | P      | N    | P     | PARTIAL |
| link          | primitive-action      | P        | P     | P      | P      | P       | P    | N    | N     | P      | P    | P     | PARTIAL |
| accordion     | collection-disclosure | P        | P     | P      | P      | P       | P    | M    | N     | P      | N    | P     | PARTIAL |

Shared P0 gaps: dual keyboard (references + profiles); composition missing on compounds; token namespaces only `button`/`input` in tokens package; no narrative docs; catalog capabilities wrong for 9 references; profile specs unreviewed.

Button `events.change` is semantically weak (actions are not value changes) — normalize during reference cleanup.

---

## 14. P1 readiness matrix (46)

Same legend. All **PARTIAL**. P2/P3 do not appear as blockers.

P1-specific patterns: enterprise forms, data table, navigation chrome, app shell, compound overlays.

| ID                                   | Profile               | Depends on (contract)             | Comp | Forms | Status  |
| ------------------------------------ | --------------------- | --------------------------------- | ---- | ----- | ------- |
| combobox                             | form-selection        | popover, input (P0)               | M    | P     | PARTIAL |
| date-picker                          | form-selection        | calendar (P1), popover+input (P0) | M    | P     | PARTIAL |
| calendar                             | editor-shell          | —                                 | M    | N     | PARTIAL |
| time-picker                          | form-selection        | —                                 | M    | P     | PARTIAL |
| number-input                         | form-text             | input (P0)                        | N    | P     | PARTIAL |
| password-input                       | form-text             | input (P0)                        | N    | P     | PARTIAL |
| file-upload                          | form-text             | —                                 | M    | P     | PARTIAL |
| slider                               | form-text             | —                                 | N    | P     | PARTIAL |
| rating                               | form-text             | —                                 | N    | P     | PARTIAL |
| input-otp                            | form-text             | —                                 | M    | P     | PARTIAL |
| toggle                               | primitive-action      | —                                 | N    | N     | PARTIAL |
| toggle-group                         | form-binary           | toggle (P1)                       | M    | P     | PARTIAL |
| segmented-control                    | form-binary           | —                                 | M    | P     | PARTIAL |
| data-table                           | data-table            | table, checkbox, pagination (P0)  | M    | N     | PARTIAL |
| command                              | collection-command    | input (P0)                        | M    | N     | PARTIAL |
| context-menu                         | overlay-menu          | —                                 | M    | N     | PARTIAL |
| hover-card                           | overlay-floating      | —                                 | M    | N     | PARTIAL |
| sheet                                | overlay-modal         | dialog (P0)                       | M    | N     | PARTIAL |
| menubar                              | overlay-menu          | —                                 | M    | N     | PARTIAL |
| navigation-menu                      | navigation            | —                                 | M    | N     | PARTIAL |
| breadcrumb                           | navigation            | link (P0)                         | M    | N     | PARTIAL |
| sidebar                              | navigation            | —                                 | M    | N     | PARTIAL |
| stepper                              | navigation            | —                                 | M    | N     | PARTIAL |
| toolbar                              | navigation            | button (P0)                       | M    | N     | PARTIAL |
| action-bar                           | navigation            | button (P0)                       | M    | N     | PARTIAL |
| app-shell                            | template              | sidebar (P1), layout P0           | M    | N     | PARTIAL |
| page-header                          | template              | heading, button (P0)              | M    | N     | PARTIAL |
| collapsible                          | collection-disclosure | —                                 | M    | N     | PARTIAL |
| scroll-area                          | layout                | —                                 | N    | N     | PARTIAL |
| resizable                            | layout                | —                                 | N    | N     | PARTIAL |
| grid, flex, center, container, panel | layout                | —                                 | N    | N     | PARTIAL |
| list, list-item                      | layout                | each other                        | N    | N     | PARTIAL |
| banner, notice, callout              | feedback              | —                                 | N    | N     | PARTIAL |
| tag, chip                            | primitive-display     | —                                 | N    | N     | PARTIAL |
| stat, meter                          | feedback              | —                                 | N    | N     | PARTIAL |
| image                                | media                 | —                                 | N    | N     | PARTIAL |
| code                                 | primitive-display     | —                                 | N    | N     | PARTIAL |

Full per-dimension cells for P1 match generated-profile PARTIAL the same way as generated P0 (identity READY, anatomy/a11y mechanism PARTIAL, tests schema-only). Do not copy stale matrix N/A for these IDs — inventory profiles declare props/states/events for form/overlay/navigation families.

**P1 deps outside P0/P1:** none required. `date-range-picker` (P2) must not block `date-picker`. `dropzone` (P2) must not block `file-upload`. `tree` (P2) must not block `sidebar`.

---

## 15. P2 / P3 handling

Recorded in the priority map. Status: **DEFERRED**.

They do not block freeze unless they prove a **global schema defect** (none identified). Duplicate pairs (`toast`/`sonner`, `separator`/`divider`, `tree`/`tree-view`) are catalog facts — do not delete IDs in Phase 1; P3/P2 ranking isolates them.

---

## 16. Architect risk checklist

```
[x] Schema assumed immutable? No — 1.1.0 + isSchemaCompatible
[ ] Profile generation semantically enough for P0/P1? No — 94 unreviewed
[ ] Docs auto-synced? No — matrix stale 6/97 vs 9/94
[ ] Catalog capabilities accurate for references? No — registry.ts bug
[x] Priority in runtime contract? Must not be — ADR-1 Accepted
[x] Tokens inside Core? Must not be — ADR-3 Option B
[ ] Single keyboard SoT? No — ADR-2
[ ] Composition used where required? No — ADR-4
```

---

## 17. Open decisions register

| Decision                                        | Why                           | Affected        | Blocker?                              | Owner              | Before freeze? |
| ----------------------------------------------- | ----------------------------- | --------------- | ------------------------------------- | ------------------ | -------------- |
| ADR-1 record map file + CI                      | Governance                    | All 103         | No (rules accepted; artifact missing) | Planning           | Yes (artifact) |
| ADR-2 apply rules to specs                      | Prevent forked semantics      | 9 refs + P0/P1  | Yes until applied                     | Core               | Yes            |
| ADR-3 Option B recorded                         | Stops Core token field debate | Visual P0/P1    | Yes until recorded                    | Architect          | Yes            |
| ADR-4 composition filled on compounds           | Dialog/Select/Table/…         | ~20 P0/P1       | Yes for those IDs                     | Core + FE          | Yes            |
| ADR-5 generator                                 | Drift                         | Docs            | No                                    | Tooling            | Recommended    |
| Card: parts vs catalog children                 | Comp R vs N                   | card            | Yes for card only                     | FE                 | Yes            |
| Button event name (`change` vs `press`/`click`) | Event SoT                     | button          | Yes for button                        | Core               | Yes            |
| `asChild`                                       | Adapter-only                  | All polymorphic | No                                    | Adapters (Phase 2) | No             |
| Framework conformance runners                   | lock doc P2                   | Adapters        | No                                    | Phase 2            | No             |

---

## 18. Execution sequence

```text
STEP 1   Write docs/phase1-component-priority-map.md (36/46/16/5) + tests
STEP 2   Record ADR-2/3/4 (and ADR-1/5) under docs/adr/ or core-lock clarifications
STEP 3   Normalize 9 reference specs to canonical rules
STEP 4   Fix registry capability derivation + regression test
STEP 5   Publish source-of-truth + freeze/change-control doc
STEP 6   Canonical docs/contracts template (generated vs narrative)
STEP 7   Baseline generated matrix (integrity; may trail steps 3–4)
STEP 8   Refine P0 specs (graph B order)
STEP 9   Validate P0 (no PHASE-1 READY claimed without tests)
STEP 10  Refine P1 specs
STEP 11  Validate P1
STEP 12  Full contract + spec conformance validation
STEP 13  Close remaining P0/P1 blockers in the register
STEP 14  Contract freeze
```

Smallest Core code changes: registry bugfix, validators, reference-spec consistency. No new packages. No token field on `ComponentContract`. No React/Vue work.

---

## 19. Phase 1 freeze gate

```text
[ ] Approved 103-component CN priority map recorded
[ ] Exactly 36 P0 / 46 P1 / 16 P2 / 5 P3
[ ] Global contract rules resolved (ADR-2)
[ ] Reference-spec inconsistencies resolved
[ ] Capability derivation bug resolved
[ ] Token/theme boundary resolved (ADR-3 Option B)
[ ] Composition adoption criteria applied (ADR-4)
[ ] Source-of-truth hierarchy documented
[ ] Contract documentation strategy finalized
[ ] Contract validation updated (extend existing)
[ ] Conformance strategy established (harness on specs; adapters later)
[ ] Contract-dimension graph complete
[ ] Component dependency graph complete
[ ] 36/36 P0 contracts PHASE-1 READY
[ ] 46/46 P1 contracts PHASE-1 READY
[ ] No unresolved P0/P1 blocking decisions
[ ] P2/P3 explicitly deferred
[ ] Contract change-control process documented
```

Only then: **PHASE 1 CONTRACT FREEZE**.

---

## 20. QA tests to add

- Priority bijection vs catalog (36/46/16/5)
- Reference catalog capabilities === spec capabilities
- Keyboard SoT (no divergent lists)
- `requiresRole` ⇒ role present
- Composition present on required IDs, absent/N/A on leaves
- Optional: generated matrix hash vs `listComponentSpecs()`
- Freeze test: P0+P1 all PHASE-1 READY only after narrative + reviewed specs exist (do not fake READY from profiles)

Keep `registry.test.ts` / `specs.test.ts` / `validate-inventory.ts`. Extend them.

---

```text
PHASE 1 STATUS:
NOT READY

CATALOG:
103 components

P0:
0 / 36 READY

P1:
0 / 46 READY

P2:
16 DEFERRED

P3:
5 DEFERRED

GLOBAL CONTRACT DECISIONS:
2 / 5 RESOLVED (ADR-1 architecture + ADR-3 Option B selected;
ADR-2/4 rules proposed not yet applied; ADR-5 non-blocking)

BLOCKING DECISIONS:
3 (ADR-2 apply, ADR-4 apply, ADR-3 record)

CONTRACT VALIDATION:
PARTIAL (structural READY; priority/SoT/composition/freeze checks NOT READY)

CONFORMANCE STRATEGY:
PARTIAL (harness exists; Phase 1 uses spec compliance; adapter runners deferred)

NEXT ACTION:
Write docs/phase1-component-priority-map.md with the 36/46/16/5 CN map
in this plan and add the catalog bijection test — then apply ADR-2
normalization to the nine reference specs.
```
