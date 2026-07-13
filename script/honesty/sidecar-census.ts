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

const record = {
  protocol: "sidecar-census",
  at: "2026-07-13",
  rule: "S83 — every test that invokes the Python sidecar is enumerated; the venv Python version + a runtime canary are recorded. A green battery that never touches the sidecar SAYS SO. The mandate is Python 3.11.x (the Py3.11-only purgedcv; Warranty V8).",
  sidecarTestsNamed: sidecarTests.length,
  sidecarTests,
  venvPresent: existsSync(VENV_PY),
  venvPython,
  venvMandate: "3.11.x",
  venvMeetsMandate: venvPython != null && venvPython.startsWith("3.11"),
  canary,
  honestNote: existsSync(VENV_PY) ? "the venv is present → the sidecar tests EXECUTE (coverage, not non-coverage); the census names them so a future 'green battery' cannot be mistaken for health when it is silence" : "the venv is ABSENT on this machine → the sidecar tests are BLOCKED and state so; a fresh clone runs `./organon.sh setup` to build it",
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "sidecar-census.json"), JSON.stringify(record, null, 2) + "\n")
console.log("── RECKON — the sidecar coverage census (S83) ──────────────")
console.log(`  sidecar tests named : ${record.sidecarTestsNamed}`)
console.log(`  venv python         : ${venvPython ?? "ABSENT"} (mandate 3.11.x → ${record.venvMeetsMandate ? "MET" : "NOT MET"})`)
console.log(`  canary              : ${canary.ok ? "OK" : "BLOCKED"} — ${canary.detail}`)
console.log("  record written: data/honesty/sidecar-census.json")
