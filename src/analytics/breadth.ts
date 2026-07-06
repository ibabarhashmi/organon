/**
 * ORGΛNON ANALYTICS — the FUNDAMENTAL-LAW BREADTH PANEL + the hedged ETA (Spine Phase 1; Rules R-ETA, R-ADVISORY,
 * A′#3). The Fundamental Law of Active Management, made a product surface: IR = TC × IC × √BR decomposes any adjudicated
 * strategy's evidence into SKILL (IC — the rank correlation of signal vs realized), INDEPENDENT BETS (BR — honest about
 * autocorrelation: overlapping/serially-correlated observations are NOT independent bets), and IMPLEMENTATION TRANSFER
 * (TC). For the first time the product can answer the two questions every non-expert asks at a refusal — *why not yet*
 * and *when, honestly* — the latter as a DERIVED, HEDGED RANGE, never a point, never a promise.
 *
 * ADVISORY-FIRST (R-ADVISORY): NOTHING here touches the write-then-invoke verdict path. The panel reads a strategy's
 * series and renders beside the frozen verdict; it changes no verdict (a verdict differential proves it). The ETA is
 * a FLOOR on time (it assumes a fixed significance bar; the frozen deflation only raises the bar as the search grows),
 * so it can only ever say "at least this long" — it can never promise sooner. The floor-audit hedge is carried verbatim.
 */
export namespace Breadth {
  // ── IC: the information coefficient = the rank (Spearman) correlation of the signal vs the realized outcome ──
  function rank(xs: number[]): number[] {
    const idx = xs.map((x, i) => [x, i] as [number, number]).sort((a, b) => a[0] - b[0])
    const r = new Array<number>(xs.length)
    let i = 0
    while (i < idx.length) {
      let j = i
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++ // ties → average rank
      const avg = (i + j) / 2 + 1
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg
      i = j + 1
    }
    return r
  }
  function pearson(a: number[], b: number[]): number {
    const n = a.length
    if (n < 2 || b.length !== n) return 0
    const ma = a.reduce((s, x) => s + x, 0) / n
    const mb = b.reduce((s, x) => s + x, 0) / n
    let num = 0, da = 0, db = 0
    for (let i = 0; i < n; i++) {
      const xa = a[i] - ma, xb = b[i] - mb
      num += xa * xb; da += xa * xa; db += xb * xb
    }
    return da === 0 || db === 0 ? 0 : num / Math.sqrt(da * db)
  }
  // the information coefficient — rank correlation (robust to outliers / non-linear monotone links), the standard IC
  export function informationCoefficient(signal: number[], realized: number[]): number {
    if (signal.length !== realized.length || signal.length < 3) return 0
    return pearson(rank(signal), rank(realized))
  }

  // ── BR: the number of INDEPENDENT bets per year, honest about autocorrelation (the load-bearing honesty, A′#3) ──
  function lag1Autocorr(xs: number[]): number {
    const n = xs.length
    if (n < 3) return 0
    const m = xs.reduce((s, x) => s + x, 0) / n
    let num = 0, den = 0
    for (let i = 0; i < n; i++) den += (xs[i] - m) ** 2
    for (let i = 1; i < n; i++) num += (xs[i] - m) * (xs[i - 1] - m)
    return den === 0 ? 0 : num / den
  }
  export interface BreadthEstimate {
    nObs: number
    barsPerYear: number
    years: number
    lag1Autocorr: number
    effectiveObs: number // AR(1)-deflated independent-observation count
    betsPerYear: number // BR — the Fundamental Law's breadth
    independenceAssumption: string // STATED on the panel — a bet is independent only after this adjustment
  }
  // BR from a returns series: N_eff = N × (1-ρ)/(1+ρ) under an AR(1) independence model; ρ clamped ≥ 0 (a positive
  // serial correlation LOWERS breadth; a negative one is not credited — conservative about overclaiming independence).
  export function breadthOf(returns: number[], barsPerYear: number): BreadthEstimate {
    const nObs = returns.length
    const years = nObs / barsPerYear
    const rhoRaw = lag1Autocorr(returns)
    const rho = Math.max(0, Math.min(0.999, rhoRaw))
    const effectiveObs = nObs * (1 - rho) / (1 + rho)
    const betsPerYear = years > 0 ? effectiveObs / years : 0
    return {
      nObs, barsPerYear, years, lag1Autocorr: rhoRaw, effectiveObs, betsPerYear,
      independenceAssumption:
        `bets treated independent after an AR(1) autocorrelation adjustment (lag-1 rho=${rhoRaw.toFixed(3)}, clamped to ${rho.toFixed(3)}): ` +
        `N_eff = N*(1-rho)/(1+rho) = ${nObs}*(1-${rho.toFixed(3)})/(1+${rho.toFixed(3)}) = ${effectiveObs.toFixed(0)}. ` +
        `Overlapping/serially-correlated observations are NOT independent bets; a positive serial correlation lowers BR.`,
    }
  }

  // ── TC: the transfer coefficient (implementation drag) — corr(intended, implemented) ∈ [0,1]; 1 if frictionless ──
  export function transferCoefficient(intended?: number[], implemented?: number[]): { tc: number; measured: boolean } {
    if (!intended || !implemented || intended.length !== implemented.length || intended.length < 3) return { tc: 1, measured: false }
    return { tc: Math.max(0, Math.min(1, pearson(intended, implemented))), measured: true }
  }

  // ── the Fundamental Law: IR = TC × IC × √BR ──
  export function informationRatio(ic: number, betsPerYear: number, tc: number): number {
    return tc * ic * Math.sqrt(Math.max(0, betsPerYear))
  }

  export interface Panel {
    ic: number
    breadth: BreadthEstimate
    tc: number
    tcMeasured: boolean
    ir: number // annualized information ratio = TC · IC · √BR
    whyNotYet: string // the plain-language one-sentence answer (E-CATALOG S1)
  }

  export function panel(input: { signal: number[]; realized: number[]; returns: number[]; barsPerYear: number; intended?: number[]; implemented?: number[] }): Panel {
    const ic = informationCoefficient(input.signal, input.realized)
    const breadth = breadthOf(input.returns, input.barsPerYear)
    const { tc, measured } = transferCoefficient(input.intended, input.implemented)
    const ir = informationRatio(ic, breadth.betsPerYear, tc)
    const whyNotYet =
      `Your strategy makes about ${breadth.betsPerYear.toFixed(0)} independent bets per year at an information coefficient of ` +
      `${ic.toFixed(3)} (skill), for an information ratio of ${ir.toFixed(2)}. At this skill and this breadth the evidence ` +
      `accrues ${ir < 0.5 ? "very slowly" : ir < 1 ? "slowly" : "at a moderate pace"} — which is why the verdict is not yet.`
    return { ic, breadth, tc, tcMeasured: measured, ir, whyNotYet }
  }

  // ── the hedged ETA — a DERIVED RANGE, never a point (R-ETA) ──
  export interface Eta {
    targetT: number // the significance bar the ETA aims at (an assumption, stated)
    irLo: number
    irHi: number
    yearsAccrued: number
    powerAtYearsLo: number // total years of observation to reach the bar, optimistic end (higher IR)
    powerAtYearsHi: number // ... pessimistic end (lower IR); Infinity when the IR band includes ≤ 0
    forwardYearsLo: number // FORWARD time remaining beyond what is already accrued
    forwardYearsHi: number
    mayNeverReach: boolean // true when the IR confidence band includes ≤ 0 → honest "may never reach power at this cadence"
    range: string // the human-facing hedged RANGE sentence
    assumptions: string[]
    hedge: string // the floor-audit hedge, verbatim
  }
  // The ETA math (hand-verified in script/phase1-spine.ts): the annualized t-stat after Y years ≈ IR·√Y; it reaches the
  // bar t* when Y = (t*/IR)². We propagate the IC estimation uncertainty (SE_ic = √((1-IC²)/(N-2))) into an IR band and
  // thus a RANGE of Y. If the IR band includes ≤ 0 the strategy MAY NEVER reach power at this cadence — an honest output.
  export function eta(p: Panel, opts: { targetT?: number; icStdErr?: number } = {}): Eta {
    const targetT = opts.targetT ?? 2.0
    const n = p.breadth.nObs
    const seIc = opts.icStdErr ?? Math.sqrt(Math.max(1e-9, (1 - p.ic * p.ic) / Math.max(1, n - 2)))
    const icLo = p.ic - seIc
    const icHi = p.ic + seIc
    const irLo = informationRatio(icLo, p.breadth.betsPerYear, p.tc) // may be ≤ 0
    const irHi = informationRatio(icHi, p.breadth.betsPerYear, p.tc)
    const yearsFor = (ir: number): number => (ir <= 0 ? Infinity : (targetT / ir) ** 2)
    const powerAtYearsHi = yearsFor(irLo) // lower IR → more years
    const powerAtYearsLo = yearsFor(irHi) // higher IR → fewer years
    const yearsAccrued = p.breadth.years
    const fwd = (total: number): number => (total === Infinity ? Infinity : Math.max(0, total - yearsAccrued))
    const forwardYearsLo = fwd(powerAtYearsLo)
    const forwardYearsHi = fwd(powerAtYearsHi)
    const mayNeverReach = !(irLo > 0)
    const fmt = (y: number): string =>
      y === Infinity ? "never (at this cadence)" : y > 100 ? "effectively never (>100 yr at this cadence)" : y < 1 ? `${(y * 12).toFixed(0)} months` : `${y.toFixed(1)} years`
    const range = mayNeverReach
      ? `Forward time to power: ${fmt(forwardYearsLo)} … never — the skill estimate is not yet distinguishable from zero, so this class of strategy MAY NEVER reach power at this cadence.`
      : `Forward time to power: about ${fmt(forwardYearsLo)} … ${fmt(forwardYearsHi)} (a range, not a promise).`
    return {
      targetT, irLo, irHi, yearsAccrued, powerAtYearsLo, powerAtYearsHi, forwardYearsLo, forwardYearsHi, mayNeverReach, range,
      assumptions: [
        `target significance bar t* = ${targetT} (a proxy for 'reaches power'; the frozen gate remains the only gate — this is advisory)`,
        `cadence: ${p.breadth.barsPerYear} bars/year → BR ${p.breadth.betsPerYear.toFixed(0)} independent bets/year (${p.breadth.independenceAssumption})`,
        `IR band from the IC estimation uncertainty: SE(IC)=${seIc.toFixed(4)} over ${n} obs → IC∈[${icLo.toFixed(3)}, ${icHi.toFixed(3)}] → IR∈[${irLo.toFixed(2)}, ${irHi.toFixed(2)}]`,
        `stationarity: the observed IC is assumed to persist forward (a strong assumption — a decaying edge lengthens the time)`,
        `this ETA IGNORES deflation growth: the frozen bar RISES as the search family grows, so the true time is >= this estimate — the ETA is a FLOOR on time, never a ceiling (it can only be later, never sooner)`,
      ],
      hedge: "pending floor audit (the power floor remains unaudited, Rule XXXVIII; reachability stays hedged and this ETA carries that hedge)",
    }
  }

  // ── the PRO-DISCLOSURE toggle — a pure DISPLAY formatter that DERIVES NOTHING (R-ADVISORY, A′#8) ──
  // It renders ALREADY-COMPUTED panels for the pro user; it computes no new number. The screen count is unchanged (8);
  // this is an extension of the existing report/rigor screens, not a ninth. Toggling changes visibility, never a value.
  export interface RawPanels {
    breadth?: Panel
    eta?: Eta
    rigor?: { sharpeAnnualized?: number | null; dsr?: number | null; psr0?: number | null; nObs?: number | null }
    cpcv?: { pbo?: number | null; oosSharpeMedian?: number | null; skipped?: boolean; skipReason?: string | null } | null
    cpcvPromotion?: string | null // the CPCV promotion tracker status (W7-01) — surfaced on the pro disclosure
  }
  export function proDisclosure(raw: RawPanels): string {
    const L: string[] = ["── PRO DISCLOSURE (raw panels — display-only, derives nothing) ──"]
    if (raw.breadth) {
      const b = raw.breadth
      L.push(`breadth: IC=${b.ic.toFixed(3)} · BR=${b.breadth.betsPerYear.toFixed(0)}/yr (N=${b.breadth.nObs}, eff=${b.breadth.effectiveObs.toFixed(0)}, rho=${b.breadth.lag1Autocorr.toFixed(3)}) · TC=${b.tc.toFixed(2)}${b.tcMeasured ? "" : " (assumed frictionless)"} · IR=${b.ir.toFixed(2)}`)
    }
    if (raw.eta) L.push(`ETA (hedged range): ${raw.eta.range}  [${raw.eta.hedge}]`)
    if (raw.rigor) L.push(`rigor: annualized Sharpe=${fmtN(raw.rigor.sharpeAnnualized)} · DSR=${fmtN(raw.rigor.dsr)} · PSR0=${fmtN(raw.rigor.psr0)} · nObs=${fmtN(raw.rigor.nObs)}`)
    if (raw.cpcv) L.push(raw.cpcv.skipped ? `CPCV: SKIPPED (${raw.cpcv.skipReason ?? "unavailable"})` : `CPCV: PBO=${fmtN(raw.cpcv.pbo)} · OOS-Sharpe median=${fmtN(raw.cpcv.oosSharpeMedian)}`)
    else L.push("CPCV: (not present for this adjudication)")
    if (raw.cpcvPromotion) L.push(raw.cpcvPromotion) // W7-01: the promotion tracker counter, surfaced (advisory)
    return L.join("\n")
  }
  function fmtN(x: number | null | undefined): string {
    return x === null || x === undefined || !Number.isFinite(x) ? "n/a" : x.toFixed(3)
  }
}
