# BUILDLOG — THE PROBE SPRINT (executed for the `organon` codebase; dual-repo)

**Repo:** `ibabarhashmi/organon` · branch `staging` · working dir `/Users/babar/Projects/organon`
**Continues:** THE ALPHA SPRINT (Alpha `PINS_SHA 3b9f98bc…`; battery 1014/2/0 across 152 files; ALPHA VERDICT READY-PENDING-OPERATOR).
**Terminal `PINS_SHA`:** `e6bed150ef680d414923df79c2f9835c732a5842644749b0df9a5a1db22f0c5e` (carried from Alpha `3b9f98bc…`).
**Probe status:** X-PROBE resolves ARMED→RUNNING — this sprint builds the Stage-0 instrumentation so the invited testers can answer the question. **The closed alpha IS the probe's vehicle.**

---

## WHAT THIS SPRINT BUILT — freshly engineered (no prior Probe layer existed in either repo)

Unlike Alpha (which was reproduced from a proven `organon-studio` layer), **no Probe layer existed in either repo** — this was built from scratch against the audited tree, then re-proven. Dual-repo: engineered + proven in `organon` first, then ported byte-identically to `organon-studio` (byte-identical `34d20e7`+Alpha bases).

**Phase 0 — PINS-LOCKED.** `data/honesty/probe-pins.json` (`pinsSha e6bed150`, carried `3b9f98bc`): the X-TELEMETRY posture + the pinned capture manifest, the feedback contract, the re-score honesty contract, the kill-criterion schema, the verdict-path-forbidden extension (telemetry/feedback beside the 7 modules), AF1–AF7, S52–S54, D24/D25. Verdict-path 7-module hash set 7/7 === live (untouched).

**Phase 1 — FINDINGS-CLOSED (the Alpha AFs).**
- **AF5** `pristine.ts` clone-checkout now targets the **source repo's current branch** (`git rev-parse --abbrev-ref HEAD`), not a hardcoded `v0` — robust per-repo (staging in organon/organon-studio, v0 in the standalone dev tree). The automated pristine gate is no longer DORMANT in `organon` (DISC-A resolved). `pristine.ts` is not hash-pinned, so this is a conscious script edit (old: `checkout -q v0` · new: `checkout -q $srcBranch`).
- **AF6** `data/honesty/probe-provenance.json` — a durable, **self-contained** base-identity record in `organon` (shared base `34d20e7`, Alpha tree `2b242ac7`, the `f53284c` cherry-pick origin), so a future reader isn't dependent on `organon-studio` staying live. The `alpha-pins` `organon-studio` label is carried verbatim (DISC-B) — mutating it would break the Alpha `pinsSha`; this record is the honest statement of the `organon` substrate.
- **AF3** D23's countersign block PREPARED (the parity proof is green in both repos, `cc7e5e5a`); `operatorSigned` stays false (an agent must not sign as the Operator).
- **AF7** the evidence bundle regenerated at the settled count (`battery-summary`/`claims` → 1043); bundle sha `9c1e7bd8` byte-identical. Reconciliation itemized below.
- **LN1/LN2** carried verbatim in the pins.

**Phase 2 — INSTRUMENTED (the telemetry + feedback seam; X-TELEMETRY — NO COVERT ANYTHING).** `src/telemetry/{manifest,store,telemetry,feedback}.ts` + `script/{telemetry,feedback}.ts` + the `telemetry`/`feedback` CLI verbs + `POST /feedback`. **OFF by default** (needs `ORGANON_TELEMETRY=1` + an accepted disclosure); the captured field set === the pinned manifest exactly (`.strict()` — an unlisted field fails); every event scrubbed (Alpha scrubber EXTENDED to address/txhash/token masking); local-first (`data/telemetry/`, gitignored) with `--show/--export/--purge`; egress ONLY on a SECOND `ORGANON_TELEMETRY_SHARE=1`; telemetry+feedback import NO scored module (verdict-path-forbidden, grep-walled); no analytics SDK; Bun-stdlib + zod only.

**Phase 3 — ARTIFACT-HONEST (the re-score post-mortems; S53, X-HONEST absolute).** `data/postmortems/{stream,elixir,resolv,index}.json` + `GET /postmortems`. The EXISTING engine (`Scorecard.score`, zero new scoring) run against the three 2025-26 collapses; **every fact cell SAMPLE-labeled** (public reporting, not re-fetched — `allSample: true`), the recorded verdict IS the engine's actual recomputed output (UNVERIFIED headline + the adverse structural flags: Stream yield/tvl/peg **fail** + counterparty caution; Elixir similar; Resolv funding-regime caution only — honestly milder). No fabricated cell.

**Phase 4 — PROBE-ARMED (the pre-registered kill-criterion; S54).** `data/honesty/probe-kill-criterion.json` (`commitHash 8b4e094b`): concrete + numeric continue/pivot/stop over three metrics (returning-testers, feedback-trust, rescore-conversation), committed BEFORE any invite, immutable-without-a-disclosed-re-pin.

**Phase 5 — PREREQS + STRANGER RED-TEAM.** `data/honesty/probe-prereqs.json`: **AF1 (IN2 Operator session) · AF2 (IN4 a11y) · AF4 (live paid-key parity) are OWED-OPERATOR-GATED** with concrete checklists — an agent cannot sit the Operator's session or hold their paid keys (LN5), so they are recorded, never simulated. `data/honesty/probe-redteam.json`: the full first-class catalog **S1–S54** (S52–S54 new), 10 in-process stranger probes all clean, the broken-on-purpose proofs biting.

---

## RE-VERIFICATION IN THIS TREE

| Gate | Result |
|---|---|
| Canonical battery (run 1) | **1043 pass / 2 skip / 0 fail across 158 files / 1045 tests** (94.4s); skips {ask_live, eval_live} |
| Canonical battery (run 2) | **1043 pass / 2 skip / 0 fail across 158 files** (96.6s) — byte-identical counts, deterministic |
| Telemetry S52 (positive-controlled) | off-by-default ✓ · manifest===schema ✓ · seeded key+address scrubbed ✓ · double-consent share ✓ · verdict-path-forbidden ✓ |
| Re-score S53 | every verdict recomputes === `Scorecard.score`; allSample=true; tampered-SOLID control bites ✓ |
| Kill-criterion S54 | concrete/numeric/pre-registered; commitHash === content (immutable) ✓ |
| Stranger red-team (in-process) | **10/10 clean** — off-by-default, manifest-drift, seeded-key grep, single-consent-block, recompute, /feedback hostile→400 sentence, oversized→413, /postmortems SAMPLE-labeled + secret-free |
| Verdict-path freeze | 7 modules re-hashed === pins, 0 moved |
| Evidence bundle | sha `9c1e7bd8` byte-identical; count settled 1014→1043 |
| Clone-side pristine (AF5) | `script/honesty/pristine.ts` (now auto-targets `staging`) GREEN: install ✓ · no-venv control fails ✓ (isolation real) · **battery 1040/0** (1043 − 3 surface_detector clone-skips) · PRISTINE GREEN true — the automated clone-gate, dormant under the hardcoded `v0`, now works in `organon` |

---

## AF7 — RECONCILIATION (itemized, not folded)

Alpha `1014/2/0 across 152 files` → Probe `1043/2/0 across 158 files` = **+29 tests / +6 files**:
- `probe_pins.test.ts` (+5) · `findings_closed_alpha.test.ts` (+6) · `telemetry.test.ts` (+6, covers feedback) · `postmortem.test.ts` (+5) · `kill_criterion.test.ts` (+3) · `probe_redteam.test.ts` (+5) = +30 across +6 files; net battery +29 (the two Alpha-era posture walls — `security_pass` NO-telemetry→no-analytics-SDK + local-first, and `honesty_ui` screen-set +`/postmortems` dispositioned door — were UPDATED in place, not added, and `stranger_ready`'s ALPHA.md telemetry claim was made truthful; expect() calls 6159→6424).

## CONSCIOUS POSTURE UPDATES (the tree's identity moved; recorded)
- `security_pass.test.ts` — the old "NO telemetry exists anywhere" wall is now "NO analytics SDK + LOCAL-FIRST": the Probe added OPT-IN telemetry (off-by-default, scrubbed, double-consent), so the security guarantee is no-covert-SDK + no-phone-home (proven: no `fetch`/beacon in the telemetry seam), not "zero telemetry".
- `honesty_ui.test.ts` — `/postmortems` (+ the POST `/feedback`) added to the non-screen set: dispositioned DOORS, not a 4th screen (D24/D25). The wall still bites a genuine 4th screen.
- `ALPHA.md` — the footer "No telemetry" made truthful ("Telemetry is OFF by default and opt-in only…") + a full Probe section (telemetry/feedback/re-score/kill-criterion) — S51 docs truthfulness. `stranger_ready` asserts the new claim.

## DUAL-REPO (one blueprint, two trees; every gate re-proven in EACH)

Engineered + proven in `organon`, then ported byte-identically to `organon-studio` (both share the `34d20e7`+Alpha byte-identical bases). The probe layer is the SAME 37-file change in both; `pristine.ts`'s AF5 fix (`rev-parse --abbrev-ref HEAD`) is repo-agnostic, so it works in both without per-repo divergence.

| Repo | Commit | Tree | Battery |
|---|---|---|---|
| `ibabarhashmi/organon` @ staging | `00396a3` | `3adffe34…` | 1043/2/0 ×2 · pristine 1040/0 |
| `ibabarhashmi/organon-studio` @ staging | `1a94acf` | `3adffe34…` (byte-identical) | 1043/2/0 |

Both authored BABAR HASHMI, no AI attribution, **unpushed** (publication Operator-gated). Per-repo DISCs recorded: DISC-A (pristine `v0`→source-branch, resolved for both), DISC-B (the `alpha-pins` `organon-studio` label carried verbatim, `probe-provenance.json` the durable record). The `organon-studio` battery's expect() count (6448) differs slightly from `organon`'s (6424) — a data-dependent loop over each clone's committed provenance chain; both 0-fail. Recorded, not reconciled (the tree wins in each).

---

## FINAL MARKER — THE PROBE SPRINT, COMPLETE (both repos)

**PROBE STATUS: RUNNING (ARMED) — READY-PENDING-OPERATOR.** For the first time in fourteen sprints the handoff's first line is NOT "the next sprint runs the probe." The invite package is ready (ALPHA.md + the setup one-liner + the disclosed-telemetry note + the three REAL-or-labeled re-score post-mortems + the pre-registered kill-criterion). The ONLY things between here and the invites are the Operator's own hands: AF1 (real-screen session), AF2 (browser/AT a11y), AF4 (the first live paid-key parity diff) — OWED-OPERATOR-GATED, never simulated (LN5).

- **Telemetry:** OFF by default · manifested · scrubbed · local-first · double-consent-to-share · verdict-path-forbidden · no analytics SDK (S52 clean, positive-controlled).
- **Credibility artifact:** the Stream/Elixir/Resolv re-scores are the engine's actual recomputed output, every cell SAMPLE-labeled (`allSample: true`), no fabricated number (S53).
- **Thesis held to its own standard:** the kill-criterion is concrete/numeric/pre-registered/immutable-without-disclosure (S54, `commitHash 8b4e094b`).
- **Alpha findings closed:** AF3 D23 countersign prepared (parity green both repos); AF5 pristine per-repo-correct; AF6 durable provenance record; AF7 evidence bundle settled + reconciliation itemized; LN1/LN2 carried.
- **Parity status:** S48 hermetic GREEN (`cc7e5e5a`) both repos; AF4 live paid-key run OWED-OPERATOR-GATED.
- **Blocker count:** 0 machine blockers; IN2/IN4/AF4 the human/live OPERATOR steps.
- **Skip set:** {ask_live, eval_live} (+ surface_detector pristine).
- **Terminal `PINS_SHA`:** `e6bed150…` (carried Alpha `3b9f98bc…`). Verdict-path 7-module hash set intact; scorecard differential (lending `70c7912f…` + funding NO-GO `0a63151b…`) byte-stable; zero frozen bytes edited; zero verdicts moved; zero secrets logged; zero telemetry captured without consent.
- **Battery:** 1043/2/0 across 158 files, two clean runs, BOTH repos. Reconciliation: Alpha 1014 → Probe 1043 = **+29 tests / +6 files** (itemized above).
- **Commits:** `organon` `00396a3` · `organon-studio` `1a94acf` — byte-identical tree `3adffe34`, unpushed.

**Deviations D1–D25** verbatim (D24 telemetry/feedback posture, D25 kill-criterion + re-score scope — both Operator-signed pending). The parked list stays parked; the probe decides what unparks next, on evidence.

**Done** = the demand signal instrumented under the exact privacy posture the thesis demands, a credibility artifact that cannot lie, a goalpost set before the throw, every Alpha finding closed in both repos, the human prerequisites carried as honest owed-operator gates — while editing zero frozen bytes, moving zero verdicts, capturing nothing without consent, and fabricating nothing. The tool is no longer merely BUILT-BUT-UNPROVEN; it is instrumented to be proven or disproven by the only judges that matter — pending the Operator's own eyes and one live paid key, then the invites go out.
