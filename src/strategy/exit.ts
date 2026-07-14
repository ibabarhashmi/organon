/**
 * ORGΛNON — THE MANIFEST SPRINT (X-MANIFEST d, S73). THE EXIT CRITERION IS THE USER'S KILL-CRITERION — the single most
 * transferable thing the tool owns (its own `8b4e094b` discipline: a goalpost set before the throw, immutable without
 * disclosure), exported to the user as a primitive.
 *
 *   · registerExit — the criterion must be EVALUABLE over facts the engine already captures (the pinned evaluable set); an
 *     unevaluable criterion (a kind the engine cannot read, an insane threshold for the kind) is REFUSED with the reason.
 *     A registered criterion is CONTENT-HASHED (sha256 over the canonical criterion) — the goalpost, fixed.
 *   · detectSilentEdit — a silent edit to a registered criterion is DETECTED (the content hash diverges).
 *   · repinExit — the ONLY sanctioned amendment: a DISCLOSED re-pin recording {old, new, reason} (never a silent move).
 *   · evaluateExit — DETERMINISTIC over the captured facts (byte-identical ×2); a fact the engine cannot read for the
 *     scoped subject → UNJUDGEABLE (never a fabricated fired/not-fired). Pure; no I/O; no model.
 */
import { createHash } from "node:crypto"
import { Manifest } from "./manifest"

export namespace ExitCriterion {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  export type T = Manifest.ExitCriterion

  // the facts the exit evaluation reads — each already computed by the existing pipeline for the scoped subject. A `null`
  // means the engine could not capture that fact for this subject → the criterion is UNJUDGEABLE (never guessed).
  export interface Facts {
    peg?: number | null // the subject's captured peg (peg axis)
    fundingNegPeriods?: number | null // count of negative funding periods (yield-source funding-flip census)
    fundingTotalPeriods?: number | null
    tvlDrawdown?: number | null // fraction drop from captured peak (tvl-trend), e.g. 0.3 = down 30%
    governanceChanged?: boolean | null // the captured governance class changed (governance line)
    // SOCKET V37 (S112) — concentration-ceiling. The DIMENSIONLESS share = position.size / poolTvl, pre-computed by the
    // pipeline that holds BOTH the user's authored size AND the captured pool TVL (Exit.concentration). null → UNJUDGEABLE.
    concentrationShare?: number | null
    // FAMILY V39 (D70) — the sixth + seventh observables. oracleStalenessS = (now − feed.updatedAt) in seconds (TEMPORAL, not
    // a value); utilizationRatio = totalBorrow/totalSupply (DIMENSIONLESS). null → UNJUDGEABLE (no captured input).
    oracleStalenessS?: number | null
    utilizationRatio?: number | null
  }

  // FAMILY V39 (DD-56) — oracle-staleness observable: (now − feed.updatedAt) in SECONDS. A TEMPORAL quantity, never a price
  // or a value (the valuation ban is untouched). UNJUDGEABLE without a captured feed.updatedAt. The curator-loss #1 root
  // cause becomes a pre-registrable kill-condition: an oracle that stopped updating while the asset moved.
  export function oracleStaleness(feed: { updatedAt: number | null | undefined }, now: number): { seconds: number | null; why: string } {
    if (feed.updatedAt == null || !Number.isFinite(feed.updatedAt)) return { seconds: null, why: "UNJUDGEABLE — no captured feed.updatedAt for the scoped subject; staleness cannot be computed without it." }
    const seconds = Math.max(0, Math.round(now - feed.updatedAt))
    return { seconds, why: `staleness = now ${now} − updatedAt ${feed.updatedAt} = ${seconds}s (temporal — seconds since the oracle last updated; a duration, not a dollar amount)` }
  }

  // FAMILY V39 (DD-57) — utilization-ceiling observable: totalBorrow / totalSupply. A DIMENSIONLESS ratio (no USD survives the
  // division). UNJUDGEABLE without both captured inputs (missing stays missing). "Can you actually get out?"
  export function utilization(totalBorrow: number | null | undefined, totalSupply: number | null | undefined): { ratio: number | null; why: string } {
    if (totalBorrow == null || totalSupply == null || !Number.isFinite(totalBorrow) || !Number.isFinite(totalSupply) || totalSupply <= 0) return { ratio: null, why: "UNJUDGEABLE — no captured total borrow/supply for the scoped subject; a utilization ratio needs both." }
    return { ratio: totalBorrow / totalSupply, why: `utilization = totalBorrow ${totalBorrow} / totalSupply ${totalSupply} = ${(totalBorrow / totalSupply).toFixed(4)} (dimensionless — a ratio, not a dollar amount)` }
  }

  // SOCKET V37 (S112) — Exit.concentration: the DIMENSIONLESS share of a pool a position holds. A SHARE IS NOT A VALUE —
  // size / poolTvl carries no USD, no price, no oracle (the valuation ban is untouched). UNJUDGEABLE without either input
  // (missing stays missing). The unit honesty: it is a valid share only if the user's size units match the pool's TVL
  // denomination, which the caller states; ORGANON does not convert or price.
  export function concentration(size: number | null | undefined, poolTvl: number | null | undefined): { share: number | null; why: string } {
    if (size == null || !Number.isFinite(size) || size <= 0) return { share: null, why: "UNJUDGEABLE — no position size (the user's own units); a share cannot be computed without it." }
    if (poolTvl == null || !Number.isFinite(poolTvl) || poolTvl <= 0) return { share: null, why: "UNJUDGEABLE — no captured pool TVL for the scoped subject; a share cannot be computed without it." }
    return { share: size / poolTvl, why: `share = size ${size} / poolTvl ${poolTvl} = ${(size / poolTvl).toFixed(6)} (dimensionless — no USD, no price, no oracle)` }
  }

  export type RegisterResult = { ok: true; hash: string; criterion: T } | { ok: false; error: string }

  // the sanity bounds per kind — a threshold outside these is unevaluable-in-practice and refused with the reason.
  function thresholdReason(c: T): string | null {
    switch (c.kind) {
      case "peg-floor":
        return c.threshold > 0 && c.threshold <= 2 ? null : `a peg floor must be a price near par (0 < threshold ≤ 2); ${c.threshold} is not a peg the engine can evaluate`
      case "funding-flip-count":
        return Number.isInteger(c.threshold) && c.threshold >= 1 ? null : `a funding-flip count must be a whole number ≥ 1 of negative periods; ${c.threshold} is not`
      case "tvl-drawdown":
        return c.threshold > 0 && c.threshold < 1 ? null : `a TVL drawdown must be a fraction in (0, 1) — e.g. 0.3 for a 30% drop; ${c.threshold} is not`
      case "governance-change":
        return null // a boolean trigger — the threshold is unused; any value accepted (documented)
      case "concentration-ceiling":
        return c.threshold > 0 && c.threshold <= 1 ? null : `a concentration ceiling must be a share in (0, 1] — e.g. 0.25 for "exit if I am ≥ 25% of the pool"; ${c.threshold} is not a dimensionless share`
      case "oracle-staleness":
        return Number.isFinite(c.threshold) && c.threshold >= 60 ? null : `an oracle-staleness ceiling must be a number of SECONDS ≥ 60 — e.g. 86400 for "exit if the oracle has not updated in a day"; ${c.threshold} is not`
      case "utilization-ceiling":
        return c.threshold > 0 && c.threshold <= 1 ? null : `a utilization ceiling must be a ratio in (0, 1] — e.g. 0.95 for "exit if the market is ≥ 95% utilized (you cannot get out)"; ${c.threshold} is not a dimensionless ratio`
      default:
        return `the exit kind "${(c as T).kind}" is not evaluable over facts the engine captures`
    }
  }

  // REGISTER — evaluable-only; content-hashed. An unevaluable criterion is refused WITH the reason (the discipline exports
  // its FORCE, not just its form). The criterion must already be shape-valid (Manifest.ExitCriterion); registerExit adds
  // the evaluability sanity + the content hash (the goalpost fixed at registration, exactly as `8b4e094b` is).
  export function register(criterion: unknown): RegisterResult {
    const parsed = Manifest.ExitCriterion.safeParse(criterion)
    if (!parsed.success) {
      const kinds = Manifest.EXIT_KINDS.join(", ")
      return { ok: false, error: `The exit criterion is not evaluable over facts the engine captures (allowed kinds: ${kinds}; e.g. "exit when Twitter sentiment turns" is refused — the engine cannot read it). Refused at registration.` }
    }
    const reason = thresholdReason(parsed.data)
    if (reason) return { ok: false, error: `The exit criterion is not evaluable: ${reason}. Refused at registration.` }
    return { ok: true, hash: hashOf(parsed.data), criterion: parsed.data }
  }

  // the content hash — the goalpost, fixed. Canonical key order (kind, threshold, subjectScope) so the hash is stable.
  export function hashOf(c: T): string {
    return sha256(JSON.stringify({ kind: c.kind, threshold: c.threshold, subjectScope: c.subjectScope }))
  }

  // a silent edit is DETECTED — the registered hash no longer matches the current criterion (the hash diverges).
  export function isSilentEdit(registeredHash: string, current: T): boolean {
    return hashOf(current) !== registeredHash
  }

  export interface Repin {
    old: T
    new: T
    oldHash: string
    newHash: string
    reason: string
    at: string
  }

  // the ONLY sanctioned amendment — a DISCLOSED re-pin recording {old, new, reason}. The old hash + new hash are recorded;
  // a reader sees exactly what moved and why (never a silent goalpost move). `at` is caller-supplied (deterministic tests).
  export function repin(oldCriterion: T, newCriterion: unknown, reason: string, at: string): { ok: true; repin: Repin } | { ok: false; error: string } {
    const reg = register(newCriterion)
    if (!reg.ok) return reg
    if (!reason || reason.trim().length === 0) return { ok: false, error: "A re-pin must state WHY the exit criterion moved — a goalpost cannot move without a disclosed reason. Refused." }
    return { ok: true, repin: { old: oldCriterion, new: reg.criterion, oldHash: hashOf(oldCriterion), newHash: reg.hash, reason: reason.trim(), at } }
  }

  export interface Evaluation {
    fired: boolean
    judgeable: boolean // false when the needed fact is not captured for the scoped subject
    why: string
  }

  // EVALUATE — deterministic over the captured facts (byte-identical ×2). A missing fact → UNJUDGEABLE (never a fabricated
  // fired/not-fired). The `why` names the number and the comparison exactly (number-traced, info/context).
  export function evaluate(c: T, facts: Facts): Evaluation {
    switch (c.kind) {
      case "peg-floor": {
        if (facts.peg == null) return { fired: false, judgeable: false, why: `UNJUDGEABLE — no captured peg for the scoped subject (${c.subjectScope}); the criterion is not evaluated on absent data.` }
        const fired = facts.peg < c.threshold
        return { fired, judgeable: true, why: `peg ${facts.peg} ${fired ? "<" : "≥"} floor ${c.threshold} → ${fired ? "FIRED" : "NOT FIRED"}` }
      }
      case "funding-flip-count": {
        if (facts.fundingNegPeriods == null) return { fired: false, judgeable: false, why: `UNJUDGEABLE — no captured funding series for the scoped subject (${c.subjectScope}).` }
        const fired = facts.fundingNegPeriods >= c.threshold
        const of = facts.fundingTotalPeriods != null ? ` of ${facts.fundingTotalPeriods}` : ""
        return { fired, judgeable: true, why: `funding negative in ${facts.fundingNegPeriods}${of} periods ${fired ? "≥" : "<"} ${c.threshold} → ${fired ? "FIRED" : "NOT FIRED"}` }
      }
      case "tvl-drawdown": {
        if (facts.tvlDrawdown == null) return { fired: false, judgeable: false, why: `UNJUDGEABLE — no captured TVL series for the scoped subject (${c.subjectScope}).` }
        const fired = facts.tvlDrawdown >= c.threshold
        return { fired, judgeable: true, why: `TVL drawdown ${facts.tvlDrawdown} from peak ${fired ? "≥" : "<"} ${c.threshold} → ${fired ? "FIRED" : "NOT FIRED"}` }
      }
      case "governance-change": {
        if (facts.governanceChanged == null) return { fired: false, judgeable: false, why: `UNJUDGEABLE — no captured governance read for the scoped subject (${c.subjectScope}).` }
        const fired = facts.governanceChanged === true
        return { fired, judgeable: true, why: `governance class ${fired ? "CHANGED" : "unchanged"} → ${fired ? "FIRED" : "NOT FIRED"}` }
      }
      case "concentration-ceiling": {
        // SOCKET V37 (S112) — the DIMENSIONLESS share vs the ceiling; UNJUDGEABLE when the share could not be computed
        // (missing size or TVL). No USD, no price, no oracle — a share, never a value.
        if (facts.concentrationShare == null) return { fired: false, judgeable: false, why: `UNJUDGEABLE — no concentration share for the scoped subject (${c.subjectScope}); needs the position size AND the captured pool TVL.` }
        const fired = facts.concentrationShare >= c.threshold
        return { fired, judgeable: true, why: `concentration share ${facts.concentrationShare.toFixed(4)} ${fired ? "≥" : "<"} ceiling ${c.threshold} → ${fired ? "FIRED" : "NOT FIRED"} (dimensionless; can you actually get out?)` }
      }
      case "oracle-staleness": {
        // FAMILY V39 (D70) — the TEMPORAL observable: seconds since the oracle last updated. FIRED when it exceeds the ceiling.
        if (facts.oracleStalenessS == null) return { fired: false, judgeable: false, why: `UNJUDGEABLE — no captured oracle staleness for the scoped subject (${c.subjectScope}); needs a feed.updatedAt (Chainlink latestRoundData).` }
        const fired = facts.oracleStalenessS >= c.threshold
        return { fired, judgeable: true, why: `oracle staleness ${facts.oracleStalenessS}s ${fired ? "≥" : "<"} ceiling ${c.threshold}s → ${fired ? "FIRED" : "NOT FIRED"} (the oracle that kept reporting $1 while the asset collapsed — a temporal count, no price)` }
      }
      case "utilization-ceiling": {
        // FAMILY V39 (D70) — the DIMENSIONLESS ratio: totalBorrow/totalSupply. FIRED when the market is too utilized to exit.
        if (facts.utilizationRatio == null) return { fired: false, judgeable: false, why: `UNJUDGEABLE — no captured utilization for the scoped subject (${c.subjectScope}); needs total borrow AND total supply.` }
        const fired = facts.utilizationRatio >= c.threshold
        return { fired, judgeable: true, why: `utilization ${facts.utilizationRatio.toFixed(4)} ${fired ? "≥" : "<"} ceiling ${c.threshold} → ${fired ? "FIRED" : "NOT FIRED"} (dimensionless; can you actually get out?)` }
      }
    }
  }
}
