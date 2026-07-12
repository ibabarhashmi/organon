/**
 * ORGΛNON — THE PER-DOMAIN AXIS REGISTRY (Domain sprint; X-DOMAIN c, S67). Each NEW domain declares EXACTLY ONE catch
 * axis — the fact the seven cannot see. This registry is the single source of that mapping AND the no-leakage guard: an
 * axis is reachable ONLY from its declared domain. A leverage axis on a STABLE subject, a redemption gap on a CDP, is a
 * Halt — a wrong lens is a wrong answer. Pinned (domain-pins.json xDomain.c.registry); pure; deterministic.
 */
import { Domain } from "./types"

export namespace DomainRegistry {
  // the pinned domain → catch-axis map (the four new domains only; the carried + UNCLASSIFIED declare none).
  const CATCH: Record<Domain.NewDomain, Domain.CatchAxis> = {
    "STABLE-SYNTH": "yield-source",
    "LST-LRT": "redemption-gap",
    "LOOPED-CDP": "leverage-distance",
    RWA: "off-chain-opacity",
  }

  // the ONE catch axis a domain declares, or null (LENDING/FUNDING/UNCLASSIFIED render the seven carried axes only).
  export function catchAxisFor(domain: Domain.DomainType): Domain.CatchAxis | null {
    return Domain.isNewDomain(domain) ? CATCH[domain] : null
  }

  // the domain an axis belongs to (the inverse) — used by the no-leakage guard.
  export function domainForAxis(axis: Domain.CatchAxis): Domain.NewDomain {
    const hit = (Object.keys(CATCH) as Domain.NewDomain[]).find((d) => CATCH[d] === axis)
    if (!hit) throw new Error(`unknown catch axis "${axis}" — not declared by any domain`)
    return hit
  }

  // THE NO-LEAKAGE GUARD (S67) — an axis renders ONLY for its declared domain. Returns true iff the axis is this domain's
  // declared catch. The render layer calls this before drawing any catch line; a mismatch is REFUSED (never a wrong lens).
  export function axisAllowedForDomain(axis: Domain.CatchAxis, domain: Domain.DomainType): boolean {
    return catchAxisFor(domain) === axis
  }

  // the biting form — throws on a cross-domain render (the seeded "leverage axis on a STABLE subject" fails here).
  export function assertAxisForDomain(axis: Domain.CatchAxis, domain: Domain.DomainType): void {
    if (!axisAllowedForDomain(axis, domain))
      throw new Error(`CROSS-DOMAIN AXIS LEAKAGE REFUSED — the "${axis}" axis renders ONLY for ${domainForAxis(axis)}, never for ${domain} (a wrong lens is a wrong answer; X-DOMAIN c, S67).`)
  }
}
