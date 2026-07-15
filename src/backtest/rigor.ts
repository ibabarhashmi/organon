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
import { existsSync, readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { PKG_ROOT, FROZEN_PY, checkFrozenSet } from "../organon/frozen"

export namespace Rigor {
  const PY = path.join(import.meta.dir, "py", ".venv", "bin", "python")
  const SRC = path.join(import.meta.dir, "..") // cwd so `-m backtest.py.crosscheck` resolves

  // SUBSTANCE V38 (S116) — one leg of the PBO null distribution: the sampling mean/SD over pinned seeds and the z-distance.
  export interface NullDist {
    S: number
    nSeeds: number
    seedBase: number
    mean: number
    sd: number
    empiricalSe: number
    ci95: [number, number]
    z: number
  }

  export interface CrossCheck {
    executed: true
    dsr: number
    dsrPurgedcv: number
    dsrDiff: number
    dsrAgree: boolean
    psr: number
    pbo: number
    // ── DERIVATION V36 (S101) — the cross-check WHOLE: PSR and PBO now cross-checked against the SAME purgedcv oracle ────
    psrPurgedcv: number
    psrDiff: number
    pboPurgedcv: number
    pboDiff: number
    // ── SOCKET V37 (S110/DD-25) — PBO CORRECTNESS: the non-shared oracle (own Sharpe) + the pinned theory expectation ─────
    pboHandRolled: number
    pboHandRolledDiff: number
    pboTheoryUnderNoise: number
    pboVsTheory: number
    // ── SUBSTANCE V38 (S116/DD-33/RP-1) — THE POWER FIX: the null-distribution over pinned seeds at the underpowered S=8 and
    // the adequately-powered S=16. The theory leg (V38) tests the POWERED estimate (nullDistS16.mean) with a z, not a single
    // low-power draw; the S=8 result is preserved. Optional (older records / the harness without it read pbo as before).
    s116PowerFix?: {
      s8Legacy: { pbo: number; S: number; note: string }
      poweredS16Single: { pbo: number; S: number; note: string }
      nullDistS8: NullDist
      nullDistS16: NullDist
      theoryUnderNoise: number
      band: number
      toleranceUnchanged: number
      sInsideFrozenSet: boolean
      note: string
    }
    cscvAlignment: { S: number; metric: string; split: string; purge: string; embargo: string; matrixOrientation: string; comparable: boolean }
    dataset: { kind: string; tier: string; trueSharpe: number; note: string }
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

  // ── RECKONING V44 (DD-88, S192) — THE CORRECTNESS LEG of the D33 audit. The V38-B five-class autopsy (mathredteam.py,
  // committed to math-redteam.json) is READ, and the frozen rigor.py is re-verified byte-identical to the sha the autopsy ran
  // against. The autopsy found 0 BREAK; audit() confirms that result STILL holds at 0 drift — because the frozen code has not
  // moved, the 0-break finding carries (the correctness is a property of the code, and the code is byte-frozen). A single BREAK
  // in the committed ledger, OR a frozen-sha mismatch (the code moved since the autopsy), flips implementation SOUND → NOT-SOUND
  // and the D33 verdict to NOT-SIGNABLE-implementation-defect. Pure: reads two committed artifacts, no network, no sidecar. ──
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  export interface Audit {
    breakCount: number
    classes: string[] // the attack classes the autopsy ran (known-answer, property, degenerate, adversarial, null-distribution)
    assumptionLimits: number
    theoryGaps: number
    clean: number
    total: number
    frozenDrift: boolean // any frozen byte moved (checkFrozenSet)
    rigorShaMatches: boolean // the current rigor.py sha === the pinned sha (58c88843…) the autopsy ran against
    sound: boolean // 0 breaks AND rigor byte-identical AND no frozen drift — the implementation leg
    headline: string
    detail: string
  }
  export function audit(): Audit {
    let counts = { total: 0, BREAK: 0, "ASSUMPTION-LIMIT": 0, "THEORY-GAP": 0, clean: 0 }
    let classes: string[] = []
    let headline = "the autopsy ledger is absent (a pre-Surrogate checkout)"
    try {
      const rec = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "math-redteam.json"), "utf8")) as { ledger?: { counts?: typeof counts; findings?: { class: string }[]; headline?: string } }
      if (rec.ledger?.counts) counts = rec.ledger.counts
      classes = [...new Set((rec.ledger?.findings ?? []).map((f) => f.class))].sort()
      headline = rec.ledger?.headline ?? headline
    } catch { /* absent ledger → breakCount 0 unproven; sound=false below (rigorShaMatches may still hold) */ }
    // the current frozen rigor.py sha vs the pinned one the autopsy ran against
    const rigorBytes = (() => { try { return readFileSync(path.join(PKG_ROOT, "src", "backtest", "py", "rigor.py"), "utf8") } catch { return null } })()
    const rigorShaMatches = rigorBytes !== null && sha256(rigorBytes) === FROZEN_PY["rigor.py"]
    // the drift that BEARS on the maths audit is the frozen COMPUTATIONAL CORE (the 6 .py in FROZEN_PY) — NOT the RWA-verdict
    // doc or the gitignored snapshot manifest, which are honestly ABSENT in the standalone (not byte-drift). Scope to FROZEN_PY.
    const rows = checkFrozenSet() as unknown as { id: string; status: string }[]
    const pyIds = new Set(Object.keys(FROZEN_PY))
    const frozenDrift = Array.isArray(rows) ? rows.filter((r) => pyIds.has(r.id)).some((r) => r.status !== "ok") : true
    const breakCount = counts.BREAK
    const sound = breakCount === 0 && rigorShaMatches && !frozenDrift
    return {
      breakCount, classes, assumptionLimits: counts["ASSUMPTION-LIMIT"], theoryGaps: counts["THEORY-GAP"], clean: counts.clean, total: counts.total,
      frozenDrift, rigorShaMatches, sound, headline,
      detail: sound
        ? `implementation SOUND — ${breakCount} BREAK across ${classes.length} attack classes [${classes.join(", ")}] at 0 frozen drift (rigor.py byte-identical to the pinned sha the autopsy ran against); ${counts["ASSUMPTION-LIMIT"]} assumption-limits (each citing its assumption), ${counts["THEORY-GAP"]} theory-gaps — an assumption-limit is NOT a break (the √(n−1) i.i.d. limit is one of these, and DD-89 makes its correction the enforced default). The correctness leg holds.`
        : breakCount > 0
          ? `implementation NOT-SOUND — ${breakCount} BREAK found in the autopsy ledger; the D33 verdict flips to NOT-SIGNABLE-implementation-defect (a break is a defect in the code, not a limit of its application)`
          : !rigorShaMatches
            ? `implementation UNPROVEN — the current rigor.py sha ≠ the pinned sha the autopsy ran against (${FROZEN_PY["rigor.py"].slice(0, 12)}…); the frozen code moved since the autopsy, so the 0-break result no longer carries — re-run the autopsy`
            : `implementation UNPROVEN — the frozen set drifted; a frozen byte moved since the autopsy`,
    }
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
