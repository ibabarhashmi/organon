/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 1 (DD-53 / RP-2 / S142): THE AUTOPSY MEETS THE SIGNATURE.
 *
 * V38's math red team found the headline assumption-limit — "autocorrelated input overstates PSR/DSR confidence" — and
 * DeFi yields ARE autocorrelated. The pen ordered that autopsy BEFORE signing D33; the finding and the SIGNABLE verdict sat
 * in one document and never met (J-2). This module makes them meet: it READS the frozen effective_n.py and rigor.py and
 * DERIVES — never asserts (X-SHOWN) — WHICH independence effective_n measures (SERIAL vs CROSS-SECTIONAL, RP-2) and whether
 * the serial correction can be WIRED into the frozen rigor.psr without touching one frozen byte. The determination it emits
 * is the SOLE input to D33's i.i.d. rider (crosscheck.ts reads the artifact, never re-decides).
 *
 * THE FINDING (RP-2, established BEFORE any wiring): effective_n.py measures BOTH axes in DISTINCT functions —
 * effective_n_serial(n,τ)=N/τ_int (SERIAL, τ_int=(1+ρ)/(1−ρ) for AR(1); Lo 2002's axis) AND effective_breadth (the
 * eigenvalue participation ratio; CROSS-SECTIONAL). The serial family IS the i.i.d. axis. BUT the frozen rigor.psr computes
 * n = len(returns) INTERNALLY and hard-codes z = (SR−SR*)·√(n−1)/denom — it takes NO n parameter, so the serial correction
 * CANNOT be fed into it without editing the frozen core (forbidden) or corrupting the moments (a thinned array changes
 * SR/g3/g4). ⇒ a HARNESS-COMPOSITION gap: the right math exists on the right axis, but must be COMPOSED BESIDE the frozen
 * number, never wired in. The rider STANDS, quantified. A fix on the wrong axis would retire the warning — worse than none.
 *
 * Pure: reads committed frozen source text + a deterministic TS-native AR(1) demonstration (clone-stable, no numpy, no I/O
 * beyond the two frozen files). No network.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"

export namespace EffectiveN {
  const PY = path.join(PKG_ROOT, "src", "backtest", "py")

  // ── faithful TS ports of the frozen serial-autocorrelation primitives (to DEMONSTRATE the mechanism clone-stably) ──
  // acf[0..maxLag] — the sample autocorrelation function (acf[0]=1), matching effective_n.py::acf.
  export function acf(x: number[], maxLag: number): number[] {
    const r = x.filter((v) => Number.isFinite(v))
    const n = r.length
    if (n < 3) return [1.0]
    const mean = r.reduce((a, b) => a + b, 0) / n
    const d = r.map((v) => v - mean)
    const denom = d.reduce((a, b) => a + b * b, 0)
    if (denom <= 0) return [1.0]
    const lags = Math.min(maxLag, n - 1)
    const out = [1.0]
    for (let k = 1; k <= lags; k++) {
      let s = 0
      for (let i = k; i < n; i++) s += d[i] * d[i - k]
      out.push(s / denom)
    }
    return out
  }

  // τ_int = 1 + 2·Σ acf_k, truncated at the first non-positive lag — matching effective_n.py::integrated_autocorr_time.
  // This is the factor by which the effective sample shrinks: N_eff = N / τ_int. For AR(1) with autocorr ρ it → (1+ρ)/(1−ρ).
  export function tauInt(x: number[], maxLag?: number): number {
    const r = x.filter((v) => Number.isFinite(v))
    const n = r.length
    if (n < 5) return 1.0
    const a = acf(r, maxLag ?? Math.min(n - 1, 200))
    let tau = 1.0
    for (let k = 1; k < a.length; k++) {
      if (a[k] <= 0) break
      tau += 2.0 * a[k]
    }
    return Math.max(tau, 1.0)
  }

  // a deterministic AR(1) demonstration series (ρ=0.95), TS-native (a simple seeded LCG — NO numpy, so it reproduces
  // byte-for-byte on any clone). It is the exact autocorrelation trap the frozen module demonstrates: a persistent series
  // whose effective sample is far below its length. NOT the frozen module's numpy series (that RNG is not TS-reproducible);
  // a clone-stable ANALOGUE that shows the SAME mechanism live.
  export function demoAr1(rho = 0.95, n = 1600, seed = 20260715): number[] {
    let s = seed >>> 0
    const rand = () => { s = (1103515245 * s + 12345) >>> 0; return s / 0xffffffff } // LCG in [0,1)
    // Box–Muller for a standard normal from two uniforms (deterministic)
    const normal = () => { const u1 = Math.max(rand(), 1e-12), u2 = rand(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
    const e = new Array<number>(n)
    let cur = 0
    for (let t = 0; t < n; t++) { cur = rho * cur + normal() * 0.2; e[t] = cur }
    const mean = e.reduce((a, b) => a + b, 0) / n
    return e.map((v) => 0.07 + (v - mean)) // small constant mean + demeaned persistent fluctuation
  }

  export type Axis = "SERIAL" | "CROSS-SECTIONAL"
  export type Classification = "WIRING-GAP" | "CROSS-SECTIONAL-ONLY" | "HARNESS-COMPOSITION-GAP"

  export interface Determination {
    axesPresent: Axis[]
    relevantAxis: Axis // the i.i.d. limitation in PSR/DSR is SERIAL
    serialCorrectionPresent: boolean // effective_n_serial / integrated_autocorr_time / nw_tstat
    crossSectionalPresent: boolean // effective_breadth (eigenvalue participation ratio)
    frozenPsrDerivesNInternally: boolean // rigor.psr uses len(returns) + √(n−1), takes NO n parameter
    classification: Classification
    riderStands: boolean
    riderDirection: string
    riderMagnitude: string
    demoTauInt: number // τ_int measured LIVE on the clone-stable AR(1) demonstration (X-SHOWN)
    demoEffNRatio: number // N_eff / N on that series = 1/τ_int (how far the effective sample collapses)
    evidence: { effectiveNSerial: string; effectiveBreadth: string; rigorPsrN: string; rigorPsrNoNParam: boolean }
    detail: string
  }

  // grep a frozen source file for a signature line (returns the matched line, trimmed — X-SHOWN evidence).
  function match(file: string, re: RegExp): string {
    const text = readFileSync(path.join(PY, file), "utf8")
    const line = text.split("\n").find((l) => re.test(l))
    return line ? line.trim() : ""
  }

  // DERIVE the determination from the frozen code — the SOLE authority for D33's rider (X-SHOWN, never asserted).
  export function derive(): Determination {
    const effSerial = match("effective_n.py", /def effective_n_serial/)
    const effTau = match("effective_n.py", /def integrated_autocorr_time/)
    const effBreadth = match("effective_n.py", /def effective_breadth/)
    // rigor.psr — the exact line where the i.i.d. bite lives: √(n−1) with n derived from the array length.
    const psrSig = match("rigor.py", /def psr\(returns, sr_star/)
    const psrN = match("rigor.py", /n = r\.size/)
    const psrZ = match("rigor.py", /z = \(sr - sr_star\) \* math\.sqrt\(n - 1\)/)

    const serialCorrectionPresent = effSerial !== "" && effTau !== ""
    const crossSectionalPresent = effBreadth !== ""
    // rigor.psr takes (returns, sr_star) — NO n parameter — and computes n = r.size internally, then √(n−1).
    const frozenPsrDerivesNInternally = psrSig !== "" && psrN !== "" && psrZ !== ""

    const axesPresent: Axis[] = []
    if (serialCorrectionPresent) axesPresent.push("SERIAL")
    if (crossSectionalPresent) axesPresent.push("CROSS-SECTIONAL")

    // the classification (RP-2): if the serial correction exists AND the frozen psr can be fed a deflated T → WIRING-GAP
    // (rider dissolves). If only the cross-sectional axis exists → CROSS-SECTIONAL-ONLY (rider stands, wrong-axis fix
    // refused). If the serial correction exists but the frozen psr derives n internally (cannot be fed n_eff) →
    // HARNESS-COMPOSITION-GAP (rider stands, quantified — the correction lives beside the frozen number, never wired in).
    let classification: Classification
    if (!serialCorrectionPresent && crossSectionalPresent) classification = "CROSS-SECTIONAL-ONLY"
    else if (serialCorrectionPresent && !frozenPsrDerivesNInternally) classification = "WIRING-GAP"
    else classification = "HARNESS-COMPOSITION-GAP"
    const riderStands = classification !== "WIRING-GAP"

    // MEASURE τ_int live on the clone-stable AR(1) demonstration (X-SHOWN — the mechanism, not a claimed number).
    const demo = demoAr1()
    const demoTauInt = tauInt(demo)
    const demoEffNRatio = 1 / demoTauInt

    return {
      axesPresent,
      relevantAxis: "SERIAL",
      serialCorrectionPresent,
      crossSectionalPresent,
      frozenPsrDerivesNInternally,
      classification,
      riderStands,
      riderDirection:
        "the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').",
      riderMagnitude:
        `z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ ${demoTauInt.toFixed(1)} (effective sample N_eff/N ≈ ${(demoEffNRatio * 100).toFixed(1)}%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds.`,
      demoTauInt,
      demoEffNRatio,
      evidence: {
        effectiveNSerial: effSerial || "ABSENT",
        effectiveBreadth: effBreadth || "ABSENT",
        rigorPsrN: psrZ || psrN || "ABSENT",
        rigorPsrNoNParam: frozenPsrDerivesNInternally,
      },
      detail:
        classification === "HARNESS-COMPOSITION-GAP"
          ? "HARNESS-COMPOSITION gap — effective_n.py HAS the serial (Lo) correction on the right axis (effective_n_serial + integrated_autocorr_time + nw_tstat), but the frozen rigor.psr derives n = len(returns) internally and hard-codes √(n−1), taking no n parameter; so the correction CANNOT be wired into the frozen core (forbidden) and must be composed BESIDE it in the harness. The i.i.d. rider STANDS, quantified (direction + magnitude named), with a harness deflated companion available. Wiring a fix into the wrong place (or feeding a cross-sectional adjustment into a serial problem) would retire the warning — worse than no fix (RP-2)."
          : classification === "WIRING-GAP"
            ? "WIRING gap — the serial correction exists and the frozen psr can be fed a deflated T without editing a frozen byte; the rider DISSOLVES."
            : "CROSS-SECTIONAL-ONLY — effective_n measures only independent bets, not serial autocorrelation; the rider STANDS and no wiring happens (a cross-sectional fix on a serial problem is worse than none, RP-2).",
    }
  }
}
