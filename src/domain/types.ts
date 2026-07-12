/**
 * ORGΛNON — THE DOMAIN TYPE (Domain sprint; X-DOMAIN a). The engine learns WHAT KIND of thing it is looking at. A domain
 * is a subject TYPE, not a screen — the four new domains render through the conscious 3 exactly like every other subject.
 * The enum is PINNED (domain-pins.json xDomain.b.domainTypes); the four NEW domains each declare exactly ONE catch axis
 * (the fact the seven cannot see); the carried LENDING/FUNDING + UNCLASSIFIED declare NONE (the seven carried axes only).
 * Pure, dependency-free, deterministic. No verdict lives here — a domain drives WHICH LENS, never the verdict (X-KEEP).
 */
export namespace Domain {
  // the pinned DomainType (domain-pins.json xDomain.b.domainTypes). LENDING/FUNDING carried; the four new; UNCLASSIFIED the
  // conservative floor. A wall cross-checks this against the pins (a drift is a Halt).
  export type DomainType = "LENDING" | "FUNDING" | "STABLE-SYNTH" | "LST-LRT" | "LOOPED-CDP" | "RWA" | "UNCLASSIFIED"
  export const ALL: DomainType[] = ["LENDING", "FUNDING", "STABLE-SYNTH", "LST-LRT", "LOOPED-CDP", "RWA", "UNCLASSIFIED"]

  // the four NEW domains — the only ones that carry a catch axis + a domain badge (the carried + UNCLASSIFIED render as today)
  export const NEW_DOMAINS = ["STABLE-SYNTH", "LST-LRT", "LOOPED-CDP", "RWA"] as const
  export type NewDomain = (typeof NEW_DOMAINS)[number]
  export function isNewDomain(d: DomainType): d is NewDomain {
    return (NEW_DOMAINS as readonly string[]).includes(d)
  }

  // the catch-axis ids (one per new domain). The per-domain axis registry (registry.ts) maps domain → axis and forbids leakage.
  export type CatchAxis = "yield-source" | "redemption-gap" | "leverage-distance" | "off-chain-opacity"

  // the facts the classifier reads — a small, captured-facts view of a subject (never inference; X-DETERM). Every field is
  // already reachable from the shelf registry + the scorecard facts; a leverageSignal is present only when a health-factor/
  // LTV read exists (LOOPED-CDP's structural signal).
  export interface DomainFacts {
    project: string // the protocol (e.g. "ethena", "lido", "gearbox", "ondo")
    symbol: string // the token (e.g. "USDe", "stETH")
    name: string // the human label
    isStablecoin: boolean
    vertical?: "stablecoin-yield" | "lending" | "delta-neutral"
    deltaNeutral?: boolean
    leverageSignal?: boolean // a health-factor/LTV/collateral-ratio read exists (LOOPED-CDP structural signal)
  }

  export interface Classified {
    domain: DomainType
    how: string // the plain reason (the classifier SHOWS its work — the governance-classifier pattern)
    catchAxis: CatchAxis | null // the domain's ONE catch axis (null for LENDING/FUNDING/UNCLASSIFIED)
  }

  // ── THE CATCH (X-DOMAIN c) — the ONE additional honest line a new domain renders, in the governance line's grammar.
  // INFO/CONTEXT this sprint (off the scorecard verdict path — it renders like the governance line, OUT of the scorecard
  // rows; the Stamp's familyN stays 1; the differential + bundle byte-identical). Number-traced, provenance-tiered. Two
  // registers (Simple: plain, no decimals; Pro: the numbers, venues, hashes). A fact, never advice (the advice wall re-runs). ──
  export interface Catch {
    axis: CatchAxis
    domain: NewDomain
    disposition: "info/context" // ALWAYS this sprint — a catch axis moves no verdict (promotion is D36, the Operator's pen)
    tier: "REAL★" | "REAL-at-timestamp" | "SAMPLE" | "INSUFFICIENT" // which kind of true the catch's numbers are
    simple: string // the Simple register — plain-language, verdict-free, NO raw decimals
    pro: string // the Pro register — the numbers, the venues, the traced facts
    numbers: Record<string, number | string | null> // every rendered number, traced (a wall checks the render cites them)
    // RWA (off-chain-opacity) ONLY — the SAMPLE-labeled attestation surface (context to go verify, NEVER a verification) +
    // the structural-cap status (BUILT but NOT INSTALLED until D35 — an agent installs no verdict rule).
    attestation?: { issuer: string; auditor: string; cadence: string; lastAttestation: string; label: "SAMPLE" }
    capStatus?: { d35Signed: boolean; wouldCapUnder: string; installed: boolean; reason: string }
  }
}
