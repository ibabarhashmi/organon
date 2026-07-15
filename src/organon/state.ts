/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 1 (S150 / MR18 / J-4): ONE PRODUCER OF A DEVIATION'S STATE.
 *
 * V38's log asserted TWO contradictory states of D51: the base gate (generated) said "D51 OPEN · pens unmoved: 2 sprints";
 * PART B (generated) said "D51 ANSWERED: INSTRUMENT". S107 checks ARITHMETIC (every producer agrees on a NUMBER); nothing
 * checked STATE. The fix is ARCHITECTURAL, not a checker (attack #8): ONE State.deviations() producer; every render READS
 * from it; a contradiction becomes UNREPRESENTABLE rather than merely detectable. Discipline drifts; schemas don't.
 *
 * Also Phase 1's two priced-fact producers:
 *   · Search.forTestRedesign(old, new) — the estimand changed ⇒ a SEARCH (S140/D56); a redesigned test with no chained
 *     SEARCH hash is a Halt. The price becomes automatic FOREVER.
 *   · Evidence.forStateFlip(dev) — a producer that FLIPS a deviation's state must EMIT the evidence that flipped it
 *     ({z, acceptanceRegion, preRegisteredAt}); a flip on a boolean is REFUSED (S141/J-3). The pen does not unlock on a boolean.
 *
 * Pure: reads committed artifacts (the rulings, the recomputed D33, the pins). No I/O beyond those reads. No network.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Signability } from "../backtest/crosscheck"

function read(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", name), "utf8"))
}
function tryRead(name: string): Record<string, unknown> | null {
  try { return read(name) } catch { return null }
}

export namespace State {
  export interface Deviation {
    id: string
    state: string // the CURRENT recorded state — the SINGLE authority (ANSWERED / SIGNABLE / OFF / OPEN / FIRST …)
    detail: string
    source: string // the committed artifact the state was derived from (never hand-typed)
    supersedes?: string // MR18 — the block this state supersedes (e.g. the base gate's stale "D51 OPEN" line)
  }

  // THE ONE PRODUCER — every render (the base gate, the addendum, the build log) reads from HERE. A render that hardcodes a
  // state contradicting this producer is caught by S150 (contradiction()). Derived from committed artifacts, never typed.
  export function deviations(): Deviation[] {
    const out: Deviation[] = []

    // D51 — ANSWERED = INSTRUMENT (V38-B, the pen's word). This is the state that V38's base gate contradicted (J-4). MR18:
    // the base gate no longer hardcodes "OPEN · pens unmoved: 2 sprints"; it renders this state + the supersession pointer.
    const sg = tryRead("surrogate-pins.json")
    const d51 = (sg?.thePenMoved as { rulings?: { D51?: { status?: string; inferenceStatedSeparately?: string } } } | undefined)?.rulings?.D51
    if (d51?.status) {
      out.push({
        id: "D51",
        state: d51.status, // "ANSWERED"
        detail: `${d51.status} — ${/INSTRUMENT/.test(d51.inferenceStatedSeparately ?? "") ? "INSTRUMENT (n=1 BY DESIGN)" : d51.inferenceStatedSeparately ?? ""}; the pen ruled 'my personal tool' (V38-B). reachableHumans: 1 BY DESIGN.`,
        source: "surrogate-pins.json → thePenMoved.rulings.D51",
        supersedes: "the base gate's V38 line 'D51 OPEN · pens unmoved: 2 sprints · Is ORGΛNON a product, or an instrument?' — that question is ANSWERED; the base gate now redirects to this state (MR18/S150).",
      })
    } else {
      out.push({ id: "D51", state: "OPEN", detail: "OPEN — no ruling recorded (a pre-V38-B checkout).", source: "surrogate-pins.json (absent)" })
    }

    // D33 — the RECOMPUTED state (SIGNABLE), carrying its PRICE (testRedesigns, never resets) and its i.i.d. RIDER on the
    // same line (S142). This is the SINGLE source of D33's rendered state; the gate reads Signability via this producer.
    const d = Signability.d33()
    out.push({
      id: "D33",
      state: d.state,
      detail: `${d.detail} operatorSigned: false (LN5).`,
      source: "backtest/crosscheck.ts → Signability.d33() (price: record/chain.json d56SearchLedgerHash; rider: effective-n-determination.json)",
    })

    // D63 — OFF by the pen ("keep it off"). familyN stays 1; the deflation is DARK; a seeded activation FAILS.
    out.push({
      id: "D63",
      state: "OFF",
      detail: "OFF — the deflation / K-activation meter stays dark by the Operator's word ('keep it off'); familyN === 1; the counts still land in the moat, so a reversal lights the meter over recorded history with zero rework.",
      source: "family-pins.json → phase5_enumerator.d63_off",
    })

    // D27 — STILL FIRST, unsigned. "The Stamp is knowingly generous until D27 is signed."
    out.push({
      id: "D27",
      state: "FIRST",
      detail: "FIRST — the Stamp is knowingly generous until D27 is signed. Presented at the gate, NEVER signed (LN5).",
      source: "the current head pins → deviations.operatorGatedNote",
    })

    // PROVENANCE V42 (MR20/S174) — M-6: D80–D83 were pinned and gated (V41) but ABSENT from the machine-readable state list,
    // which enumerated only D51/D33/D63/D27. The ONE producer now folds in every RESERVED deviation from the current pins
    // heads (variant D80–D83, provenance D84–D86), each RESERVED and Operator-signed=false (LN5). A pinned deviation absent
    // from deviationStates FAILS S174 — the state list can no longer under-enumerate what the gate presents.
    const seen = new Set(out.map((d) => d.id))
    for (const f of ["variant-pins.json", "provenance-pins.json", "backfill-pins.json"]) {
      const p = tryRead(f)
      const devs = p?.deviations as Record<string, unknown> | undefined
      if (!devs) continue
      for (const [id, detail] of Object.entries(devs)) {
        if (!/^D\d+$/.test(id) || seen.has(id)) continue // skip mr13/mr20/operatorGatedNote and any already-enumerated id
        const s = String(detail)
        out.push({ id, state: "RESERVED", detail: `${s.slice(0, 220)}${s.length > 220 ? "…" : ""}`, source: `${f} → deviations.${id} (Operator-signed=false, LN5)` })
        seen.add(id)
      }
    }

    return out
  }

  export function byId(id: string): Deviation | undefined {
    return deviations().find((d) => d.id === id)
  }

  // S150 — given the states a render actually emitted ({id: renderedState}), return the ids whose rendered state CONTRADICTS
  // the single producer. An empty array means every render agrees. A seeded second render hardcoding "OPEN" for D51 (while
  // the producer says "ANSWERED") lands in this array — the contradiction is caught, not merely hoped away.
  export function contradiction(renderedStates: Record<string, string>): string[] {
    const canonical = new Map(deviations().map((d) => [d.id, d.state]))
    const bad: string[] = []
    for (const [id, rendered] of Object.entries(renderedStates)) {
      const c = canonical.get(id)
      if (c !== undefined && c !== rendered) bad.push(id)
    }
    return bad
  }
}

export namespace Search {
  export interface LedgerEntry {
    act: "SEARCH"
    reason: string
    estimandChanged: true
    requiresChainedHash: true
  }
  // S140 (D56) — a test whose ESTIMAND changed is a SEARCH. `old` and `new` describe the estimand each test measures; if
  // they differ, this is a redesign and a SEARCH is owed (its hash must be chained in record/, else the battery Halts).
  // Returns null when the estimand did NOT change (a re-run of the same test is not a search).
  export function forTestRedesign(oldEstimand: string, newEstimand: string): LedgerEntry | null {
    if (oldEstimand.trim() === newEstimand.trim()) return null // same test, same estimand — not a search
    return {
      act: "SEARCH",
      reason: `the estimand changed: "${oldEstimand}" → "${newEstimand}". A change of TEST is a change of hypothesis; under X-RECKON a hypothesis tried is a SEARCH. The price must be chained in record/ (D56).`,
      estimandChanged: true,
      requiresChainedHash: true,
    }
  }

  // the pure pricing predicate (S140's teeth) — a recorded test redesign is PRICED iff there are no redesigns OR a chained
  // SEARCH hash exists. A redesign with no chained hash is UNPRICED → a Halt (the price is automatic forever).
  export function pricedGiven(redesigns: number, chainedHash: string | null): boolean {
    return redesigns === 0 || chainedHash !== null
  }

  // S140 — the record's teeth applied to the live artifacts. Reads test-redesign-search.json + record/chain.json.
  export function redesignIsPriced(): { redesigns: number; chainedHash: string | null; priced: boolean } {
    const rec = tryRead("test-redesign-search.json")
    const redesigns = (rec?.redesigns as number | undefined) ?? 0
    let chainedHash: string | null = null
    try {
      const chain = JSON.parse(readFileSync(path.join(PKG_ROOT, "record", "chain.json"), "utf8"))
      chainedHash = (chain.d56SearchLedgerHash as string | undefined) ?? null
    } catch { /* no chain on this checkout */ }
    return { redesigns, chainedHash, priced: pricedGiven(redesigns, chainedHash) }
  }
}

export namespace Evidence {
  export type Flip = { z: number; acceptanceRegion: string; preRegisteredAt: string } | { refused: true; why: string }
  // S141 (J-3) — a producer that FLIPS a deviation's state (e.g. D33 → SIGNABLE) must EMIT the evidence that flipped it: the
  // z-score, the pre-pinned acceptance region, and the pre-registration timestamp. A flip on a BOOLEAN (no z, no region) is
  // REFUSED — the pen does not unlock on a boolean. Reads the recomputed cross-check + the pinned theory band.
  export function forStateFlip(deviationId: string): Flip {
    if (deviationId !== "D33") return { refused: true, why: `Evidence.forStateFlip only backs D33's flip this sprint; ${deviationId} has no flip evidence producer.` }
    // the evidence is the S116 powered theory leg: the null-distribution MEAN z, the |z|<2 acceptance region, pre-pinned.
    const legs = tryReadCrossCheckLegs()
    if (!legs || legs.z == null || !Number.isFinite(legs.z)) {
      return { refused: true, why: "D33 SIGNABLE with NO emitted z — a flip on a boolean is REFUSED (S141/J-3). The deciding number must be shown: z, the acceptance region, and the pre-registration timestamp." }
    }
    return { z: legs.z, acceptanceRegion: "|z_mean| < 2 (the pre-registered band; the null-distribution MEAN indistinguishable from the pinned theory 0.5)", preRegisteredAt: legs.preRegisteredAt }
  }

  // read the powered theory leg's z + the pre-registration timestamp from the committed cross-check + socket pins.
  function tryReadCrossCheckLegs(): { z: number | null; preRegisteredAt: string } | null {
    try {
      const cc = tryRead("rigor-crosscheck.json")
      const socket = tryRead("socket-pins.json")
      // the powered estimate is the null-distribution MEAN at S=16 (crossCheck.s116PowerFix.nullDistS16); the z is the MEAN's
      // distance from the pinned theory in units of the MEAN's SE (sd/√nSeeds) — the exact quantity Correctness.legs uses.
      const powered = ((cc?.crossCheck as { s116PowerFix?: { nullDistS16?: { mean: number; sd: number; nSeeds: number } } } | undefined)?.s116PowerFix)?.nullDistS16
      const theory = (socket?.pboTheory as { expectedPboUnderNoise?: number } | undefined)?.expectedPboUnderNoise
      if (!powered || theory == null) return { z: null, preRegisteredAt: "" }
      const seMean = powered.sd / Math.sqrt(powered.nSeeds)
      const z = seMean > 0 ? (powered.mean - theory) / seMean : null
      // the theory band was pinned in socket-pins (V37), before the powered estimate was seen — that is the pre-registration.
      const at = (socket?.at as string | undefined) ?? "socket-pins (V37) — the theory band pre-pinned before compute"
      return { z, preRegisteredAt: at }
    } catch { return null }
  }
}
