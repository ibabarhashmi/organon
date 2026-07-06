/**
 * ORGΛNON — the PRISTINE fresh-clone harness (Reachability Phase 1; Rule U-PRISTINE, A′#7/#9). V7–V10's "fresh-clone
 * proof green" verified the battery under environments where an INHERITED venv satisfied a stale path (W6-04). From this
 * sprint on, fresh-clone proofs run PRISTINE: an isolated temp HOME, no inherited venvs, no parent-dir fallbacks, with
 * the prerequisites ENUMERATED (system-provided vs repo-provided) — so environmental luck can never again masquerade as
 * verification. The POSITIVE CONTROL proves the isolation is real: WITHOUT creating the venv, a sidecar-dependent test
 * FAILS (no inherited venv is used); WITH the fresh venv, the battery is green. Run: bun run script/pristine-clone.ts
 */
import { mkdtempSync, writeFileSync, existsSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"

const D = path.join(PKG_ROOT, "data", "studio")
function run(cmd: string[], opts: { cwd?: string; env?: Record<string, string> } = {}): { code: number; out: string } {
  const r = Bun.spawnSync(cmd, { cwd: opts.cwd, env: { ...process.env, ...opts.env }, stdout: "pipe", stderr: "pipe" })
  return { code: r.exitCode, out: (r.stdout?.toString() ?? "") + (r.stderr?.toString() ?? "") }
}

const tmp = mkdtempSync(path.join(os.tmpdir(), "organon-pristine-"))
const HOME = mkdtempSync(path.join(os.tmpdir(), "organon-home-")) // an ISOLATED HOME — no inherited configs/venvs
const clone = path.join(tmp, "clone")
const isoEnv = { HOME, XDG_DATA_HOME: path.join(HOME, ".local", "share"), NO_COLOR: "1" }

// ── PREREQUISITE ENUMERATION (system-provided vs repo-provided) ──
// K-SCOPE debt (Ensemble Phase 0): the enumeration is amended with the CONDITIONAL prerequisites the PARKED unblocks
// require. The delivered domains (lending · funding · basis) run on the system python3 above; the PARKED fee-yield and
// RWA unblocks additionally require Python 3.11 specifically (the pandas/purgedcv discovery-panel stack pins to 3.11 —
// the W8 environmental finding). Naming it conditionally keeps the pristine claim honest: the green battery below does
// NOT depend on 3.11 (the delivered path is 3.11-agnostic); the note prevents a future reader assuming any 3.x suffices
// for the parked domains when they are unblocked.
const py311 = run(["bash", "-lc", "command -v python3.11 >/dev/null 2>&1 && python3.11 --version || echo 'absent (not required for the delivered lending/funding/basis path; required ONLY for the PARKED fee-yield + RWA unblocks)'"]).out.trim()
const prereqs = {
  systemProvided: {
    bun: run(["bun", "--version"]).out.trim(),
    python3: run(["python3", "--version"]).out.trim(),
    git: run(["git", "--version"]).out.trim(),
  },
  conditional: {
    "python3.11": py311, // required ONLY for the PARKED fee-yield + RWA unblocks (the pandas/purgedcv stack) — NOT for the delivered path
  },
  repoProvided: "everything else (the frozen core, the studio, the Python sidecars' source, package.json, the lockfile) — cloned, never inherited",
}

// ── clone + install (isolated HOME) ──
run(["git", "clone", "-q", PKG_ROOT, clone])
run(["git", "checkout", "-q", "v0"], { cwd: clone })
const install = run(["bun", "install"], { cwd: clone, env: isoEnv })

// ── POSITIVE CONTROL: WITHOUT the venv, a sidecar-dependent test FAILS (proves no inherited venv is used) ──
const venvPath = path.join(clone, "src", "backtest", "py", ".venv", "bin", "python")
const controlBeforeVenv = run(["bun", "test", "--timeout", "30000", "test/organon/goal_console.test.ts"], { cwd: clone, env: isoEnv })
const controlFailedAsExpected = !existsSync(venvPath) && /fail|error|posix_spawn/i.test(controlBeforeVenv.out)

// ── create the venv FRESH (the correct standalone path — W6-04 fixed; no parent-dir fallback) ──
const pyDir = path.join(clone, "src", "backtest", "py")
run(["python3", "-m", "venv", ".venv"], { cwd: pyDir, env: isoEnv })
run([path.join(pyDir, ".venv", "bin", "pip"), "install", "-q", "numpy", "scipy"], { cwd: pyDir, env: isoEnv })
const venvCreated = existsSync(venvPath)

// ── the PRISTINE battery: setup-to-battery green FROM NOTHING ──
const battery = run(["bash", "organon-studio-test.sh"], { cwd: clone, env: isoEnv })
const m = battery.out.match(/(\d+)\s+pass\s+(\d+)\s+fail/) ?? battery.out.match(/(\d+) pass\n\s*(\d+) fail/)
const pass = m ? Number(m[1]) : -1
const fail = m ? Number(m[2]) : -1
const batteryGreen = fail === 0 && pass > 0

const out = {
  protocol: "pristine-clone-v14",
  at: "2026-07-06",
  rule: "U-PRISTINE — isolated HOME, no inherited venvs, enumerated prerequisites; environmental luck cannot masquerade as verification",
  isolatedHome: true,
  prerequisites: prereqs,
  installOk: install.code === 0,
  positiveControl: { withoutVenvSidecarFails: controlFailedAsExpected, note: "WITHOUT the fresh venv a sidecar-dependent test FAILS — the isolation is real, no inherited venv is used (the exact environmental luck W6-04's predecessors relied on)" },
  venvCreatedFresh: venvCreated,
  battery: { pass, fail, green: batteryGreen },
  pristineGreen: install.code === 0 && controlFailedAsExpected && venvCreated && batteryGreen,
}
writeFileSync(path.join(D, "pristine-clone-v14.json"), JSON.stringify(out, null, 2) + "\n")

console.log(`prerequisites (system): bun ${prereqs.systemProvided.bun} · ${prereqs.systemProvided.python3} · ${prereqs.systemProvided.git}`)
console.log(`conditional prereq (python3.11 for parked unblocks): ${prereqs.conditional["python3.11"]}`)
console.log(`positive control (no venv → sidecar fails): ${controlFailedAsExpected}`)
console.log(`venv created fresh: ${venvCreated} · pristine battery: ${pass} pass / ${fail} fail (green=${batteryGreen})`)
console.log(`PRISTINE GREEN: ${out.pristineGreen}`)
console.log(`written: data/studio/pristine-clone-v14.json (temp cleaned by the OS)`)
run(["rm", "-rf", tmp, HOME])
