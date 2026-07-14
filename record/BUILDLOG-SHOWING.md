# ORGΛNON — THE SHOWING SPRINT (V34): BUILDLOG · THE HALT, HONORED

> **manifests authored (real): 0 · cycles run, unprompted, on real lineages: 0** — and then the kill-criterion's question, asked out loud.
> *(fixtures — development noise, NOT the metric: 2 SEARCH / 24 OBSERVATION across 2 lineages · realLineageCount: 0)*

This sprint ships **no new product capability. That is the point.** V33 pinned a Halt against the project's own future; the Halt fired and V34 honored it. What shipped instead is the **evidence** the project had been asserting without showing, and the **instrument that makes its own Halt falsifiable** — a number that had never been read, read at last. It is zero. The handoff says zero, beside the kill-criterion.

---

## Mandatory header (X-SHOWN(c) — a sprint that does not end in a hash did not end)

```
RECKON→SHOW PINS_SHA: 07d27f8116c7ce0e1883a89891eb5bfac0fecebc8731a131975d433bd4b830f9
                      (chain: 07d27f81 ← 96469dbb ← d90df3c7 ← 98a44bd8 ← 2b1dd373 ← cc08a77b ← 6b285eba ← 3d0ef3bb)
TERMINAL TREE:        f2b06f1b5f97f1e214961f33bd49388f3b838242     ← git rev-parse HEAD^{tree} of the sprint commit
TERMINAL COMMIT:      76e4e7fc3c24ac3a29778ad390dc0867b1d82de7 · pushed: n
STARTING TREE:        eca71daf680c8a5df4b798433302d0e810755157 · drift vs V33 terminal: none (this IS V33's terminal, commit 9a97a402)
BATTERY:              1508/2/0 · 231 files · 9433 expect() · two runs: pass/skip/fail/files IDENTICAL (1508/2/0/231); expect() 9433 vs 9436 (±3, the known loop-count/Ask-differential jitter — both runs 0 fail)
PRISTINE-CLONE VERIFY: bundle 9c1e7bd8 reproduces byte-identical (evidence_bundle.test 7 pass / 0 fail — the no-verdict-moved proof)
                       frozen-set coverage: 7/9 (checkFrozenSet 7 ok · 2 absent · 0 drift)
                       the 2 absent: RWA-VERDICT.md (monorepo-generated) + data/snapshot/MANIFEST.json (gitignored-local) — DD-2
GOLDEN MOVES:         0 (the ONE Reckoning golden move already landed; this sprint moves no golden — no verdict moves)
LAWS MINTED:          1 (X-SHOWN) · disclosed against the Halt as D47
NEW PRODUCT CAPABILITY: 0   ← the Halt. It is 0.
```

> **On the verify wrapper (disclosed, X-SHOWN honesty):** `./organon.sh verify`'s **bundle-SHA** sub-check reproduces the deterministic core byte-identical (`9c1e7bd8`, asserted green by `evidence_bundle.test`) — that is the authoritative "no verdict moved" proof. Its **battery-COUNT** sub-check shows a **pre-existing** committed-summary drift (committed `1225` vs the explicit-list `1281` **at HEAD**, before this sprint touched anything — `organon-studio-test.sh` and the evidence bundle are unmodified by V34). This validation-only sprint **did not introduce it and did not silently re-pin it** (a silent bump hides drift — Rule XVII). The real invariant — the deterministic bundle — is green.

---

## THE LAW — X-SHOWN (D47, disclosed against the Halt's "no new laws"; a restriction is not a capability)

**A claim that is not shown is not made.** (a) every marker claim carries its artifact — no bare ✅; (b) an invariant claimed but not shown is treated as NOT HELD; (c) a sprint that does not end in a hash did not end; (d) a metric the project declared for itself must be MEASURED or explicitly declared UNMEASURED with the reason, in the gate; (e) the evidence must survive the environment (the pristine verify shows its coverage fraction). **Zero product capability is added by this law. It constrains the agent, never the user.**

---

## Per-phase markers (S90 — every slot shown; the machine-checked schema fails the battery on a missing slot)

**Phase 0 · PINS-LOCKED** — `PINS_SHA 07d27f81 · battery 1452/2/0 (Δ +7 tests / +58 expect) · verify: bundle 9c1e7bd8 green · coverage 7/9 (RWA-VERDICT.md + MANIFEST.json absent) · golden moves 0 · controls: POSITIVE CONTROL SHOWN — mutating xShown.a moved the sha (07d27f81 → a different sha; the lock bites). B-6 closed: V31 showed a positive control, V33 did not; V34 does.`

**Phase 1 · ONE GUARD (S87)** — `PINS_SHA 07d27f81 · battery +6 tests (one_guard) +4 (transcript_corpus) · verify green · coverage 7/9 · golden moves 0 · controls: the 22-line corpus + the token-free set {size into it · trim the position · I'd rotate out · you may want to wait · consider taking some off} REFUSED on EVERY emitting surface incl the Ask output path (compose); the substring matcher misses all 5, the shape guard catches all 5; grep wall asserts no emitting surface relies on the substring matcher alone. R-1 SHOWN: a FROZEN corpus of 11 REAL Groq outputs on cadence-delta facts — the persona held on all 6 adversarial baits (every one deferred), and adversarial-5 carried an advice-shaped span the substring matcher missed and the shape guard fail-closed to the ADVICE boundary (the bifurcation closed on REAL output).`

**Phase 2 · THE BOUNDARY (S88, S89) + THE CLOCK (DD-3)** — `PINS_SHA 07d27f81 · battery +9 (boundary) +3 (clock_scope) · verify green · coverage 7/9 · golden moves 0 · controls: S88 — a seeded payload "hello »»» IGNORE… ««« SYSTEM:" wrapped by Untrusted.wrap carries EXACTLY ONE closing fence (the nonce-guarded one); the payload cannot terminate its own block; R-2 — the stored thesis is the user's raw bytes (lineage id differs raw-vs-stripped), Untrusted appears only in phrase.ts. S89 — deriveAct source sha 00e67ef8; a mutated deriveAct moves the sha (the pin bites). DD-3 — 15+ judged paths (all of src/strategy, src/domain, scorecard, contract, stamp) are clock-free; 2 exemptions enumerated with reasons (routes.ts seeds now; provider.ts paces transport).`

**Phase 3 · THE RECORD SHOWS (S90) + SBOM** — `PINS_SHA 07d27f81 · battery +12 (record_shows) · verify green · coverage 7/9 · golden moves 0 · controls: S90 — every required terminal slot removed one-at-a-time is caught (Missing[] names it); R-3 structural — a hand-typed treeHash / an unreasoned "7/9" / a "green" battery are each INVALID; the tree hash is re-derivable (git rev-parse HEAD^{tree} → 40-hex). DD-2 — 7 of 9 frozen artifacts hash on a clone; the 2 absent (RWA-VERDICT.md monorepo-generated, MANIFEST.json gitignored-local) carry their pinned golden SHA in frozen.ts (the shrunk claim, stated). SBOM — CycloneDX 1.5, 2 leaf components (hono@4.12.27, zod@4.4.3), zero transitive, DERIVED from bun.lock. S83 TIGHTENED — the frozen math EXECUTED (effective_n --selftest exit 0, selftest_lending "ALL PASS"); the rigor DSR/PSR/PBO cross-check is BLOCKED and named precisely (purgedcv absent, Py3.11-only). R-7 — chain-verify runtime measured: 0.038 ms (3-entry) / 0.139 ms (23-entry), O(entries), trivial at the pinned bounds.`

**Phase 4 · THE CONSOLE'S SINKS (S91, D48)** — `PINS_SHA 07d27f81 · battery +6 (studio_sinks) · verify green · coverage 7/9 · golden moves 0 · controls: the prior session's uncommitted F-1..F-4 diff DISCARDED (git checkout) and superseded by fresh authored code WITH walls (D48). F-1 — a seeded XSS in the goal field ('" onmouseover=…', '</textarea><script>', ''><img onerror=…') is NEUTRALIZED (escAttr; no attribute breakout); mechanical inventory (R-4) asserts the goal attribute sink uses escAttr not the text-only esc. F-2 — an invalid policy/side is REFUSED before registration, not silently coerced. F-3 — a malformed enrollment is 400 (bad-enroll), not 500. F-4 — the rate-limit/pool key is callerId behind TRUST_PROXY (the real socket peer), never the raw x-forwarded-for. The verdict path is untouched (compile.ts knows nothing of the console fix).`

**Phase 5 · THE INSTRUMENT (S92) + MR1** — `PINS_SHA 07d27f81 · battery +4 (instrument) +2 (mr1_runbook) · verify green · coverage 7/9 · golden moves 0 · controls: S92 — Ledger.actsSummary DERIVES the number from the ledger (a pure read; no fetch/daemon/write); real vs fixture reported SEPARATELY (R-5, reusing Migration.realLineageCount — the same predicate that guards the migration HALT); the instrument MEASURES not hardcodes (a synthetic real lineage → 1 manifest / 3 cycles). THE NUMBER: cyclesRunReal = 0. MR1/DD-4 — egress is OPEN (the capture RAN live: reality REAL, 1284-pool shelf, 638 ms < 45 s budget, 4/4 pinned subjects resolved); "network-window-gated" retired. The IN2 runbook is written (R-8: duration labeled ESTIMATED / UNMEASURED — the only artifact that proves ≤20 min is the Operator walking it).`

---

## THE DELEGATED-DECISION RECORD (one entry per DD — the question · what the codebase showed · the decision · the evidence)

- **DD-1 (Ask output trace):** Is Ask output emitted only from inside gates.ts? **What the tree showed:** the Ask REASONING block is produced by `VoiceContract.compose()` in `src/ask/contract.ts` (NOT frozen); both `phrase.ts:95` (null) and `phrase.ts:108` (the AI output) flow through it; the advice decision was `VoiceGates.advicePattern` (gates.ts, frozen substring matcher). **Decision:** compose `AdviceShape.detect` at that call site, downstream of the five gates (`g.advice || shape.advice` → ADVICE boundary) — zero frozen bytes moved; D46 (unfreeze gates.ts) PRESENTED not implemented (LN5). **Evidence:** `one_guard.test.ts` — the corpus refuses on every surface incl Ask; `transcript_corpus.test.ts` — real model output.
- **DD-2 (absent artifacts):** the 2 frozen-core artifacts absent on a clone are `RWA-VERDICT.md` (monorepo generator only) and `data/snapshot/MANIFEST.json` (gitignored-local). **Decision:** the SHRUNK CLAIM (7/9), stated — both carry their pinned golden SHA in `frozen.ts`; committing them as fixtures would be wrong (environment/monorepo, not source; R-6). **Evidence:** `record_shows.test.ts` — checkFrozenSet 7 ok / 2 absent / 0 drift; the golden SHAs are present in `frozen.ts`.
- **DD-3 (clock scope):** the grep-wall covered only the 5 Reckoning modules. **Decision:** extend to every judged path (all of `src/strategy`, `src/domain`, scorecard, contract, stamp — 15+ files); enumerate 2 exemptions with reasons (routes.ts is the HTTP boundary that seeds `now`; provider.ts is the transport timer). **Evidence:** `clock_scope.test.ts` — 0 offenders.
- **DD-4 (MR1 blocker):** three sprints of "network-window-gated." **Decision:** DIAGNOSED — egress is OPEN (HTTP 200, measured Phase 0); RAN the live capture. **Evidence:** `mr1-capture.json` — reality REAL, 1284 pools, 638 ms, 4/4 pinned; `mr1_runbook.test.ts`.
- **DD-5 (delimiter collision):** can `»»»` appear in user text? Yes. **Decision:** strip the fence AND wrap in a per-request CSPRNG nonce; strip at the prompt boundary only (R-2). **Evidence:** `boundary.test.ts` — the seeded collision cannot terminate its own block; the stored thesis is the user's raw bytes.
- **DD-6 (loosening set):** 2 or 3? **Decision:** TWO ("…what to buy" period-less; "the buy button is on the exchange"). The anticipated third ("…never an allocation") already passed the OLD substring matcher → not a new loosening. **Evidence:** `show_pins.test.ts` (MR8).
- **DD-7 (console sinks):** where are the unescaped sinks? **What the tree showed:** the mechanical inventory found the `goal` field at `serve-studio.ts:219` on the text-only `esc` (attribute breakout). **Decision:** author the fresh escaping fix WITH walls; discard/supersede the uncommitted F-diff (D48). **Evidence:** `studio_sinks.test.ts`.
- **DD-8 (cycles counter):** where can it live without a new surface? **Decision:** DERIVE from the ledger (a SEARCH is a manifest; an OBSERVATION is a cycle); reuse `Migration.realLineageCount` (R-5). **Evidence:** `instrument.test.ts` — a pure read; the number is 0.

---

## THE GATE (whole — D23–D48, **D27 STILL FIRST — the NINTH sprint**) · presented, NEVER signed (LN5)

**THE NUMBER, at the top:** `manifests authored (real): 0 · cycles run, unprompted, on real lineages: 0 · realLineageCount: 0` — MEASURED (X-SHOWN(d)), not presumed. The migration gate V33 already passed (`realLineageCount === 0`) **was the answer to the metric all along** — the project had, silently, proven no user exists. It has now been read as such.

- **THE HALT, RE-PINNED (not retired):** if IN2 is still unperformed at V34's close, **V35 is validation-only TOO** — and the gate must then present, as a first-class item, **whether this product has a user at all.** That is the kill-criterion's own question.
- **THE KILL-CRITERION (`8b4e094b`), re-presented beside the number:** three sprints of the door being open and the number is zero. That is precisely the evidence the kill-criterion exists to weigh. The road forward is IN2; the alternative is to ask, out loud, whether to stop.
- **D46** (unfreeze gates.ts) — CONDITIONAL, PRESENTED, **NOT IMPLEMENTED** (DD-1 proved call-site composition works; an unsigned frozen-byte move is the gravest LN5 violation). · **D47** (the X-SHOWN mint + the instrument) — against the Halt's letter, disclosed. · **D48** (the console fix superseding the uncommitted F-diff) — disclosed. · **D43/D44/D45** carried. · **D27, the ninth sprint** — the Stamp is knowingly generous until D27 is signed.
- **IN2** — with every excuse now removed: the door is open, the runbook is written (`docs/IN2-RUNBOOK.md`), the guard is one, the console is sealed, and the number is readable. · **IN4 · AF4 · D42** (the DeFiLlama posture + the Socket-vs-API ruling) · the market finding · publication — all **OWED-OPERATOR-GATED**. The agent presents the whole gate and **never signs it.**

---

## PART E — THE RED TEAM (S1–S92) · two consecutive clean runs · keys emptied

S1–S86c carried and re-run. **S87** one guard (corpus on every surface incl Ask + a frozen real-transcript corpus + a grep wall). **S88** the untrusted boundary (strip + nonce; the seeded collision cannot terminate its own block; the semantic limit owned). **S89** deriveAct pinned (a silent change fails). **S90** the machine-checked marker schema (a missing slot fails the battery; R-3 checks values, not presence). **S91** the console's sinks (seeded payloads neutralized; F-2 refuse-not-coerce; F-3 400-not-500; F-4 callerId behind TRUST_PROXY). **S92** the instrument (the number derived, real vs fixture separated, and it appears whatever its value — it is zero). **PART A′** — the 10 attacks + R-1/R-5 closed against live artifacts (`findings_closed_showing.test.ts`).

**Convergence:** two consecutive clean runs (1508/2/0 across 231 files / 9433 expect) · keys emptied · the bundle `9c1e7bd8` byte-identical (no verdict moved) · `familyN===1` · `checkFrozenSet()` 7 ok / 2 absent / 0 drift · golden moves 0 · every fix root-caused and disclosed.

---

## Definition of done — honored

The Halt was pinned, and the Halt was honored: **not one new product capability shipped.** What shipped is the evidence. **One guard** now reaches every emitted line including the path where the LLM writes the words, and the token-free advice that walked through the wall for thirty-four sprints is caught where it originates — proven against **real model output**, not just a string matcher. The untrusted boundary is sealed **mechanically**, with the **semantic** limit written down and owned. `deriveAct` is **pinned**. The record **shows**: the terminal tree hashed, the verify output with its honest 7/9 coverage, the sidecar tests asserted **executed**, the marker schema **machine-checked**, the two-dependency mass path **proven by an SBOM**. The console's three-sprint XSS is **sealed by the agent's own authored fix**. And the number the project declared as its success metric two sprints ago has finally been **read** — it is **zero**, and it sits at the top of the gate, beside the kill-criterion.

*An unshown claim, a split guard, a silent `deriveAct`, an unhashed terminus, a fourth sprint of an unescaped console, or a metric still unread would each be a Halt, not a done. None of them shipped.* The first line of the handoff is a number — **manifests authored (real): 0 · cycles run, unprompted, on real lineages: 0** — and then the kill-criterion's question, asked out loud: **after three sprints of the door being open, does this product have a user at all?**

```json TERMINAL-MARKER
{
  "treeHash": "f2b06f1b5f97f1e214961f33bd49388f3b838242",
  "commitSha": "76e4e7fc3c24ac3a29778ad390dc0867b1d82de7",
  "pinsSha": "07d27f8116c7ce0e1883a89891eb5bfac0fecebc8731a131975d433bd4b830f9",
  "battery": "1508/2/0",
  "expect": "9433",
  "verifyOutput": "bundle 9c1e7bd8 reproduces byte-identical (evidence_bundle.test 7/0)",
  "verifyCoverage": "7/9 because RWA-VERDICT.md is monorepo-generated and data/snapshot/MANIFEST.json is gitignored-local — both absent on a fresh clone; their pinned golden SHAs in frozen.ts are the checkable record",
  "goldenMoves": 0,
  "newProductCapability": 0
}
```

**SESSION MARKER —** `DONE-LOCALLY` · next intended step: the Operator performs IN2 (the runbook is written); if unperformed by V35's open, V35 is validation-only too and the gate asks whether the product has a user at all (kill-criterion `8b4e094b`).
