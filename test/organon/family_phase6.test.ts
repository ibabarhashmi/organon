/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 6 wall (S149 / D72) — *sheds second.* THE LINEAGE VIEW.
 *
 * The thinnest ice (A4): a comparison is a ranking with the sort button removed, unless disciplined hard. CHRONOLOGICAL,
 * mechanically pinned (a seeded score-ordering FAILS); each variant its own independent ternary Stamp (never an ordering);
 * no aggregate, no "best", no total order; the SEARCH COUNT renders beside them (the price tag that permits the comparison);
 * the copy is PINNED VERBATIM — no LLM (RP-5); a PATH, not a screen (screens stay 3).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { LineageView } from "../../src/strategy/lineageview"

const variants: LineageView.Variant[] = [
  { lineageId: "a", filedAt: Date.parse("2026-05-01"), stamp: "NO-GO" },
  { lineageId: "b", filedAt: Date.parse("2026-06-15"), stamp: "GO" },
  { lineageId: "c", filedAt: Date.parse("2026-07-01"), stamp: "INSUFFICIENT" },
]

test("S149 — the ordering is CHRONOLOGICAL, mechanically pinned; a SEEDED score-ordering FAILS", () => {
  const v = LineageView.view(variants)
  expect(v.ordering).toBe("CHRONOLOGICAL")
  // the rendered lines are in filing order (2026-05 → 2026-06 → 2026-07), regardless of the stamps
  expect(v.lines[0]).toMatch(/2026-05-01/)
  expect(v.lines[2]).toMatch(/2026-07-01/)
  expect(LineageView.isChronological([...variants].sort((a, b) => a.filedAt - b.filedAt))).toBe(true)
  // SEEDED NEGATIVE — a score-ordering (GO first) is NOT chronological; the discipline FAILS it (a ranking with the sort button removed)
  expect(LineageView.isChronological(LineageView.seededScoreOrdering(variants))).toBe(false)
})

test("S149 — each variant carries its OWN independent ternary Stamp (a classification, never an ordering); NO aggregate / best / total order", () => {
  const v = LineageView.view(variants)
  // every stamp word appears beside its own variant — a classification per variant
  expect(v.lines.join(" ")).toMatch(/NO-GO/)
  expect(v.lines.join(" ")).toMatch(/GO/)
  expect(v.lines.join(" ")).toMatch(/INSUFFICIENT/)
  // NO aggregate — the view has no "best"/"rank"/"score"/"total" field; the pinned line states it plainly
  expect(Object.keys(v)).not.toContain("best")
  expect(Object.keys(v)).not.toContain("rank")
  expect(Object.keys(v)).not.toContain("score")
  expect(v.noAggregateLine).toMatch(/no total, no best, no ranking/i)
})

test("S149 — the SEARCH COUNT renders prominently (the price tag): N variants = N searches (X-RECKON)", () => {
  const v = LineageView.view(variants)
  expect(v.searchCount).toBe(3)
  expect(v.variantCount).toBe(3)
  expect(v.searchCountLine).toMatch(/filed 3 variants/)
  expect(v.searchCountLine).toMatch(/3 searches/) // the comparison is permitted BECAUSE it carries its own price tag
  // singular renders correctly (1 variant = 1 search)
  const one = LineageView.view([variants[0]])
  expect(one.searchCountLine).toMatch(/filed 1 variant\b/)
  expect(one.searchCountLine).toMatch(/1 search\b/)
})

test("S149 (RP-5) — the copy is PINNED VERBATIM in family-pins.json (NO LLM, NO generated prose): the view fills pinned templates only", () => {
  const fp = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "family-pins.json"), "utf8"))
  const pinned = fp.phase6_lineageView.dd60_chronological.copyVerbatim
  const v = LineageView.view(variants)
  // the header + no-aggregate line are the PINNED strings verbatim (a summarization would move the pins sha)
  expect(v.header).toBe(pinned.header)
  expect(v.noAggregateLine).toBe(pinned.noAggregate)
  // the search-count line is the pinned TEMPLATE with {n} substituted — no free prose
  expect(pinned.searchCount).toMatch(/\{n\}/)
  expect(v.searchCountLine).toBe(pinned.searchCount.replace(/\{n\}/g, "3").replace(/\{s\}/g, "s").replace(/\{es\}/g, "es"))
  // RP-5 is pinned (no LLM phrasing on this surface)
  expect(fp.phase6_lineageView.rp5_pinnedCopy).toMatch(/PINNED VERBATIM/)
  expect(fp.phase6_lineageView.rp5_pinnedCopy).toMatch(/no LLM/i)
})

test("S149 — a PATH, not a screen: the screen count stays 3 (the view is a render fragment, never a fourth screen)", () => {
  const fp = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "family-pins.json"), "utf8"))
  expect(fp.phase6_lineageView.screens).toBe(3)
  expect(fp.carried.screens.length).toBe(3)
})
