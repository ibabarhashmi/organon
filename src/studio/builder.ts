/**
 * ORGΛNON STUDIO — the GUIDED BUILDER (Reachability Phase 3; Rules U-AMEND, U-SURFACE, S-PROPOSE, S-FAMILY, A′#5/#6).
 * The missing middle door: between the newcomer who clicks a preset and the goal-writer who trusts a model sits the user
 * who wants to COMPOSE the spec themselves, field by field, understanding each choice. A schema-driven form over the
 * EXISTING typed primitives (lending, here) — no new primitive types, no free-form code, no model calls from the form.
 * CONSERVATIVE ratified defaults (no leverage-forward, no GO-hunting); plain-language field help honesty-checked (a
 * default or copy that primes toward risk or a GO is an S2); DERIVES NOTHING (validation comes from the same schema the
 * API enforces — one source of truth); every composed spec submits through the identical write-then-invoke gate with
 * declared family/lineage. A builder-composed spec is a trial like any other; editing + resubmitting stiffens the bar.
 */
import type { DataPlaneEngine } from "../dataplane/engine"

export namespace Builder {
  // the CONSERVATIVE defaults, ratified (A′#6) — static (no tilt), equal weights, monthly; never leverage-forward
  export const DEFAULTS = { policy: "static" as const, rebalanceTrigger: "monthly", weightMode: "equal" as const }

  export interface Field {
    id: string
    label: string
    help: string // plain-language: what this choice means + what it risks — honesty-checked (never primes)
    kind: "markets" | "select"
    options?: string[]
    default?: string
  }
  // the field schema over the existing lending primitive (DataPlaneEngine.LendingSpec)
  export const FIELDS: Field[] = [
    { id: "markets", label: "Markets — which lending pools to allocate across", help: "Choose the lending markets to spread across. Adding markets diversifies the bet; it does not guarantee a better result — the honest verdict still depends on the data, and the deflation charges every strategy you try.", kind: "markets" },
    { id: "policy", label: "Allocation policy", help: "'static' holds fixed equal-ish weights (the conservative default). 'carry-tilt' and 'carry-rotation' shift toward higher-yield markets — more active, not necessarily better; the extra search is charged by the family-size deflation.", kind: "select", options: ["static", "carry-tilt", "carry-rotation"], default: "static" },
    { id: "rebalance", label: "Rebalance frequency", help: "How often the weights are re-set. Monthly is the conservative default; more frequent rebalancing is not inherently better.", kind: "select", options: ["monthly"], default: "monthly" },
    { id: "lineage", label: "Is this an edit of an earlier attempt?", help: "If this edits a strategy you already submitted, declare its parent. Editing and resubmitting counts as ANOTHER attempt in the same family — the bar stiffens (family-size deflation). This is the product working, not a penalty.", kind: "select", options: ["(new strategy)"], default: "(new strategy)" },
  ]

  export interface ComposeInput { markets: { key: string; weight: number }[]; policy?: string; rebalance?: string; parentSpecHash?: string | null }
  export interface Composed { spec: DataPlaneEngine.LendingSpec; lineage: { parentSpecHash: string | null; isEdit: boolean } }

  // Compose + VALIDATE via the same schema the API enforces (derives nothing; one source of truth). An invalid
  // composition (an impossible parameter pair, an out-of-range weight, an unknown market, an empty set) is REFUSED with
  // an honest, non-priming message BEFORE registration — never a crash, never a fabricated verdict (the failure state).
  export function compose(input: ComposeInput, availableMarkets: string[]): { ok: true; composed: Composed } | { ok: false; error: string } {
    const markets = Array.isArray(input.markets) ? input.markets : []
    if (!markets.length) return { ok: false, error: "No markets selected. Choose at least one lending market to allocate across. Nothing was registered." }
    for (const m of markets) {
      if (typeof m?.key !== "string" || !availableMarkets.includes(m.key)) return { ok: false, error: `Market "${m?.key}" is not in the available captured set. The builder composes only over existing primitives — an unknown market is refused before registration. Nothing was registered.` }
      if (typeof m?.weight !== "number" || !Number.isFinite(m.weight) || m.weight < 0 || m.weight > 1) return { ok: false, error: `Weight ${m?.weight} for "${m?.key}" is out of range — a weight must be between 0 and 1 (no leverage). Refused before registration. Nothing was registered.` }
    }
    const total = markets.reduce((s, m) => s + m.weight, 0)
    if (total <= 0) return { ok: false, error: "The weights sum to zero — there is nothing to allocate. Refused before registration." }
    // F-2 (V34, S91) — an OMITTED policy defaults to the conservative 'static'; a PRESENT-but-invalid policy is REFUSED,
    // never silently coerced to a default (silent coercion registers something the user did not choose — refuse, don't coerce).
    if (input.policy !== undefined && input.policy !== "static" && input.policy !== "carry-tilt" && input.policy !== "carry-rotation")
      return { ok: false, error: `Allocation policy "${input.policy}" is not one of static / carry-tilt / carry-rotation — refused before registration (never silently coerced to a default). Nothing was registered.` }
    const policy = input.policy === "carry-tilt" || input.policy === "carry-rotation" ? input.policy : "static"
    const rebalance = input.rebalance === "monthly" ? "monthly" : DEFAULTS.rebalanceTrigger
    const spec: DataPlaneEngine.LendingSpec = { family: "lending-carry", policy, rebalance: { trigger: rebalance }, markets: markets.map((m) => ({ key: m.key, weight: m.weight / total })) } // normalized weights (no leverage)
    const parentSpecHash = input.parentSpecHash && input.parentSpecHash !== "(new strategy)" ? input.parentSpecHash : null
    return { ok: true, composed: { spec, lineage: { parentSpecHash, isEdit: parentSpecHash !== null } } }
  }

  // the ratified defaults are conservative — a drift toward risk (leverage/tilt-by-default) is caught
  export function defaultsConservative(): boolean {
    return DEFAULTS.policy === "static" && DEFAULTS.weightMode === "equal" && DEFAULTS.rebalanceTrigger === "monthly"
  }

  // the help copy honesty check (A′#6): no priming toward risk (leverage, guaranteed, high returns) or toward a GO.
  const PRIMING = [
    /guaranteed/i, /can't lose/i, /sure thing/i, /leverage/i, /\bwin\b/i, /high returns?/i, /maximi[sz]e (profit|return|gain)/i,
    /you('| wi)ll (make|earn|profit)/i, /best strategy/i, /strong candidate/i, /likely to pass/i, /on track to (a )?go/i, /trust (me|us)/i,
  ]
  export function helpHonest(): { ok: boolean; issues: string[] } {
    return helpHonestFor(FIELDS, "lending")
  }
  // per-domain honesty check (K-SCOPE cure, A′#5): funding/basis help must NOT inherit lending's phrasing where it
  // misleads. A seeded priming help per domain is caught here (the walk's ux-priming theme hunts each domain's copy).
  export function helpHonestFor(fields: Field[], domain: string): { ok: boolean; issues: string[] } {
    const issues: string[] = []
    for (const f of fields) for (const p of PRIMING) if (p.test(f.help) || p.test(f.label)) issues.push(`[${domain}] field "${f.id}" help/label primes: ${p}`)
    return { ok: issues.length === 0, issues }
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // THE BUILDER, WHOLE (Ensemble Phase 2; K-SCOPE cure, U-SURFACE, R-BASIS). V12 shipped the builder LENDING-ONLY against
  // a three-domain scope, silently (the K-SCOPE founding amendment, retro-filed in Phase 0). The cure: funding + basis
  // join lending under the IDENTICAL discipline — conservative ratified defaults, per-domain honesty-checked help,
  // lineage in the form, validation from the same schema the API enforces. The basis form surfaces the weakest leg's tier
  // (MIN(legs)) + EXPERIMENTAL INLINE, BEFORE the user composes — not after (R-BASIS: a basis is only as strong as its
  // weakest leg, and the user should see that up front). A funding/basis spec composed here is a trial like any other.
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // ── FUNDING ──
  export const FUNDING_VENUES = ["binance", "bybit", "okx"] as const // CeFi perp venues (funding carry)
  export const FUNDING_INTERVALS = [1, 8] as const // funding settles hourly (some venues) or 8-hourly — a 3h interval is invalid
  export const FUNDING_DEFAULTS = { venue: "binance", intervalHours: 8, side: "receive" as const } // conservative: receive-funding, 8h
  export const FUNDING_FIELDS: Field[] = [
    { id: "venue", label: "Venue — which perp venue's funding to harvest", help: "The CeFi perpetual venue whose funding you collect. Different venues publish funding on different schedules; this does not change the honest verdict, which still depends on the data and the deflation.", kind: "select", options: [...FUNDING_VENUES], default: "binance" },
    { id: "interval", label: "Funding interval (hours)", help: "How often funding settles (1h or 8h, depending on the venue). Shorter intervals mean more settlements, not more edge; the breadth panel counts independent bets honestly.", kind: "select", options: FUNDING_INTERVALS.map(String), default: "8" },
    { id: "side", label: "Side — receive or pay funding", help: "'receive' collects funding when it is positive (the conservative default); 'pay' is the opposite leg. Neither side is inherently better — the verdict depends on the realized funding, and a NO-GO is the product working.", kind: "select", options: ["receive", "pay"], default: "receive" },
    { id: "lineage", label: "Is this an edit of an earlier attempt?", help: "If this edits a funding strategy you already submitted, declare its parent. Editing and resubmitting counts as ANOTHER attempt in the same family — the bar stiffens (family-size deflation). This is the product working, not a penalty.", kind: "select", options: ["(new strategy)"], default: "(new strategy)" },
  ]
  export interface FundingSpec { family: "funding-carry"; venue: string; intervalHours: number; side: "receive" | "pay" }
  export function composeFunding(input: { venue?: string; interval?: string | number; side?: string; parentSpecHash?: string | null }, availableVenues: string[] = [...FUNDING_VENUES]): { ok: true; spec: FundingSpec; lineage: { parentSpecHash: string | null; isEdit: boolean } } | { ok: false; error: string } {
    const venue = String(input.venue ?? FUNDING_DEFAULTS.venue)
    if (!availableVenues.includes(venue)) return { ok: false, error: `Venue "${venue}" is not in the available set (${availableVenues.join(", ")}). The builder composes only over delivered primitives — an unknown venue is refused before registration. Nothing was registered.` }
    const intervalHours = Number(input.interval ?? FUNDING_DEFAULTS.intervalHours)
    if (!(FUNDING_INTERVALS as readonly number[]).includes(intervalHours)) return { ok: false, error: `Funding interval ${input.interval} is invalid — funding settles on a ${FUNDING_INTERVALS.join("h or ")}h schedule, not arbitrary intervals. Refused before registration. Nothing was registered.` }
    // F-2 (V34, S91) — an OMITTED side defaults to the conservative 'receive'; a PRESENT-but-invalid side is REFUSED, never silently coerced.
    if (input.side !== undefined && input.side !== "receive" && input.side !== "pay")
      return { ok: false, error: `Funding side "${input.side}" is not receive / pay — refused before registration (never silently coerced to a default). Nothing was registered.` }
    const side = input.side === "pay" ? "pay" : "receive"
    const parentSpecHash = input.parentSpecHash && input.parentSpecHash !== "(new strategy)" ? input.parentSpecHash : null
    return { ok: true, spec: { family: "funding-carry", venue, intervalHours, side }, lineage: { parentSpecHash, isEdit: parentSpecHash !== null } }
  }

  // ── BASIS (cross-venue; MIN-tier + EXPERIMENTAL surfaced INLINE) ──
  export const BASIS_CEX_VENUES = ["binance", "bybit"] as const // CeFi legs (immutable checksummed dumps → T1)
  export const BASIS_DEX_VENUES = ["hyperliquid", "dydx"] as const // DeFi legs (free public funding → T2-forward)
  export const BASIS_TIERS: Record<string, "T1" | "T2" | "T3"> = { binance: "T1", bybit: "T1", hyperliquid: "T2", dydx: "T2" }
  export const BASIS_DEFAULTS = { cexVenue: "binance", dexVenue: "hyperliquid" }
  export const BASIS_FIELDS: Field[] = [
    { id: "cexVenue", label: "CeFi leg — the centralized perp venue", help: "The centralized venue whose funding is the CeFi leg of the basis (immutable checksummed dumps → tier T1). The basis is the SPREAD between this leg and the DeFi leg.", kind: "select", options: [...BASIS_CEX_VENUES], default: "binance" },
    { id: "dexVenue", label: "DeFi leg — the on-chain perp venue", help: "The on-chain venue whose funding is the DeFi leg (free public funding, captured forward-only → tier T2). A retro-claimed on-chain 'history' is refused by nonce physics; this leg can only be proven forward.", kind: "select", options: [...BASIS_DEX_VENUES], default: "hyperliquid" },
    { id: "lineage", label: "Is this an edit of an earlier attempt?", help: "If this edits a basis strategy you already submitted, declare its parent. Editing and resubmitting counts as ANOTHER attempt in the same family — the bar stiffens. This is the product working.", kind: "select", options: ["(new strategy)"], default: "(new strategy)" },
  ]
  export interface BasisSpec { family: "basis-carry"; cexVenue: string; dexVenue: string; cexTier: "T1" | "T2" | "T3"; dexTier: "T1" | "T2" | "T3"; minTier: "T1" | "T2" | "T3" }
  // MIN(legs) = the WEAKER tier (higher rank number). Surfaced INLINE in the form BEFORE composing (R-BASIS).
  export function minTier(a: "T1" | "T2" | "T3", b: "T1" | "T2" | "T3"): "T1" | "T2" | "T3" {
    const rank: Record<string, number> = { T1: 1, T2: 2, T3: 3 }
    return rank[a] >= rank[b] ? a : b
  }
  // the form note the basis screen renders BEFORE composing — the weakest leg's tier + EXPERIMENTAL, visible up front
  export function basisFormNote(cexVenue: string, dexVenue: string): string {
    const ct = BASIS_TIERS[cexVenue] ?? "T3", dt = BASIS_TIERS[dexVenue] ?? "T3"
    return `weakest-leg tier = MIN(${cexVenue} ${ct}, ${dexVenue} ${dt}) = ${minTier(ct, dt)} · EXPERIMENTAL (the CeFi-DeFi basis is a cross-venue domain at its true tier — the whole spread is only as strong as its weakest leg; you see this BEFORE composing)`
  }
  export function composeBasis(input: { cexVenue?: string; dexVenue?: string; parentSpecHash?: string | null }): { ok: true; spec: BasisSpec; lineage: { parentSpecHash: string | null; isEdit: boolean }; formNote: string } | { ok: false; error: string } {
    const cexVenue = String(input.cexVenue ?? BASIS_DEFAULTS.cexVenue), dexVenue = String(input.dexVenue ?? BASIS_DEFAULTS.dexVenue)
    if (!(BASIS_CEX_VENUES as readonly string[]).includes(cexVenue)) return { ok: false, error: `CeFi leg "${cexVenue}" is not a supported centralized venue (${BASIS_CEX_VENUES.join(", ")}). A basis needs one CeFi leg and one DeFi leg — a mismatched pair is refused before registration. Nothing was registered.` }
    if (!(BASIS_DEX_VENUES as readonly string[]).includes(dexVenue)) return { ok: false, error: `DeFi leg "${dexVenue}" is not a supported on-chain venue (${BASIS_DEX_VENUES.join(", ")}). A basis needs one CeFi leg and one DeFi leg — a mismatched pair is refused before registration. Nothing was registered.` }
    const cexTier = BASIS_TIERS[cexVenue], dexTier = BASIS_TIERS[dexVenue]
    const parentSpecHash = input.parentSpecHash && input.parentSpecHash !== "(new strategy)" ? input.parentSpecHash : null
    return { ok: true, spec: { family: "basis-carry", cexVenue, dexVenue, cexTier, dexTier, minTier: minTier(cexTier, dexTier) }, lineage: { parentSpecHash, isEdit: parentSpecHash !== null }, formNote: basisFormNote(cexVenue, dexVenue) }
  }
}
