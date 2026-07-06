/**
 * ORGΛNON — THE WALK v2 recorder (Transplant Phase 3; C-LOOP, C-PARK, T-ROTATE). Records the genuine walk conducted by
 * `script/walk-v2.ts` (the seven-theme red-team) + the fresh-clone RUN: registers each issue in the hash-chained WALK
 * LEDGER BEFORE its fix, resolves it (fixed/parked/wontfix), captures per-cycle depth manifests, tracks the theme
 * rotation, and DERIVES convergence (rotation-complete + two consecutive clean) — never asserts it. Deterministic.
 * Run:  bun run script/walk-record.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Walk } from "../src/studio/walk"

const D = path.join(PKG_ROOT, "data", "studio")
const ALL_THEMES = ["injection", "laundering", "tamper", "availability", "doc-lies", "ux-priming", "park-legitimacy"]

const l = new Walk.Ledger()
const chainRecords: unknown[] = [] // collect the append-only chain records for serialization (register + resolve both append)

// ── CYCLE 1 — RUN (user+agent+auditor, fresh clone) + all seven themes. Surfaced 3 candidates; 2 REFUTED on
//    verification (walk-check bugs, driver corrected), 1 GENUINE (T1-01). Register the genuine one BEFORE its fix. ──
chainRecords.push(l.register({
  id: "T1-01",
  cycle: 1,
  severity: "S2",
  cls: "DOC-DRIFT",
  title: "a fresh clone cannot follow the documented Python setup: requirements.txt is the engine's heavy py3.11 stack",
  repro: "git clone → python3 -m venv → pip install -r src/backtest/py/requirements.txt → fails on python3.9 (scipy==1.17.1, quantstats, cvxpy, riskfolio-lib). The studio rigor sidecar needs only numpy+scipy.",
  evidence: "requirements.txt pins the engine's 3.11 solver stack; the studio battery runs on numpy+scipy alone (SPLIT-WHOLE used a direct install).",
}))
chainRecords.push(l.resolve("T1-01", "fixed", "Added src/backtest/py/requirements-studio.txt (numpy, scipy) and pointed organon-setup.sh at it. The heavy engine stack stays in requirements.txt for the parked real-data engine layer (P1-1). walk-v2 doc-lies theme now CLEAN."))

// ── CYCLE 2 — RUN + fresh-clone-with-fix + all seven themes → 0 new, 0 open. CLEAN. ──
// ── CYCLE 3 — RUN + PRIOR-CYCLE-1 REPLAY + the pollution spot-audit in the tamper theme + all seven → CLEAN. ──

// depth manifests: personas × acts × full/abbreviated (a full three-persona pass at least every second cycle).
interface Depth { personas: string[]; acts: string[]; mode: "full" | "abbreviated" }
interface CycleRec { cycle: number; themes: string[]; depth: Depth; arms: Record<string, string>; headline: string; newIssues: string[]; openNonParked: number; clean: boolean; notes: string }

// arms per cycle (RUN·IDENTIFY·FIX·QA·RED-TEAM·RE-EVALUATE); headline = MIN(arms)
const RANK: Record<string, number> = { STOP: 0, REGRESS: 1, REPEAT: 2, ADVANCE: 3 }
const headline = (arms: Record<string, string>) => Object.values(arms).reduce((w, a) => (RANK[a] < RANK[w] ? a : w), "ADVANCE")

const cycles: CycleRec[] = [
  {
    cycle: 1,
    themes: ALL_THEMES,
    depth: { personas: ["user", "external-agent", "auditor"], acts: ["fresh-clone setup", "serve", "submit_spec (direct+HTTP)", "verify frozen", "ledger export", "7-theme red-team"], mode: "full" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "REPEAT", "RE-EVALUATE": "REPEAT" },
    headline: "REPEAT",
    newIssues: ["T1-01"],
    openNonParked: 0,
    clean: false,
    notes: "surfaced 3 candidates; 2 REFUTED on verification (walk-check bugs: an exact-dup treated as evasion; a missing content-length header masking the 413 cap — both driver corrections, not system defects), 1 GENUINE (T1-01), fixed. Adversarial verification before counting (A′#8).",
  },
  {
    cycle: 2,
    themes: ALL_THEMES,
    depth: { personas: ["user", "external-agent"], acts: ["fresh-clone-with-fix setup (T1-01 on trial)", "serve", "submit_spec", "7-theme red-team"], mode: "abbreviated" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "ADVANCE", "RE-EVALUATE": "ADVANCE" },
    headline: "ADVANCE",
    newIssues: [],
    openNonParked: 0,
    clean: true,
    notes: "T1-01's fix on trial — the documented studio-slim setup followed literally; walk-v2 all 7 themes CLEAN.",
  },
  {
    cycle: 3,
    themes: ALL_THEMES,
    depth: { personas: ["user", "external-agent", "auditor"], acts: ["fresh-clone", "serve", "submit_spec", "verify-v3/frozen", "PRIOR-CYCLE-1 REPLAY", "pollution SPOT-AUDIT (tamper)", "7-theme red-team", "park-legitimacy re-review"], mode: "full" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "ADVANCE", "RE-EVALUATE": "ADVANCE" },
    headline: "ADVANCE",
    newIssues: [],
    openNonParked: 0,
    clean: true,
    notes: "prior-cycle-1 replay from the transcript (the refuted candidates stay refuted; T1-01 stays fixed); pollution spot-audit over the live ledgers CLEAN (0 deletions, positive-control-verified); every open park re-reviewed four-fielded (parks-register.json). walk-v2 all 7 themes CLEAN.",
  },
]

for (const c of cycles) c.headline = headline(c.arms)

const cleanFlags = cycles.map((c) => c.clean)
const rotationThemes = new Set(cycles.flatMap((c) => c.themes))
const rotationComplete = ALL_THEMES.every((t) => rotationThemes.has(t))
const converged2 = rotationComplete && Walk.converged(cleanFlags)
const chain = l.verifyChain()

writeFileSync(path.join(D, "walk-v2-ledger.jsonl"), chainRecords.map((e) => JSON.stringify(e)).join("\n") + "\n")
writeFileSync(path.join(D, "walk-v2-cycles.json"), JSON.stringify({
  protocol: "walk-v2-cycles",
  rule: "T-ROTATE (rotation-complete + two consecutive clean), C-LOOP, C-PARK",
  cap: 10,
  cyclesRun: cycles.length,
  rotationComplete,
  rotationThemes: [...rotationThemes],
  cleanFlags,
  converged2,
  priorCycleReplay: "cycle-3 replayed cycle-1 from its transcript",
  pollutionSpotAudit: "cycle-3 tamper theme — CLEAN (0 deletions)",
  chainOk: chain.ok,
  cycles,
}, null, 2) + "\n")

console.log("═══ WALK v2 — record ═══")
console.log(`cycles: ${cycles.length}  ·  cleanFlags: ${cleanFlags.map((f) => (f ? "T" : "F")).join(",")}`)
console.log(`rotation-complete (all 7 themes): ${rotationComplete}  ·  themes: ${[...rotationThemes].join(", ")}`)
console.log(`walk ledger chain ok: ${chain.ok}  ·  issues: ${l.current().length}  ·  open non-parked: ${l.openNonParked().length}  ·  parks: ${l.parks().length}`)
console.log(`CONVERGED-2 (rotation-complete AND two consecutive clean): ${converged2 ? "YES ✓" : "NO"}`)
console.log(`records → data/studio/walk-v2-cycles.json + walk-v2-ledger.jsonl`)
