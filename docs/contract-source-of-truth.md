# Contract Source-of-Truth Hierarchy

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

1. **`ComponentSpec`** — authoritative machine-readable contract (`@celestial-ui/core/specs/<id>`).
2. **Validation** — schema validators + **P1-VERIFY** (28-dimension audit before freeze). `phase1Readiness` is evidence, not proof.
3. **Documentation** — generated matrix + `docs/contracts/<id>.md`. **Never** an independent source of truth. If docs disagree with specs, **specs win**.
4. **Adapters** — translate frozen Core; do not redefine semantics.

**Planning artifacts** (priority map, readiness matrices) are governance metadata, not runtime contracts.

**Phase 1 freeze:** [PHASE-1-CONTRACT-FREEZE.md](./architecture/PHASE-1-CONTRACT-FREEZE.md) records the implementation baseline after P1-VERIFY PASS and CCA-ACCEPT.

See [conformance-strategy.md](./conformance-strategy.md) for schema vs P1-VERIFY vs Wave 0 vs adapter conformance.
