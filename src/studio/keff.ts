/**
 * ORGΛNON STUDIO — the POOL K_eff CHARGE (Ensemble; Rules K-PRECOND, K-EFF, A′#1/#2). The pinned, hash-checked formula
 * for the effective number of INDEPENDENT bets in a pool of K members with mean pairwise correlation ρ̄:
 *
 *     K_eff = K / (1 + (K-1)·ρ̄)          pool charge = ceil(K_eff)   (a CEILING — conservative, never a floor)
 *
 * the classic effective-independent-count: at ρ̄=0 → K_eff=K (fully diversified, charge K); at ρ̄=1 → K_eff=1 (one bet in
 * disguise, charge 1); in between it is NON-TRIVIAL — the operative clause of the V12 ensemble disposal ("legitimate WITH
 * the correlation-adjusted family charge"), and exactly the cell V12's evidence never exercised. This is the SAME shape
 * as the breadth panel's AR(1) N_eff (Breadth.breadthOf) — an independence adjustment, here cross-sectional over members.
 *
 * The SPEC STRING below is pinned pre-first-run (its sha256 filed in the Phase-0 pin value); the preconditions module and
 * the pool composer recompute it and REFUSE to run on a mismatch — a post-hoc formula tweak to flatter a pool is CAUGHT
 * (K-PRECOND). This is a pure formula module (NOT a pool surface): it is what the precondition VALIDATES, never a product.
 */
import { createHash } from "node:crypto"

export namespace Keff {
  // pinned pre-first-run — the correlation-adjusted family charge the V12 disposal established (its sha is the pin)
  export const POOL_KEFF_MAPPING_SPEC =
    "Pool K_eff charge mapping (pinned pre-first-run, K-PRECOND/K-EFF): K_eff = K / (1 + (K-1)·rhoBar) where K is the " +
    "member count and rhoBar is the MEAN PAIRWISE Pearson correlation of the members' return series over the pinned " +
    "window (clamped to [0,1] — a negative correlation is conservatively treated as zero, never rewarded); the pool's " +
    "family charge = ceil(K_eff), a CEILING never a floor; the charge enters the frozen deflation via declaredNTrials = " +
    "max(ceil(K_eff), familySize, rootCount). At rhoBar=0 → K_eff=K (fully diversified); at rhoBar=1 → K_eff=1 (one bet " +
    "in disguise — the pool adds nothing beyond its strongest member). K_eff is RECOMPUTED as clocks accrue: a pool " +
    "composed in a low-correlation window whose members later correlate sees its K_eff fall toward 1 (convenient windows " +
    "cannot survive time). Selection rule: the correlation-adjusted charge is honest IFF a pure-noise pool never survives " +
    "at it (the pooled-noise wall); if that wall cannot hold, the pooling surface does not ship (STOP, pre-authorised)."

  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  export function keffMappingHash(): string {
    return sha256(POOL_KEFF_MAPPING_SPEC)
  }
  export class KeffPinError extends Error {}
  // refuse to run unless the recomputed mapping hash equals the Phase-0 pin (a post-hoc formula change is caught)
  export function assertMappingPinned(pinnedHash: string): void {
    if (keffMappingHash() !== pinnedHash) throw new KeffPinError(`pool K_eff mapping hash ${keffMappingHash().slice(0, 12)}… ≠ Phase-0 pin ${pinnedHash.slice(0, 12)}… — the formula was adjusted post-hoc; the precondition/pool cannot run (K-PRECOND)`)
  }

  // Pearson correlation of two equal-length series (population form over the pinned window).
  export function pearson(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length)
    if (n < 2) return 0
    let ma = 0, mb = 0
    for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i] }
    ma /= n; mb /= n
    let cov = 0, va = 0, vb = 0
    for (let i = 0; i < n; i++) { const da = a[i] - ma, db = b[i] - mb; cov += da * db; va += da * da; vb += db * db }
    const den = Math.sqrt(va * vb)
    return den === 0 ? 0 : cov / den
  }

  // the MEAN PAIRWISE correlation ρ̄ over K member series (the K_eff input; the pinned window is the caller's slice)
  export function meanPairwiseCorr(members: number[][]): number {
    const K = members.length
    if (K < 2) return 0
    let sum = 0, pairs = 0
    for (let i = 0; i < K; i++) for (let j = i + 1; j < K; j++) { sum += pearson(members[i], members[j]); pairs++ }
    return pairs === 0 ? 0 : sum / pairs
  }

  // K_eff = K / (1 + (K-1)·ρ̄), ρ̄ clamped to [0,1] (a negative correlation is not rewarded — conservative, K-EFF)
  export function kEff(K: number, rhoBar: number): number {
    if (K <= 1) return K
    const rho = Math.max(0, Math.min(1, rhoBar))
    return K / (1 + (K - 1) * rho)
  }
  // the pool's family charge = ceil(K_eff) — a CEILING, never a floor (conservative; iterating never LOWERS the bill)
  export function poolCharge(K: number, rhoBar: number): number {
    return Math.max(1, Math.ceil(kEff(K, rhoBar)))
  }
  // the charge computed directly from the member series over the pinned window (the load-bearing path)
  export function poolChargeFromMembers(members: number[][]): { rhoBar: number; kEff: number; charge: number } {
    const rhoBar = meanPairwiseCorr(members)
    const K = members.length
    return { rhoBar, kEff: kEff(K, rhoBar), charge: poolCharge(K, rhoBar) }
  }
}
