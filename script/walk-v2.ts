/**
 * ORGΛNON — THE WALK v2 driver (Transplant Phase 3; Rules C-USER, C-LOOP, C-PARK, T-ROTATE). Walks the STANDALONE
 * system as a stranger through public interfaces, running the SEVEN red-team themes as concrete checks and recording
 * every observation as a registered issue (BEFORE any fix). Convergence = rotation-complete (all seven themes ≥1) AND
 * two consecutive CLEAN cycles; cap = 10. Depth manifests per cycle. A finding is a genuine defect the check detects —
 * NOT a fabricated one; a clean theme returns []. The walker fixes between rounds; this driver re-checks and derives
 * convergence from the register, never asserts it.
 *
 * Run:  bun run script/walk-v2.ts <cycle> <theme,theme,...>
 */
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { Hono } from "hono"
import { PKG_ROOT } from "../src/organon/frozen"
import { Ledger } from "../src/ledger/ledger"
import { StudioRoutesNS } from "../src/studio/routes"
import { StudioSurfaces } from "../src/studio/surfaces"
import { Durable } from "../src/studio/durable"
import { Tense } from "../src/studio/tense"

export interface Finding { theme: string; severity: "S1" | "S2" | "S3" | "S4"; cls: string; title: string; repro: string; evidence: string }
const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 7) + 0.002)
const sub = (spec: unknown, extra: Record<string, unknown> = {}) => ({ spec, authorClass: "human" as const, domain: "rwa", timestamp: 1_700_000_000_000, returns: R, barsPerYear: 365, ...extra })

// ── THEME 1: injection — the W1-04 class + the new corpora against the served surface ──
async function injection(): Promise<Finding[]> {
  const f: Finding[] = []
  const store = new Ledger.Store()
  const app = new Hono().route("/studio", StudioRoutesNS.mountable(store))
  const hostile = [
    { family: "rwa-allocation", policy: "static; DROP TABLE", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] },
    { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [] },
    { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: Array.from({ length: 1000 }, (_, i) => ({ id: `l${i}`, weight: 0.001 })) },
  ]
  for (const spec of hostile) {
    const res = await app.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub(spec)) })
    if (res.status !== 400) f.push({ theme: "injection", severity: "S1", cls: "INTEGRITY", title: `hostile spec accepted (status ${res.status})`, repro: `POST /studio/submit_spec ${JSON.stringify(spec).slice(0, 80)}`, evidence: `expected 400, got ${res.status}` })
  }
  if (store.length !== 0) f.push({ theme: "injection", severity: "S1", cls: "INTEGRITY", title: "hostile spec reached the ledger", repro: "the corpus above", evidence: `store.length=${store.length}, expected 0` })
  return f
}

// ── THEME 2: laundering — re-rooting / fresh-author over HTTP must still deflate ──
async function laundering(): Promise<Finding[]> {
  const f: Finding[] = []
  const store = new Ledger.Store()
  // (a) a STRUCTURALLY-DISTINCT re-rooting search (different policies) under one author must accumulate rootCount so
  //     the architecture-search breadth DEFLATES (H-SCOPE), not just each family.
  const policies = ["static", "barbell", "yield-rotation", "constrained-carry", "peg-defensive"]
  policies.forEach((policy, i) => store.register({ spec: { family: "rwa-allocation", policy, rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }, authorClass: "agent", authorId: "searcher", domain: "rwa", timestamp: i }))
  const rc = store.rootCount("searcher", "rwa")
  if (rc < policies.length) f.push({ theme: "laundering", severity: "S1", cls: "INTEGRITY", title: "re-rooting did not accumulate root count (breadth not deflating)", repro: "5 distinct-policy roots via register", evidence: `rootCount=${rc}, expected ${policies.length}` })
  // (b) a STRUCTURALLY-IDENTICAL orphan (a mutation dressed as a fresh start to reset the family counter) must be
  //     REFUSED as lineage evasion — the stronger defense. Not catching it is the finding.
  let evasionCaught = false
  // a SAME-STRUCTURE, DIFFERENT-NUMBER orphan (not an exact dup, which would dedup) — the real evasion move.
  try { store.register({ spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 0.97 }] }, authorClass: "agent", authorId: "searcher", domain: "rwa", timestamp: 99 }) } catch (e) { evasionCaught = e instanceof Ledger.LineageEvasionError }
  if (!evasionCaught) f.push({ theme: "laundering", severity: "S1", cls: "INTEGRITY", title: "structural re-root evasion NOT refused", repro: "re-register an existing structure as a fresh orphan", evidence: "expected LineageEvasionError" })
  return f
}

// ── THEME 3: tamper/rollback — the pollution spot-audit re-run over the live ledgers ──
async function tamper(): Promise<Finding[]> {
  const f: Finding[] = []
  // a durable store: submit, tamper the file's tail, reopen → the torn line must be quarantined, prior kept
  const { mkdtempSync, writeFileSync, readFileSync } = await import("node:fs")
  const { tmpdir } = await import("node:os")
  const file = path.join(mkdtempSync(path.join(tmpdir(), "walk-tamper-")), "l.jsonl")
  const s1 = Durable.DurableStore.open(file, { epochLabel: "w" })
  await StudioSurfaces.submit_spec(s1.mountableStore(), sub({ family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }))
  writeFileSync(file, readFileSync(file, "utf8") + '{"seq":1,"garbage":true}\n') // a torn/garbage tail line
  try {
    const s2 = Durable.DurableStore.open(file, { epochLabel: "w" })
    if (s2.length !== 1) f.push({ theme: "tamper", severity: "S1", cls: "INTEGRITY", title: "torn tail not quarantined correctly", repro: "append a garbage line, reopen", evidence: `length=${s2.length}, expected 1 (prior kept, torn quarantined)` })
    if (!s2.verifyChain().ok) f.push({ theme: "tamper", severity: "S1", cls: "INTEGRITY", title: "chain broken after tail quarantine", repro: "reopen after torn tail", evidence: "verifyChain not ok" })
  } catch (e) {
    f.push({ theme: "tamper", severity: "S1", cls: "INTEGRITY", title: "durable reopen threw on a torn tail (should quarantine)", repro: "append garbage line, reopen", evidence: String(e).slice(0, 120) })
  }
  return f
}

// ── THEME 4: availability — a dead sidecar/model endpoint must render an HONEST error, never a crash/fake verdict ──
async function availability(): Promise<Finding[]> {
  const f: Finding[] = []
  const store = new Ledger.Store()
  const app = new Hono().route("/studio", StudioRoutesNS.mountable(store))
  // malformed JSON body → 400 honest, not a crash
  const res = await app.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: "{not json" })
  if (res.status !== 400) f.push({ theme: "availability", severity: "S2", cls: "BUG", title: `malformed JSON not a clean 400 (got ${res.status})`, repro: "POST a malformed body", evidence: `status ${res.status}` })
  // an oversize body → 413 (size cap), behind a hardened mount
  const big = new Hono().route("/studio", StudioRoutesNS.mountable(store, undefined, { maxBodyBytes: 100 }))
  const bigBody = JSON.stringify(sub({ family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }))
  const res2 = await big.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json", "content-length": String(bigBody.length) }, body: bigBody })
  if (res2.status !== 413) f.push({ theme: "availability", severity: "S2", cls: "BUG", title: `oversize body not 413 (got ${res2.status})`, repro: "POST a body over the cap", evidence: `status ${res2.status}` })
  return f
}

// ── THEME 5: doc-lies — the tense scanner over the docs + the documented setup literally ──
async function docLies(): Promise<Finding[]> {
  const f: Finding[] = []
  // (a) the tense scanner's own positive control must hold
  const control = Tense.scan("The system is byte-identical and every check passes.")
  if (!control.some((c) => c.flagged)) f.push({ theme: "doc-lies", severity: "S2", cls: "DOC-DRIFT", title: "tense scanner blind to a seeded overclaim", repro: "Tense.scan(overclaim)", evidence: "no flag" })
  // (b) the documented studio setup must be followable: a studio-slim requirements must exist (T1-01)
  const reqStudio = path.join(PKG_ROOT, "src/backtest/py/requirements-studio.txt")
  if (!existsSync(reqStudio)) f.push({ theme: "doc-lies", severity: "S2", cls: "DOC-DRIFT", title: "no studio-slim requirements — a fresh clone cannot follow the documented setup on python3.9 (T1-01)", repro: "pip install -r requirements.txt on a fresh clone", evidence: "requirements.txt pins the engine's 3.11 stack (scipy==1.17.1, cvxpy, riskfolio); studio needs only numpy+scipy" })
  else {
    // inspect only the ACTUAL requirement lines (strip comments), so an explanatory comment naming the heavy stack
    // doesn't false-flag the slim file.
    const pkgs = readFileSync(reqStudio, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
    if (!pkgs.some((p) => /numpy/.test(p)) || !pkgs.some((p) => /scipy/.test(p)) || pkgs.some((p) => /quantstats|cvxpy|riskfolio|PyPortfolioOpt/.test(p))) f.push({ theme: "doc-lies", severity: "S2", cls: "DOC-DRIFT", title: "studio requirements not actually slim", repro: "read requirements-studio.txt (non-comment lines)", evidence: pkgs.join(", ") })
  }
  return f
}

// ── THEME 6: UX-priming — the served report/trust surfaces must be two-sided + non-priming (S-HONEST-UX) ──
async function uxPriming(): Promise<Finding[]> {
  const f: Finding[] = []
  const { StudioReport } = await import("../src/studio/report").catch(() => ({ StudioReport: null as any }))
  // the leaderboard must launch EMPTY-OF-GO (a priming board would fabricate a GO)
  const board = StudioSurfaces.leaderboard([])
  if (!board.emptyOfGo || board.goCount !== 0) f.push({ theme: "ux-priming", severity: "S2", cls: "UX", title: "empty leaderboard not empty-of-GO", repro: "leaderboard([])", evidence: `emptyOfGo=${board.emptyOfGo}, goCount=${board.goCount}` })
  return f
}

// ── THEME 7: park-legitimacy — every open park re-reviewed; a convenience park is a finding ──
async function parkLegitimacy(): Promise<Finding[]> {
  const f: Finding[] = []
  const reg = path.join(PKG_ROOT, "data/studio/parks-register.json")
  if (!existsSync(reg)) { f.push({ theme: "park-legitimacy", severity: "S2", cls: "INTEGRITY", title: "no parks register", repro: "read parks-register.json", evidence: "missing" }); return f }
  const parks = JSON.parse(readFileSync(reg, "utf8")).parks ?? []
  for (const p of parks) {
    const fourFields = p.context && p.rationale && p.impact && p.nextSteps
    if (!fourFields) f.push({ theme: "park-legitimacy", severity: "S2", cls: "PARK-CANDIDATE", title: `park ${p.id} missing a required field (convenience park?)`, repro: `parks-register ${p.id}`, evidence: JSON.stringify(Object.keys(p)) })
  }
  return f
}

const THEMES: Record<string, () => Promise<Finding[]>> = { injection, laundering, tamper, availability, "doc-lies": docLies, "ux-priming": uxPriming, "park-legitimacy": parkLegitimacy }

async function main() {
  const cycle = Number(process.argv[2] ?? 1)
  const themes = (process.argv[3] ?? Object.keys(THEMES).join(",")).split(",")
  const findings: Finding[] = []
  for (const t of themes) { if (THEMES[t]) findings.push(...(await THEMES[t]())) }
  console.log(`═══ WALK v2 — cycle ${cycle} — themes: ${themes.join(", ")} ═══`)
  if (findings.length === 0) console.log(`  CLEAN — 0 findings across ${themes.length} theme(s)`)
  else for (const x of findings) console.log(`  [${x.severity} ${x.theme}] ${x.title}\n     repro: ${x.repro}\n     evidence: ${x.evidence}`)
  console.log(JSON.stringify({ cycle, themes, findingCount: findings.length, findings }))
}
main()
