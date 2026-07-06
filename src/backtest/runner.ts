import path from "node:path"
import { buffer } from "node:stream/consumers"
import { Process } from "../util/process"

// Backtest runner — the TS<->Python sidecar bridge (STANDALONE SLIM). This is the transplant's ONE fix-forward to the
// verdict path: the studio verdict path uses ONLY `Runner.sidecar` (rigor / attest / lending_accrual), whose `spawn`
// body is preserved BYTE-FAITHFUL from the monorepo (same PYTHONHASHSEED, timeout, JSON-in/JSON-out, error surfacing),
// so verdicts are byte-identical. The monorepo runner ADDITIONALLY carries the real-data RWA backtest
// (accrualEquity / commonWindow / buildJob) + strategy_run persistence, which import the marketdata / risk / universe /
// storage engine infra (and, through storage/db → the OpenCode 12-table schema → @solidity-sentinel/* sibling
// packages). That whole real-data engine layer is a DATA-PLANE concern NOT transplanted to the standalone — it is
// PARKED (see the parks register), and its absence is honest (the standalone has no PIT cache), never faked. Slimming
// here is what lets Organon live at its own address without dragging the editor's guts along.
export namespace Runner {
  const PY = path.join(import.meta.dir, "py/.venv/bin/python")
  const SRC = path.join(import.meta.dir, "..") // cwd so `-m backtest.py.X` resolves

  async function spawn(module: string, payload: unknown): Promise<any> {
    const proc = Process.spawn([PY, "-m", `backtest.py.${module}`], {
      cwd: SRC,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120_000,
      // pin Python hash seed so set-iteration order is fixed → cost summation is bit-stable across runs (determinism
      // hardening only; no formula changes). Preserved byte-for-byte from the monorepo runner.
      env: { PYTHONHASHSEED: "0" },
    })
    if (!proc.stdin || !proc.stdout || !proc.stderr) throw new Error(`sidecar ${module}: pipes unavailable`)
    proc.stdin.write(JSON.stringify(payload))
    proc.stdin.end()
    const [code, out, err] = await Promise.all([proc.exited, buffer(proc.stdout), buffer(proc.stderr)])
    if (code !== 0) {
      // surface the failure — never swallow it
      throw new Error(`sidecar ${module} failed (exit ${code}): ${err.toString().trim().slice(0, 2000)}`)
    }
    return JSON.parse(out.toString())
  }

  export async function sidecar(module: string, payload: unknown): Promise<any> {
    return spawn(module, payload)
  }
}
