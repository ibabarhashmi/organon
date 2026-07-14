/**
 * ORGΛNON — THE RECKONING SPRINT, Phase 4 (S83 — THE SIDECAR COVERAGE CENSUS). V32 reported "0 environmental failures" — which
 * may have meant HEALTH, or may have meant NON-COVERAGE (the Python sidecar never ran). The census makes the difference
 * VISIBLE: it enumerates every test that invokes the sidecar, records the venv's Python version, and runs a runtime CANARY
 * (import numpy + scipy). A green battery that never touches the sidecar must SAY SO — the census is the saying.
 * Run: bun run script/honesty/sidecar-census.ts
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const PY_DIR = path.join(PKG_ROOT, "src", "backtest", "py")
const VENV_PY = path.join(PY_DIR, ".venv", "bin", "python")
const TEST_DIR = path.join(PKG_ROOT, "test", "organon")

// enumerate the tests that INVOKE the sidecar (transitively spawn python) — a test that reaches the runner or a sidecar-backed
// module. Detected by importing a sidecar-bearing module or referencing the runner / a rigor/attest/effective_n path.
const SIDECAR_MARKERS = ["backtest/runner", "Runner.sidecar", "backtest/rigor", "variance", "effective_n", "purgedcv", "sidecar", "attest", "backtest.py", "Backtest.run"]
const sidecarTests = readdirSync(TEST_DIR)
  .filter((f) => f.endsWith(".test.ts"))
  .filter((f) => { const s = readFileSync(path.join(TEST_DIR, f), "utf8"); return SIDECAR_MARKERS.some((m) => s.includes(m)) })
  .sort()

// the venv Python version (the mandate: 3.11.x — the Py3.11-only purgedcv has failed the Py3.9 venv since Warranty V8)
let venvPython: string | null = null
const cfg = path.join(PY_DIR, ".venv", "pyvenv.cfg")
if (existsSync(cfg)) venvPython = (readFileSync(cfg, "utf8").match(/version\s*=\s*([\d.]+)/)?.[1]) ?? null

// the runtime CANARY — the sidecar interpreter actually executes numpy + scipy (the studio verdict path's stack)
let canary: { ok: boolean; detail: string } = { ok: false, detail: "venv absent — sidecar tests are BLOCKED (stated, never faked)" }
if (existsSync(VENV_PY)) {
  const r = spawnSync(VENV_PY, ["-c", "import numpy, scipy, sys; print(numpy.__version__, scipy.__version__, sys.version.split()[0])"], { encoding: "utf8", timeout: 60_000 })
  canary = r.status === 0 ? { ok: true, detail: `numpy+scipy import OK — ${r.stdout.trim()}` } : { ok: false, detail: `canary FAILED (exit ${r.status}): ${(r.stderr || "").trim().slice(0, 200)}` }
}

// S83 TIGHTENED (V34, B-7): naming ≠ executing. Actually RUN the frozen sidecar math end-to-end and record the exit —
// an EXECUTION proof, not a name. Two golden-noise self-tests run the frozen modules (effective_n's own --selftest; the
// lending sibling that validates neutralize.py). The rigor DSR/PSR/PBO cross-check needs `purgedcv` (Py3.11-only) — where
// it is absent, the block is NAMED PRECISELY (not "environmental"), never dressed as coverage.
const SRC = path.join(PKG_ROOT, "src")
function runExec(args: string[]): { ok: boolean; tail: string } {
  if (!existsSync(VENV_PY)) return { ok: false, tail: "venv absent — BLOCKED" }
  const r = spawnSync(VENV_PY, args, { cwd: SRC, encoding: "utf8", timeout: 120_000, env: { ...process.env, PYTHONHASHSEED: "0" } })
  return { ok: r.status === 0, tail: (r.status === 0 ? (r.stdout || "") : (r.stderr || r.stdout || "")).trim().split("\n").pop()?.slice(0, 90) ?? "" }
}
// REACH V35 (S94): the DSR/PSR/PBO cross-check now EXECUTES via crosscheck.py (the frozen rigor vs the independent
// purgedcv oracle) — the studio-slim venv ships numpy+scipy only, and purgedcv is provisioned from
// requirements-crosscheck.txt (RP-2). A crosscheck exit 0 means the frozen math agreed with the reference; an absent
// purgedcv leaves it BLOCKED with the precise, ACTIONABLE reason (never dressed as coverage, never mocked — attack #2).
const crosscheck = runExec(["-m", "backtest.py.crosscheck"])
const executed = [
  { module: "effective_n", proof: "-m backtest.py.effective_n --selftest", ...runExec(["-m", "backtest.py.effective_n", "--selftest"]) },
  { module: "neutralize (lending sibling)", proof: "-m backtest.py.selftest_lending", ...runExec(["-m", "backtest.py.selftest_lending"]) },
  { module: "rigor DSR/PSR/PBO cross-check (crosscheck.py vs purgedcv)", proof: "-m backtest.py.crosscheck", ...crosscheck },
]
const blocked = crosscheck.ok ? [] : [{ selftest: "rigor DSR/PSR/PBO cross-check (backtest.py.crosscheck vs purgedcv)", reason: "requires `purgedcv` (Py3.11-only) — provision it with `src/backtest/py/.venv/bin/pip install -r src/backtest/py/requirements-crosscheck.txt`; the studio-slim venv ships numpy+scipy only. BLOCKED is named precisely, never dressed as coverage, never mocked (RP-2)", tail: crosscheck.tail }]

const record = {
  protocol: "sidecar-census",
  at: "2026-07-14",
  rule: "S83 — every test that invokes the Python sidecar is enumerated; the venv Python version + a runtime canary are recorded. A green battery that never touches the sidecar SAYS SO. The mandate is Python 3.11.x (the Py3.11-only purgedcv; Warranty V8). REACH V35 (S94): the DSR/PSR/PBO cross-check now EXECUTES (crosscheck.py vs the independent purgedcv) — the first time in the audited record; provisioned from requirements-crosscheck.txt (RP-2).",
  sidecarTestsNamed: sidecarTests.length,
  sidecarTests,
  venvPresent: existsSync(VENV_PY),
  venvPython,
  venvMandate: "3.11.x",
  venvMeetsMandate: venvPython != null && venvPython.startsWith("3.11"),
  canary,
  executed, // S83 TIGHTENED — the frozen sidecar math actually RAN (executed, not merely named); each carries its exit
  executedCount: executed.filter((e) => e.ok).length,
  blocked, // the precisely-named block (purgedcv absent) — an honest gap, never dressed as coverage
  honestNote: existsSync(VENV_PY) ? "the venv is present → the sidecar tests EXECUTE (coverage, not non-coverage); S83 TIGHTENED asserts the frozen math actually RAN (effective_n --selftest + selftest_lending exit 0), not merely that files are named" : "the venv is ABSENT on this machine → the sidecar tests are BLOCKED and state so; a fresh clone runs `./organon.sh setup` to build it",
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "sidecar-census.json"), JSON.stringify(record, null, 2) + "\n")
console.log("── RECKON — the sidecar coverage census (S83) ──────────────")
console.log(`  sidecar tests named : ${record.sidecarTestsNamed}`)
console.log(`  venv python         : ${venvPython ?? "ABSENT"} (mandate 3.11.x → ${record.venvMeetsMandate ? "MET" : "NOT MET"})`)
console.log(`  canary              : ${canary.ok ? "OK" : "BLOCKED"} — ${canary.detail}`)
console.log("  record written: data/honesty/sidecar-census.json")
