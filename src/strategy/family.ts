/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 5 (DD-59 / S148 / D71): THE FAMILY ENUMERATOR — *you build; ORGΛNON counts.*
 *
 * Not a proposer, not an optimizer, not a ranker — an ACCOUNTANT with perfect memory. `enumerate(filter)` is a SET OPERATION
 * over the user's OWN stated constraints (never a generation): it counts the shelf members satisfying the filter the user
 * himself stated. `selectionRank(pick, family)` is DERIVED, never asked — "your pick is the highest-APY member of your stated
 * filter — rank 1 of 48" (X-RECKON one level up: do not ASK whether he was yield-chasing; DERIVE it). It authors no manifest,
 * ranks no candidates FOR him to pick from, suggests nothing.
 *
 * D63 is OFF by the pen ("keep it off"): familyN stays 1, the deflation stays DARK — a seeded familyN > 1 FAILS to light it.
 * But the counts land in the moat REGARDLESS, so the day the pen reverses D63 the deflation lights over history already
 * recorded, with zero rework. The ruling cost the meter; it never cost the memory.
 *
 * Pure: reads the committed shelf-attributes fixture (REAL captured tvl/apy). No network. No model. No generation.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import type { Manifest } from "./manifest"

export namespace Family {
  export interface Member {
    project: string
    symbol: string
    chain: string
    asset: string
    tvlUsd: number | null
    apyBase: number | null
    pool?: string
  }

  // the shelf, with REAL captured attributes — the universe the filter selects FROM (Reality.CURATED + DefiLlama tvl/apy).
  export function shelf(): Member[] {
    try {
      const fx = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "shelf-attributes.json"), "utf8"))
      return fx.members as Member[]
    } catch { return [] }
  }

  // does a member satisfy the user's stated filter? A pure predicate — every clause is a constraint the USER stated.
  function matches(m: Member, f: Manifest.Filter): boolean {
    if (f.chain && m.chain.toLowerCase() !== f.chain.toLowerCase()) return false
    if (f.asset && m.asset.toLowerCase() !== f.asset.toLowerCase()) return false
    if (f.project && m.project.toLowerCase() !== f.project.toLowerCase()) return false
    if (f.minTvlUsd != null && (m.tvlUsd == null || m.tvlUsd < f.minTvlUsd)) return false
    if (f.minApy != null && (m.apyBase == null || m.apyBase < f.minApy)) return false
    return true
  }

  export interface Enumeration {
    filter: Manifest.Filter
    cardinality: number
    members: Member[]
    authoredManifest: null // AUTHORS NOTHING — always null (a seeded manifest emission would put a spec here; it never does)
  }

  // ENUMERATE — a SET OPERATION over the shelf. Counts the members satisfying the user's OWN filter. Authors nothing.
  export function enumerate(filter: Manifest.Filter): Enumeration {
    const members = shelf().filter((m) => matches(m, filter))
    return { filter, cardinality: members.length, members, authoredManifest: null }
  }

  export interface Rank {
    rank: number // the pick's 1-based position within the family, by the stated attribute (DERIVED, never asked)
    of: number // the family cardinality
    byAttribute: "apyBase" // the attribute the rank is derived over (APY — the yield-chasing axis, X-RECKON)
    detail: string
    // NOTE the shape: {rank, of} — a FACT about the user's OWN pick, NOT an ordered list of candidates to choose from.
    // A "recommended" / "top pick" / ordered-candidate-list field does NOT exist (ranks no candidates FOR him).
  }

  // SELECTION RANK — DERIVED, never asked. Where does the user's OWN pick sit in the family he defined, by APY? (rank 1 =
  // the highest-APY member — the yield-chasing tell, derived not confessed.) A pick outside the family → rank 0 of N (honest).
  export function selectionRank(pick: { project: string; symbol: string; chain: string }, family: Member[]): Rank {
    // sort the family by APY descending to LOCATE the pick's rank — an internal ordering to find a position, NEVER an output
    // list of candidates to choose from (the distinction A3 turns on: the mirror shows where you stand, it does not choose for you).
    const sorted = [...family].sort((a, b) => (b.apyBase ?? -Infinity) - (a.apyBase ?? -Infinity))
    const idx = sorted.findIndex((m) => m.project === pick.project && m.symbol === pick.symbol && m.chain === pick.chain)
    const rank = idx < 0 ? 0 : idx + 1
    const of = family.length
    const detail = rank === 0
      ? `your pick (${pick.project}/${pick.symbol}) is not a member of the filter you stated — rank 0 of ${of}`
      : rank === 1
        ? `your pick is the HIGHEST-APY member of your stated filter — rank ${rank} of ${of} (the yield-chasing axis, derived from your own choice, never asked)`
        : `your pick is rank ${rank} of ${of} by APY within the filter you stated (derived from your own choice, never asked)`
    return { rank, of, byAttribute: "apyBase", detail }
  }

  // ── D63 OFF — the meter is dark by the pen's word ("keep it off") ─────────────────────────────────────────────────────
  // familyN is the count of trial VARIANTS in a strategy family (NOT the enumerator's shelf cardinality). It stays 1: a
  // strategy of one. The deflated-Sharpe meter reads familyN; with D63 OFF it never lights, and a SEEDED familyN > 1 FAILS
  // to light it (the ruling costs the meter). The counts still land in the moat, so a reversal lights it over history.
  export const familyN = 1
  export const D63 = "OFF" as const

  // the meter is lit ONLY if D63 is ON AND familyN > 1. D63 is OFF → always dark, even for a seeded familyN > 1.
  export function meterLit(seededFamilyN: number = familyN): boolean {
    return (D63 as string) === "ON" && seededFamilyN > 1
  }

  // AUTHORS NOTHING — the enumeration + rank contain NO authored manifest, NO ordered candidate list to pick from, NO
  // suggestion. A pure structural guard (S148): the result is facts (a count + a rank), and nothing that authors or advises.
  export function authorsNothing(e: Enumeration): boolean {
    return e.authoredManifest === null
  }

  // the guard-passing FACT statement — a count + a derived rank, speakable in both registers, through the ONE GUARD. It
  // states what the user did (the cardinality of HIS filter, the rank of HIS pick) and STOPS: no suggestion, no better pick,
  // no "consider instead". D63 OFF → it names the family size as a FACT, never lights a meter (familyN stays 1).
  export function statement(e: Enumeration, rank: Rank, register: "simple" | "pro" = "pro"): string {
    const size = e.cardinality
    if (register === "simple") {
      return `You filtered the shelf to ${size} pool${size === 1 ? "" : "s"}. Your pick sits at ${rank.rank === 0 ? "not in that set" : `rank ${rank.rank} of ${rank.of} by yield`}. A count, not advice.`
    }
    return `Your stated filter selects ${size} member${size === 1 ? "" : "s"} of the shelf. ${rank.detail}. This is a COUNT and a derived rank — a fact about the family you defined and the pick you made, never a nudge toward a different pick (familyN stays 1; the deflation meter is off by the pen's word).`
  }
}
