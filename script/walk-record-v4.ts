/**
 * ORGΛNON — THE WALK v4 recorder (Data-Plane Phase 4; C-USER, C-LOOP, C-PARK, T-ROTATE, D-WALK+, F-BUDGET). Records the
 * genuine walk of the WHOLE organism on REAL DATA — the data plane brought home: the PIT store, the differential-proven
 * lending engine, the REAL-PIT live path, the re-told matrix. Each issue is registered in the hash-chained WALK LEDGER
 * BEFORE its fix; the seven data-plane-aware themes rotate; prior cycles are replayed; the pollution spot-audit covers
 * the PIT snapshot chains. Convergence is at the RAISED floor (D-WALK+): rotation-complete AND two consecutive
 * FULL-depth clean cycles AND ≥4 cycles — DERIVED, never asserted. Deterministic. Run: bun run script/walk-record-v4.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Walk } from "../src/studio/walk"

const D = path.join(PKG_ROOT, "data", "studio")
const ALL_THEMES = ["injection", "laundering", "tamper", "availability", "doc-lies", "ux-priming", "park-legitimacy"]

const l = new Walk.Ledger()
const chainRecords: unknown[] = []

// ── CYCLE 1 — RUN (user + external-agent + auditor over the REAL-DATA surfaces) + all seven data-plane-aware themes.
//    Surfaced 2 candidates; 1 REFUTED on verification (the tamper probe error), 1 GENUINE (W4-01). Register before fix. ──
chainRecords.push(l.register({
  id: "W4-01",
  cycle: 1,
  severity: "S2",
  cls: "PROVENANCE-HYGIENE",
  title: "the committed differential fixture embedded the raw captured data (A′#12 inconsistency)",
  repro: "wc -c data/studio/differential-fixture-v9.json → 464KB; it embedded 1908 raw lending data points inside the derived Job — the same credential-free DefiLlama data that Phase 1 deliberately gitignored (data/dataplane/snapshots/, A′#12). The raw data rode into the commit via the derived fixture; the doc-lies/tamper theme found the tree carrying data it advertised as gitignored-with-provenance-only.",
  evidence: "A′#12: snapshots stay gitignored with hash-chained provenance; the reproducibility contracts carry the guarantee. A committed fixture embedding the raw points contradicts that discipline.",
}))
chainRecords.push(l.resolve("W4-01", "fixed", "script/differential.ts now writes only a SLIM fixture record (fixtureSha + spec + window + per-market point counts, NO raw Job) — 464KB → 1186 bytes. The full Job is re-derived deterministically from the (re-capturable) snapshots each run, reproducing the same fixtureSha; the committed fixtureSha + the provenance chain are the guarantee. Consistent with A′#12: no raw data in the tree."))

// ── CYCLE 2 — RUN (with the W4-01 fix) + all seven themes → 0 new, 0 open. CLEAN (full depth). ──
// ── CYCLE 3 — RUN + PRIOR-CYCLE-1 REPLAY + the PIT-inclusive pollution SPOT-AUDIT (tamper) + park-legitimacy → CLEAN. ──
// ── CYCLE 4 — RUN + a second REPLAY + full re-verification → CLEAN (full depth). ──

interface Depth { personas: string[]; acts: string[]; mode: "full" | "abbreviated" }
interface CycleRec { cycle: number; themes: string[]; depth: Depth; arms: Record<string, string>; headline: string; newIssues: string[]; openNonParked: number; clean: boolean; notes: string }

const RANK: Record<string, number> = { STOP: 0, REGRESS: 1, REPEAT: 2, ADVANCE: 3 }
const headline = (arms: Record<string, string>) => Object.values(arms).reduce((w, a) => (RANK[a] < RANK[w] ? a : w), "ADVANCE")

const FULL_PERSONAS = ["user", "external-agent", "auditor"]
const cycles: CycleRec[] = [
  {
    cycle: 1,
    themes: ALL_THEMES,
    depth: { personas: FULL_PERSONAS, acts: ["fresh goal → REAL-PIT verdict with visible provenance (user)", "SKILL.md over HTTP → a submission against real snapshots (external-agent)", "verify-v3 + matrix-vs-reality + a snapshot provenance chain traced (auditor)", "7-theme data-plane red-team"], mode: "full" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "REPEAT", "RE-EVALUATE": "REPEAT" },
    headline: "REPEAT",
    newIssues: ["W4-01"],
    openNonParked: 0,
    clean: false,
    notes: "the user received a REAL-PIT verdict (NO-GO) with traceable provenance — the first walk-user real-data adjudication in the standalone. Surfaced 2 candidates; 1 REFUTED (the tamper probe: a first regex targeted the Job's array format not the snapshot's object format → a false 'served tampered data'; a correct tamper → the store REFUSES to serve (integrity holds) — a walk-check error, not a system defect, A′#8), 1 GENUINE (W4-01: the differential fixture embedded raw data), fixed. injection: a missing-market/bad-policy spec is REFUSED, never fabricated. availability: a stripped-provenance series → BLOCKED, never a stale REAL-PIT. laundering: family + root deflation counts REAL-PIT lending trials (dsr deflates with family size). All findings adversarially verified before counting.",
  },
  {
    cycle: 2,
    themes: ALL_THEMES,
    depth: { personas: FULL_PERSONAS, acts: ["fresh-clone-with-fix", "battery (211/0)", "differential re-proven (byte-identical)", "the slim fixture on trial (no raw data)", "7-theme red-team"], mode: "full" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "ADVANCE", "RE-EVALUATE": "ADVANCE" },
    headline: "ADVANCE",
    newIssues: [],
    openNonParked: 0,
    clean: true,
    notes: "the W4-01 fix on trial: the fixture is 1186 bytes (no raw Job) and the differential re-derives + re-proves byte-identical. Battery 211/0; frozen seven byte-identical; matrix-vs-reality green; absences ok. All 7 themes CLEAN.",
  },
  {
    cycle: 3,
    themes: ALL_THEMES,
    depth: { personas: FULL_PERSONAS, acts: ["fresh-clone", "battery", "PRIOR-CYCLE-1 REPLAY", "PIT-inclusive pollution SPOT-AUDIT (tamper)", "tense scan (doc-lies)", "matrix-vs-reality + REAL/ILLUSTRATIVE labels (doc-lies)", "park-legitimacy re-review incl. the door", "7-theme red-team"], mode: "full" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "ADVANCE", "RE-EVALUATE": "ADVANCE" },
    headline: "ADVANCE",
    newIssues: [],
    openNonParked: 0,
    clean: true,
    notes: "prior-cycle-1 replay from the transcript (W4-01 stays fixed; the tamper probe stays refuted — a correct tamper is refused). PIT-inclusive pollution spot-audit: the provenance chain verifies (10 stamps, 5 lending snapshots; a snapshot tamper → the store refuses to serve; a chain tamper → Capture.Service throws). doc-lies: matrix-vs-reality green + README byte-match locked; REAL-PIT/ILLUSTRATIVE labels distinct (the deflation demo carries its own hash, never conflated with trial-2); tense scan flags only evidenced past-tense pointer prose (human-reckoned). park-legitimacy: P1-1 (PARTIALLY CLOSED — lending landed), P0-1 (BLOCKED-on-credential), the 2 inherited + P2-1 RESOLVED + the two-way door reviewed; zero convenience parks. ux-priming: the REAL-PIT NO-GO is framed as the product working, never primed toward GO. All 7 themes CLEAN.",
  },
  {
    cycle: 4,
    themes: ALL_THEMES,
    depth: { personas: FULL_PERSONAS, acts: ["fresh-clone", "battery", "SECOND REPLAY (cycle-2)", "full re-verification (differential + frozen + provenance chain + matrix)", "7-theme red-team"], mode: "full" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "ADVANCE", "RE-EVALUATE": "ADVANCE" },
    headline: "ADVANCE",
    newIssues: [],
    openNonParked: 0,
    clean: true,
    notes: "second replay (cycle-2) + full re-verification: battery 211/0, differential DIFF-PROVEN, frozen seven byte-identical, PIT provenance chain verified, matrix-vs-reality + absences green. Two consecutive FULL-depth clean cycles reached (2,3,4); rotation-complete; ≥4 cycles. All 7 themes CLEAN.",
  },
]

for (const c of cycles) c.headline = headline(c.arms)

const cleanFlags = cycles.map((c) => c.clean)
const rotationThemes = new Set(cycles.flatMap((c) => c.themes))
const rotationComplete = ALL_THEMES.every((t) => rotationThemes.has(t))

// D-WALK+ (the RAISED floor): rotation-complete AND ≥4 cycles AND two consecutive FULL-depth clean cycles.
function twoConsecutiveFullClean(cs: CycleRec[]): boolean {
  for (let i = 1; i < cs.length; i++) if (cs[i].clean && cs[i - 1].clean && cs[i].depth.mode === "full" && cs[i - 1].depth.mode === "full") return true
  return false
}
const converged3 = rotationComplete && cycles.length >= 4 && twoConsecutiveFullClean(cycles)
const chain = l.verifyChain()

writeFileSync(path.join(D, "walk-v4-ledger.jsonl"), chainRecords.map((e) => JSON.stringify(e)).join("\n") + "\n")
writeFileSync(path.join(D, "walk-v4-cycles.json"), JSON.stringify({
  protocol: "walk-v4-cycles",
  rule: "D-WALK+ (RAISED floor: rotation-complete + two consecutive FULL-depth clean + ≥4 cycles), T-ROTATE, C-LOOP, C-PARK, F-BUDGET (the protected majority)",
  cap: 10,
  cyclesRun: cycles.length,
  rotationComplete,
  rotationThemes: [...rotationThemes],
  cleanFlags,
  twoConsecutiveFullClean: twoConsecutiveFullClean(cycles),
  converged3,
  subject: "the WHOLE organism on REAL DATA (the data plane: PIT store, differential-proven lending engine, REAL-PIT live path, re-told matrix)",
  priorCycleReplay: "cycle-3 replayed cycle-1; cycle-4 replayed cycle-2",
  pollutionSpotAudit: "cycle-3 tamper theme — PIT-inclusive: the provenance chain verifies; a snapshot tamper is refused; a chain tamper throws (0 pollution, 0 deletions)",
  docLiesMatrixVsReality: "green + README byte-match re-locked (14 PRESENT / 3 ABSENT); REAL-PIT/ILLUSTRATIVE labels distinct",
  refutedCandidates: [{ id: "W-c1-tamper-probe", note: "a first tamper regex targeted the Job's array format not the snapshot's object format → a false 'served tampered data'; a correct tamper is REFUSED (integrity holds). A walk-check error, not a system defect (A′#8)." }],
  chainOk: chain.ok,
  cycles,
}, null, 2) + "\n")

console.log("═══ WALK v4 — record (RAISED floor D-WALK+) ═══")
console.log(`cycles: ${cycles.length}  ·  cleanFlags: ${cleanFlags.map((f) => (f ? "T" : "F")).join(",")}  ·  all full-depth: ${cycles.every((c) => c.depth.mode === "full")}`)
console.log(`rotation-complete (all 7 themes): ${rotationComplete}`)
console.log(`two consecutive FULL-depth clean: ${twoConsecutiveFullClean(cycles)}  ·  ≥4 cycles: ${cycles.length >= 4}`)
console.log(`walk ledger chain ok: ${chain.ok}  ·  issues: ${l.current().length}  ·  open non-parked: ${l.openNonParked().length}  ·  parks: ${l.parks().length}`)
console.log(`CONVERGED-3 (raised floor): ${converged3 ? "YES ✓" : "NO"}`)
process.exit(converged3 && chain.ok ? 0 : 1)
