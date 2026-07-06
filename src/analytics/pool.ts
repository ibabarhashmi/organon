/**
 * ORGΛNON ANALYTICS — THE POOL (Ensemble Phase 3; Rules K-EFF, K-LEGIBLE, S-FAMILY, U-SURFACE). The park protocol's first
 * DELIVERED capability, built only through the open door (the Phase-1 preconditions passed OPEN-WITH-CONDITIONS). Pooling
 * INSUFFICIENT strategies is the laundering temptation incarnate — ten weak things averaged into one "strong" thing is
 * either diversification or fraud, and the difference is a NUMBER: the effective number of independent members K_eff,
 * under the formula PINNED in Phase 0 and hash-checked here. So the pool pays the UNION's bill:
 *
 *   · a pool is a REGISTERED TRIAL (write-then-invoke) charged declaredNTrials = ceil(K_eff) — the correlation-adjusted
 *     count of independent bets, NOT the raw K (raw K would over-charge a diversified pool and hide a correlated one);
 *   · MEMBER SELECTION IS SEARCH — editing a pool (swapping a member) registers a CHILD composition, so the family of
 *     compositions ratchets: n rises with every edit, never resets (the red-team's signature laundering scenario, killed);
 *   · K_eff RECOMPUTES as clocks accrue (composition-time vs current) — convenient low correlations at composition cannot
 *     survive contact with time; the divergence renders;
 *   · the POOLED-NOISE WALL is permanent — K noise members pooled must NEVER survive; a survivor trips the kill-switch;
 *   · members are strategy specs ONLY (depth-1) — a pool of pools is schema-refused (recursion = laundering-laundering);
 *   · the STRESS CAVEAT is mandatory copy on every pool report; K_eff≈1 renders "this pool adds nothing beyond its
 *     strongest member" — plainly, without refusing composition.
 *
 * This module is a build artifact under the ratification-wall-scanned surfaces — its ADOPT row (the ensemble park's
 * future-sprint ADOPT, activated) authorizes it. The frozen core adjudicates the pooled series untouched. Deterministic.
 */
import { Ledger } from "../ledger/ledger"
import { Studio } from "../studio/adjudicate"
import { Keff } from "../studio/keff"
import { Selection } from "../studio/selection"

export namespace Pool {
  export const POOL_FAMILY = "strategy-pool" as const

  // X-SELECT (Explanation Phase 1 — the door answered TERM): the pool's FIRST-composition SELECTION of K members from a
  // universe of M candidates (choose-K-of-M) is search the ceil(K_eff) breadth charge does NOT count. The pre-registered
  // experiment (Selection.runCell) found best-of-M noise inflates survivors 18–40% at the current charge (> 2× the 5%
  // tolerance) and the pinned surcharge ceil(log2(C(M,K))) drives it to 0% without over-killing real edges (78–90% survive).
  // So the pool now pays the pick: declaredNTrials = ceil(K_eff) + selectionSurcharge(M,K). M is the DECLARED universe the
  // members were selected from; a pool composed over its members-as-the-set (no best-of-M search) declares M=K → surcharge 0
  // (log2(C(K,K))=0), so historical pools do not move. The form is the same pinned closed form Selection hashes (one source).
  export const selectionSurcharge = Selection.selectionSurcharge

  // a pool member is a strategy spec (with its return series). Depth-1: a member whose spec family IS a pool is refused.
  export interface Member { specHash: string; family: string; returns: number[] }
  export interface PoolSpec { family: typeof POOL_FAMILY; memberHashes: string[]; kEffCharge: number; rhoBar: number }

  export class PoolError extends Error {}

  // validate the members: ≥2, equal-length series, and DEPTH-1 (no member is itself a pool — recursion schema-refused)
  export function validateMembers(members: Member[]): { ok: boolean; error?: string } {
    if (!Array.isArray(members) || members.length < 2) return { ok: false, error: "A pool needs at least 2 member strategies to diversify across. Nothing was registered." }
    for (const m of members) {
      if (m.family === POOL_FAMILY) return { ok: false, error: "A pool member cannot itself be a pool (depth-1 only — a pool of pools is schema-refused; recursion is deferred by default). Nothing was registered." }
      if (!Array.isArray(m.returns) || m.returns.length < 2) return { ok: false, error: `Member "${m.specHash.slice(0, 8)}" has no usable return series. Nothing was registered.` }
    }
    const n = members[0].returns.length
    if (!members.every((m) => m.returns.length === n)) return { ok: false, error: "Pool members must share a common window (equal-length return series). Nothing was registered." }
    return { ok: true }
  }

  export const poolReturns = (members: Member[]): number[] => members[0].returns.map((_, t) => members.reduce((s, m) => s + m.returns[t], 0) / members.length)

  // the pool's charge = ceil(K_eff) over the members' return series (the pinned formula, hash-checked). ρ̄ = the mean
  // pairwise correlation; at ρ̄→1 K_eff→1 (the pool "adds nothing"); at ρ̄→0 K_eff→K (fully diversified).
  export function poolCharge(members: Member[]): { rhoBar: number; kEff: number; charge: number } {
    return Keff.poolChargeFromMembers(members.map((m) => m.returns))
  }

  export interface PoolVerdict {
    verdict: string
    dsrAtDeclared: number | null
    kEff: number
    rhoBar: number
    charge: number // ceil(K_eff) — the correlation-adjusted union (breadth) charge
    selectionUniverse: number // M — the declared candidate universe the K members were selected from (M=K → no best-of-M search)
    selectionSurcharge: number // X-SELECT (TERM): ceil(log2(C(M,K))) — the bits of search in choosing K of M (0 when M=K)
    effectiveCharge: number // ceil(K_eff) + selectionSurcharge — the priced-pick union charge the deflation is set at
    memberCount: number
    familySize: number // the family of COMPOSITIONS (edits) — ratchets with each swap
    familyDeclaredNTrials: number // max(effectiveCharge, familySize, rootCount) — the deflated n the bar is set at
    addsNothing: boolean // K_eff≈1 → "adds nothing beyond its strongest member"
    stressCaveat: string
    selectionCaveat: string // X-SELECT: the interim "the pick is not yet priced" note (until the selection door answers)
    legibility: string // the K-LEGIBLE deflation basis (n · scoping · a neutral comparability note)
  }

  // THE MANDATORY STRESS CAVEAT — on every pool report (K-EFF). Yield sources correlate in stress; diversification is a
  // forward assumption, never a guarantee. Ratified copy.
  export const STRESS_CAVEAT = "Stress caveat: yield sources have historically correlated in stress; this pool's effective diversification (K_eff) assumes the observed correlations persist — it can only be proven forward. K_eff recomputes as time accrues; a pool that looks diversified today can lose its diversification in a squeeze."

  // THE INTERIM SELECTION CAVEAT (Explanation Phase 0; X-SELECT) — on every pool report FROM THIS SPRINT until the
  // selection door (Phase 1) answers. The pool charges ceil(K_eff) for effective BREADTH; the first composition's
  // SELECTION from the adjudicated universe (choose K of M) is search the ledger does not yet count. The honest interim
  // is disclosure, not silence. When the door answers, the caveat becomes the outcome's note (TERM: the surcharge form;
  // RESTRICT: the declared-member-set rule; NO-INFLATION: retired with its reason).
  export type SelectionDoorState = "interim" | "term" | "restrict" | "no-inflation"
  export function selectionCaveat(state: SelectionDoorState = "interim"): string {
    switch (state) {
      case "term": return "Member selection is priced: this pool's charge includes a selection surcharge for choosing its members from the adjudicated universe (choose K of M is search — the pick is counted, not only the breadth)."
      case "restrict": return "Member selection is restricted: first compositions are admissible only over pre-registered/declared member sets (the pick is bounded to a set that was declared in advance, so best-of-M cherry-picking cannot ride free)."
      case "no-inflation": return "Member selection was tested and priced-free: a pre-registered experiment found best-of-M composition at the K_eff charge does not inflate survivors beyond planted truth (evidence filed; the interim caveat retired with its reason)."
      default: return "Member selection is not yet priced: this pool's charge covers breadth (K_eff), not the pick — choosing K members of M candidates is search the ledger does not yet count. A pre-registered experiment (the selection door) will price it, restrict it, or prove it free; until it answers, treat the charge as a floor."
    }
  }

  // K-LEGIBLE: the deflation basis, rendered NEUTRAL (n · the scoping that produced it · a comparability note). It STATES,
  // it never judges — no shaming, no rankings-by-virtue. Display-only; derives nothing (the numbers are passed in).
  export function deflationBasis(n: number, scoping: string): string {
    return `Deflation basis: tested against n=${n} trial(s) · scoping: ${scoping} · a higher n is a harder bar (more search was accounted for) — compare two bars only at equal n. This states how hard the bar was set; it is not a judgement of the strategy.`
  }

  // IDENTITY PROVENANCE (Explanation Phase 2; K-LEGIBLE gains the provenance sentence). The truth stated plainly where
  // users read the deflation basis: author identity is SELF-DECLARED (the family-ratchet keys per declared author, the
  // rate limiter per connection) and NOT verified — a caller who declares a new author, or connects anew, starts a fresh
  // family. Neutral and factual (it STATES the exposure, it never reassures). The two keys are named where each bites.
  export const IDENTITY_PROVENANCE_NOTE = "Identity provenance: author identity is self-declared and not verified. The family-of-attempts bar (the edit-ratchet) is keyed per declared author; the rate limiter is keyed per connection. A caller who declares a new author, or connects anew, starts a fresh family — so a bar compares searches within one declared identity, not across the world. See the sybil note for what self-declared identity means for cross-author comparisons."
  export function identityProvenanceNote(): string {
    return IDENTITY_PROVENANCE_NOTE
  }
  // the NEUTRALITY check (A′#7): the identity note must STATE the exposure, never REASSURE. A seeded reassuring sentence
  // ("your work is safe", "protected", "secure", "can't be faked") is CAUGHT — false comfort about self-declared identity
  // is the exact priming this surface must not commit.
  const IDENTITY_REASSURANCE = [/\bsafe\b/i, /\bprotected\b/i, /\bsecure(d|ly)?\b/i, /can'?t be (stolen|faked|forged|copied)/i, /guaranteed/i, /\btrust (us|me)\b/i, /\byour work is\b/i]
  export function identityNoteNeutral(text: string): { ok: boolean; violations: string[] } {
    const violations = IDENTITY_REASSURANCE.filter((r) => r.test(text)).map((r) => `reassuring/false-comfort phrase about self-declared identity: ${r}`)
    return { ok: violations.length === 0, violations }
  }

  // compose a pool → register as a trial with family = the members' union at ceil(K_eff), the edit history as its family
  // (each prior composition registered so the family of compositions ratchets), then adjudicate the pooled series.
  export async function composeAndAdjudicate(store: Ledger.Store, members: Member[], timestamp: number, opts?: { priorCompositions?: PoolSpec[]; authorId?: string; selectionState?: SelectionDoorState; selectionUniverse?: number }): Promise<PoolVerdict> {
    const v = validateMembers(members)
    if (!v.ok) throw new PoolError(v.error!)
    const { rhoBar, kEff, charge } = poolCharge(members)
    // X-SELECT (TERM): the declared selection universe M (the candidates the K members were picked from). M=K (or absent)
    // → no best-of-M search → surcharge 0. A universe smaller than K is a caller error (clamped to K, surcharge 0).
    const M = Math.max(opts?.selectionUniverse ?? members.length, members.length)
    const surcharge = selectionSurcharge(M, members.length)
    const effectiveCharge = charge + surcharge
    const authorId = opts?.authorId ?? "pool-composer"
    // register the edit history (prior compositions) so the family of COMPOSITIONS grows — a swap is another attempt
    let parentSeq: number | null = null
    for (const prior of opts?.priorCompositions ?? []) parentSeq = Studio.register(store, { spec: prior, authorClass: "agent", authorId, domain: "pool", parentSeq, timestamp }).seq
    const spec: PoolSpec = { family: POOL_FAMILY, memberHashes: members.map((m) => m.specHash), kEffCharge: charge, rhoBar }
    const returns = poolReturns(members)
    const verdict = await Studio.submit(store, { spec, authorClass: "agent", authorId, domain: "pool", parentSeq, timestamp, returns, barsPerYear: 365, declaredNTrials: effectiveCharge })
    const n = verdict.familyDeclaredNTrials
    return {
      verdict: verdict.attestation.verdict, dsrAtDeclared: verdict.attestation.dsrAtDeclared ?? null,
      kEff, rhoBar, charge, selectionUniverse: M, selectionSurcharge: surcharge, effectiveCharge, memberCount: members.length, familySize: verdict.family.size, familyDeclaredNTrials: n,
      // "adds nothing beyond its strongest member" = the diversification is NEGLIGIBLE (K_eff essentially 1 — the members
      // are near-duplicates), independent of the conservative ceil'd charge. The threshold is the effective-breadth, not
      // the integer charge (ceil(1.02)=2 but 1.02 independent bets is ~1 — the pool adds ~nothing).
      addsNothing: kEff < 1.2,
      stressCaveat: STRESS_CAVEAT,
      // the door answered TERM (Phase 1) → the pick is priced; the caveat is the outcome's note. A caller mid-migration
      // may still pass "interim" explicitly (the Phase-0 evidence did); the default is the derived outcome.
      selectionCaveat: selectionCaveat(opts?.selectionState ?? "term"),
      legibility: deflationBasis(n, `pool of ${members.length} members · K_eff=${kEff.toFixed(2)} (ρ̄=${rhoBar.toFixed(2)}) · selection: ${M > members.length ? `best-of-${M} → +${surcharge} selection trials (the pick priced)` : `no best-of-M search (M=K, surcharge 0)`} · effective charge=${effectiveCharge} · author-family of compositions`),
    }
  }

  // K_eff RECOMPUTES on clock ticks: composition-time vs current, with the divergence rendered (K-EFF). A pool composed
  // in a low-correlation window whose members later correlate sees its K_eff FALL toward 1 — convenient windows cannot
  // survive time.
  export interface KeffDivergence { atComposition: number; current: number; divergence: number; render: string }
  export function recomputeKeff(memberReturnsAtComposition: number[][], memberReturnsCurrent: number[][]): KeffDivergence {
    const K = memberReturnsAtComposition.length
    const atComposition = Keff.kEff(K, Keff.meanPairwiseCorr(memberReturnsAtComposition))
    const current = Keff.kEff(K, Keff.meanPairwiseCorr(memberReturnsCurrent))
    const divergence = atComposition - current
    const render = `K_eff at composition ${atComposition.toFixed(2)} → current ${current.toFixed(2)} (${divergence >= 0 ? "fell" : "rose"} ${Math.abs(divergence).toFixed(2)}${divergence > 0.3 ? " — the members have correlated since composition; the pool is LESS diversified than when composed" : ""})`
    return { atComposition, current, divergence, render }
  }

  // ── THE POOLED-NOISE PERMANENT WALL (K-EFF) — K pure-noise members pooled must NEVER survive the honest K_eff charge;
  // a survivor trips the kill-switch (the composer disabled pending an owner decision, a first-class finding). Same
  // discipline the VoC proposer lives under. Deterministic (seeded PRNG; no Math.random).
  function mulberry32(seed: number): () => number { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
  function gauss(rng: () => number, n: number): number[] { const o: number[] = []; while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) } return o }
  // the KILL-SWITCH — one survivor disables the composer class pending an owner decision (a first-class finding, K-EFF)
  export function killSwitch(survivorCount: number): { tripped: boolean; composerDisabled: boolean; reason: string } {
    return survivorCount > 0
      ? { tripped: true, composerDisabled: true, reason: `${survivorCount} pooled-noise survivor(s) passed the deflation at their K_eff charge — the POOL COMPOSER is DISABLED pending an owner decision (a first-class finding, never hidden; K-EFF kill-switch, the same discipline the VoC proposer lives under)` }
      : { tripped: false, composerDisabled: false, reason: "pooled-noise wall green — zero survivors; the composer stays admitted" }
  }
  export interface PooledNoiseWall { seeds: number; K: number; survivors: number; allClean: boolean; killSwitch: { tripped: boolean; composerDisabled: boolean; reason: string } }
  // K noise members pooled must NEVER survive the honest K_eff charge. `seedSurvivor` injects a STRONG-edge pool (not
  // noise) so the pool DOES survive — proving the wall's detection + kill-switch path fires (the analog of the VoC
  // in-sample seed): the wall is empirical, not assumed.
  export async function pooledNoiseWall(nSeeds: number, opts: { K?: number; nObs?: number; timestamp: number; seedSurvivor?: boolean }): Promise<PooledNoiseWall> {
    const K = opts.K ?? 5, nObs = opts.nObs ?? 400
    let survivors = 0
    for (let s = 1; s <= nSeeds; s++) {
      const mean = opts.seedSurvivor ? 0.006 : 0 // seedSurvivor → a strong REAL edge that survives (proves the alarm); else pure noise
      const members: Member[] = Array.from({ length: K }, (_, k) => ({ specHash: `${opts.seedSurvivor ? "seed" : "noise"}-${s}-${k}`, family: "noise", returns: gauss(mulberry32(0x9e00 + s * 31 + k), nObs).map((x) => mean + x * 0.01) }))
      const v = await composeAndAdjudicate(new Ledger.Store(), members, opts.timestamp + s, {})
      if ((v.dsrAtDeclared ?? 0) >= 0.95) survivors++
    }
    return { seeds: nSeeds, K, survivors, allClean: survivors === 0, killSwitch: killSwitch(survivors) }
  }
}
