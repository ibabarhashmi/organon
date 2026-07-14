# BUILDLOG — THE PRECISION SPRINT (`organon` tree)

**Repo:** `ibabarhashmi/organon` · branch `staging` · continuing the UNPUSHED Moat tree (`61381c1`, terminal tree `238dc3fa…`).
**Carried `PINS_SHA`:** `6aa2d0c7…` (Moat) → **Phase 0 `PINS_SHA d2fa4cdc…`**.
**Battery start:** 1083 pass / 2 skip / 0 fail across 165 files / 1085 tests (pristine 1080/0), BOTH repos.

## The spine (the Operator's own live COMPARE)
An "aave USDC vs compound USDC" comparison rendered **39 contract findings**, nearly all the fingerprints of the most-audited
proxy pattern in DeFi (OZ transparent/UUPS — "upgrade entrypoint without an auth signal", "no storage gap", delegatecall),
each honestly fenced `[info/context]`, none moving a verdict — **the SAFE way to be imprecise, but not the USEFUL way.**
The screen reads the **proxy shell, not the resolved implementation**; "without an auth signal" = the screen's blindness (a
false positive by construction); 39 lines of structural noise train the depositor to ignore the axis — **alarm fatigue is the
product defect** — and the axis has **no discriminative power** (a battle-tested aave pool and a rugged fork render alike).

## X-PRECISION — four moves, all capture-time, no paid provider, content-hashed into the moat
(a) analyze the RESOLVED implementation not the proxy · (b) resolve WHO HOLDS THE KEY (the 1967 admin slot, conservative by
law) · (c) collapse the canonical noise into ONE honest governance line (a whitelist, not a compressor) · (d) discriminate or
stay context. Plus D26 forced, every Moat finding closed (MT1–MT5), the whole Operator gate, S1–S60.

## Phase 0 — PINS-LOCKED ✅ (organon)
- `script/honesty/precision-pins-build.ts` → `data/honesty/precision-pins.json`. **PINS_SHA `d2fa4cdc…`** carried `6aa2d0c7…`.
- Pinned: X-PRECISION's four clauses; the implementation-analysis rule; the **1967 slots verbatim** (impl `0x3608…bbc`, admin
  `0xb531…103`, beacon) + the **one-pinned-block-per-subject** rule; the **conservative classifier** (EOA/SAFE/TIMELOCK/
  UNRESOLVED) with **THE anti-cry-wolf datum, verified on-chain: a ZERO admin slot is UNRESOLVED, NEVER EOA** (aave-v3 + spark
  hold the admin immutably in bytecode, so `0xb531…` reads `0x0`; a naive slot=0→EOA read would fabricate an alarm on a
  blue-chip — the exact defect this sprint kills) + the owner()-hop; the **collapse whitelist** (fold = canonicalMatch AND
  adminGated(SAFE|TIMELOCK) AND fingerprint-match; everything else survives) + the **three-form grammar**; the **discrimination
  fixtures WITH rationale** (compound-v3 → TIMELOCK gated · aave-v3 → UNRESOLVED honest · a SYNTHETIC EOA control · the
  **real-world census: 0 of ~50 mainnet proxies hold an EOA admin** (blue-chips AND smaller/older protocols) → the damning class is
  EXTINCT among live survivors (pools that gave a single key the upgrade path rugged and are dead — archive-height only); the clean/
  context side is REAL (compound TIMELOCK · Ribbon SAFE · aave UNRESOLVED), the damning side a labeled SYNTHETIC control; the archive-
  height real-rug an HONEST GAP, never simulated); the **cross-check rule** (Etherscan/Blockscout OPTIONAL, ABSENT-honest, disagreements surfaced);
  **both D26 branches** pre-designed + **D26 decision = branch B built** (zero-dep, no signature) with D26 OWED-OPERATOR-GATED;
  the **D29 promotion spec** (EOA-admin → `bounding`, conservative degrade-only, PARKED); MT1–MT5 (MT1 the top countersign);
  D28/D29 reserved; S58–S60; verdict-path 7 + frozen-core 2 hashes === live AND === Moat (no drift).
- `test/organon/precision_pins.test.ts` — **9 pass / 80 expect() (organon)**; registered in `organon-studio-test.sh`.
- Real on-chain probes (the tool's own free rotation, publicnode): aave admin slot `0x0` (impl `0x728a…`) → UNRESOLVED;
  compound admin `0x1ec6…` → owner-hop → **TIMELOCK** (the Compound Timelock `0x6d90…`); sparklend/fluid → UNRESOLVED.

## Live RPC reachable this session
`https://ethereum.publicnode.com` (+ the rotation) served block-pinned reads at head ~25507800 — REAL captures are earned
this sprint (block-pinned, content-hashed), not degraded to fixtures.

## Phase 1 — FINDINGS-CLOSED + D26-DECIDED ✅ (organon)
- **MT3** — the two post-mortem layers labeled DISTINCT in the render: `/postmortems` now returns a `layers` descriptor +
  per-subject `reconstruction`/`aftermath` labels ("RECONSTRUCTION (all-SAMPLE): what we'd have flagged at the collapse" vs
  "AFTERMATH (REAL-as-fetched): what the engine renders on real fetched current state") + a `distinctness` note; the ALPHA.md
  pitch line mirrors it verbatim and **explicitly disavows** the blurred "we'd have caught it on real data" phrasing.
- **MT2/D26** — the resolver decision recorded (`precision-countersign-package.json` D26) with the **Bun cost folded**:
  BRANCH B BUILT (zero-dep, no signature, proven on the shelf); branch A available on the Operator's D26 signature.
- **MT1/MT4** — `data/honesty/precision-countersign-package.json`: the whole gate assembled for one sitting, **D27 (the
  variance amendment) FIRST**; IN2 (now incl. the governance line) · IN4 · AF4 · the push — OWED-OPERATOR-GATED, never simulated.
- **MT5** — the FTO action (US 2019/0294990 A1) re-confirmed + **re-dated 2026-07-11**; implementation stays PARKED.
- **D28** (precision scope) + **D29** (EOA→bounding promotion, PARKED) appended to `deviations.json` → **D1–D29**, both
  `operatorSigned=false`.
- `test/organon/findings_closed_moat.test.ts` — **6 pass / 45 expect() (organon)**; registered.
- **PR5 (clean baseline):** organon **6803** / studio **6827** expect() = **+24** (the stable Moat delta; the earlier +29 was
  studio working-tree runtime cruft in provenance.jsonl/cadence.json, reverted to committed — a working-tree DISC, not a real one).

## Phase 2 — RESOLVER-TRUE ✅ (organon)
- **Branch B resolver** (`script/capture/governance.ts`, zero-dep, Bun-native, over the tool's OWN free RPC rotation
  `PlaneRpcState`) + the **pure logic** (`src/contract/governance.ts`: the conservative `classifyAdmin`, the canonical-collapse
  `collapse` whitelist, the `governanceLine` grammar — NO viem/whatsabi, NO scored-module import).
- **RAN LIVE** at pinned block **25507932** → `data/honesty/governance/{subject}.json` (content-hashed into the moat):
  - **compound-v3-usdc → TIMELOCK** (admin `0x1ec6…` → owner-hop → the Compound Timelock `0x6d90…`; `ownerIsTimelock=true`).
  - **aave-v3-pool → UNRESOLVED** (admin slot `0x0`, impl resolves `0x83d4…`→ the anti-cry-wolf rule: a ZERO slot is UNRESOLVED, never EOA).
  - sparklend/fluid/curve → UNRESOLVED. Census: **0 EOA / 1 TIMELOCK / 4 UNRESOLVED** (`census.json`).
- **Cross-checks** OPTIONAL + ABSENT-honest (no `ETHERSCAN_API_KEY` → `crossCheck.etherscan="ABSENT"`, `agrees=null`); the full
  pass is keyless-green; a disagreement would be SURFACED, never arbitrated.
- `test/organon/resolver.test.ts` (10) + `test/organon/governance_capture.test.ts` (6) — **15 pass / 76 expect() (organon)**;
  the S58 collapse control (ungated upgrade + EOA → nothing folds, survives) + the S59 classifier controls (Safe-lookalike →
  UNRESOLVED; zero-slot → UNRESOLVED) + the grep wall (no viem, `package.json` = `{hono, zod}`). Registered.

## Phase 3 — SCREEN-ON-TRUTH ✅ (organon)
- **The governance line LEADS the contract drawer** (`src/studio/reality.ts`, render-layer; a `governance` param loaded by the
  route — a call site that passes nothing gets NO line, so `governance===null` is BYTE-IDENTICAL to the pre-Precision render →
  **S36 content golden UNCHANGED**, verified). The route (`serve-reality.ts /check/:key`) loads the bundle + passes it.
- **The collapse whitelist** (strengthened): fold = canonicalMatch AND adminGated(SAFE|TIMELOCK) AND (canonical phrase OR the
  finding's `contract` ∈ the pinned canonical OZ proxy/library set). A business-logic finding (on a business contract) SURVIVES.
- **Re-point at the resolved implementation** — ATTEMPTED for real (`script/capture/impl-findings.ts`, forge 1.5.1 + keyless
  Sourcify): both impls are Sourcify-verified (aave `match`, compound `exact_match`) but **did not build under our pipeline**
  (large multi-file contracts) → recorded **UNVERIFIED** (the honest A′#8 path; the governance line renders regardless). The
  mechanism exists + is proven via the S58 synthetic verified-impl bundle.
- **The alarm-fatigue census** (`data/honesty/governance/alarm-census.json`, an OUTCOME not a target — A′#9):
  **compound-v3 39 → 0 (collapsed, TIMELOCK-gated)** · **aave-v3 27 → 27 (conservative — UNRESOLVED)**.
- **HONEST DIVERGENCE from the blueprint's illustrative "aave 27→1":** aave's admin is genuinely UNRESOLVED (immutable off-slot,
  verified on-chain), so the CONSERVATIVE collapse (folds only a *resolved gated* admin — X-PRECISION b) does NOT fire for aave —
  it renders the caution line + the 27 proxy-shell findings (drawer-tucked, honestly labeled "not resolved-gated, nothing
  collapsed"). Only compound collapses (TIMELOCK). Reality is followed over the blueprint's assumption that aave resolves gated.
  The alarm-fatigue fix still lands for aave: the governance line LEADS (the depositor reads WHO HOLDS THE KEY first).
- `test/organon/screen_truth.test.ts` — **S58 (the gravest wall): a genuinely-ungated `upgradeTo` on a business contract + EOA
  admin SURVIVES the collapse AND renders the damning line** · compound collapses · a business reentrancy survives even on a gated
  proxy (whitelist not compressor) · the governance line renders on UNVERIFIED-source aave · **NO verdict moves** (the verdict pill
  byte-identical with/without the bundle). 7 tests. Registered.

## Phase 4 — DISCRIMINATE-OR-STAY-CONTEXT ✅ (organon)
- **The discrimination fixture sets** (pinned WITH rationale — A′#5): KNOWN-CLEAN = compound-v3 (TIMELOCK, real) + aave-v3
  (UNRESOLVED, real, the honest "we don't guess" exemplar); KNOWN-RUGGED = a SYNTHETIC EOA-admin + genuinely-ungated-upgrade
  fixture (`data/honesty/governance/fixtures/synthetic-eoa-rug.json`, `provenance=SYNTHETIC-FIXTURE`, `synthetic=true`, NEVER
  claimed REAL). Grounded in the real-world census: the live-survivor EOA-admin class is EXTINCT (0 of ~50), so the damning
  fixture is necessarily synthetic — separation rests on the admin fact, not a cherry metric.
- **The S60 wall** (`test/organon/discrimination.test.ts`): three-way separation on ALL THREE of governance class (TIMELOCK vs
  UNRESOLVED vs EOA) + collapse behavior (compound collapses to 0; aave/rug collapse nothing) + grammar form (gated vs caution vs
  damning); the tier RANK orders TIMELOCK > UNRESOLVED > EOA; **a clean-LOOKING rug** (canonical bytecode identical to compound,
  but EOA admin) **still separates on the admin fact** (does NOT collapse, renders damning); the render itself separates. 5 tests.
- **D29 finalized + PARKED** (`data/honesty/governance/d29-promotion.json`): EOA-admin → `bounding`, CONSERVATIVE (degrade-only —
  caps at CAUTION, never lifts), DAMNING-EOA-only, `operatorSigned=false`. The **affected-pool census is pre-computed: 0 current
  shelf subjects are EOA** → signing today caps ZERO current verdicts, it ARMS the tool for the first future EOA-admin subject
  (the curated shelf is already free of the damning class — the census's own point). The verdict-path hashes asserted UNCHANGED.

## Phase 5 — THE OPERATOR GATE (whole, again) + PART E ✅ (organon)
- **The whole Operator gate** presented in ONE document (`precision-countersign-package.json`): D23–D29 with **D27 (the variance
  amendment) FIRST** (MT1) · IN2 (now incl. the governance line) · IN4 · AF4 · the push — **OWED-OPERATOR-GATED, never simulated**
  (LN5); discharged whole or an honest STOP with the remainder quoted (MT4).
- **PART E red team** (`script/honesty/precision-redteam.ts` → `precision-redteam.json`): **S1–S60 RED-TEAM-CLEAN** (S1–S57 carried;
  S58 collapse-is-a-whitelist, S59 governance-resolution integrity, S60 the discrimination wall — all new). 15 in-process probes,
  all PASS; the new walls broken-on-purpose + bite; the two-verdict separation KEPT (the governance fact is verdict-path-forbidden,
  info/context, D29 parked); verdict-path 7 + frozen-core 2 byte-unchanged; kill-criterion 8b4e094b untouched.
  `test/organon/precision_redteam.test.ts` (5 tests).
- **FIX-ON-THE-GO (red-team caught 2 real bugs):** (1) the `/check/:key` route needed `async` after I added `await import(...)` for
  the governance load — a parse error that would break every serve-reality importer; fixed. (2) `governance_capture.test.ts`'s
  artifact scan wrongly picked up the sibling `d29-promotion.json`; fixed to filter by the `poolKeys` field. Both root-caused + fixed.

## TERMINAL MARKER (organon)
- **PRECISION DELIVERED — READY-PENDING-OPERATOR.** `PINS_SHA d2fa4cdc…` (carried Moat `6aa2d0c7…`).
- **Battery:** 1129 pass / 2 skip / 0 fail across 172 files / 1131 tests — two clean runs (Phase-3-5 + terminal).
- **PR5:** organon **7095** expect() vs studio **7119** — a **+24** delta (stable Moat→Precision; +372 each from the six walls,
  the delta unchanged), documented never smoothed; both 0-fail, same 1131-test/172-file count.
- **verify GREEN:** the evidence bundle reproduces — **bundle sha `9c1e7bd8…` byte-identical** (NO verdict moved), battery
  1129/0 == committed, frozen-seven git-clean, every claim + live number resolves. Scorecard differential lending `70c7912f…` +
  funding `0a63151b…` byte-identical; parity `cc7e5e5a`; kill-criterion `8b4e094b` untouched.
- Frozen seven + verdict-path 7 + frozen-core 2 byte-unchanged (the governance fact is info/context; D29 parked). **D1–D29**
  (D26/D27/D28/D29 unsigned — OWED-OPERATOR-GATED). **S1–S60 clean.** Screens the conscious 3; mass path `hono`+`zod`. Unpushed.

> **Final:** terminal tree `312bbd75…` (byte-identical to organon-studio); HEAD `8d812fec`; verify GREEN; UNPUSHED (Operator-gated).
> The handoff's owed first line stays the Operator's: the invites go out once IN2/IN4/AF4 + the D23–D29 countersigns + the push
> are discharged — now with an axis that tells a depositor WHO HOLDS THE UPGRADE KEY in one honest line.

- **PRISTINE GATE GREEN** (fresh clone + isolated HOME + fresh venv): battery **1126/0** (the 3 fewer than 1129 are the
  DISC-1 continuity tests that read BUILDLOG files absent on a fresh clone); install ok · no-venv control fails as designed · venv
  fresh. Terminal tree **`3cb0c674…`** byte-identical; verify GREEN (bundle `9c1e7bd8…`); UNPUSHED (Operator-gated).
