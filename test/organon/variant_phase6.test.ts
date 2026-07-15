/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 6 walls (S166–S168): THE VARIANT LEDGER. NO NEW LAW (never sheds — the builder's
 * second half). DD-67/68/69/73, RP-1/2/4/6.
 *
 * W-VR06 (S166) — DD-67/RP-4: familyId = filter hash + operator epoch (never auto-grouped by filter alone); every FIXTURE
 *   lineage id unchanged (the epoch is OUTSIDE the hashed identity — a seeded fixture-id move FAILS).
 * W-VR07 (S167) — DD-69/RP-2: the ledger is CHRONOLOGICAL (a seeded score-ordering renders chronological); no aggregate/
 *   best/ranking/delta-improvement (the shape has no such field); each Stamp shown with its OWN inline evidence; the search
 *   count renders between the variants; the copy is PINNED VERBATIM.
 * W-VR08 (S168) — DD-68/RP-1/RP-6: the search price is COMPUTED and DARK (lit false), stored as INGREDIENTS tagged
 *   DARK-COMPUTE NOT A VERDICT; familyN === 1; a seeded AGENT variant cannot reach realLineageCount (the quarantine holds).
 */
import { test, expect } from "bun:test"
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Variant, SearchPrice } from "../../src/strategy/variant"
import { StrategyStore } from "../../src/strategy/store"
import { Family } from "../../src/strategy/family"

const H = path.join(PKG_ROOT, "data", "honesty")
const copyV = JSON.parse(readFileSync(path.join(H, "variant-pins.json"), "utf8")).delegatedDecisions.DD69.copyVerbatim

function entries(): Variant.Entry[] {
  return [
    { lineageId: "variant-a", filedAt: 1_700_000_000_000, stamp: "GO", authorship: "HUMAN", evidence: { falseFire: "USDC peg 0/459d held", exit: "peg-floor 0.98" }, bestNaive: 0.9 },
    { lineageId: "variant-b", filedAt: 1_700_100_000_000, stamp: "NO-GO", authorship: "HUMAN", evidence: { falseFire: "TVL 5 fires @30%", dependency: "3 of 5 share USDC" }, bestNaive: 0.4 },
  ]
}

// ── S166 (W-VR06) — the family derivation moves NO lineage id ──────────────────────────────────────────────────────────
test("S166 (W-VR06) — every FIXTURE lineage id is UNCHANGED: the familyId is derived OUTSIDE the hashed manifest identity", () => {
  const dir = StrategyStore.FIXTURE_DIR
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const m = JSON.parse(readFileSync(path.join(dir, f), "utf8"))
    expect(StrategyStore.lineageId(m)).toBe(f.replace(".json", "")) // the id did NOT move (a seeded move would fail here)
  }
})

test("S166 (W-VR06) — RP-4: same filter + DIFFERENT operator epoch → DIFFERENT family (never auto-grouped by filter alone)", () => {
  const filter = { chain: "ethereum", asset: "USDC" }
  expect(Variant.family(filter, "epoch-jan")).not.toBe(Variant.family(filter, "epoch-jun")) // two hunts, not one over-charged family
  expect(Variant.family(filter, "epoch-jan")).toBe(Variant.family(filter, "epoch-jan")) // deterministic
  // a manifest with NO filter is a family of ONE (familyN stays 1)
  expect(Variant.filterHash(undefined)).toBe("∅")
  expect(Family.familyN).toBe(1)
})

// ── S167 (W-VR07) — chronological, no ranking, own-thesis evidence, pinned copy ────────────────────────────────────────
test("S167 (W-VR07) — the ledger is CHRONOLOGICAL: a seeded score-ordering (GO-first) STILL renders in filing order", () => {
  const scoreOrdered = Variant.seededScoreOrdering(entries()) // GO before NO-GO — the adversarial ranking A′ #1 warns about
  const L = Variant.ledger("fam", scoreOrdered, 2)
  expect(L.ordering).toBe("CHRONOLOGICAL")
  // the rendered order is by filedAt ascending (variant-a filed first), NOT by Stamp rank
  expect(L.variants.map((v) => v.lineageId)).toEqual(["variant-a", "variant-b"])
  expect(L.variants[0].when <= L.variants[1].when).toBe(true)
})

test("S167 (W-VR07) — NO aggregate/best/ranking/delta-improvement: the Ledger shape carries no such field (structural, not a guard)", () => {
  const L = Variant.ledger("fam", entries(), 2) as unknown as Record<string, unknown>
  for (const forbidden of ["best", "rank", "ranking", "aggregate", "winner", "recommended", "delta", "score", "total"]) {
    expect(forbidden in L).toBe(false)
  }
  // no DATA line (the header, the search count, the per-variant evidence) says "choose"/"better than"/"best"/"instead".
  // The disclaimer lines (noAggregate, ownThesisRule) legitimately NEGATE these words ("no best, no 'choose'") — that is the
  // whole point of the pinned copy, so they are excluded (the V40 dependency-map precedent: scope the check to data lines).
  const L2 = Variant.ledger("fam", entries(), 2)
  const dataText = [L2.header, L2.searchCountLine, L2.authorshipLine, ...L2.variants.map((v) => v.evidenceLine)].join(" ").toLowerCase()
  for (const bad of ["choose", "better than", "the best", "prefer ", "instead"]) expect(dataText).not.toContain(bad)
})

test("S167 (W-VR07) — each Stamp shown with its OWN inline evidence (RP-2); the search count renders BETWEEN the variants", () => {
  const L = Variant.ledger("fam", entries(), 2)
  expect(L.variants[0].evidenceLine).toMatch(/judged against its own thesis/) // RP-2 — own thesis, not a compare
  expect(L.variants[0].evidenceLine).toMatch(/peg/) // variant-a's OWN facts
  expect(L.variants[1].evidenceLine).toMatch(/share USDC/) // variant-b's OWN facts
  expect(L.searchCountLine).toMatch(/you have filed 2 variants.*that is 2 searches/) // the PRICE of having both
  expect(L.cumulativeSearches).toBe(2)
})

test("S167 (W-VR07) — the copy is PINNED VERBATIM (no LLM on this surface): the rendered strings ARE the pinned templates", () => {
  const L = Variant.ledger("fam", entries(), 2)
  expect(L.header).toBe(copyV.header)
  expect(L.ownThesisRule).toBe(copyV.ownThesisRule)
  expect(L.noAggregateLine).toBe(copyV.noAggregate)
  // the templates are filled, never generated — the search count is the pinned template with {n} substituted
  expect(L.searchCountLine).toBe(copyV.searchCount.replace(/\{n\}/g, "2").replace(/\{s\}/g, "s").replace(/\{es\}/g, "es"))
})

// ── S168 (W-VR08) — the DARK search price + the authorship quarantine ──────────────────────────────────────────────────
test("S168 (W-VR08) — the search price is COMPUTED and DARK: lit false, tagged DARK-COMPUTE NOT A VERDICT, ingredients stored (RP-1)", () => {
  // a 4-variant family — the search price is visibly non-zero (2 searches barely deflate; the price grows with N)
  const four: Variant.Entry[] = [0, 1, 2, 3].map((i) => ({ lineageId: `v${i}`, filedAt: 1_700_000_000_000 + i * 1e6, stamp: i === 0 ? "GO" : "NO-GO", authorship: "HUMAN", evidence: { falseFire: `variant ${i} facts` }, bestNaive: 0.9 - i * 0.1 }))
  const L = Variant.ledger("fam", four, 4)
  const p = L.searchPriceDark
  expect(p.lit).toBe(false) // the meter's LIGHT is OFF (D63)
  expect(p.tag).toBe("DARK-COMPUTE, NOT A VERDICT")
  // RP-1 — stored as INGREDIENTS, not a verdict: {nTrials, bestNaive, deflationFactor}; NO GO/NO-GO field
  expect(p.ingredients.nTrials).toBe(4)
  expect(typeof p.ingredients.deflationFactor).toBe("number")
  expect("verdict" in p).toBe(false)
  expect("go" in p).toBe(false)
  // the deflation GROWS with N (the price of searching): 4 searches raise the bar above the 1-trial baseline
  expect(p.sr0AtN).toBeGreaterThan(p.sr0AtOne)
  expect(p.ingredients.deflationFactor).toBeGreaterThan(0)
  // the render is DARK and names the meter is off
  expect(p.render).toMatch(/currently OFF|light is OFF/i)
})

test("S168 (W-VR08) — probit reproduces scipy.norm.ppf clone-stably (the frozen sr0_deflated ported to the harness)", () => {
  expect(SearchPrice.probit(0.975)).toBeCloseTo(1.959964, 5)
  expect(SearchPrice.probit(0.95)).toBeCloseTo(1.644854, 5)
  expect(SearchPrice.probit(0.5)).toBeCloseTo(0, 6)
  // sr0_deflated grows monotonically with the trial count (more searches ⇒ a higher expected-max benchmark)
  expect(SearchPrice.sr0Deflated(0.25, 48)).toBeGreaterThan(SearchPrice.sr0Deflated(0.25, 4))
  expect(SearchPrice.sr0Deflated(0.25, 4)).toBeGreaterThan(SearchPrice.sr0Deflated(0.25, 1))
})

test("S168 (W-VR08) — RP-6: the ledger's HUMAN count reads the SAME producer as realLineageCount; an AGENT variant cannot reach it", () => {
  // a busy ledger of AGENT variants: 3 AGENT, 0 HUMAN — honest (the quarantine holds); realLineageCount stays 0
  const agentEntries: Variant.Entry[] = [0, 1, 2].map((i) => ({ lineageId: `agent-${i}`, filedAt: 1_700_000_000_000 + i, stamp: "GO", authorship: "AGENT", evidence: {}, bestNaive: 0.5 }))
  const L = Variant.ledger("fam", agentEntries, 0) // realLineageCount injected = 0 (the SAME producer the gate reads)
  expect(L.authorship.agent).toBe(3)
  expect(L.authorship.human).toBe(0)
  expect(L.authorship.humanEqualsRealLineageCount).toBe(true) // human (0) === realLineageCount (0) — no contradiction
  expect(L.authorshipLine).toMatch(/3 variants — 3 AGENT, 0 HUMAN/) // a busy ledger that does NOT imply human use
  // a seeded AGENT variant that TRIED to count as human would break the equality (the wall bites)
  const seeded = Variant.ledger("fam", agentEntries, 1) // pretend realLineageCount says 1 while 0 humans are present
  expect(seeded.authorship.humanEqualsRealLineageCount).toBe(false) // the disagreement is the alarm
})

test("S168 (W-VR08) — screens stay 3: the variant ledger is a PURE MODULE (a PATH), not a served screen (DD-73)", () => {
  // the variant ledger imports NO server/route — it is a pure module like LineageView (a PATH off the lineage view)
  const src = readFileSync(path.join(PKG_ROOT, "src", "strategy", "variant.ts"), "utf8")
  expect(src).not.toMatch(/\bapp\.(get|post)\b|new Hono|serve\(|\.route\(/) // no route registration → no fourth screen
})
