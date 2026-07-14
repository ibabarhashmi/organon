# BUILDLOG — THE MOAT SPRINT (`organon` tree)

**Repo:** `ibabarhashmi/organon` · branch `staging` · continuing the UNPUSHED `3adffe34…` Probe tree (`00396a3`).
**Start battery (from Probe, VALIDATED PASS):** 1043 pass / 2 skip / 0 fail across 158 files / 1045 tests (pristine 1040/0), BOTH repos.
**Carried `PINS_SHA`:** `e6bed150…` (Probe) → this sprint re-pins to the Moat `PINS_SHA`.
**Probe status carried in:** X-PROBE RUNNING (ARMED) — READY-PENDING-OPERATOR (the invites wait only on the Operator's hands).

The moat is the per-subject, content-hashed record of what was true and when. The resource evaluation ("viem and the López de Prado / qlib Quant Canon") found exactly **four** lines the moat can get DEEPER without getting louder — this sprint builds those four and nothing else, closes every Probe finding in both repos, and presents the Operator's whole gate. **Dual-repo, byte-identical:** engineered in `organon`, ported to `organon-studio`; every gate re-proven in each; per-repo deltas are DISCs, never smoothed.

The engineering narrative, the AF/PR closures, the conscious posture updates, the D26/D27 decisions, and the itemized reconciliation live HERE (the `organon` record); `organon-studio`'s file is the port record.

---

## Phase 0 — PINS-LOCKED ✅

**Engineered.** No product code. The four deepening lines pre-fenced before a line lands:
- `script/honesty/moat-pins-build.ts` → `data/honesty/moat-pins.json` (`PINS_SHA 6aa2d0c7…`, carried Probe `e6bed150…`):
  - **(a) the capture-time dependency contract** — `viem@2.55.0` + `@shazow/whatsabi@0.26.0` (MIT ×2, exact-pinned, no caret); `batch.multicall`+`http({batch})` PROHIBITED (S55 byte-identity test); every read block-pinned; NO signing import; the capture-module allowlist (`script/capture/proxy-truth.ts` only) + grep wall; ADOPT-OR-RECORD (D26 Operator-signed; deps do NOT land until signed); the RPC-STATE mass path stays hand-rolled with RE6's flip condition in writing.
  - **(b) the PIT-honesty re-score contract** — a REAL cell = content hash + exact as-of + re-fetch instruction; `REAL-as-fetched-now`, never `REAL-as-of-collapse` a current API can't prove; unprovable → SAMPLE; the kill-criterion `8b4e094b` stays untouched.
  - **(c) the variance-audit protocol + the two D27 paths** — the audit is READ-ONLY; the i.i.d. evidence named (`rigor.py::psr` uses `(1 - g3·SR + ((g4-1)/4)·SR²)/(n-1)` — skew/kurtosis-aware but independence-assuming); the repo already ships the fix (`effective_n.py`, frozen, funding-path-only) so an amendment needs ZERO frozen-byte edits (an off-path effective-N floor, the MinTRL pattern); the amendment direction CONSERVATIVE (a net-generous fix HALTS); the caveat rendered beside the strength line; interim honest default = caveat rendered now, amendment specified + parked pending D27.
  - **(d) the trials-ledger schema** — per-trial (config + returns + metric + content hash), deterministic agglomerative clustering pre-required, implementation PARKED; the RE3 inert-deflation label; the RE4 FTO action (US 2019/0294990 A1, dated, Operator-owned).
- **PR1–PR5** pinned; **the DISC-B reconciliation** recorded (the `alpha-pins` `organon-studio` label superseded by each tree's own `34d20e7` base-identity; the Alpha `3b9f98bc…` chain intact as superseded history — U-RESUPERSEDE); **D26/D27 reserved**; **S55–S57** added to the catalog.
- `PINS.md` extended with the Moat section; a fresh `BUILDLOG-MOAT.md` per repo.

**Validated.** `moat_pins.test.ts` — 7 pass / 64 expect() calls: the pinsSha hash-locked + carrying `e6bed150`; the dependency contract exact + testable; the PIT contract present; both D27 paths pre-designed with the conservative-direction clause; the trials schema present + implementation-absent; RE3/RE4/PR1–PR5 pinned; the DISC-B supersession recorded; S55–S57; the verdict-path (7) + frozen-core (2) hash sets === live (UNCHANGED at Phase 0).

**Red-team.** A dependency contract without the batching test → the S55 clause is asserted present. A REAL-cell definition without the as-of → the PIT clause asserted. An amendment path without the conservative-direction clause → asserted. A trials schema WITH implementation → the implementation-absent clause asserted. A pins bump silently rewriting Alpha history → the `alphaChainIntact` supersession clause asserted.

**Gate — PINS-LOCKED.**

### SESSION MARKER — Phase 0
- **Terminal `PINS_SHA`:** `6aa2d0c7a23caaabe721732eb2efda2d2fbfbb79a67029f58a5b01da6c84170c` (carried Probe `e6bed150…`).
- **Battery delta:** +1 file (`moat_pins.test.ts`, +7 tests). Per-repo battery re-proven at the phase close (below).
- **Verdict-path 7-module + frozen-core 2-module hash sets:** unchanged. Scorecard differential + capability parity: unchanged (no product code touched).
- Frozen seven byte-untouched; deps still `hono`+`zod`; screens still 3.

---

## Phase 1 — FINDINGS-CLOSED ✅

**Engineered.** (PR4) the DISC-B reconciliation verified live in `moat-pins.json` — the Alpha `organon-studio` label superseded by each tree's own `34d20e7` base, the Alpha `3b9f98bc…` chain intact as superseded history. (PR5) `data/honesty/dual-repo-divergence.json` + `dual_repo_divergence.test.ts` — the standing wall: `organon` 6488 / `organon-studio` 6512 expect() calls (stable **+24** delta), both trees **0-fail**, same 1052-test/159-file count; the wall BITES if the recorded delta ≠ |a−b| (a papered delta) or a non-zero delta lacks a note (a smoothing). (RE3) the inert-deflation label rendered at `reality.ts renderStamp` on an n=1 GO/NO-GO ("The deflation is currently inert — 1 attempt counted, no multiple-testing penalty was paid") — a **render-layer** disclosure, so the verdict-path 7-module hashes stay frozen; positive-controlled (absent when the render degrades a SAMPLE payload). (RE4) the FTO action (US 2019/0294990 A1, dated 2026-07-11, Operator-owned) pinned. (PR2) `moat-countersign-package.json` — D23/D24/D25 prepared + D26/D27 reserved, all `operatorSigned=false`, presented whole at Phase 5.

**Validated.** `findings_closed_probe.test.ts` (5) + `dual_repo_divergence.test.ts` (3) — 8 pass / 32 expect(). Verdict-path 7 hashes UNCHANGED (reality.ts is render-layer). S36 content golden byte-identical (renderStamp is not in the golden). Full battery **1058 pass / 2 skip / 0 fail across 161 files**.

**Red-team.** A seeded expect() smoothing (delta claimed 0 while counts differ) → the delta-equality assertion fails. The RE3 text in pins but absent at the n=1 render → the render assertion fails. A countersign package missing a deviation, or one signed by the agent → fails.

**Gate — FINDINGS-CLOSED.**

### SESSION MARKER — Phase 1
- **Terminal `PINS_SHA`:** `6aa2d0c7…` (unchanged — no pins rebuild this phase).
- **Battery delta:** +2 files (`dual_repo_divergence`, `findings_closed_probe`, +8 tests) → 1058/2/0 × 161 files.
- **Per-repo expect():** organon 6520 · organon-studio 6544 (post-Phase-1; the +24 delta holds). The committed `dual-repo-divergence.json` records the Phase-0 dual-measured baseline (refreshed to terminal counts at Phase 5).
- **Ported:** `organon@c13b0d6` → `organon-studio` via `git am`; tree `50510e6d…` identical.
- Verdict-path 7 + frozen-core 2 hashes unchanged; scorecard differential + parity unchanged; deps `hono`+`zod`; screens 3.

---

## Phase 2 — CAPTURE-TRUTH (RE1/D26) ✅

**Engineered.** `script/capture/proxy-truth.ts` (capture-time-only, the sole allowlisted viem/whatsabi importer, runs under node/tsx) RUN against a pinned mainnet adversarial set at a pinned block → `data/honesty/capture-truth.json`:

| Subject | Pattern | Naive EIP-1967 | viem+whatsabi | Verdict |
|---|---|---|---|---|
| aave-v3 Pool | EIP-1967 transparent | `0x728a…` | `0x728a…` | **MATCH** (naive sufficient) |
| USDC | custom OZ proxy, non-1967 slot | **NONE** | `0x4350…` | **CORRECTNESS GAP** |
| Idle vault clone | EIP-1167 (impl in bytecode) | **NONE** | `0x9c13…` | **CORRECTNESS GAP** |
| Beanstalk | EIP-2535 Diamond | **NONE** | diamond detected (loupe) | **CORRECTNESS GAP** |
| USDT | non-proxy control | NONE | (self) | AGREE |
| Seaport 1.6 | non-proxy, nested-tuple ABI | NONE | (self) + 18 selectors | AGREE |

**Decision: ADOPT-RECOMMENDED** — 3 demonstrated correctness gaps the naive hand-rolled EIP-1967 reader missed and viem+whatsabi resolved/detected; the evaluation's fragility is REAL and measured (not adopted on taste). **Capture-time only; D26 UNSIGNED** → the deps do NOT land (`package.json` stays `hono`+`zod`; the measurement + recommendation are recorded, the trees stay allowlist-clean). **Recorded adoption COST:** viem@2.55.0 does NOT run under Bun 1.3.11 (a transitive `@noble/hashes@1.8.0` self-referential subpath import fails Bun's cache resolver) — the capture step runs under **node**; the mass path (hono+zod, bun) is unaffected. The RPC-STATE mass path stays hand-rolled (RE6 flip unchanged); no contract tier changed (the curated shelf's aave/compound are standard 1967, already correctly resolved — no re-capture triggered).

**Validated.** `capture_truth.test.ts` (5) — 24 expect(): S55 batching OFF-vs-ON **byte-identical** (`shaOff === shaOn`); block-pinned + exact versions (viem 2.55.0 / whatsabi 0.26.0); the **allowlist grep** — viem/whatsabi imported by EXACTLY `script/capture/proxy-truth.ts`, NO mass/verdict-path import, `package.json` still `{hono, zod}`; **no signing import** (the import lines carry no wallet/account symbol); **adopt-or-record evidence-match** (ADOPT ⟺ ≥1 gap, each gap's `naiveImpl` NULL). D26 in the ledger + countersign package, `operatorSigned=false`.

**Red-team.** Batching flipped on → the byte-identity assertion would fail. A viem import seeded in `reality.ts` → the allowlist grep fails (importers ≠ `[proxy-truth.ts]`). An "ADOPT" with zero gaps → the evidence-match fails. A tier changed without disclosure → none triggered (asserted aave MATCH, no over-claim).

**Gate — CAPTURE-DECIDED.**

### SESSION MARKER — Phase 2
- **Terminal `PINS_SHA`:** `6aa2d0c7…` (unchanged — the capture-time contract was pinned at Phase 0; this phase RAN it).
- **Battery delta:** +1 file (`capture_truth.test.ts`, +5 tests) → 1063/2/0 × 162 files. Per-repo expect(): organon 6548 (studio +24).
- **Decision quoted:** ADOPT-RECOMMENDED (3 gaps), capture-time-only, D26 unsigned, deps unchanged (`hono`+`zod`), node-runtime cost recorded.
- **Ported:** `organon@db871e1` → `organon-studio`; tree `086a75da…` identical.
- Verdict-path 7 + frozen-core 2 hashes unchanged; scorecard differential + parity unchanged; screens 3.

---

## Phase 3 — REAL-RESCORE (PR3/S56) ✅

**Engineered.** `script/honesty/rescore-real.ts` (bun-native, plain DeFiLlama HTTP — no viem) re-fetches what is GENUINELY fetchable for the three collapse subjects, content-hashes a small committed capture, and runs the EXISTING engine on the REAL current facts → `data/postmortems/{stream,elixir,resolv}-real.json`:

| Subject | Peak TVL → now | Current peg | REAL cells | Engine verdict (REAL facts) | REAL adverse flags |
|---|---|---|---|---|---|
| Stream Finance | $203.8M → **$0** (−100%) | no current price → SAMPLE | 2 | UNVERIFIED | (30d-window flat-at-dead) |
| Elixir | $342.5M → **$12** (−100%) | no current price → SAMPLE | 2 | UNVERIFIED | (30d-window flat-at-dead) |
| Resolv | $684.7M → **$14M** (−98%) | **USR $0.15** (conf 0.99) → REAL | 3 | UNVERIFIED | **peg: fail · tvl-trend: caution** |

**The PIT fence, honored:** the REAL cells are `REAL-AS-FETCHED-NOW` (the current/aftermath state), NEVER `REAL-AS-OF-COLLAPSE` (a current API can't prove point-in-time fidelity). The all-SAMPLE collapse RECONSTRUCTION stays (`{subject}.json`, "what we'd have flagged at the collapse"); this ADDS a REAL current-state layer ("what the engine renders on the REAL state we fetched + content-hashed"). Cells not fetchable STAY SAMPLE (stream/elixir have no current price → the peg cell is SAMPLE, labeled). The engine headlines stay UNVERIFIED honestly (the collapse-time YIELD mix is not re-fetchable for a delisted pool, so the flagship yield-reality axis is honestly unverified) — but Resolv's current $0.15 makes the peg axis **FAIL on REAL data**, and the damning REAL cell is the peak→now drawdown (−100% / −98%), content-hashed + re-fetchable. `/postmortems` surfaces the REAL layer cell-by-cell.

**Validated.** `postmortem_real.test.ts` (9) — 48 expect(): content-hash integrity (every capture re-hashes to its `contentSha`); a tamper control (a $1 mutation → a different hash → caught); engine re-verification (`Scorecard.score(realFacts)` reproduces the verdict + flags); Resolv's REAL peg fail; the PIT guard (NO cell claims as-of-collapse; a seeded dishonest cell caught); SAMPLE where not fetchable; the **kill-criterion `8b4e094b` UNTOUCHED** while the artifact improved; the census before→after. Census: **all-SAMPLE (0 REAL) → 2–3 REAL cells per subject.**

**Red-team.** A REAL label without a committed hash → the integrity assertion fails. An as-of implying PIT fidelity ("as-of-collapse" on a current fetch) → the PIT guard fails. A tampered value → the recompute/hash fails. The artifact's improvement nudging the kill-criterion → the `8b4e094b` immutability check fails.

**Gate — ARTIFACT-EARNED.**

### SESSION MARKER — Phase 3
- **Terminal `PINS_SHA`:** `6aa2d0c7…` (unchanged).
- **Battery delta:** +1 file (`postmortem_real.test.ts`, +9 tests) → 1072/2/0 × 163 files. Per-repo expect(): organon 6596 (studio +24).
- **REAL/SAMPLE census:** before all-SAMPLE (0 REAL cells) → after Stream 2 · Elixir 2 · Resolv 3 REAL cells; the collapse reconstruction stays SAMPLE; kill-criterion `8b4e094b` untouched.
- **Ported:** `organon@583511a` → `organon-studio`; tree `e8e58282…` identical.
- Verdict-path 7 + frozen-core 2 hashes unchanged; scorecard differential + parity unchanged; screens 3.

---

## Phase 4 — VARIANCE-HONEST (RE2/D27/S57) ✅

**Engineered (READ-ONLY audit).** `script/honesty/stamp-variance-audit.ts` (`git diff -- src/` empty through the audit — the Lineage D20 discipline) → `data/honesty/stamp-variance-audit.json`:
- **The CODE fact (hermetic):** `rigor.py::psr` (FROZEN, `5fc0eaac…`) computes the Sharpe variance as `(1 − g3·SR + ((g4−1)/4)·SR²)/(n−1)` — skew/kurtosis-aware but treating the `n` observations as **INDEPENDENT** (the √(n−1) factor). The DSR inherits it. It does **not** deflate `n` for serial autocorrelation.
- **The DATA fact (measured):** representative REAL stablecoin-lending yield series (the Stamp's exact input kind: `(apyBase+apyReward)/100/365`), run through the **ALREADY-FROZEN `effective_n.py`** (funding-path-only today, never the Stamp's DSR):

| Real series | N | τ_int | effective N | shrink | naive t → deflated t |
|---|---|---|---|---|---|
| aave-v3 USDT | 1244 | 26.9 | 46 | 27× | 39.9 → 28.9 |
| compound-v3 USDC | 1370 | 124.3 | 11 | 124× | 59.5 → 8.7 |
| aave-v3 DAI | 1551 | 165.3 | 9 | 165× | 36.2 → 4.7 |

- **The finding: CONFIRMED.** The i.i.d. variance is grossly understated (a ~27–165× effective-N shrink; median τ_int ~124) → the DSR is optimistic → the Stamp's GO bar is far too easy. **Direction: GENEROUS** — the exact direction the firewall exists to fear.

**The D27 decision (Operator-owned; interim honest default).** The **CAVEAT is rendered NOW** at the Stamp render (`reality.ts renderStamp` — a render-layer disclosure beside the significance: "Read the significance as an optimistic ceiling, not a floor… DeFi yields are autocorrelated…"). Disclosure of a KNOWN optimism needs no signature (the RE3 pattern); silence would be the dishonest act. The **AMENDMENT** (a deterministic effective-N floor using the frozen `effective_n.py`: `n_eff = N/τ_int`; `n_eff < floor → INSUFFICIENT`; ZERO frozen-byte edits, direction CONSERVATIVE, per-pool census) is **specified in `moat-pins` + PARKED pending the Operator's D27 signature**. **No verdict moved this session** (an agent must not perform a conscious math amendment on the frozen core's behalf). D27 in the ledger + countersign package, `operatorSigned=false`.

**Validated.** `variance_audit.test.ts` (6) — 31 expect(): the code fact hermetically re-verifiable (rigor.py::psr uses √(n−1)); the finding CONFIRMED + direction GENEROUS + measured τ_int > 1 (never hedged); read-only; the caveat rendered at an n=1 GO Stamp; the amendment specified + PARKED with the conservative-direction wall; the **frozen-core 2 + verdict-path 7 hashes BYTE-UNCHANGED**. Full battery **1078/2/0 across 164 files**; scorecard differential byte-identical (the Stamp is off the scorecard path).

**Red-team.** A "fix" that keeps every GO → the CONSERVATIVE-direction clause bites (a net-generous outcome HALTS). An amendment without the Operator's signature → not activated (D27 unsigned; the frozen math untouched, asserted). An audit that hedged against its own evidence → the CONFIRMED/GENEROUS assertion fails (the D20 precedent).

**Gate — VARIANCE-DECIDED.**

### SESSION MARKER — Phase 4
- **Terminal `PINS_SHA`:** `6aa2d0c7…` (unchanged — no pins rebuild; the audit protocol was pinned at Phase 0).
- **Battery delta:** +1 file (`variance_audit.test.ts`, +6 tests) → 1078/2/0 × 164 files. Per-repo expect(): organon 6631 (studio +24).
- **Finding quoted:** i.i.d. CONFIRMED; τ_int ~27–165 (median ~124); direction GENEROUS. **D27 decision:** caveat rendered (interim), effective-N-floor amendment specified + PARKED, `operatorSigned=false`. **Verdict-change census: ZERO** (no verdict moved — the amendment awaits the signature).
- **Ported:** `organon@d8ce9b4` → `organon-studio`; tree `c6eadf57…` identical.
- Frozen-core 2 (rigor.py, effective_n.py) + verdict-path 7 hashes byte-unchanged; scorecard differential + parity unchanged; screens 3.

---

## Phase 5 — THE OPERATOR GATE + PART E (RED-TEAM) ✅

**The whole Operator gate, presented (`data/honesty/moat-prereqs.json`).** IN2 (the real-screen session — now with the RE3 inert label + the D27 caveat + the REAL-layer /postmortems) · IN4 (the browser/AT a11y pass) · AF4 (the first live paid-key parity diff) · the **D23–D27 countersigns** (`moat-countersign-package.json`, all `operatorSigned=false`) · the **push decision** (HELD — unpushed, publication Operator-gated). All **OWED-OPERATOR-GATED, never simulated** — an agent can DRIVE the flows and PREPARE the deviations but cannot sit the Operator's session, hold the Operator's paid keys, or sign as the Operator (LN5 / A′#11).

**PART E — the red team (`moat-redteam.ts` → `moat-redteam.json`).** 11 in-process hostile probes on the REAL Moat surfaces, catalog **S1–S57 CLEAN** (S1–S54 carried first-class + re-run; S55–S57 new):
- **S55** capture-time determinism — batching OFF-vs-ON byte-identical; the allowlist grep (viem imported by EXACTLY `proxy-truth.ts`); adopt-or-record evidence-matched (3 gaps).
- **S56** REAL-cell integrity — every REAL capture re-hashes; a $1 tamper caught; no as-of-collapse claim; kill-criterion `8b4e094b` untouched.
- **S57** variance honesty — the audit CONFIRMED + GENEROUS (never hedged); the caveat rendered; the frozen-core + verdict-path hashes byte-unchanged; the amendment conservative-walled + parked.

**Fix-on-the-go (the red team bit).** The first run FAILED S55: the viem-allowlist grep matched files that merely *mention* the pattern in a comment/regex (the walls themselves) — not just importers. Root-caused + fixed in BOTH `moat-redteam.ts` and `capture_truth.test.ts`: **comment-stripped, import-anchored** (only a real `import … from "viem"` statement counts). Re-run → S55 clean; `capture_truth` 5/5.

**Evidence + convergence.** Evidence bundle regenerated — **bundle sha `9c1e7bd8…` byte-identical** (the deterministic core unchanged → no verdict moved); `battery-summary`/`claims` to 1083; V-LIVE refreshed (defillama 200, gecko 200, hyperliquid 200; unlock 402 scope-cut; gemini 403 no-key). `./organon.sh verify` reproduces the bundle.

**Gate — RED-TEAM-CLEAN + GATE-PRESENTED (READY-PENDING-OPERATOR).**

---

## TERMINAL MARKER — THE MOAT SPRINT

- **Verdict: MOAT DEEPENED — READY-PENDING-OPERATOR.** The moat resolves deeper (capture-time viem+whatsabi proven on 3 real proxy patterns → **D26 ADOPT-RECOMMENDED**, capture-time-only, deps not landed until signed), the artifact earned REAL cells (Stream/Elixir/Resolv aftermath, content-hashed, PIT-honest), the Stamp's variance no longer flatters silently (**D27** i.i.d. caveat rendered; the conservative effective-N-floor amendment specified + parked), and the trials-ledger schema is ready before trials exist. The invites go out the moment IN2/IN4/AF4 are discharged + D23–D27 signed + the push authorized — against a goalpost (`8b4e094b`) set before the throw.
- **Terminal `PINS_SHA`:** `6aa2d0c7a23caaabe721732eb2efda2d2fbfbb79a67029f58a5b01da6c84170c` (carried Probe `e6bed150…`).
- **Battery:** **1083 pass / 2 skip / 0 fail across 165 files / 1085 tests**, TWO consecutive clean runs BOTH repos (+40 tests / +7 files over the Probe 1043/158). Skip set {ask_live, eval_live}.
- **Per-repo expect() (PR5):** organon **6723** · organon-studio **6747** — a **+24** delta, stable Phase-0→terminal, documented never smoothed; both trees 0-fail, same 1085-test/165-file count.
- **Frozen invariants:** the frozen seven byte-untouched; the verdict-path 7 + frozen-core 2 (rigor.py, effective_n.py) hash sets byte-unchanged (the RE3/D27 caveats are render-layer); the scorecard differential `70c7912f…` + funding NO-GO `0a63151b…` byte-identical (FIFTEEN sprints); capability parity `cc7e5e5a` hermetic; kill-criterion `8b4e094b` untouched; evidence bundle `9c1e7bd8…`.
- **Deviations D1–D27** (D26 capture-time dependency ADOPT-RECOMMENDED, D27 variance caveat-now/amendment-parked; both `operatorSigned=false`, alongside D23–D25). **S1–S57 RED-TEAM-CLEAN.**
- **Mass path:** `hono`+`zod` (viem/whatsabi capture-time-only, allowlisted, grep-walled). **Screens:** the conscious 3. **Parked:** proposer / ONC-PBO-CSCV / reports-API / execution / archive-node / calibration / meta-labeling — the probe decides what unparks next.
- **Commits (UNPUSHED — Operator-gated):** `organon` staging · `organon-studio` staging · byte-identical trees at every phase.

> **Final:** the pristine gate commit bumps the terminal tree to `238dc3fa476d38eed5e645c24d9d5924ca1d4199`; organon HEAD `61381c1`, organon-studio HEAD `6660215` — byte-identical. Both repos: two+ consecutive clean runs (1083/2/0), pristine GREEN (1080/0), UNPUSHED.
