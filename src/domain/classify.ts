/**
 * ORGΛNON — THE CONSERVATIVE DOMAIN CLASSIFIER (Domain sprint; X-DOMAIN b, S67). classifyDomain(facts) → DomainType, by
 * DETERMINISTIC PINNED HEURISTICS over captured facts — the governance classifier's discipline (classifyAdmin): CONSERVATIVE
 * BY LAW. A subject that matches EXACTLY ONE new-domain signature is that domain; a subject matching TWO is UNCLASSIFIED
 * (ambiguous — never a guess); a subject matching NONE falls to its carried vertical (LENDING/FUNDING) or UNCLASSIFIED. There
 * is NO OPTIMISTIC DEFAULT — the classifier never up-classifies on a hunch, because a guessed domain is a wrong lens and a
 * wrong lens is a wrong answer. The allowlists are pinned (domain-pins.json xDomain.b.signatures); a wall cross-checks them.
 */
import { Domain } from "./types"
import { DomainRegistry } from "./registry"

export namespace DomainClassify {
  // the pinned signature allowlists (domain-pins.json xDomain.b.signatures.*.allowlist). Lowercase; matched as substrings of
  // the subject's project/symbol/name haystack. STABLE-SYNTH additionally REQUIRES isStablecoin (a synthetic stable, not a
  // lending stablecoin — aave/compound USDC are NOT synthetic and stay LENDING).
  const SYNTH_STABLE = ["ethena", "usde", "susde", "crvusd", "curve-usd", "gho", "aave-gho"]
  const LST_LRT = ["steth", "wsteth", "reth", "cbeth", "weeth", "ezeth", "rseth", "pufeth", "rsweth"]
  const LOOPED = ["gearbox", "contango", "loopfi", "cian", "instadapp-lite"]
  const RWA = ["ondo", "maple", "centrifuge", "buidl", "superstate", "usdy", "ousg", "goldfinch", "openeden"]

  const norm = (s: string) => (s ?? "").toLowerCase()
  const matchesAny = (hay: string, list: string[]) => list.some((a) => hay.includes(a))

  // the NEW-domain signatures a subject matches (0, 1, or more). Order is fixed + deterministic.
  export function matchSignatures(f: Domain.DomainFacts): Domain.NewDomain[] {
    const hay = `${norm(f.project)} ${norm(f.symbol)} ${norm(f.name)}`
    const sym = `${norm(f.symbol)} ${norm(f.name)}` // LST/LRT symbols are token-side (a bare project like "lido" is not enough)
    const m: Domain.NewDomain[] = []
    if (f.isStablecoin && matchesAny(hay, SYNTH_STABLE)) m.push("STABLE-SYNTH") // synthetic/CDP stable — NOT a lending stablecoin
    if (matchesAny(sym, LST_LRT)) m.push("LST-LRT")
    if (matchesAny(hay, LOOPED) || f.leverageSignal === true) m.push("LOOPED-CDP")
    if (matchesAny(hay, RWA)) m.push("RWA")
    return m
  }

  // THE CONSERVATIVE CLASSIFIER (X-DOMAIN b) — deterministic, no optimistic default, ambiguity → UNCLASSIFIED.
  export function classifyDomain(f: Domain.DomainFacts): Domain.Classified {
    const matches = matchSignatures(f)
    if (matches.length === 1) {
      const domain = matches[0]
      return { domain, how: `matched exactly one domain signature (${domain}); the ${DomainRegistry.catchAxisFor(domain)} catch axis applies`, catchAxis: DomainRegistry.catchAxisFor(domain) }
    }
    if (matches.length > 1) {
      // AMBIGUOUS — matched multiple signatures. A wrong lens is a wrong answer, so the classifier REFUSES to guess.
      return { domain: "UNCLASSIFIED", how: `AMBIGUOUS — matched multiple domain signatures (${matches.join(", ")}); the classifier does not guess (a wrong lens is a wrong answer), so the seven carried axes render alone`, catchAxis: null }
    }
    // no NEW-domain signature — fall to the carried classification (these render the seven carried axes, no catch line).
    if (f.deltaNeutral === true || f.vertical === "delta-neutral") return { domain: "FUNDING", how: "a delta-neutral funding strategy — no new-domain signature (carried; the funding-regime axis leads)", catchAxis: null }
    if (f.vertical === "lending" || f.vertical === "stablecoin-yield") return { domain: "LENDING", how: "a lending/stable-yield pool with no new-domain signature (carried; the seven axes as today)", catchAxis: null }
    return { domain: "UNCLASSIFIED", how: "no domain signature matched — the seven carried axes render alone (the conservative floor)", catchAxis: null }
  }
}
