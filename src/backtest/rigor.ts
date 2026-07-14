/**
 * ORGΛNON — THE REACH SPRINT (V35), S94: Rigor.crossCheck() — the frozen core's DSR/PSR/PBO cross-check, EXECUTED.
 *
 * X-REACH(b): a cross-check that does not execute is not a check. This runs the FROZEN `rigor` math against the
 * INDEPENDENT `purgedcv` oracle via the crosscheck.py harness (which reimplements nothing — src/backtest/py/crosscheck.py).
 * RP-2: NEVER vendored/stubbed/mocked/reimplemented. BLOCKED is a FIRST-CLASS result — if the venv or purgedcv is absent
 * (the studio-slim requirements ship numpy+scipy only; purgedcv is provisioned from requirements-crosscheck.txt), the
 * function returns { blocked: true, reason } with an ACTIONABLE sentence, and the S94 wall records the honest red — a
 * mocked green would be worse than an absent one (attack #2, the gravest available failure).
 */
import path from "node:path"
import { existsSync } from "node:fs"

export namespace Rigor {
  const PY = path.join(import.meta.dir, "py", ".venv", "bin", "python")
  const SRC = path.join(import.meta.dir, "..") // cwd so `-m backtest.py.crosscheck` resolves

  export interface CrossCheck {
    executed: true
    dsr: number
    dsrPurgedcv: number
    dsrDiff: number
    dsrAgree: boolean
    psr: number
    pbo: number
    deflationCollapse: number
    dsrMonotonic: boolean
    dsrByNTrials: { n10: number; n100: number; n1000: number }
    purgedcvVersion: string
    numpyVersion: string
    seed: number
    T: number
    nTrials: number
  }
  export interface Blocked {
    blocked: true
    reason: string // ONE actionable sentence — never dressed as coverage
  }

  // Execute the cross-check. Synchronous (used by a regenerator script + a wall). Never throws for a missing env —
  // an absent venv/purgedcv is a BLOCKED result, not a crash (the honest red X-REACH(b) requires).
  export function crossCheck(): CrossCheck | Blocked {
    if (!existsSync(PY))
      return { blocked: true, reason: "the sidecar venv is absent — run `./organon.sh setup` then `src/backtest/py/.venv/bin/pip install -r src/backtest/py/requirements-crosscheck.txt` to provision numpy+scipy+purgedcv" }
    const r = Bun.spawnSync([PY, "-m", "backtest.py.crosscheck"], {
      cwd: SRC,
      env: { ...process.env, PYTHONHASHSEED: "0" },
      stdout: "pipe",
      stderr: "pipe",
    })
    if (r.exitCode !== 0) {
      const err = r.stderr.toString()
      if (/No module named 'purgedcv'/.test(err))
        return { blocked: true, reason: "purgedcv is not installed in the sidecar venv — run `src/backtest/py/.venv/bin/pip install -r src/backtest/py/requirements-crosscheck.txt` (numpy+scipy+purgedcv==0.1.2); the studio-slim requirements ship numpy+scipy only" }
      return { blocked: true, reason: `the cross-check driver exited ${r.exitCode}: ${err.trim().split("\n").pop()?.slice(0, 300)}` }
    }
    return JSON.parse(r.stdout.toString()) as CrossCheck
  }

  export function isBlocked(x: CrossCheck | Blocked): x is Blocked {
    return (x as Blocked).blocked === true
  }

  // S94 is GREEN iff the cross-check EXECUTED and the frozen DSR agrees with the independent purgedcv reference.
  export function s94Green(x: CrossCheck | Blocked): boolean {
    return !isBlocked(x) && x.executed === true && x.dsrAgree === true
  }

  // D33's STRUCTURAL PRECONDITION (X-REACH(b)): the countersign package may present D33 as SIGNABLE only while S94 is
  // green. This is not advice to the Operator — it is a wall. A red S94 (BLOCKED cross-check, or a disagreement) makes
  // D33 UNSIGNABLE regardless. NOTE the separate, stronger invariant: LN5 — the AGENT never signs it; signable here
  // means "the pen MAY be offered", and operatorSigned stays false in the pins whether or not the precondition holds.
  export function d33Signable(x: CrossCheck | Blocked): { signable: boolean; reason: string } {
    if (isBlocked(x)) return { signable: false, reason: `D33 UNSIGNABLE — S94 is red (the cross-check did not execute): ${x.reason}` }
    if (!x.dsrAgree) return { signable: false, reason: `D33 UNSIGNABLE — S94 is red (the frozen DSR ${x.dsr.toFixed(6)} disagrees with purgedcv ${x.dsrPurgedcv.toFixed(6)}, |Δ|=${x.dsrDiff.toExponential(2)} ≥ 0.02)` }
    return { signable: true, reason: "the precondition is met (S94 green: the cross-check executed and agrees) — the pen MAY be offered; the agent still never signs it (LN5)" }
  }
}
