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

  // ── RECKONING V44 (DD-89, RP-3) — THE N_eff CORRECTION, COMPOSED IN THE HARNESS. The frozen rigor.psr hard-codes √(n−1)
  // over the raw observation count — valid for i.i.d. returns, WRONG for autocorrelated ones. This composes the correction
  // BESIDE the frozen number (effective_n.py + rigor.py are READ, never edited): N_eff = clamp(n/τ_int, [1,n]), and √(N_eff−1)
  // replaces √(n−1) in the PSR z-score. τ_int uses the windowed/tapered estimator (tauInt above truncates at the first
  // non-positive lag — the Sokal automatic window). RP-3: N_eff is CLAMPED to [1,n] (a noisy negative ρ_k cannot drive it
  // above n or the denominator negative), and where the series is too short to estimate τ_int stably (< SHORT_SAMPLE_FLOOR),
  // N_eff is UNJUDGEABLE and the caller (the Stamp) renders INSUFFICIENT — the short-sample case fails safe toward caution. ──
  export const SHORT_SAMPLE_FLOOR = 30 // below this, τ_int cannot be estimated stably → N_eff UNJUDGEABLE → Stamp INSUFFICIENT

  // the standard-normal CDF via a deterministic erf (Abramowitz–Stegun 7.1.26, |error| < 1.5e-7) — clone-stable, no numpy.
  // Φ(z) = 0.5·(1 + erf(z/√2)). Enough precision to compare a PSR to the 0.95 bar.
  export function normalCdf(z: number): number {
    const sign = z < 0 ? -1 : 1
    const x = Math.abs(z) / Math.SQRT2
    const t = 1 / (1 + 0.3275911 * x)
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
    return 0.5 * (1 + sign * y)
  }

  export interface Serial {
    n: number
    tauInt: number // the integrated autocorrelation time (windowed at the first non-positive lag)
    nEff: number // clamp(n/τ_int, [1,n]) — the effective sample size under autocorrelation
    lagWindow: number // the lag at which the τ_int sum truncated (the Sokal automatic window)
    acfHead: number[] // the first few ρ_k (rendered so the estimate is auditable — RP-3)
    stable: boolean // n ≥ SHORT_SAMPLE_FLOOR AND τ_int finite AND nEff in [1,n] — else UNJUDGEABLE
    detail: string
  }
  // EffectiveN.serial(returns) — τ_int + N_eff, windowed + clamped + stability-flagged (RP-3). The decisive application-leg
  // instrument: on the AR(1) demonstration (τ_int ≈ 36), N_eff collapses to ≈ n/36; on a near-white series (τ_int ≈ 1), N_eff ≈ n.
  export function serial(returns: number[]): Serial {
    const r = returns.filter((v) => Number.isFinite(v))
    const n = r.length
    const a = acf(r, Math.min(Math.max(n - 1, 1), 200))
    // the windowed τ_int (matching tauInt: truncate at the first non-positive lag — the Sokal automatic window)
    let tau = 1.0
    let lagWindow = 0
    for (let k = 1; k < a.length; k++) {
      if (a[k] <= 0) { lagWindow = k; break }
      tau += 2.0 * a[k]
      lagWindow = k
    }
    tau = Math.max(tau, 1.0)
    const nEffRaw = tau > 0 ? n / tau : n
    const nEff = Math.min(Math.max(nEffRaw, 1), n) // RP-3 clamp to [1,n]
    const stable = n >= SHORT_SAMPLE_FLOOR && Number.isFinite(tau) && nEff >= 1 && nEff <= n
    return {
      n, tauInt: tau, nEff, lagWindow, acfHead: a.slice(0, Math.min(6, a.length)),
      stable,
      detail: stable
        ? `n ${n} · τ_int ${tau.toFixed(2)} (windowed at lag ${lagWindow}) · N_eff ${nEff.toFixed(1)} (${((nEff / n) * 100).toFixed(1)}% of n) — the effective sample under autocorrelation`
        : n < SHORT_SAMPLE_FLOOR
          ? `n ${n} < ${SHORT_SAMPLE_FLOOR} — too short to estimate τ_int stably; N_eff is UNJUDGEABLE (the Stamp renders INSUFFICIENT, never GO on a naive n — RP-3 fail-safe)`
          : `N_eff unstable (τ_int ${tau}, N_eff ${nEff}) — UNJUDGEABLE`,
    }
  }

  export interface PsrAtNeff {
    n: number
    nEff: number
    tauInt: number
    sr: number
    psrNaive: number // Φ((SR−SR*)·√(n−1)/denom) — the frozen formula, reproduced in TS (validated against the closed form)
    psrCorrected: number // Φ((SR−SR*)·√(N_eff−1)/denom) — the N_eff correction, always ≤ psrNaive on autocorrelated input
    judgeable: boolean // the serial estimate is stable — else the corrected PSR is not to be trusted (Stamp → INSUFFICIENT)
    detail: string
  }
  // EffectiveN.psrAtNeff(returns, srStar) — the frozen PSR z-score with √(N_eff−1) instead of √(n−1), composed in the harness.
  // The moments (sr via ddof=1 std; g3 biased skew; g4 biased non-excess kurtosis) match rigor.psr EXACTLY, so psrNaive
  // reproduces the frozen number and psrCorrected is the honest deflation. A frozen-core edit is NOT required and is FORBIDDEN.
  export function psrAtNeff(returns: number[], srStar = 0): PsrAtNeff {
    const r = returns.filter((v) => Number.isFinite(v))
    const n = r.length
    const s = serial(r)
    if (n < 3) return { n, nEff: s.nEff, tauInt: s.tauInt, sr: 0, psrNaive: NaN, psrCorrected: NaN, judgeable: false, detail: "n < 3 — PSR undefined" }
    const mu = r.reduce((x, y) => x + y, 0) / n
    const varDdof1 = r.reduce((x, y) => x + (y - mu) ** 2, 0) / (n - 1)
    const std1 = Math.sqrt(varDdof1)
    const sr = std1 === 0 ? 0 : mu / std1
    // biased central moments (ddof=0) — scipy.stats.skew / kurtosis(fisher=False), matching the frozen rigor.psr
    const m2 = r.reduce((x, y) => x + (y - mu) ** 2, 0) / n
    const m3 = r.reduce((x, y) => x + (y - mu) ** 3, 0) / n
    const m4 = r.reduce((x, y) => x + (y - mu) ** 4, 0) / n
    const g3 = m2 > 0 ? m3 / m2 ** 1.5 : 0
    const g4 = m2 > 0 ? m4 / m2 ** 2 : 3
    const denom = Math.sqrt(Math.max(1.0 - g3 * sr + ((g4 - 1.0) / 4.0) * sr * sr, 1e-12))
    const zNaive = ((sr - srStar) * Math.sqrt(Math.max(n - 1, 0))) / denom
    const zCorr = ((sr - srStar) * Math.sqrt(Math.max(s.nEff - 1, 0))) / denom
    const psrNaive = normalCdf(zNaive)
    const psrCorrected = normalCdf(zCorr)
    return {
      n, nEff: s.nEff, tauInt: s.tauInt, sr, psrNaive, psrCorrected, judgeable: s.stable,
      detail: `PSR naive ${psrNaive.toFixed(4)} (√(n−1)=${Math.sqrt(n - 1).toFixed(1)}) → corrected ${psrCorrected.toFixed(4)} (√(N_eff−1)=${Math.sqrt(Math.max(s.nEff - 1, 0)).toFixed(1)}); τ_int ${s.tauInt.toFixed(1)} deflates the confidence ${s.stable ? "" : "(UNJUDGEABLE — short/unstable sample)"}`.trim(),
    }
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
