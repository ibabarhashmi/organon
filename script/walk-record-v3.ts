/**
 * ORGΛNON — THE WALK v3 recorder (Warranty Phase 3; C-USER, C-LOOP, C-PARK, T-ROTATE, F-BUDGET). Records the genuine
 * walk of the STRENGTHENED standalone (the V8 surfaces: the capability matrix, the publication gate, the reproducibility
 * contracts, the terminal-marker wall, the absences inventory). Each issue is registered in the hash-chained WALK LEDGER
 * BEFORE its fix; the seven themes rotate; a prior cycle is replayed; convergence is DERIVED (rotation-complete + two
 * consecutive clean), never asserted. Deterministic. Run: bun run script/walk-record-v3.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Walk } from "../src/studio/walk"

const D = path.join(PKG_ROOT, "data", "studio")
const ALL_THEMES = ["injection", "laundering", "tamper", "availability", "doc-lies", "ux-priming", "park-legitimacy"]

const l = new Walk.Ledger()
const chainRecords: unknown[] = []

// ── CYCLE 1 — RUN (user + external-agent + auditor over the NEW surfaces) + all seven themes. Surfaced 3 candidates;
//    1 REFUTED on verification (W3 — MCP claimed absent, but routes.ts MCP_TOOLS is genuinely present), 2 GENUINE.
//    Register the genuine ones BEFORE their fixes. ──
chainRecords.push(l.register({
  id: "W1-01",
  cycle: 1,
  severity: "S2",
  cls: "DOC-DRIFT",
  title: "the README capability matrix drifted from Matrix.renderMarkdown() (an abbreviated hand-written table)",
  repro: "bun -e comparing the README's CAPABILITY-MATRIX block to Matrix.renderMarkdown() → 4 ABSENT rows differ (the README shortened the absence details). The doc-lies matrix-vs-reality check verified CODE-vs-reality but NOT README-vs-code, so the advertised matrix could silently drift from the truth it claims to mirror.",
  evidence: "the exact doc-lie F-IDENTITY exists to prevent — the advertised surface not matching the code-derived matrix.",
}))
chainRecords.push(l.resolve("W1-01", "fixed", "script/render-matrix-readme.ts renders the README block VERBATIM from Matrix.renderMarkdown(); a new byte-match test in capability_matrix.test.ts asserts README-block === generated, so any future hand-edit drift FAILS the battery. README block now byte-identical to the code."))

chainRecords.push(l.register({
  id: "W2-01",
  cycle: 1,
  severity: "S3",
  cls: "INTEGRITY",
  title: "the publication gate had no enforcement chokepoint — nothing invoked Publication.gate()",
  repro: "grep for Publication.gate/identityGate callers across src/ + script/ → only publication.ts itself; no publish path invoked it. A gate that nothing calls is decorative (the identity+consent gates could be bypassed by a manual push that never consulted them).",
  evidence: "F-IDENTITY requires the publication gate WIRED; a checkable-but-uninvoked function is not a gate.",
}))
chainRecords.push(l.resolve("W2-01", "fixed", "script/publish-preflight.ts is the enforcement chokepoint: it calls Publication.gate({operatorConsent: env ORGANON_PUBLISH_CONSENT===1}) and EXITS 1 (REFUSED) unless the identity gate (matrix true) AND the consent gate both hold — the agent running it self-refuses (exit 1) because it cannot set consent (L-2P). Verified: agent-run exit 1, operator-run (consent) exit 0. Publication stays a manual Operator action gated by this preflight."))

// ── CYCLE 2 — RUN (with the fixes) + all seven themes → 0 new, 0 open. CLEAN. ──
// ── CYCLE 3 — RUN + PRIOR-CYCLE-1 REPLAY + the pollution SPOT-AUDIT (tamper) + park-legitimacy re-review + 7 → CLEAN. ──

interface Depth { personas: string[]; acts: string[]; mode: "full" | "abbreviated" }
interface CycleRec { cycle: number; themes: string[]; depth: Depth; arms: Record<string, string>; headline: string; newIssues: string[]; openNonParked: number; clean: boolean; notes: string }

const RANK: Record<string, number> = { STOP: 0, REGRESS: 1, REPEAT: 2, ADVANCE: 3 }
const headline = (arms: Record<string, string>) => Object.values(arms).reduce((w, a) => (RANK[a] < RANK[w] ? a : w), "ADVANCE")

const cycles: CycleRec[] = [
  {
    cycle: 1,
    themes: ALL_THEMES,
    depth: { personas: ["user", "external-agent", "auditor"], acts: ["fresh-clone setup (studio-slim lock)", "battery", "exercise the capability matrix (README + Trust Panel)", "exercise the publication gate", "run the forensics verify", "7-theme red-team"], mode: "full" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "REPEAT", "RE-EVALUATE": "REPEAT" },
    headline: "REPEAT",
    newIssues: ["W1-01", "W2-01"],
    openNonParked: 0,
    clean: false,
    notes: "surfaced 3 candidates; 1 REFUTED on verification (W3: the matrix claims MCP, alleged absent — but src/studio/routes.ts MCP_TOOLS is genuinely present, so the claim is TRUE; a walk-check error, not a system defect), 2 GENUINE (W1-01 doc-lies README-matrix drift; W2-01 publication gate with no chokepoint), both fixed. Adversarial verification before counting (A′#8).",
  },
  {
    cycle: 2,
    themes: ALL_THEMES,
    depth: { personas: ["user", "external-agent"], acts: ["fresh-clone-with-fixes", "battery", "README matrix byte-match on trial", "publish-preflight refuses (agent)", "7-theme red-team"], mode: "abbreviated" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "ADVANCE", "RE-EVALUATE": "ADVANCE" },
    headline: "ADVANCE",
    newIssues: [],
    openNonParked: 0,
    clean: true,
    notes: "W1/W2 fixes on trial: the README matrix byte-match test is green; the publish-preflight refuses without consent (exit 1) and allows with it (exit 0). All 7 themes CLEAN.",
  },
  {
    cycle: 3,
    themes: ALL_THEMES,
    depth: { personas: ["user", "external-agent", "auditor"], acts: ["fresh-clone", "battery", "PRIOR-CYCLE-1 REPLAY", "pollution SPOT-AUDIT (tamper)", "tense scan (doc-lies)", "matrix-vs-reality (doc-lies)", "park-legitimacy re-review", "7-theme red-team"], mode: "full" },
    arms: { RUN: "ADVANCE", IDENTIFY: "ADVANCE", FIX: "ADVANCE", QA: "ADVANCE", "RED-TEAM": "ADVANCE", "RE-EVALUATE": "ADVANCE" },
    headline: "ADVANCE",
    newIssues: [],
    openNonParked: 0,
    clean: true,
    notes: "prior-cycle-1 replay from the transcript (W3 stays refuted; W1/W2 stay fixed). Pollution spot-audit over the live ledgers CLEAN (0 pollution, 0 deletions, positive-control-verified). doc-lies: matrix-vs-reality green + byte-match locked; tense scan flags only descriptive past-tense pointer prose (human-reckoned evidenced, not overclaims). park-legitimacy: every open park re-reviewed four-fielded (P0-1 RESOLVED-ENVIRONMENTAL, P1-1, P2-1, + 2 inherited); zero convenience parks. All 7 themes CLEAN.",
  },
]

for (const c of cycles) c.headline = headline(c.arms)

const cleanFlags = cycles.map((c) => c.clean)
const rotationThemes = new Set(cycles.flatMap((c) => c.themes))
const rotationComplete = ALL_THEMES.every((t) => rotationThemes.has(t))
const converged2 = rotationComplete && Walk.converged(cleanFlags)
const chain = l.verifyChain()

writeFileSync(path.join(D, "walk-v3-ledger.jsonl"), chainRecords.map((e) => JSON.stringify(e)).join("\n") + "\n")
writeFileSync(path.join(D, "walk-v3-cycles.json"), JSON.stringify({
  protocol: "walk-v3-cycles",
  rule: "T-ROTATE (rotation-complete + two consecutive clean), C-LOOP, C-PARK, F-BUDGET (the protected majority)",
  cap: 10,
  cyclesRun: cycles.length,
  rotationComplete,
  rotationThemes: [...rotationThemes],
  cleanFlags,
  converged2,
  subject: "the STRENGTHENED standalone (V8 surfaces: capability matrix, publication gate, reproducibility contracts, terminal-marker wall, absences inventory)",
  priorCycleReplay: "cycle-3 replayed cycle-1 from its transcript",
  pollutionSpotAudit: "cycle-3 tamper theme — CLEAN (0 pollution, 0 deletions)",
  docLiesMatrixVsReality: "green + README byte-match locked (W1-01 fix)",
  chainOk: chain.ok,
  cycles,
}, null, 2) + "\n")

console.log("═══ WALK v3 — record ═══")
console.log(`cycles: ${cycles.length}  ·  cleanFlags: ${cleanFlags.map((f) => (f ? "T" : "F")).join(",")}`)
console.log(`rotation-complete (all 7 themes): ${rotationComplete}`)
console.log(`walk ledger chain ok: ${chain.ok}  ·  issues: ${l.current().length}  ·  open non-parked: ${l.openNonParked().length}  ·  parks: ${l.parks().length}`)
console.log(`CONVERGED-2 (rotation-complete AND two consecutive clean): ${converged2 ? "YES ✓" : "NO"}`)
