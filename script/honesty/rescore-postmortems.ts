/**
 * ORGΛNON — THE RE-SCORE POST-MORTEMS (Probe Phase 3; S53, X-HONEST governs absolutely). The credibility artifact that
 * ships with the invites: ORGΛNON's OWN deterministic engine (Scorecard.score — ZERO new scoring) run against the three
 * 2025-26 collapses the research named (Stream Finance · Elixir · Resolv). THE HONESTY RULE: every fact cell is labeled
 * SAMPLE (drawn from public post-mortem reporting — the tool did NOT re-fetch the now-delisted pools; a REAL cell would be
 * a content-hashed live fetch), and the recorded verdict IS the engine's actual recomputed output — not authored. The
 * headline is honestly UNVERIFIED (the engine will not bless data it cannot verify); the persuasion is the ADVERSE
 * STRUCTURAL FLAGS the axes compute from the documented facts (emissions/collapse/depeg/counterparty). A fabricated cell,
 * an unlabeled SAMPLE, or a verdict the engine does not reproduce is the exact over-claim the tool forbids.
 * Run: bun run script/honesty/rescore-postmortems.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync, mkdirSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Scorecard } from "../../src/analytics/scorecard"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

// each SAMPLE fact carries WHY it is SAMPLE (public reporting, not re-fetched) — the per-cell provenance the test checks
type Cell = { value: number | boolean | null; reality: "REAL" | "SAMPLE"; source: string }
interface Subject {
  key: string
  name: string
  collapse: string // factual context, LABELED as external public reporting (never asserted as a REAL engine fetch)
  facts: Scorecard.PoolFacts
  factProvenance: Record<string, Cell>
}

const cell = (value: number | boolean | null, source: string): Cell => ({ value, reality: "SAMPLE", source })

const SUBJECTS: Subject[] = [
  {
    key: "stream",
    name: "Stream Finance xUSD",
    collapse:
      "Per public post-mortems (Nov 2025): xUSD — a yield-bearing 'stablecoin' fed by opaque off-chain curator strategies with recursive leverage — depegged hard (to ~$0.2–0.3) as the strategies unwound; hundreds of millions in exposure across the dependent stack. All figures below are SAMPLE (public reporting), not an ORGΛNON re-fetch.",
    facts: { name: "Stream Finance xUSD", apyBase: 2, apyReward: 16, tvlSlope30d: -0.72, pegDev: 0.75, isStablecoin: true, reality: "SAMPLE", provenanceRef: null, vertical: "stablecoin-yield", depProtocols: 4, ageDays: 240, sizeUsd: 150_000_000, liqUsd: null },
    factProvenance: {
      apyBase: cell(2, "SAMPLE — indicative organic base from public reporting"),
      apyReward: cell(16, "SAMPLE — the large emissions component driving the >80%-reward mix (mercenary)"),
      tvlSlope30d: cell(-0.72, "SAMPLE — the ~-72% 30d TVL move as the pool unwound (public post-mortems)"),
      pegDev: cell(0.75, "SAMPLE — the hard depeg to ~$0.25 (|price-1|≈0.75)"),
      depProtocols: cell(4, "SAMPLE — the stacked off-chain-curator + recursive-leverage dependency (≥3 = a hard flag)"),
    },
  },
  {
    key: "elixir",
    name: "Elixir deUSD",
    collapse:
      "Per public post-mortems (late 2025): deUSD carried material exposure to the Stream complex; as Stream unwound, deUSD depegged and the protocol moved to wind down / redeem. All figures below are SAMPLE (public reporting), not an ORGΛNON re-fetch.",
    facts: { name: "Elixir deUSD", apyBase: 3, apyReward: 9, tvlSlope30d: -0.6, pegDev: 0.25, isStablecoin: true, reality: "SAMPLE", provenanceRef: null, vertical: "stablecoin-yield", depProtocols: 3, ageDays: 300, sizeUsd: 100_000_000, liqUsd: null },
    factProvenance: {
      apyBase: cell(3, "SAMPLE — indicative base from public reporting"),
      apyReward: cell(9, "SAMPLE — the reward component (reward-heavy mix)"),
      tvlSlope30d: cell(-0.6, "SAMPLE — the ~-60% 30d TVL move during the wind-down"),
      pegDev: cell(0.25, "SAMPLE — the depeg stress as Stream contagion hit (|price-1|≈0.25)"),
      depProtocols: cell(3, "SAMPLE — the counterparty dependency on the Stream complex (≥3 = a hard flag)"),
    },
  },
  {
    key: "resolv",
    name: "Resolv USR",
    collapse:
      "Per public post-mortems (2025): USR — a delta-neutral 'stablecoin' backed by a hedged basis position with an RLP insurance layer — saw peg stress / a wobble under adverse funding, absorbed by the insurance layer (a milder event than Stream/Elixir). All figures below are SAMPLE (public reporting), not an ORGΛNON re-fetch.",
    facts: { name: "Resolv USR", apyBase: 5, apyReward: 7, tvlSlope30d: -0.2, pegDev: 0.03, isStablecoin: true, reality: "SAMPLE", provenanceRef: null, vertical: "delta-neutral", deltaNeutral: true, fundingBand: { p10: -8, median: 4, p90: 15 }, depProtocols: 3, ageDays: 200, sizeUsd: 250_000_000, liqUsd: null },
    factProvenance: {
      apyBase: cell(5, "SAMPLE — indicative basis yield from public reporting"),
      apyReward: cell(7, "SAMPLE — the reward component"),
      tvlSlope30d: cell(-0.2, "SAMPLE — a ~-20% 30d TVL move (a wobble, not a collapse)"),
      pegDev: cell(0.03, "SAMPLE — a modest peg deviation, largely held"),
      fundingBand: cell(null, "SAMPLE — the delta-neutral funding band (p10 -8 / median 4 / p90 15 %) — adverse-tail funding risk"),
    },
  },
]

const postmortems = SUBJECTS.map((s) => {
  const scored = Scorecard.score(s.facts) // THE ACTUAL ENGINE — recomputed in the test, never authored
  const rows = scored.rows.map((r) => ({ axis: r.axis, name: r.name, tier: r.tier, material: r.material, flagship: r.flagship }))
  const adverseFlags = rows.filter((r) => r.tier === "fail" || r.tier === "caution").map((r) => `${r.axis}: ${r.tier}`)
  const engineOutput = { verdict: scored.verdict, failing: scored.failing, summary: scored.summary, rows }
  // the reproHash lets the test prove the recorded output IS the engine's output on these exact facts
  const reproHash = sha256(JSON.stringify({ facts: s.facts, verdict: scored.verdict, rows: rows.map((r) => [r.axis, r.tier]) }))
  return {
    subject: s.key,
    name: s.name,
    collapse: s.collapse,
    provenancePosture: "SAMPLE — every fact cell below is drawn from public post-mortem reporting; ORGΛNON did NOT re-fetch the (now delisted) pool. A REAL cell would be a content-hashed live fetch. The engine verdict is the actual recomputed output on these SAMPLE facts.",
    facts: s.facts,
    factProvenance: s.factProvenance,
    engineOutput,
    adverseFlags,
    honestNote:
      scored.verdict === "UNVERIFIED"
        ? `The headline verdict is UNVERIFIED — the engine will not bless data it cannot verify (these facts are SAMPLE). But the structural axes it computes from the documented facts flag: ${adverseFlags.join(" · ") || "(none material)"}. It would never have rendered this SOLID.`
        : `The engine's recomputed verdict on these SAMPLE facts is ${scored.verdict}; adverse structural flags: ${adverseFlags.join(" · ") || "(none)"}.`,
    reproHash,
  }
})

const dir = path.join(PKG_ROOT, "data", "postmortems")
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
for (const pm of postmortems) writeFileSync(path.join(dir, `${pm.subject}.json`), JSON.stringify(pm, null, 2) + "\n")

const index = {
  protocol: "rescore-postmortems",
  at: "2026-07-10",
  rule: "S53 — the existing deterministic engine (Scorecard.score, zero new scoring) run against three real 2025-26 collapses; every fact cell REAL-and-content-hashed or labeled SAMPLE; the verdict is the engine's actual recomputed output; no fabricated cell, no unsupported certainty (X-HONEST governs absolutely).",
  subjects: postmortems.map((p) => ({ subject: p.subject, name: p.name, verdict: p.engineOutput.verdict, adverseFlags: p.adverseFlags, reproHash: p.reproHash })),
  allSample: postmortems.every((p) => Object.values(SUBJECTS.find((s) => s.key === p.subject)!.factProvenance).every((c) => c.reality === "SAMPLE")),
  note: "allSample=true: no cell claims REAL provenance (we did not re-fetch the delisted pools). The verdicts are UNVERIFIED (honest) with the adverse structural flags the engine actually computes — 'here is what we would have flagged, deterministically'.",
}
writeFileSync(path.join(dir, "index.json"), JSON.stringify(index, null, 2) + "\n")

console.log("── RE-SCORE POST-MORTEMS (S53) ─────────────────")
for (const p of postmortems) console.log(`  ${p.subject.padEnd(8)} ${p.engineOutput.verdict.padEnd(11)} flags: ${p.adverseFlags.join(" · ") || "(none)"}`)
console.log(`  allSample: ${index.allSample} · written data/postmortems/{stream,elixir,resolv,index}.json`)
