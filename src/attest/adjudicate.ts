import { createHash } from "node:crypto"
import { Runner } from "../backtest/runner"
import { Attest } from "./submission"
import { AttestClassify } from "./classify"
import { AttestReexec } from "./reexec"
import { AttestPower } from "./power"

// ORGΛNON — Attestation Engine: the ADJUDICATOR (Phase 2; Rules XII/XIII + Hardening XIV/XV). It classifies a
// submission, obtains the returns BY THE ENGINE'S OWN RE-EXECUTION (V2 on ORGΛNON's PIT data; V1 by re-simulation on
// the claimant's data with a reproduction check; V0 the submitted series), runs the SHARED rigor (attest.py →
// rigor.py, formulas untouched), and CAPS the verdict by verifiability tier + search-honesty. A tier is EARNED, never
// declared (XIV): caller-supplied returns can never earn V2, an un-executable spec is capped at V0, and the VERIFIED
// ledger asserts ONLY what actually re-executed. The unconditional GO is FENCED behind real re-execution AND an
// anchor-verified pre-registration (XV). Byte-reproducible.

export namespace AttestAdjudicate {
  export type Verdict =
    | "GO" | "CONDITIONAL" | "NO-GO" | "CANNOT-VERIFY-SEARCH" | "CANNOT-VERIFY-DATA" | "INSUFFICIENT-EVIDENCE"

  export interface Attestation {
    id: string
    verdict: Verdict
    verifiability: Attest.Verifiability // the EFFECTIVE tier (after any un-executable downgrade)
    declaredVerifiability: Attest.Verifiability // what the submission claimed (before the earned-tier check)
    searchHonesty: Attest.SearchHonesty
    unconditional: boolean
    reExecuted: boolean // the engine ran its OWN executor and produced the returns (Rule XIV)
    anchorVerified: boolean // the pre-registration was anchored by the engine's own clock/on-chain (Rule XV)
    synthetic: boolean // the returns are a labeled engine-synthetic demonstration fixture (disclosed)
    consistency: AttestReexec.Consistency | null // V1 returns-vs-spec reproduction check
    rigor: any
    declaredNTrials: number | null
    effectiveNTrials: number | null // the engine's OWN search context for an earned V2 (never a claimant-declared one)
    dsrAtDeclared: number | null
    floorObs: number
    verifiedLedger: string[]
    trustedLedger: string[] // what the engine could NOT verify (the disclosed caveats)
    reasons: string[]
    reproHash: string
  }

  const GLOWING_SHARPE = 1.0 // an annualized Sharpe above this "looks like" a real claim
  const SIG = 0.95 // significance bar (PSR pre-registered, or DSR at the declared search)

  function dsrAt(sensitivity: { nTrials: number; dsr: number | null }[], n: number): number | null {
    const exact = sensitivity.find((s) => s.nTrials === n)
    return exact ? exact.dsr : null
  }

  interface Resolved {
    returns: number[]
    reExecuted: boolean
    reExec: AttestReexec.ReExec | null
    effectiveVerifiability: Attest.Verifiability
    consistency: AttestReexec.Consistency | null
    synthetic: boolean
    downgraded: boolean
  }

  // Resolve the returns + provenance the engine will adjudicate. The submitter NEVER supplies the returns for V2 —
  // the engine re-executes its own executor (Rule XIV). Un-executable V2/V1 ⇒ EFFECTIVE tier drops to V0.
  async function resolve(s: Attest.Submission, tier: AttestClassify.Tier): Promise<Resolved> {
    if (tier.verifiability === "V2") {
      const rex = await AttestReexec.executeOwnData(s.spec)
      if (rex)
        return { returns: rex.returns, reExecuted: true, reExec: rex, effectiveVerifiability: "V2", consistency: null, synthetic: rex.synthetic, downgraded: false }
      // un-executable ⇒ cap at V0 (CANNOT-VERIFY-DATA). Any caller returns are scored ONLY as a trusted V0 series.
      return { returns: s.returns ?? s.data?.returns ?? [], reExecuted: false, reExec: null, effectiveVerifiability: "V0", consistency: null, synthetic: false, downgraded: true }
    }
    if (tier.verifiability === "V1") {
      const rep = await AttestReexec.reproduceOnClaimantData(s.spec, s.data)
      if (rep)
        return { returns: rep.reExec.returns, reExecuted: true, reExec: rep.reExec, effectiveVerifiability: "V1", consistency: rep.consistency, synthetic: false, downgraded: false }
      // no runnable claimant data ⇒ rigor on the claimant's TRUSTED returns (not re-derived), still V1
      return { returns: s.data?.returns ?? [], reExecuted: false, reExec: null, effectiveVerifiability: "V1", consistency: null, synthetic: false, downgraded: false }
    }
    // V0
    return { returns: s.returns ?? s.data?.returns ?? [], reExecuted: false, reExec: null, effectiveVerifiability: "V0", consistency: null, synthetic: false, downgraded: false }
  }

  // The VERIFIED ledger asserts ONLY what actually re-executed this run (Rule XIV — a false line is a Halt). The
  // "re-derived on ORGΛNON's PIT data" line appears iff the engine really ran its own executor.
  function ledgers(
    effVerifiability: Attest.Verifiability,
    searchHonesty: Attest.SearchHonesty,
    r: Resolved,
  ): { verified: string[]; trusted: string[] } {
    const verified: string[] = []
    const trusted: string[] = []

    if (r.reExecuted && r.reExec) {
      for (const step of r.reExec.steps) verified.push(step)
      if (!r.synthetic) verified.push("returns RE-DERIVED by the engine's OWN executor — NOT taken from the submission")
      if (r.synthetic) trusted.push("the 'genuine edge' is an engine-controlled SYNTHETIC demonstration fixture, not a real market (disclosed — no real third-party edge is being attested)")
      if (effVerifiability === "V1" && r.consistency && !r.consistency.consistent) trusted.push(`returns-vs-spec: ${r.consistency.note}`)
      if (effVerifiability === "V1") trusted.push("the claimant's underlying data is genuine and point-in-time-clean (CANNOT verify — V1)")
    } else if (effVerifiability === "V1") {
      verified.push("rigor (Sharpe · PSR · DSR sensitivity · CPCV) computed ON the claimant's returns")
      trusted.push("the returns were NOT independently re-derived (no runnable data supplied); the claimant's data is genuine and PIT-clean (CANNOT verify — V1)")
    } else {
      verified.push("rigor (Sharpe · PSR · DSR sensitivity · CPCV) computed ON the submitted returns series")
      trusted.push("the returns series is genuine, point-in-time-clean, and complete (CANNOT verify — V0)")
      if (r.downgraded) trusted.push("the submitted spec could NOT be re-executed by the engine → capped at V0 (a tier is EARNED, never declared — Rule XIV)")
    }
    if (searchHonesty === "declared") trusted.push("the declared search intensity (n_trials) is honest (CANNOT verify — Rule XIII)")
    if (searchHonesty === "undeclared") trusted.push("search intensity is undeclared and unprovable (Rule XIII)")
    return { verified, trusted }
  }

  function decide(
    effVerifiability: Attest.Verifiability,
    searchHonesty: AttestClassify.Tier["searchHonesty"],
    rig: any,
    dsrDeclared: number | null,
  ): { verdict: Verdict; reasons: string[] } {
    const reasons: string[] = []
    if (rig.insufficient) return { verdict: "INSUFFICIENT-EVIDENCE", reasons: [`only ${rig.nObs} obs — below the derived power floor (${rig.minObs})`] }
    // degenerate series (zero-variance / non-finite rigor: constant, single distinct value, NaN-contaminated): the
    // Sharpe/PSR test is undefined → not attestable (Rule IX — bias to NO, never launder a degenerate into a yes).
    if (rig.psr0 === null || rig.psr0 === undefined || !Number.isFinite(rig.sharpeAnnualized) || !Number.isFinite(rig.psr0))
      return { verdict: "NO-GO", reasons: ["degenerate series (zero-variance or non-finite rigor) — not attestable"] }
    const glowing = rig.sharpeAnnualized > GLOWING_SHARPE

    if (searchHonesty === "undeclared") {
      reasons.push(glowing ? `glowing (annualized Sharpe ${rig.sharpeAnnualized.toFixed(2)}) but search unprovable` : "no edge even before deflation")
      return { verdict: glowing ? "CANNOT-VERIFY-SEARCH" : "NO-GO", reasons }
    }
    if (searchHonesty === "declared") {
      reasons.push(`DSR at declared n_trials = ${dsrDeclared === null ? "n/a" : dsrDeclared.toFixed(3)} (bar ${SIG})`)
      if (dsrDeclared === null || dsrDeclared < SIG) return { verdict: "NO-GO", reasons: [...reasons, "does not survive the deflation at the declared search (overfit / risk premium / noise)"] }
      return { verdict: "CONDITIONAL", reasons: [...reasons, "survives the deflation GIVEN the declared search — capped CONDITIONAL (not V2 ∧ anchor-pre-registered)"] }
    }
    // pre-registered (anchor-verified — no multiple-testing problem → PSR(0) is the honest significance)
    reasons.push(`anchor-verified pre-registration: PSR(0) = ${rig.psr0.toFixed(3)} (no deflation needed)`)
    if (rig.psr0 < SIG) return { verdict: "NO-GO", reasons: [...reasons, "not significant even pre-registered"] }
    if (effVerifiability === "V2") return { verdict: "GO", reasons: [...reasons, "earned V2 ∧ anchor-verified pre-registration ∧ significant → unconditional"] }
    if (effVerifiability === "V1") return { verdict: "CONDITIONAL", reasons: [...reasons, "significant but the claimant's data is unverified (V1)"] }
    return { verdict: "CANNOT-VERIFY-DATA", reasons: [...reasons, "significant but the spec was not re-executed on verifiable data (capped at V0)"] }
  }

  // The FENCE (Phase 0 / defense-in-depth): an unconditional GO is REFUSED unless the run actually re-executed the
  // spec (Rule XIV) AND the pre-registration is anchor-verified (Rule XV). Even if some path decided GO, this closes it.
  function fence(verdict: Verdict, reExecuted: boolean, anchorVerified: boolean): { verdict: Verdict; reason: string | null } {
    if (verdict !== "GO") return { verdict, reason: null }
    if (!anchorVerified) return { verdict: "CANNOT-VERIFY-SEARCH", reason: "FENCE: unconditional GO refused — the pre-registration is not anchor-verified (Rule XV)" }
    if (!reExecuted) return { verdict: "CANNOT-VERIFY-DATA", reason: "FENCE: unconditional GO refused — the spec was not re-executed by the engine on its own data (Rule XIV)" }
    return { verdict, reason: null }
  }

  export async function adjudicate(s: Attest.Submission): Promise<Attestation> {
    const tier = AttestClassify.classify(s)
    const declaredN = typeof s.declaredNTrials === "number" ? s.declaredNTrials : null

    const resolved = await resolve(s, tier)
    const effVerifiability = resolved.effectiveVerifiability
    const anchorVerified = tier.searchHonesty === "pre-registered" // pre-registered ⟺ anchor-verified (classify.ts)
    const effectiveNTrials = resolved.reExec ? resolved.reExec.nTrials : null

    // the DSR sensitivity grid: include the engine's OWN n_trials for an earned tier (never trust a declared search).
    const grid = [1, 10, 100, 1000, 10000, ...(declaredN ? [declaredN] : []), ...(effectiveNTrials ? [effectiveNTrials] : [])]
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a - b)

    const barsPerYear = s.barsPerYear ?? 365
    const floor = AttestPower.deriveObsFloor(barsPerYear)
    // real (un-inflated Lo-2002) var_sharpe for an EARNED tier (the series is the engine's own); conservative for V0/V1.
    const conservativeVarSharpe = !resolved.reExecuted || effVerifiability === "V1"
    const rig = await Runner.sidecar("attest", { returns: resolved.returns, nTrialsGrid: grid, barsPerYear, minObs: floor.floorObs, conservativeVarSharpe })

    // for an earned V2 the honest deflation is at the engine's OWN n_trials; else at the claimant's declared search.
    const deflationN = effVerifiability === "V2" && resolved.reExecuted ? effectiveNTrials : declaredN
    const dsrDeclared = deflationN && rig.sensitivity ? dsrAt(rig.sensitivity, deflationN) : null

    const decided = decide(effVerifiability, tier.searchHonesty, rig, dsrDeclared)
    const fenced = fence(decided.verdict, resolved.reExecuted, anchorVerified)
    const verdict = fenced.verdict
    const { verified, trusted } = ledgers(effVerifiability, tier.searchHonesty, resolved)

    const unconditional = verdict === "GO" && effVerifiability === "V2" && tier.searchHonesty === "pre-registered" && resolved.reExecuted && anchorVerified

    const core = { verdict, verifiability: effVerifiability, searchHonesty: tier.searchHonesty, rig, dsrDeclared, reExecuted: resolved.reExecuted, anchorVerified }
    const reproHash = createHash("sha256").update(JSON.stringify(core)).digest("hex")

    const reasons = [...tier.reasons, ...decided.reasons]
    if (fenced.reason) reasons.push(fenced.reason)
    if (resolved.downgraded) reasons.push("un-executable spec → EFFECTIVE tier capped at V0 (Rule XIV)")
    if (resolved.consistency && !resolved.consistency.consistent) reasons.push(`returns-vs-spec self-inconsistent: ${resolved.consistency.note}`)

    return {
      id: s.id,
      verdict,
      verifiability: effVerifiability,
      declaredVerifiability: tier.verifiability,
      searchHonesty: tier.searchHonesty,
      unconditional,
      reExecuted: resolved.reExecuted,
      anchorVerified,
      synthetic: resolved.synthetic,
      consistency: resolved.consistency,
      rigor: rig,
      declaredNTrials: declaredN,
      effectiveNTrials,
      dsrAtDeclared: dsrDeclared,
      floorObs: floor.floorObs,
      verifiedLedger: verified,
      trustedLedger: trusted,
      reasons,
      reproHash,
    }
  }
}
