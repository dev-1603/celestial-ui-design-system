# Contract Conformance Strategy

## Three layers (do not duplicate)

| Layer | Question | Owner | When |
|---|---|---|---|
| **Schema validation** | Is the contract structurally valid? | Core validators (`validateComponentContract`, `phase1-rules.ts`, `validateAllComponentSpecs`) | Continuous / CI |
| **P1-VERIFY** | Are P0/P1 contracts freeze-eligible on 28 canonical dimensions? | [PHASE-1-CONFORMANCE-REPORT.md](./architecture/PHASE-1-CONFORMANCE-REPORT.md) | Before P1-FREEZE |
| **Adapter conformance** | Does an implementation match the **frozen** contract? | `@celestial-ui/core/testing` harness + React/Vue wave tests | After P1-FREEZE |

```text
ComponentSpec (authority)
  → schema validation (structural)
  → P1-VERIFY (28-dimension audit; marker is evidence, not proof)
  → P1-FREEZE
  → implementation
  → adapter conformance (runtime/harness)
```

## Schema validation (P1-IMPL output)

P1-IMPL delivers structural readiness via:

- `validateComponentContract` + Phase 1 rules (`phase1-rules.ts`)
- `validateAllComponentSpecs` + priority map integrity
- `createConformanceHarness(spec).assertCompliant()` on specs

`extensions.phase1Readiness: "ready"` is an **implementation marker**. It is **not** proof of P1-VERIFY conformance.

## P1-VERIFY (evaluation-independent audit)

P1-VERIFY reuses Core validators and scores **28 canonical dimensions** per P0/P1 ID.

- Independent = evaluation does not treat `phase1Readiness` as proof
- Not independent = tooling (no parallel validation product)

Freeze-eligible per component: every applicable dimension is `READY` or `NOT_APPLICABLE`. `PARTIAL`, `MISSING`, and `BLOCKED` are not freeze-eligible.

Workflow: [phase-1-contract-conformance.md](../../celestial-component-libraries/workflows/phase-1-contract-conformance.md)

## Wave 0 (adapter package integration)

WF04 Wave 0 validates **package/build/adapter integration** against **frozen published Core**. It does **not** re-run the 28-dimension P1-VERIFY audit.

## Phase 2 (adapter implementation)

```text
Frozen ComponentSpec → schema validation → React/Vue implementation
  → Core conformance snapshots → adapter tests (axe, SSR, harness)
```

Framework-specific conformance runners remain **P2** per `docs/core-lock.md` (live in framework packages).

## Source-of-truth hierarchy

1. `ComponentSpec` — authoritative  
2. Validation / P1-VERIFY — conformance gates  
3. Generated docs/matrix — derived; if Markdown disagrees with specs, specs win  

See [contract-source-of-truth.md](./contract-source-of-truth.md).
