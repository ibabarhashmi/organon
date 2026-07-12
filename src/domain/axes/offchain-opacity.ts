/**
 * ORGΛNON — THE OFF-CHAIN OPACITY AXIS (Domain sprint; RWA's catch, X-DOMAIN d — THE HARDEST HONESTY TEST). An RWA yield's
 * truth lives OFF-CHAIN (a T-bill custodian, a credit book, an attestation PDF); the chain sees only a token that SAYS it
 * is backed. Therefore the RWA domain is UNVERIFIABLE BY CONSTRUCTION, and a clean on-chain scorecard is NOT evidence of
 * safety. This axis renders the WARNING (the truth about the opacity, told immediately) + the SAMPLE-labeled attestation
 * surface (context the user must go verify, NEVER a verification). The STRUCTURAL CAP (an RWA may never render SOLID) is a
 * VERDICT-SHAPED RULE — it is BUILT here + its affected census pre-computed, but LEFT UNINSTALLED until D35 is signed,
 * because an AGENT MAY NOT INSTALL A VERDICT RULE (the D27/D29/D30 precedent, LN5). Pure, deterministic, INFO/CONTEXT.
 */
import { Domain } from "../types"

export namespace OffchainOpacity {
  export type Verdict = "SOLID" | "CAUTION" | "AVOID" | "UNVERIFIED" // matches Scorecard.Verdict (a string union, no coupling)

  // THE STRUCTURAL CAP (D35) — BUILT, NOT INSTALLED. Pure: if d35Signed, an RWA may NEVER render SOLID (cap SOLID→CAUTION,
  // with the reason). If NOT signed (the default — TODAY), return the verdict UNCHANGED: the warning renders, the verdict is
  // untouched, because an agent installs no verdict rule. The render calls this ONLY with d35Signed=false; the cap's EFFECT
  // is proven under simulation (a test passes true), never applied to a live verdict path.
  export function rwaStructuralCap(onchainVerdict: Verdict, d35Signed: boolean): { verdict: Verdict; capped: boolean; reason: string } {
    if (!d35Signed) return { verdict: onchainVerdict, capped: false, reason: "the structural cap is NOT installed (D35 unsigned) — the warning renders, the verdict is unchanged; an agent installs no verdict rule (LN5)." }
    const capped = onchainVerdict === "SOLID" // an RWA may never render SOLID
    return { verdict: capped ? "CAUTION" : onchainVerdict, capped, reason: capped ? "capped SOLID→CAUTION: the yield's collateral settles off-chain; nothing on-chain can verify it — we cannot see the thing that matters." : "already ≤ CAUTION on-chain — the cap reduces nothing further." }
  }

  // the affected census (D35) — over a set of RWA subjects' on-chain verdicts, how many WOULD be capped (SOLID→CAUTION)
  // under a signed D35. Pre-computed so the Operator sees the exact blast radius before the pen. Degrade-only (cap, never lift).
  export function affectedCensus(onchainVerdicts: Verdict[]): { total: number; wouldCap: number; verdicts: Record<string, number> } {
    const verdicts = onchainVerdicts.reduce<Record<string, number>>((m, v) => ((m[v] = (m[v] ?? 0) + 1), m), {})
    return { total: onchainVerdicts.length, wouldCap: onchainVerdicts.filter((v) => v === "SOLID").length, verdicts }
  }

  export interface Input {
    issuer: string
    auditor: string
    cadence: string
    lastAttestation: string
    onchainVerdict: Verdict // the verdict the seven axes computed on-chain (for the SIMULATION + the census — never applied)
  }

  export function offchainOpacityCatch(inp: Input): Domain.Catch {
    const today = rwaStructuralCap(inp.onchainVerdict, false) // TODAY — d35Signed=false → the verdict is UNCHANGED
    const wouldCap = rwaStructuralCap(inp.onchainVerdict, true).capped // the SIMULATION — what a signed D35 WOULD do
    return {
      axis: "off-chain-opacity", domain: "RWA", disposition: "info/context", tier: "SAMPLE",
      numbers: { onchainVerdict: inp.onchainVerdict, wouldCapUnderD35: wouldCap ? "yes (SOLID→CAUTION)" : "no" },
      simple: "this yield's backing lives off-chain — a real-world asset a custodian holds. Nothing on-chain can prove it is really there, so treat even a clean scorecard with care and go verify the backing yourself.",
      pro: "This yield's collateral settles off-chain. Nothing on-chain can verify it. We cannot see the thing that matters — treat every clean axis below with that in mind. info/context — a fact about what CANNOT be known, never advice.",
      attestation: { issuer: inp.issuer, auditor: inp.auditor, cadence: inp.cadence, lastAttestation: inp.lastAttestation, label: "SAMPLE" },
      capStatus: { d35Signed: false, wouldCapUnder: wouldCap ? "a signed D35 would cap SOLID→CAUTION" : "already ≤ CAUTION on-chain", installed: false, reason: today.reason },
    }
  }
}
