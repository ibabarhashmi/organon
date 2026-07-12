/**
 * ORGΛNON — THE D35/D36 PROMOTION SPECS + AFFECTED CENSUSES (Domain sprint; X-DOMAIN d,e). The catch axes are info/context
 * this sprint; their promotion to a verdict-CAPPING role is a VERDICT-SHAPED RULE and needs the Operator's pen. This builds
 * the parked specs with their affected censuses PRE-COMPUTED so the Operator sees the exact blast radius before signing:
 *   · D35 — the RWA structural cap (an RWA subject may never render SOLID). Affected = current RWA subjects that render SOLID.
 *   · D36 — the three catch-axis promotions (funding-flip / leverage / redemption-gap caps), each CONSERVATIVE + DEGRADE-ONLY
 *     (a promotion may only CAP a verdict, never LIFT one). Affected = current subjects the cap would reduce.
 * The census is an OUTCOME over the curated shelf; NO curated subject is a new domain today → the censuses are ZERO
 * (arms-for-a-future-subject, like D29/D30 — a low-cost pen that ratifies zero current renders). Run: bun run script/honesty/domain-promotions.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { OffchainOpacity } from "../../src/domain/axes/offchain-opacity"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// the curated shelf, scored, classified — how many are each new domain (the affected-census denominator).
const cards = Reality.shelfFromRecord(Date.now())
const byDomain = cards.map((c) => ({ name: c.name, domain: Reality.domainOf(c.name, c.scored.facts).domain, verdict: c.scored.verdict }))
const rwaSubjects = byDomain.filter((c) => c.domain === "RWA")
const rwaCensus = OffchainOpacity.affectedCensus(rwaSubjects.map((c) => c.verdict as OffchainOpacity.Verdict))

// a promotion's affected census — current subjects in the domain that the cap WOULD reduce (SOLID → CAUTION). Degrade-only.
function promoCensus(domain: string): { total: number; wouldCap: number } {
  const subj = byDomain.filter((c) => c.domain === domain)
  return { total: subj.length, wouldCap: subj.filter((c) => c.verdict === "SOLID").length }
}

const OUT = {
  protocol: "domain-promotions",
  at: "2026-07-12",
  rule: "the catch axes are info/context; promoting one to a verdict-CAPPING role is a verdict-shaped rule that needs the Operator's pen. These specs are PARKED with their affected censuses pre-computed. Every promotion is CONSERVATIVE + DEGRADE-ONLY (cap, never lift). An agent installs no verdict rule (LN5).",
  D35_rwaStructuralCap: {
    deviation: "D35",
    rule: "an RWA subject may NEVER render SOLID — capped at CAUTION/UNVERIFIED, the reason rendered. BUILT (src/domain/axes/offchain-opacity.ts::rwaStructuralCap), NOT INSTALLED (the render calls it with d35Signed=false; the effect is proven under simulation only).",
    degradeOnly: true,
    affectedCensus: rwaCensus, // over the curated shelf's RWA subjects (currently 0)
    armsForFuture: rwaCensus.total === 0 ? "ZERO current RWA subjects on the curated shelf — signing D35 ratifies zero current renders; it ARMS the tool for the first future RWA subject (the warning renders today regardless). A low-cost pen." : `${rwaCensus.wouldCap} of ${rwaCensus.total} current RWA subjects would be capped SOLID→CAUTION.`,
    operatorSigned: false,
  },
  D36_promotions: {
    deviation: "D36",
    rule: "the three catch-axis promotions to a verdict-CAPPING role — conservative, degrade-only, census-attached, PARKED.",
    promotions: [
      { axis: "yield-source", cap: "funding-flip cap", spec: "a STABLE-SYNTH whose yield is funding-carry AND whose funding-flip census exceeds a pinned threshold (e.g. negative in > X% of periods) caps SOLID→CAUTION — the peg+yield joint risk is real. Degrade-only.", affectedCensus: promoCensus("STABLE-SYNTH"), operatorSigned: false },
      { axis: "leverage-distance", cap: "leverage cap", spec: "a LOOPED-CDP whose liquidation distance is below a pinned floor (e.g. < X%) caps SOLID→CAUTION — a thin distance-to-liquidation is a real hazard the headline APY hides. Degrade-only.", affectedCensus: promoCensus("LOOPED-CDP"), operatorSigned: false },
      { axis: "redemption-gap", cap: "redemption-gap cap", spec: "an LST-LRT whose secondary trades at a discount beyond a pinned band caps SOLID→CAUTION — a persistent discount is a real depeg signal. Degrade-only.", affectedCensus: promoCensus("LST-LRT"), operatorSigned: false },
    ],
    armsForFuture: "NO curated shelf subject is a new domain today → every promotion census is ZERO (arms-for-a-future-subject). A promotion may only CAP a verdict, never LIFT one; an agent installs no verdict rule.",
  },
  note: "the censuses are OUTCOMES over the curated shelf; the four domains render through the lookup path + fixtures, so no curated subject is capped today. The catch axes stay info/context until the Operator signs D35 (RWA) / D36 (the three promotions).",
}
const body = { ...OUT, contentSha: sha256(JSON.stringify(OUT)) }
writeFileSync(path.join(H, "domain-promotions.json"), JSON.stringify(body, null, 2) + "\n")

console.log("── DOMAIN PROMOTIONS — D35/D36 parked, censuses pre-computed ────")
console.log(`  D35 RWA cap    : ${rwaCensus.wouldCap} of ${rwaCensus.total} current RWA subjects would cap (arms-for-future)`)
for (const p of OUT.D36_promotions.promotions) console.log(`  D36 ${p.cap.padEnd(20)}: ${p.affectedCensus.wouldCap} of ${p.affectedCensus.total} current subjects`)
console.log(`  contentSha     : ${body.contentSha.slice(0, 16)}…`)
console.log("written: data/honesty/domain-promotions.json")
