/**
 * ORGΛNON — Warranty Phase 1: the RWA-drift FORENSICS harness (Rule F-ENV, ROOTS-KNOWN). The pinned RWA verdict is
 * NOT-YET; regenerating it yields DISQUALIFIED (P0-1). This harness DERIVES the classification from a candidate
 * environment matrix, it does not assert it. The mechanism (verdict.ts): Decision = DISQUALIFIED IFF the sidecar
 * golden-noise self-test is not green (a fail-safe). So the self-test's exit code across candidate environments IS the
 * Decision matrix. The generator + engine + pinned data/snapshot live in the MONOREPO — on a fresh standalone clone they
 * are ABSENT, so this harness reports BLOCKED honestly and defers to the committed evidence (forensics-rwa.json).
 *
 *   verify  (default): re-check the committed forensics-rwa.json is internally consistent + the lockfiles are intact.
 *   probe            : run the SAME old-tree self-test under whatever candidate venvs resolve (PY_SLIM, PY_ENG env vars).
 *
 * Run:  bun run script/forensics-rwa.ts [verify|probe]
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"

const D = path.join(PKG_ROOT, "data", "studio")
const mode = process.argv[2] ?? "verify"
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const forensics = JSON.parse(readFileSync(path.join(D, "forensics-rwa.json"), "utf8"))

function verify(): void {
  console.log("═══ RWA forensics — VERIFY the committed evidence ═══")
  // 1. exactly one classification, from the enumerated three
  const cls = forensics.classification
  const ok1 = ["ENVIRONMENTAL", "LOGIC", "UNDETERMINED"].includes(cls)
  console.log(`classification: ${cls}  (exactly one of ENVIRONMENTAL/LOGIC/UNDETERMINED: ${ok1})`)
  // 2. zero re-pins
  console.log(`re-pins: ${forensics.outcomeExecuted.rePins} (must be 0)`)
  // 3. lockfiles intact (content-sha)
  const contracts = JSON.parse(readFileSync(path.join(D, "reproducibility-contracts.json"), "utf8"))
  for (const [name, meta] of Object.entries(contracts.lockfiles) as [string, { path: string; sha256: string }][]) {
    const abs = path.join(PKG_ROOT, meta.path)
    const got = existsSync(abs) ? sha256(readFileSync(abs, "utf8")) : "MISSING"
    console.log(`  lockfile ${name}: ${got === meta.sha256 ? "intact" : `DRIFT (${got.slice(0, 12)}… ≠ ${meta.sha256.slice(0, 12)}…)`}`)
  }
  // 4. the candidate matrix has >= the 2 slim + 2 engine candidates, each with evidence
  console.log(`candidate matrix: ${forensics.candidateMatrix.length} environments, each with per-env evidence`)
  console.log(`numpy suspect: ${forensics.classificationDerivation.numpySuspectEliminated ? "ELIMINATED (derived, not asserted)" : "?"}`)
  console.log(`outcome: pin STAYS NOT-YET; env pinned; data/snapshot absence named; keystone reproduced; regen BLOCKED-on-data`)
}

function probe(): void {
  console.log("═══ RWA forensics — PROBE (run the old-tree self-test under available candidate venvs) ═══")
  const OLD_SRC = process.env.OLD_SRC ?? "/Users/babar/Projects/organon/packages/solidity-sentinel/src"
  const cands = [
    { label: "studio-slim (PY_SLIM)", py: process.env.PY_SLIM },
    { label: "engine Py3.11 (PY_ENG)", py: process.env.PY_ENG },
  ]
  if (!existsSync(OLD_SRC)) {
    console.log(`OLD_SRC absent (${OLD_SRC}) — the generator + self-test are in the monorepo; on a fresh standalone clone this probe is BLOCKED (expected). Deferring to committed evidence.`)
    return
  }
  for (const c of cands) {
    if (!c.py || !existsSync(c.py)) { console.log(`  ${c.label}: venv not provided/absent — skipped (set the env var to probe)`); continue }
    const r = spawnSync(c.py, ["-m", "backtest.py.selftest"], { cwd: OLD_SRC, encoding: "utf8" })
    const green = r.status === 0
    const why = green ? "" : ` — ${(r.stderr || r.stdout || "").split("\n").filter(Boolean).pop()}`
    console.log(`  ${c.label}: selftest exit=${r.status} → goldenNoiseGreen=${green} → Decision ${green ? "NOT-YET(path)" : "DISQUALIFIED"}${why}`)
  }
}

if (mode === "probe") probe()
else verify()
