/**
 * ORGΛNON — THE RECKONING SPRINT wall S83 (THE SIDECAR COVERAGE CENSUS). The census makes the difference between a green
 * battery that is HEALTHY and one that is merely NON-COVERAGE visible: it enumerates every sidecar-invoking test, records the
 * venv Python version + a runtime canary, and states BLOCKED honestly when the venv is absent. A green battery that never
 * touches the sidecar must SAY SO.
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const census = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "sidecar-census.json"), "utf8"))
const VENV_PY = path.join(PKG_ROOT, "src", "backtest", "py", ".venv", "bin", "python")

test("S83 — the census is present + honest: it NAMES the sidecar-invoking tests and states the venv mandate (Python 3.11.x)", () => {
  expect(census.protocol).toBe("sidecar-census")
  expect(census.sidecarTestsNamed).toBeGreaterThan(0)
  expect(census.sidecarTests.length).toBe(census.sidecarTestsNamed)
  expect(census.venvMandate).toBe("3.11.x")
  // the census states one of the two honest states — coverage (venv present) or BLOCKED (venv absent), never silent
  expect(census.honestNote).toMatch(/EXECUTE|BLOCKED/i)
})

test("S83 — if the venv is present it MEETS the 3.11 mandate and the runtime canary imports numpy+scipy (coverage, not silence)", () => {
  if (!existsSync(VENV_PY)) {
    // a fresh clone without the venv: the census must SAY it is blocked (never dress non-coverage as health)
    expect(census.honestNote).toMatch(/BLOCKED|ABSENT/i)
    return
  }
  // the venv is present → it must meet the mandate, and a live canary confirms the interpreter actually executes
  const r = spawnSync(VENV_PY, ["-c", "import numpy, scipy, sys; print(sys.version.split()[0])"], { encoding: "utf8", timeout: 60_000 })
  expect(r.status).toBe(0)
  expect(r.stdout.trim()).toMatch(/^3\.11\./) // the mandated interpreter
  expect(census.venvMeetsMandate).toBe(true)
  expect(census.canary.ok).toBe(true)
})
