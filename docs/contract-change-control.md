# Contract Change Control (Phase 1 Freeze)

After **Phase 1 Contract Freeze**, P0/P1 behavioral contracts are authoritative for implementation.

**Freeze artifact:** [PHASE-1-CONTRACT-FREEZE.md](./architecture/PHASE-1-CONTRACT-FREEZE.md)  
**Conformance report:** [PHASE-1-CONFORMANCE-REPORT.md](./architecture/PHASE-1-CONFORMANCE-REPORT.md)

WF04 Wave 0 and framework adapters must pin the Core version recorded in the freeze artifact.

---

## Change process

```text
Contract Change Request
  → Impact analysis (which P0/P1 specs + adapters affected)
  → Contract Diff
  → Tests + regenerated docs
  → Version Decision: PATCH | MINOR | MAJOR
  → Approval
  → Contract update + publish new Core version
```

---

## Version classification

| Class | Typical change | Semver | Adapter impact |
|---|---|---|---|
| **PATCH** | Documentation clarifications; non-semantic test additions; generated doc regen | Patch | None expected |
| **MINOR** | Additive contract fields within schema `1.x`; new optional props/states | Minor | Adapters may opt in |
| **MAJOR** | Breaking semantic change; role/event/part rename; removed props | Major | Migration required |

Additive changes within schema `1.x` follow [core-lock.md](./core-lock.md) allowed changes when semantics are preserved.

---

## Rules

- Implementation must **never** silently edit a frozen spec to match adapter code.
- Adapters must **not** invent Core semantics to bypass a BLOCKED contract (e.g. wrong `accessibility.role` on `popover`).
- Breaking semantic changes require migration notes and semver coordination across `@celestial-ui/core` and adapters.
- Priority map changes are governance-only and do not change `ComponentSpec` schema versions.

---

## Freeze gate (P1-FREEZE eligibility)

P1-FREEZE requires P1-VERIFY **PASS**:

- All 82 P0/P1 IDs freeze-eligible: every applicable dimension on the **28-dimension** audit is `READY` or `NOT_APPLICABLE`
- No `PARTIAL`, `MISSING`, or `BLOCKED` on applicable dimensions
- Global blockers = 0 (including shared-profile semantic defects such as `overlay-floating` role on non-tooltip IDs)
- P2/P3 explicitly deferred (16 + 5)

`extensions.phase1Readiness: "ready"` alone does **not** satisfy the freeze gate.

See [phase-1-contract-freeze.md](../../celestial-component-libraries/workflows/phase-1-contract-freeze.md).
