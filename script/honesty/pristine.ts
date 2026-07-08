/**
 * ORGΛNON — the Honesty Layer PRISTINE fresh-clone proof (PART E, E.4; Rule U-PRISTINE). Clone-from-nothing: an
 * isolated temp HOME, no inherited venv, a fresh clone → the battery green. The honesty layer is clone-robust by
 * construction — the gitignored snapshot payloads are ABSENT on a clone, so every shown value falls back to the honest
 * SAMPLE label (→ UNVERIFIED), never a mislabeled REAL. The POSITIVE CONTROL proves the isolation is real: WITHOUT the
 * venv a sidecar test FAILS (no inherited venv is used). Run: bun run script/honesty/pristine.ts
 */
import { mkdtempSync, writeFileSync, existsSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

function run(cmd: string[], opts: { cwd?: string; env?: Record<string, string> } = {}): { code: number; out: string } {
  const r = Bun.spawnSync(cmd, { cwd: opts.cwd, env: { ...process.env, ...opts.env }, stdout: "pipe", stderr: "pipe" })
  return { code: r.exitCode, out: (r.stdout?.toString() ?? "") + (r.stderr?.toString() ?? "") }
}

const tmp = mkdtempSync(path.join(os.tmpdir(), "honesty-pristine-"))
const HOME = mkdtempSync(path.join(os.tmpdir(), "honesty-home-")) // an ISOLATED HOME — no inherited configs/venvs
const clone = path.join(tmp, "clone")
const isoEnv = { HOME, XDG_DATA_HOME: path.join(HOME, ".local", "share"), NO_COLOR: "1" }

run(["git", "clone", "-q", PKG_ROOT, clone])
run(["git", "checkout", "-q", "v0"], { cwd: clone })
const install = run(["bun", "install"], { cwd: clone, env: isoEnv })

// POSITIVE CONTROL: WITHOUT the venv, a sidecar-dependent test FAILS (proves no inherited venv is used)
const pyDir = path.join(clone, "src", "backtest", "py")
const venvPath = path.join(pyDir, ".venv", "bin", "python")
const control = run(["bun", "test", "--timeout", "30000", "test/organon/goal_console.test.ts"], { cwd: clone, env: isoEnv })
const controlFailedAsExpected = !existsSync(venvPath) && /fail|error|posix_spawn/i.test(control.out)

// create the venv FRESH (the standalone path — no parent-dir fallback)
run(["python3", "-m", "venv", ".venv"], { cwd: pyDir, env: isoEnv })
run([path.join(pyDir, ".venv", "bin", "pip"), "install", "-q", "numpy", "scipy"], { cwd: pyDir, env: isoEnv })
const venvCreated = existsSync(venvPath)

// the PRISTINE battery: setup-to-battery green FROM NOTHING (honesty layer clone-robust — SAMPLE where payloads absent)
const battery = run(["bash", "organon-studio-test.sh"], { cwd: clone, env: isoEnv })
// match pass / fail INDEPENDENTLY — a skipped test (the Operator-gated live-AI test, skipped offline) prints a " N skip"
// line BETWEEN pass and fail, so a `pass\s+fail` regex would misparse (W-P03, the build-evidence fix, in this 2nd site)
const pm = battery.out.match(/(\d+)\s+pass\b/)
const fm = battery.out.match(/(\d+)\s+fail\b/)
const pass = pm ? Number(pm[1]) : -1
const fail = fm ? Number(fm[1]) : -1
const green = fail === 0 && pass > 0

const out = {
  protocol: "pristine-honesty", at: "2026-07-09",
  rule: "U-PRISTINE — isolated HOME, no inherited venv, fresh clone; the honesty layer is clone-robust (SAMPLE where the gitignored payloads are absent)",
  installOk: install.code === 0,
  positiveControl: { withoutVenvSidecarFails: controlFailedAsExpected },
  venvCreatedFresh: venvCreated,
  battery: { pass, fail, green },
  pristineGreen: install.code === 0 && controlFailedAsExpected && venvCreated && green,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "pristine-honesty.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`install ${install.code === 0} · control(no-venv→fail) ${controlFailedAsExpected} · venv ${venvCreated} · battery ${pass}/${fail} (green=${green})`)
console.log(`PRISTINE GREEN: ${out.pristineGreen} · written data/honesty/pristine-honesty.json`)
run(["rm", "-rf", tmp, HOME])
