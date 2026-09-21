# Post-Freeze Step 6 — Downstream Reconciliation Report

**Date:** 2026-09-20  
**Workflow:** Post-Freeze Step 6 — Downstream Contract Reconciliation  
**Scope:** React matrix, generated contract docs, downstream drift scan (no Core edits, no WF04 implementation)

---

## 1. Baseline

| Field | Value |
| --- | --- |
| Core version | `0.1.0` |
| SPEC_SCHEMA_VERSION | `1.1.0` |
| CONTRACT_SCHEMA_VERSION | `1.1.0` |
| Freeze commit | `d7c900071b41814f0f949b872ec3d2a85b564400` |
| Total components | 103 (P0=36, P1=46, P2=16, P3=5) |
| Frozen Phase 1 population | 82 |

Authoritative artifacts read: `PHASE-1-CONTRACT-FREEZE.md`, `PHASE-1-CONFORMANCE-REPORT.md`, `PHASE-1-CCA-ACCEPT-REPORT.md`.

---

## 2. React Matrix Changes

| Component | Previous | New | Reason |
| --- | --- | --- | --- |
| Switch | A11y `role: checkbox`; Core ID `form-binary`; Status OPEN; Readiness **BLOCKED** | Core ID `switch` (reference); A11y `role: switch`; Status **LOCKED**; Readiness **READY** | Frozen Core reference spec defines `role: switch` with `root/control/thumb` parts |
| Popover | A11y `role: tooltip` | A11y `role: dialog` | Frozen Core / freeze artifact: `overlay-floating` non-tooltip IDs → `dialog` |
| Label | Core ID `primitive-display`; Readiness **BLOCKED** | Core ID `label` (reference); native `<label>`; Status **LOCKED**; Readiness **READY** | Frozen Core reference spec uses `nativeTag: label` |
| RadioGroup | Core ID `form-binary`; parts `root/control`; Readiness **BLOCKED** | Core ID `radio-group` (reference); `role: radiogroup`; parts include `item`; Status **LOCKED**; Readiness **READY** | Frozen Core reference spec defines collection + `item` part |

**Not changed:** Other matrix rows retain prior readiness (e.g. Button READY, Popover PROPOSED / READY-WITH-NONBLOCKING-OQ). Component population in the matrix remains the same 17 React families; priority counts unchanged.

**Distinction preserved:** Core contract readiness (`READY`) does **not** imply React source exists. Wave 0 has not started.

---

## 3. Generated Documentation

| Item | Detail |
| --- | --- |
| Generator command | `pnpm docs:contracts` (`pnpm --filter @celestial-ui/core build && node tooling/generate-contract-docs.mjs`) |
| Files regenerated | 82 contract docs under `celestial-ui-design-system/docs/contracts/` (including `popover.md`, `hover-card.md`) |
| Popover result | `"role": "dialog"` in machine-derived section |
| Hover-card result | `"role": "dialog"` in machine-derived section |
| Tooltip result | `"role": "tooltip"` (unchanged, correct) |

**Integrity note:** Regeneration used the **local working-tree Core build**, which includes an uncommitted `spec-profiles.ts` patch. At pristine freeze commit `d7c90007` (without that patch), built contracts emit `popover` / `hover-card` → `tooltip`. See §6 and §9.

---

## 4. Additional Drift Found

| Location | Finding | Classification |
| --- | --- | --- |
| `celestialui-react/docs/architecture/react/families/{switch,label,radio-group,popover-tooltip}.md` | Historical BLOCKED / wrong roles | **fixed** |
| `celestialui-react/docs/architecture/react/react-component-architecture-specification.md` | Core Gap BLOCKED rows; OQ-14 open | **fixed** (gaps RESOLVED; OQ-14 RESOLVED) |
| `celestialui-react/docs/implementation/wf04/*` | BLOCKED skips for Label/Switch/RadioGroup; stale Popover role | **fixed** |
| `CelestialUI-Vue/docs/architecture/vue/README.md` | “Wait for P1-FREEZE” in next steps | **fixed** (freeze complete) |
| `CelestialUI-Vue/docs/architecture/vue/vue-component-matrix.md` | Label/Switch/RadioGroup still BLOCKED | **deferred** (Vue spec workflow; authority chain already references P1-FREEZE) |
| `CelestialUI-Vue/docs/architecture/vue/vue-open-questions.md` | Core gap BLOCKED entries | **deferred** (Vue spec workflow) |
| `celestial-component-libraries/README.md` | “WF04 BLOCKED until P1-FREEZE” | **deferred** (master index; freeze now complete; separate doc pass) |
| `PHASE-1-CONFORMANCE-REPORT.md` / `PHASE-1-CCA-ACCEPT-REPORT.md` | Historical drift descriptions | **legitimate historical reference** |
| `.cursor/plans/*.plan.md` | Pre-freeze planning notes | **legitimate historical reference** |
| `packages/core/src/catalog/spec-profiles.ts` (uncommitted) | `overlay-floating` id-aware role fix | **Core contradiction** — see §6 |
| `packages/core/test-roles.ts` (untracked) | Ad-hoc test file | **deferred** — not part of freeze; remove or commit separately |

---

## 5. Vue Authority Check

**PASS (authority chain).** `CelestialUI-Vue/docs/architecture/vue/README.md` correctly references:

```text
@celestial-ui/core (published frozen dist) → … → P1-VERIFY → CCA-ACCEPT → P1-FREEZE → Vue planning artifacts
```

Next steps updated to reflect P1-FREEZE complete. Vue component matrix and OQ register still carry pre-freeze BLOCKED rows — deferred to the Vue Framework Specification workflow (not in Step 6 scope).

---

## 6. Core Integrity

### Changes made in Step 6

**NO edits to frozen Core contract source files in this step.**

Step 6 did **not** modify: ComponentContract, ComponentSpec reference files, registry, validation, schema versions, or profiles beyond what was already present in the working tree.

### Pre-existing working-tree state (discovered, not introduced by Step 6)

| Path | State |
| --- | --- |
| `packages/core/src/catalog/spec-profiles.ts` | **Modified (uncommitted)** — `overlay-floating` emits `dialog` for non-`tooltip` IDs |
| `packages/core/test-roles.ts` | **Untracked** |

### Core contradiction (STOP condition)

| Source | `popover` / `hover-card` accessibility role |
| --- | --- |
| `PHASE-1-CONTRACT-FREEZE.md` (artifact) | `dialog` |
| Freeze commit `d7c90007` built registry (pristine) | `tooltip` |
| Local uncommitted `spec-profiles.ts` build | `dialog` |
| Generated `docs/contracts/popover.md` (this step) | `dialog` (from uncommitted build) |

Reference specs at freeze commit **do** match downstream reconciliation for Switch (`role: switch`), Label (`nativeTag: label`), and RadioGroup (`role: radiogroup`, `item` part). The remaining contradiction is **`overlay-floating` profile semantics for Popover/HoverCard** — documented as fixed in the freeze artifact but not present in the freeze commit’s committed profile source.

---

## 7. Validation

| Command | Repository | Result |
| --- | --- | --- |
| `pnpm docs:contracts` | `celestial-ui-design-system` | **PASS** — 82 contract docs written |
| `pnpm docs:validate` | `celestial-ui-design-system` | **PASS** — Overall `RELEASE_READY` |
| Built registry role spot-check (pristine `d7c90007`, stash profile patch) | `celestial-ui-design-system` | `popover=tooltip`, `hover-card=tooltip`, `switch=switch` |
| Built registry role spot-check (with local profile patch) | `celestial-ui-design-system` | `popover=dialog`, `hover-card=dialog` |
| React stale-reference grep | `celestialui-react` | No remaining stale Switch `role: checkbox` or Popover-only `role: tooltip` in reconciled architecture docs |

---

## 8. Remaining Work

### Documentation reconciliation

- React matrix + family specs + WF04 planning docs: **complete**
- Generated contract docs: **aligned to freeze artifact intent**, but **not verifiably derived from pristine freeze commit** until `overlay-floating` profile fix is committed/published per change control
- Vue matrix/OQ BLOCKED rows: **deferred** to Vue Framework Specification
- `celestial-component-libraries` master index WF04 gate wording: **deferred**

### React implementation

- **Not started.** Wave 0 foundation + Celestial package integration validation is the next execution workflow (WF04).

### Vue specification

- Vue Framework Specification and Component Architecture: **not written**
- Vue WF04 folder: **not created**

### React Wave 0

- **Not started** in this step (by design).

---

## 9. Gate Decision

**`DOWNSTREAM RECONCILIATION BLOCKED — CORE CONTRADICTION`**

React downstream documentation is reconciled with the **freeze artifact’s stated semantics**. However, the committed freeze baseline at `d7c90007` still builds `popover` / `hover-card` with `role: tooltip` unless the uncommitted `spec-profiles.ts` patch is applied. Generated contract documentation therefore reflects working-tree Core, not the pristine freeze commit alone.

**Recommended remediation (outside Step 6 — requires Core change control, not done here):**

1. Commit and publish the `overlay-floating` profile fix under Phase 1 change control, **or**
2. Amend the freeze baseline if the artifact overstated committed Core state.

Until resolved, WF04 should treat Popover/HoverCard accessibility as **ambiguous between artifact and commit**.

---

**STOP.** WF04 / React Wave 0 preparation may proceed for non-contradicted families after Core remediation; this step does not start Wave 0.
