# Served-persistence decision memo (Transplant Phase 2; W3-01, Rule T-SERVE)

> **The park that came due.** V6 correctly PARKED W3-01 — "served submits in RAM" is a product/security decision, not a
> mechanical fix. This is the "subsequent sprint after appropriate review" the protocol promised. The decision is made
> HERE, both options costed, and — whichever wins — **a genuine second party's first contact must be preservable
> BEFORE DOORS-OPEN may be attempted** (the W3-01 ↔ DOORS-OPEN intersection nobody flagged until the V6 audit did).

## The finding (W3-01, restated)

`serve-studio.ts` mounted the studio routes on `durable.store` — the durable ledger's INNER, in-memory `Ledger.Store`,
whose `register()` does not fsync. And it opened that store on `live-ledger.jsonl` (the AUTHORED live-run ledger). So a
served submission (a) evaporated on restart and (b) would have merged into the authored ledger. A stranger's first
contact would not survive the operator restarting the process — and DOORS-OPEN's whole point is that first contact.

## The two options, costed

| Dimension | **A — Ephemeral by design + out-of-band capture** | **B — Isolated, authn-gated durable store (CHOSEN)** |
|---|---|---|
| First-contact survival | only if the operator curls `/studio/export` before shutdown (manual, fallible) | **survives restart automatically** (fsync write-to-disk-then-invoke) |
| Abuse surface | none added (nothing persists) | a persisted store CAN be filled — bounded by authn + rate-limit + per-author quota (below) |
| Evidence preservation | fragile — depends on the runbook being followed each time | durable + hash-chained + torn-tail-quarantined + rollback-detected (the existing L-PERSIST machinery) |
| Retention | zero (RAM) | the isolated file; the operator prunes it deliberately (never auto-wiped) |
| authn interaction | authn still gates mutation, but nothing is kept to protect | authn gates WRITE; the durable file is operator-local, never a public endpoint |
| Isolation from the authored ledger | trivially isolated (nothing kept) | **explicit** — a SEPARATE file `served-submissions.jsonl`, never merged into `live-ledger.jsonl` |
| Complexity | least | small — reuses `Durable.DurableStore` via a persisting `mountableStore()` view (a Proxy over the inner store) |

## The decision: **B — persist, isolated, authn-gated, restart-surviving**

DOORS-OPEN depends on first contact surviving a restart, and the durable machinery (fsync, chain-verify-on-load,
torn-tail quarantine, rollback-vs-anchor) already exists — so Option B is both the stronger AND the lower-marginal-cost
choice. Concretely:

- **Isolated store.** `serve-studio.ts` now opens `data/studio/served-submissions.jsonl` — a SEPARATE file from the
  authored `live-ledger.jsonl`. Untrusted served submissions never merge with the authored ledger.
- **Restart-survival.** The routes are mounted on `durable.mountableStore(...)` — a `Ledger.Store` view whose
  `register()` is the PERSISTING (fsync) path. `test/organon/served_persistence.test.ts` proves a submission survives a
  reopen with the chain intact; its POSITIVE CONTROL proves the OLD wiring (`durable.store`) would NOT survive — W3-01
  made mechanically un-reintroducible.
- **Bounded served-abuse hardening.** authn (Bearer token) on mutating routes · rate-limit (120/min) · body-size cap
  (64 KB) · a **per-author root quota** (`maxRootsPerAuthorDomain: 25`) as registration friction.
- **The sybil residual, NAMED (not eliminated).** A determined sybil can mint fresh `authorId`s to reset the per-author
  quota. This residual is REAL: authn + rate-limits + the quota MITIGATE it; they do not eliminate it. It is displayed,
  never hidden behind a false "solved" (the same honesty the whole system enforces). A stronger identity binding (a
  key-scoped authorId with a cost to mint) is the follow-up owner's problem — parked, not faked.

## T-SERVE gate: first contact is now preservable BEFORE it happens

The restart-survival wall is green; the served store is isolated and authn-gated. **A genuine second party's session —
their submission, tier, and ledger evidence — will survive a restart.** DOORS-OPEN may therefore be attempted by the
Operator (with the first-contact runbook), first contact preservable, per T-SERVE. Independence stays PENDING until a
genuine non-author actually acts (L-2P) — the persistence decision does not manufacture the stranger.
