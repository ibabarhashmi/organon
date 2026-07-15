/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 6 (S166–S168, D80/D81): THE VARIANT LEDGER — *the builder's second half.*
 *
 * ORGΛNON counts your family (V39) and names your shared deaths (V40); now it lets you author two variants and see what
 * trying both COST you. You author variant A, then variant B; the tool records each as its own hash-chained lineage, renders
 * them SIDE BY SIDE in filing order, each under its own independent ternary Stamp WITH that variant's own inline evidence,
 * with the cumulative search count between them — and the deflation for N searches COMPUTED, DARK, IN THE MOAT.
 *
 * THE LINE THE WHOLE CONSTITUTION WAS BUILT TO WALK: a comparison is permitted ONLY because it carries its own price tag —
 * NO ranking, NO "best", NO "choose", NO total order (A′ #1). The walls (S167): chronological (a seeded score-ordering
 * FAILS); each Stamp judged against its OWN thesis, shown with its OWN evidence (RP-2 — never a cross-variant compare); the
 * search count rendered as the PRICE of having both; the copy PINNED VERBATIM (no LLM on this surface). And DECISIVELY the
 * deflated number is DARK (D63): the one figure that would let the user rank on quality is COMPUTED and NOT shown lit (S168).
 *
 * DD-67 (S166): a variant is a manifest that names a PARENT FAMILY — familyId = sha256(filterHash + operatorEpoch). RP-4: a
 * family is the filter hash PLUS an operator-controlled epoch (never auto-grouped by filter alone), and the epoch is a
 * sidecar OUTSIDE the hashed identity, so grouping moves NO lineage id. RP-6: the ledger renders its own authorship
 * breakdown, and its HUMAN count reads the SAME producer as realLineageCount (the quarantine holds; an AGENT variant cannot
 * imply human use). A PATH off the lineage view — screens stay 3.
 *
 * Pure: reads the pinned copy + the frozen-derived deflation math (ported clone-stably; no numpy, no network, no LLM).
 */
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Rider } from "../backtest/rider"
import { Authorship } from "./authorship"
import { Migration } from "./migration"
import type { Manifest } from "./manifest"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

// ── THE DARK SEARCH PRICE (DD-68 / D81 / RP-1) — COMPUTED, stored as INGREDIENTS, tagged DARK-COMPUTE NOT A VERDICT ────────
// The deflation for N variants: the frozen sr0_deflated expected-maximum-Sharpe benchmark GROWS with N trials (more searches
// ⇒ a higher bar the best variant's Sharpe must clear). Ported clone-stably from rigor.py::sr0_deflated (READ, never edited);
// composed with the enforced rider's serial-correlation inflation. RP-1: the moat entry is {nTrials, bestNaive,
// deflationFactor} — NOT a rendered GO/NO-GO, NOT an "overfit" conclusion — tagged so no reader mistakes it for a verdict.
export namespace SearchPrice {
  const GAMMA = 0.5772156649015329 // Euler–Mascheroni (rigor.py GAMMA)
  const E = Math.E

  // the inverse standard-normal CDF (probit), Acklam's rational approximation (|err| < 1.15e-9) — clone-stable, no scipy.
  // rigor.py uses scipy.stats.norm.ppf; this reproduces it to ~1e-9 (a wall asserts Φ⁻¹(0.975)=1.959964, Φ⁻¹(0.95)=1.644854).
  export function probit(p: number): number {
    if (!(p > 0 && p < 1)) return NaN
    const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
    const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
    const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
    const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
    const plow = 0.02425, phigh = 1 - plow
    if (p < plow) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1) }
    if (p <= phigh) { const q = p - 0.5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1) }
    const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }

  // rigor.py::sr0_deflated — SR0 = sqrt(V)·[(1−γ)·Z(1−1/N) + γ·Z(1−1/(N·e))], the expected-maximum Sharpe across N trials.
  export function sr0Deflated(varSharpe: number, nTrials: number): number {
    const n = Math.max(Math.trunc(nTrials), 2) // N=1 ⇒ Z(0)=-inf; floor at 2 (frozen behaviour)
    const z1 = probit(1 - 1 / n)
    const z2 = probit(1 - 1 / (n * E))
    return Math.sqrt(Math.max(varSharpe, 0)) * ((1 - GAMMA) * z1 + GAMMA * z2)
  }

  export const DARK_COMPUTE_TAG = "DARK-COMPUTE, NOT A VERDICT"
  export interface DarkPrice {
    lit: false // the meter's LIGHT is OFF (D63); a lit render FAILS (S168)
    tag: "DARK-COMPUTE, NOT A VERDICT"
    ingredients: { nTrials: number; bestNaive: number; varSharpe: number; deflationFactor: number } // RP-1 — inputs, not a verdict
    sr0AtOne: number // the expected-max-Sharpe benchmark at 1 trial (floored to 2)
    sr0AtN: number // …and at N trials — the bar RISES with N (the price of searching)
    serialInflation: number // the enforced rider's ≈√τ_int inflation (composed as a second dark ingredient)
    render: string // the DARK line — pinned copy, never an LLM sentence
  }

  // SearchPrice.deflatedDark — COMPUTED, DARK. Stores INGREDIENTS (RP-1), renders the pinned dark line, lights NOTHING.
  export function deflatedDark(bestNaive: number, nTrials: number, varSharpe: number): DarkPrice {
    const sr0AtOne = sr0Deflated(varSharpe, 1)
    const sr0AtN = sr0Deflated(varSharpe, nTrials)
    const deflationFactor = sr0AtN - sr0AtOne // how much the bar RISES from 1 trial to N trials
    // the enforced rider's representative serial-correlation inflation (a second dark ingredient; the composition DD-68 asks for)
    const serialInflation = Rider.compoundedGenerosity().overstatementFactor
    const copy = copyVerbatim()
    const render = copy.searchPriceDark
      .replace(/\{n\}/g, String(nTrials))
      .replace("{naive}", bestNaive.toFixed(3))
      .replace("{deflated}", (bestNaive - deflationFactor).toFixed(3))
    return { lit: false, tag: DARK_COMPUTE_TAG, ingredients: { nTrials, bestNaive, varSharpe, deflationFactor }, sr0AtOne, sr0AtN, serialInflation, render }
  }

  function copyVerbatim(): Record<string, string> {
    return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "variant-pins.json"), "utf8")).delegatedDecisions.DD69.copyVerbatim
  }
}

export namespace Variant {
  export type Stamp = "GO" | "NO-GO" | "INSUFFICIENT"

  // DD-67 / S166 — the filter hash (the V39 optional filter; a canonical hash of its present keys, or "∅" when absent).
  export function filterHash(filter: Manifest.Filter | undefined): string {
    if (filter === undefined) return "∅" // no filter ⇒ a family of one, byte-identical to today (the lineage id does not move)
    return sha256(JSON.stringify(filter))
  }

  // DD-67 / RP-4 — a variant is a manifest that names a PARENT FAMILY: familyId = sha256(filterHash + '·' + operatorEpoch).
  // The operatorEpoch is an explicit boundary the Operator controls ("a variant of THIS search" vs "start fresh") — NEVER
  // auto-grouped by filter alone (F-4: two different searches with the same filter must NOT collapse into one over-charged
  // family). A manifest with no filter is a family of ONE (familyId over "∅"). The epoch lives OUTSIDE the hashed manifest
  // identity (a sidecar, like the authorship marker), so grouping moves NO lineage id (S166).
  export function family(filter: Manifest.Filter | undefined, operatorEpoch: string): string {
    return sha256(`${filterHash(filter)}·${operatorEpoch}`)
  }

  // a variant to render — its lineage id, filing time, its OWN Stamp, its OWN inline evidence (RP-2), its authorship class,
  // and its best naive Sharpe (an ingredient of the DARK search price). NOTE the shape: NO "rank", NO "score", NO "isBest".
  export interface Entry {
    lineageId: string
    filedAt: number
    stamp: Stamp
    authorship: Authorship.Class
    evidence: { falseFire?: string; dependency?: string; exit?: string } // this variant's OWN facts, judged against its OWN thesis
    bestNaive: number // this variant's best naive Sharpe (a dark-price ingredient; NEVER rendered as a rank)
  }

  export interface RenderedVariant {
    lineageId: string
    when: string // the filing date — the ONLY ordering key (chronological)
    stampWord: Stamp
    evidenceLine: string // "judged against its own thesis: {evidence}" — the pinned per-variant evidence (RP-2)
    authorship: Authorship.Class
  }

  export interface Ledger {
    familyId: string | null
    header: string
    searchCountLine: string // "you have filed N variants in this family. that is N searches."
    variants: RenderedVariant[] // CHRONOLOGICAL — the only ordering
    ownThesisRule: string // "each variant is judged against its own thesis, not against the others…" (RP-2, pinned verbatim)
    authorshipLine: string // "N variants — n AGENT, m HUMAN." (RP-6)
    noAggregateLine: string // "no total, no best, no ranking…" (pinned verbatim)
    searchPriceDark: SearchPrice.DarkPrice // COMPUTED, DARK (D81/S168)
    variantCount: number
    cumulativeSearches: number // === variantCount (each variant is a SEARCH)
    authorship: { agent: number; human: number; fixture: number; humanEqualsRealLineageCount: boolean } // RP-6
    ordering: "CHRONOLOGICAL"
    // NOTE: there is NO aggregate/best/rank/delta field — the shape itself cannot rank (structural, not a guard)
  }

  function copy(): Record<string, string> {
    return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "variant-pins.json"), "utf8")).delegatedDecisions.DD69.copyVerbatim
  }

  // Variant.ledger — a GROUP-BY over the family's variants, rendered as the pinned copy. Chronological; each Stamp with its
  // OWN evidence; the search count between; the DARK search price; the authorship breakdown. It RANKS NOTHING.
  // `realLineageCount` is injected (defaults to the quarantined producer) so the wall can prove the ledger's HUMAN count
  // reads the SAME producer (RP-6 — S150's one-producer discipline extends here).
  export function ledger(familyId: string | null, entries: Entry[], realLineageCount: number = Migration.realLineageCount()): Ledger {
    const c = copy()
    // MECHANICAL chronological ordering — the ONLY sort key is filedAt ascending (a seeded score-ordering does not happen here).
    const ordered = [...entries].sort((a, b) => a.filedAt - b.filedAt)
    const n = ordered.length
    const plural = (s: string) => (n === 1 ? "" : s)
    const searchCountLine = c.searchCount.replace(/\{n\}/g, String(n)).replace(/\{s\}/g, plural("s")).replace(/\{es\}/g, plural("es"))
    const variants: RenderedVariant[] = ordered.map((v) => ({
      lineageId: v.lineageId,
      when: new Date(v.filedAt).toISOString().slice(0, 10),
      stampWord: v.stamp,
      // RP-2 — each variant's own inline evidence: the false-fire / dependency / exit facts FOR THIS variant (never a compare)
      evidenceLine: c.perVariantEvidence.replace("{evidence}", [v.evidence.falseFire, v.evidence.dependency, v.evidence.exit].filter(Boolean).join(" · ") || "no recorded evidence for this variant"),
      authorship: v.authorship,
    }))
    // RP-6 — the authorship breakdown; the HUMAN count reads the SAME producer as realLineageCount (the quarantine holds).
    const agent = ordered.filter((v) => v.authorship === "AGENT").length
    const human = ordered.filter((v) => v.authorship === "HUMAN").length
    const fixture = ordered.filter((v) => v.authorship === "FIXTURE").length
    const authorshipLine = c.authorship.replace(/\{n\}/g, String(n)).replace(/\{s\}/g, plural("s")).replace("{agent}", String(agent)).replace("{human}", String(human))
    // DD-68 / D81 / S168 — the DARK search price: the best variant's naive Sharpe deflated over N searches, COMPUTED, DARK.
    const bestNaive = ordered.length ? Math.max(...ordered.map((v) => v.bestNaive)) : 0
    const varSharpe = sampleVariance(ordered.map((v) => v.bestNaive))
    const searchPriceDark = SearchPrice.deflatedDark(bestNaive, n, varSharpe)
    return {
      familyId,
      header: c.header,
      searchCountLine,
      variants,
      ownThesisRule: c.ownThesisRule, // RP-2 — pinned verbatim
      authorshipLine,
      noAggregateLine: c.noAggregate,
      searchPriceDark,
      variantCount: n,
      cumulativeSearches: n, // each variant is a SEARCH (X-RECKON)
      authorship: { agent, human, fixture, humanEqualsRealLineageCount: human === realLineageCount },
      ordering: "CHRONOLOGICAL",
    }
  }

  function sampleVariance(xs: number[]): number {
    const finite = xs.filter((x) => Number.isFinite(x))
    if (finite.length < 2) return 0.25 // a pinned demonstration variance when the family is too small to estimate one
    const mu = finite.reduce((a, b) => a + b, 0) / finite.length
    return finite.reduce((a, b) => a + (b - mu) * (b - mu), 0) / (finite.length - 1)
  }

  // S167 — the ordering is CHRONOLOGICAL, mechanically. Given the rendered order, is it sorted by filedAt ascending?
  export function isChronological(entries: Entry[]): boolean {
    for (let i = 1; i < entries.length; i++) if (entries[i].filedAt < entries[i - 1].filedAt) return false
    return true
  }

  // a seeded ADVERSARIAL ordering (by Stamp rank — GO best) that A′ #1 warns about. The wall proves the ledger REFUSES it
  // (Variant.ledger sorts by filedAt only, so a score-ordered input still renders chronological).
  export function seededScoreOrdering(entries: Entry[]): Entry[] {
    const rank: Record<Stamp, number> = { "GO": 0, "INSUFFICIENT": 1, "NO-GO": 2 }
    return [...entries].sort((a, b) => rank[a.stamp] - rank[b.stamp])
  }
}
