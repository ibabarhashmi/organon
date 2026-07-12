/**
 * ORGΛNON — RATIFY the DeFi domain-typing layer (Domain sprint; X-DOMAIN). src/domain/ is a NEW research-derived surface
 * (the ratification wall now scans src/domain + src/domain/axes — the constitution's rule against escaping the ADOPT
 * requirement by being invisible) → it must be covered by an ADOPT row. Append-only: the existing entries are replayed
 * (reproducing their hashes) and the new row is chained. It lists ALL the domain artifacts (the classifier + registry +
 * types + the four catch axes) — the axes land in Phase 3, and an ADOPT may name a sprint's planned deliverables (the wall
 * only requires EXISTING files to be covered; a listed-but-absent artifact is harmless until it lands, then it is already
 * ratified). Run: bun run script/honesty/ratify-domain.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ratify } from "../../src/studio/ratify"

const TABLE = path.join(PKG_ROOT, "data", "studio", "research-ratification-v14.json") // the ACTIVE chain (v11→…→v14); the wall reads v14
const raw = JSON.parse(readFileSync(TABLE, "utf8")) as { entries: Ratify.Entry[]; counts?: unknown }

const led = new Ratify.Ledger()
for (const e of raw.entries) led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })

if (!raw.entries.some((e) => e.item === "defi-domain-typing")) {
  led.record({
    item: "defi-domain-typing",
    disposition: "ADOPT",
    researchFinding: "The seven axes were built for lending/stable-yield pools. Four DeFi domains hide a catch the seven cannot see, each a real, documented failure mode: SYNTHETIC STABLES (a 'stablecoin yield' that is really short-vol perp-funding carry — it inverts when funding flips); LST/LRT (the depeg lives in the gap between an on-chain redemption rate and a thin secondary price); LOOPED/CDP (a headline APY without its leverage is a costume — the number that decides the outcome is distance-to-liquidation); RWA (the collateral settles off-chain — UNVERIFIABLE BY CONSTRUCTION, so a clean on-chain scorecard is NOT evidence of safety). Shipping these domains without their catch would be a fabricated reassurance wearing the tool's credibility.",
    reason: "A domain is a subject TYPE, not a screen (the four render through the conscious 3 like every other subject). A DETERMINISTIC, CONSERVATIVE classifier (pinned allowlist/structural heuristics over captured facts; ambiguous or multi-match → UNCLASSIFIED, the seven carried axes only — no optimistic default, a guessed domain is a wrong lens) + a per-domain axis registry (an axis reachable ONLY from its declared domain — no cross-domain leakage) + four pure catch axes, each number-traced, provenance-tiered, and INFO/CONTEXT (off the scorecard verdict path — the catch renders like the governance line; the Stamp's familyN stays 1; the differential + bundle byte-identical). The RWA structural cap is verdict-shaped and PARKED for the Operator's pen (D35 — an agent installs no verdict rule); promotions are PARKED (D36, degrade-only).",
    cheapTest: "domain_classify.test.ts (each domain classifies from a real fixture; the ambiguous/novel fixture → UNCLASSIFIED, output shown; no optimistic default) + domain_registry.test.ts (the per-domain registry; the seeded cross-domain render — a leverage axis on a STABLE subject — is REFUSED, the refusal shown) + catch_axes.test.ts + rwa_cap.test.ts (each axis renders on its domain and ONLY its domain; the seeded perfect-on-chain RWA control cannot render SOLID; the cap is provably NOT agent-installed).",
    flipCriteria: "If the classifier proves non-conservative (a novel subject shoehorned into a domain → a wrong lens → a confident wrong answer), OR an axis leaks across domains, OR a catch axis moves a verdict before its D36 promotion, OR the RWA cap is agent-installed before D35, the domain layer is PULLED. The catch axes stay info/context until the Operator signs the promotion (D36); the RWA cap stays uninstalled until D35 — building the machinery is not installing the rule.",
    buildArtifacts: ["src/domain/types.ts", "src/domain/classify.ts", "src/domain/registry.ts", "src/domain/axes/yield-source.ts", "src/domain/axes/redemption-gap.ts", "src/domain/axes/leverage-distance.ts", "src/domain/axes/offchain-opacity.ts"],
    park: null,
    experiment: null,
    note: "Domain sprint (X-DOMAIN). The four catch axes render like the governance line (OUT of the scorecard rows) — info/context, off the verdict path; the differential (lending 70c7912f / funding 0a63151b) + bundle 9c1e7bd8 stay byte-identical (asserted at every gate). The RWA cap (D35) + the promotions (D36) are verdict-shaped and parked for the pen.",
    stamp: "domain-typing-adopt",
  } as Parameters<Ratify.Ledger["record"]>[0])
  const out = { ...raw, chainOk: led.verifyChain().ok, counts: { total: led.all().length, adopt: led.all().filter((e) => e.disposition === "ADOPT").length }, entries: led.all() }
  writeFileSync(TABLE, JSON.stringify(out, null, 2) + "\n")
  console.log(`appended defi-domain-typing ADOPT · entries ${raw.entries.length}→${led.all().length} · chainOk ${led.verifyChain().ok}`)
} else {
  console.log("defi-domain-typing already ratified — no-op")
}
