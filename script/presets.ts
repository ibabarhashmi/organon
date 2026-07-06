/**
 * ORGΛNON STUDIO — GOAL PRESETS (Convergence Phase 2). Three worked example goals in plain non-expert language, each
 * run through the REAL engine (register → adjudicate → report) to a REAL, refusal-shaped verdict. Not mocked: the
 * verdicts come from the frozen core. Written to data/studio/presets.json and surfaced on the dashboard so a non-expert
 * sees, concretely, that the honest outcome is a NO / NOT-YET with the receipts. Run: bun run script/presets.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Ledger } from "../src/ledger/ledger"
import { Studio } from "../src/studio/adjudicate"
import { StudioReport } from "../src/studio/report"

const T = 1_700_000_000_000
function seededNormalSeries(seed: number, drift: number, vol: number, n: number): number[] {
  let s = seed >>> 0
  const u = () => ((s = (s + 0x6d2b79f5) | 0), ((t) => ((t = Math.imul(t ^ (t >>> 15), t | 1)), (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)), ((t ^ (t >>> 14)) >>> 0) / 4294967296))(s))
  const out: number[] = []
  for (let i = 0; i < n; i++) { const u1 = Math.max(u(), 1e-12), u2 = u(); out.push(drift + vol * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)) }
  return out
}

const base = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "tbill-3m", weight: 0.5 }, { id: "tbill-6m", weight: 0.5 }] }

async function main() {
  const presets: any[] = []

  // Preset 1 — the beginner who only has a little data. Ends: INSUFFICIENT-EVIDENCE (a forward clock, not an error).
  {
    const store = new Ledger.Store()
    const v = await Studio.submit(store, { spec: base, authorClass: "human", domain: "rwa", timestamp: T, returns: seededNormalSeries(7, 0.02, 0.6, 90), barsPerYear: 365 })
    const rep = StudioReport.render(v)
    presets.push({ goal: "\"I have about 3 months of data — is my stablecoin yield strategy any good?\"", verdict: v.attestation.verdict, tier: v.attestation.verifiability, report: rep, readability: StudioReport.check(rep, v), teaches: "Not enough evidence yet is a forward clock, not a failure — the engine tells you how much more it needs." })
  }

  // Preset 2 — the optimizer who iterated. Ends: NO-GO (the search is counted; the bar got harder). refusal-shaped.
  {
    const store = new Ledger.Store()
    const R = seededNormalSeries(1, 0.125, 0.9, 260)
    const variant = (k: number) => ({ ...base, legs: [{ id: "a", weight: 0.5 + k * 0.01 }, { id: "b", weight: 0.5 - k * 0.01 }] })
    let parent: number | null = null
    for (let k = 0; k < 8; k++) parent = Studio.register(store, { spec: variant(k), authorClass: "agent", authorId: "optimizer", domain: "rwa", parentSeq: parent, timestamp: T + k }).seq
    const v = await Studio.adjudicateRegistered(store, variant(7), { returns: R, barsPerYear: 365 }) // the exact registered spec
    presets.push({ goal: "\"I tried 8 versions of my strategy and the last one looks great — approve it?\"", verdict: v.attestation.verdict, tier: v.attestation.verifiability, report: StudioReport.render(v), readability: StudioReport.check(StudioReport.render(v), v), teaches: "Iterating to look better makes the bar harder: the ledger counted all 8 tries and deflated the score. Cherry-picking is impossible here." })
  }

  // Preset 3 — the confident caller who sends a returns series and claims a top tier. Ends: capped at V0, refusal-shaped.
  {
    const store = new Ledger.Store()
    const v = await Studio.submit(store, { spec: { ...base, policy: "barbell" }, authorClass: "external", domain: "rwa", timestamp: T, returns: seededNormalSeries(3, 0.05, 0.7, 260), barsPerYear: 365, declaredNTrials: 1, declaredTier: "V2", claimedVerdict: "GO" } as any)
    presets.push({ goal: "\"Here are my returns and I'm sure it's a GO — mark it top-tier.\"", verdict: v.attestation.verdict, tier: v.attestation.verifiability, report: StudioReport.render(v), readability: StudioReport.check(StudioReport.render(v), v), teaches: "You cannot declare your own tier or verdict. Caller-supplied returns are capped at V0; a claimed GO buys nothing — the tier is earned on the engine's own data." })
  }

  writeFileSync(path.join(PKG_ROOT, "data", "studio", "presets.json"), JSON.stringify({ protocol: "goal-presets", asOf: "2026-07-04", presets }, null, 2) + "\n")
  for (const p of presets) console.log(`• ${p.goal}\n  → ${p.verdict} (tier ${p.tier}) — ${p.teaches}\n`)
  console.log("wrote data/studio/presets.json")
}
main()
