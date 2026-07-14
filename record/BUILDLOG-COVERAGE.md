# BUILDLOG — THE COVERAGE SPRINT (X-COVERAGE + X-CORRELATE)

> Working doc (gitignored under `sprint/`). The DURABLE record is `data/honesty/coverage-pins.json` (hash-locked) + the
> committed tests. Kill the cold-start ("is my pool covered?" → yes) without bending a law — the three-source stack
> behind an honest license posture, the any-pool lookup, the two-tier provenance label, the deterministic correlation
> substrate with the deflation PROVABLY inert, every Ground-Truth finding closed, the whole gate D23–D33 (D27 first).

**Header (start state):** continues the Redesign sprint (battery **1176/2-skip/0 across 179 files**, `PINS_SHA 6b285eba…`
carrying GroundTruth `3d0ef3bb…`), both repos, UNPUSHED at start (redesign since pushed to terminal/v0.2 + studio/sandbox).
The advisor's cold-start line — *"very limited DeFi data… a user checks their pool, it's not covered, they leave
forever"* — is the spine's evidence. The generosity line: *"The Stamp is knowingly generous until D27 is signed."*
Deviations D1–D31 with **D23–D31 unsigned** (D27 first); this sprint reserves **D32/D33** (also unsigned — LN5).

---

## Phase 0 — PINS-LOCKED ✅
- `script/honesty/coverage-pins.ts` → `data/honesty/coverage-pins.json`. **COVERAGE PINS_SHA `cc08a77b…`** carried Redesign `6b285eba…`.
- Pinned VERBATIM: the DeFiLlama non-commercial ToS + USD-100k clause; the standing existing-use exposure; the three branches α/β/γ (β names the Pro-vs-API purchase trap); the non-advisory diversification wording; the K-activation gate (BOTH trigger and pen); the Pyth refusal DATED (July 31 2026). Pinned specs: the 'covered' definition (SAMPLE-only excluded), the two-tier label, the Chainlink read (staleness + L2 sequencer), vaults.fyi BYOK, the correlate contract (agglomerative-not-k-means, merge threshold 0.5, min-overlap 30, the deflation-inert wall). GT1–GT5; D32/D33 reserved Operator-signed=false; S1–S66.
- Wall `test/organon/coverage_pins.test.ts` → 8/0 (self-consistent + carried; the verbatim + covered-definition + activation-gate + inert asserts bite). Wired into `organon-studio-test.sh`.
- **SESSION MARKER:** PINS-LOCKED · PINS_SHA `cc08a77b…` · organon +1 file (coverage_pins) · battery target 1177 (post-phase). Studio port pending (batched at sprint close).

## Phase 1 — FINDINGS-CLOSED (GT1–GT5) ✅
GT1 governance-wording wall (aave→upgradeable NEVER "immutable/fixed"; genuinely-immutable→immutable line, positive-controlled — `findings_closed_coverage.test.ts`). GT2 the voc_proposer scipy sidecar asterisk DIES (`SIDECAR_MS=120_000` per-test on every sidecar test; 8/0 on the default budget). GT3 IN2 gains compound's impl-truth item. GT4 D30 arms-for-future note. GT5 invite package LED by the PAID Network capture. `coverage-countersign-package.json` (D23–D33, D27 first; supersedes GroundTruth's — U-RESUPERSEDE). D32/D33 reserved Operator-signed=false (LN5).

## Phase 2 — BREADTH-HONEST (S64) ✅
`src/dataplane/providers/llama-yields.ts` (universe + lookup + census + the pinned 'covered' definition) + `CoveragePosture` (the VERBATIM non-commercial license posture, three branches α/β/γ; branch γ degrades a REAL DeFiLlama number to SAMPLE in a served commercial context). The any-pool LOOKUP wired into `/check/:key` (a covered pool NOT on the shelf → live Reality Check, per-axis honest degrade; garbage id → honest 404). vaults.fyi BYOK descriptor (absent → byte-exact). **Coverage census REAL: 15497 universe / 15490 covered** (`coverage-census.json`, content-hashed). Walls `breadth.test.ts` (6) + `lookup.test.ts` (5). Cold-start fix proven LIVE (lido stETH looked up).

## Phase 3 — PRICE-REAL★ (S65) ✅
`src/dataplane/providers/chainlink.ts` (pinned feed registry; block-pinned `getRoundData` → REAL★; the staleness bound + the L2 Sequencer-Uptime check BITE; feed-absent/stale → degrade). `src/dataplane/tier.ts` — the two-tier label (REAL★ block-pinned vs REAL-at-timestamp aggregator; `isRealStarLegit` refuses an aggregator wearing REAL★) + the conscious re-label census (`provenance-tier-census.json`, 8 sources: 4 REAL★ / 4 REAL-at-timestamp, disclosed). The tier renders beside the stamp on the lookup (S36 byte-identical — the all-SAMPLE golden gates it off). Walls `chainlink.test.ts` (5) + `provenance_tier.test.ts` (4).

## Phase 4 — SUBSTRATE-INERT (S66) ✅
`src/analytics/correlate.ts` (pure, dependency-free): Pearson on log-delta series · agglomerative average-linkage on 1−ρ · pinned merge threshold 0.5 · lexicographic tie-break · canonical ordering — **permutation-invariant byte-identical clusters**; the minimum-overlap floor (30) → INSUFFICIENT. The ONE non-advisory diversification fact wired into COMPARE (`tools.ts::compareMany`, info/context, surfaced only on sufficient overlap). **THE DEFLATION STAYS INERT** — the Stamp path imports no substrate, the comment-stripped grep finds no Math.random/k-means, the K-activation door is REFUSED without BOTH the trigger AND D33 (`stamp_inert.test.ts`). ADOPT-ratified in the v14 chain (`ratify-correlate.ts`). Walls `correlate.test.ts` (5) + `stamp_inert.test.ts` (4).

## Phase 5 — THE OPERATOR GATE + PART E (S1–S66) ✅
The gate PRESENTED, never signed (LN5) — `coverage-countersign-package.json` D23–D33, D27 FIRST; IN2/IN4/AF4 + the push OWED-OPERATOR-GATED. PART E: `coverage-redteam.json` + `coverage_redteam.test.ts` — the full S1–S66 catalog (S64–S66 new, each broken-on-purpose + biting); findings-fixed-on-the-go W-CV01–04 + GT2. **CONVERGED: two clean runs BOTH repos.**

---

## TERMINAL MARKER
- **COVERAGE PINS_SHA `cc08a77b…`** carried Redesign `6b285eba…` (which carried GroundTruth `3d0ef3bb…`).
- **Battery 1225 pass / 2 skip / 0 fail across 188 files / 1227 tests**, two clean runs (was 1176/179 at redesign; +9 files/+49 tests = the coverage walls + the GT2/census fixes). **VERIFY GREEN** — evidence bundle `9c1e7bd8…` byte-identical, frozen-seven git-clean, verdict differential (lending `70c7912f` / funding `0a63151b`) byte-stable — **NO verdict moved**. Kill-criterion `8b4e094b` untouched. Mass path `hono`+`zod`. Screens still 3 (the lookup is a path).
- Fixed on the go: W-CV01 (the redesign's latent claims/battery-summary count mismatch — regenerated, bundle byte-identical), W-CV02 (DataCapability namespace), W-CV03 (stressCatalog object shape), W-CV04 (the k-means grep comment false-positive), W-CV05 (the ratification table is v14 not v11; the /check 404 path; the sidecar-flake battery timeout 30s→120s to match the runner's process budget).
- **VERDICT: COVERAGE DELIVERED — READY-PENDING-OPERATOR.** The cold-start is killed (any covered pool answerable, per-axis honest), every number names which kind of true it is (REAL★ vs REAL-at-timestamp), the familyN substrate is built + PROVABLY inert, every GT closed. The whole eleven-signature gate (D23–D33, D27 first) awaits the Operator's hands (IN2/IN4/AF4 + the push — never simulated, LN5).
