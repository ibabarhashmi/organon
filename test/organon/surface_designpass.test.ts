/**
 * ORGΛNON — THE SOVEREIGN SPRINT, Phase 2 wall (THE DESIGN PASS; Spine A · SF5 · X-DESIGNPASS · S41). The interactive
 * impeccable `critique` was RUN for real (a design-review sub-agent + the deterministic detector), its genuine findings
 * applied ON THE GO — but ONLY within the walls: the SEMANTIC TOKENS stay byte-frozen (a value change would break the
 * frozen Surface pin), the CONTENT stays byte-identical (S36, asserted in surface_content_identity), the deps stay
 * hono+zod, and every new color pairing clears WCAG-AA (COMPUTED — never claimed untested). This wall proves the pass
 * happened, that it moved pixels and not facts, and that its one out-of-scope correctness finding (W-SO01) was routed to
 * the red-team rather than silently patched into an aesthetics-only pass.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const T = JSON.parse(read("data/honesty/design-tokens.json"))
const css = read("public/organon.css")
const crit = JSON.parse(read("data/honesty/designpass-critique.json"))
const surfacePins = JSON.parse(read("data/honesty/surface-pins.json"))
const sha256 = (b: string) => require("node:crypto").createHash("sha256").update(b).digest("hex")

// WCAG contrast (sRGB relative luminance) — same computation as surface_a11y
function lum(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
function contrast(a: string, b: string): number { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05) }

test("DESIGN PASS — the SEMANTIC TOKENS stayed BYTE-FROZEN: the live design-tokens.json still hashes to the frozen Surface pin (the pass changed NO token value)", () => {
  // the honesty-load-bearing primitives (the AA-cleared palette, the type scale, the non-color cues) are hash-locked into
  // the Surface pin b0179998 — the pass operates ABOVE them, so the live file must still match the frozen record.
  expect(sha256(read("data/honesty/design-tokens.json"))).toBe(surfacePins.tokens.sha)
  expect(crit.tokensChanged).toBe(false)
})

test("DESIGN PASS — the critique RAN for real: Assessment A (design-review) + Assessment B (detector), isolated, with the browser/live flow honestly NOT run", () => {
  expect(crit.assessmentA_designReview).toBeDefined()
  expect(crit.assessmentB_detector).toBeDefined()
  expect(crit.assessmentB_detector.isolatedFromA).toBe(true)
  expect(crit.assessmentA_designReview.isolatedFromB).toMatch(/WITHOUT the detector output|isolation/i)
  expect(crit.honestBound).toMatch(/NOT run|no browser automation/i) // the honest disclosure, not overstated
  expect(crit.honestBound).toMatch(/SOURCE-BASED/i)
  expect(crit.assessmentB_detector.postPassFindings).toMatch(/0 non-exception|unchanged/i)
  expect(crit.screenCount).toBe(3)
})

test("DESIGN PASS — P1 (facts loudest): .num is a mono + --ink figure style, and the render wraps live figures in it (a fact made loud, not moved)", () => {
  // the CSS rule exists and uses EXISTING tokens (mono + ink + body size) — no token value invented
  expect(css).toMatch(/\.num\{font-family:var\(--mono\);color:var\(--ink\);font-weight:600/)
  // the render wraps figures: the shelf headline APY, the confidence band's durable/advertised, the split-bar readout
  const rc = Reality.realityCheck(`defillama:pool:${require("../../src/dataplane/providers/defillama").DefiLlama.SAMPLE_POOLS[0].pool}`, Date.parse("2026-07-09T00:00:00Z"))
  const html = rc ? Reality.renderRealityCheck(rc.name, rc.scored, rc.history, "defillama:pool:x") : ""
  expect(html).toMatch(/<span class="num">[^<]*%<\/span>/) // a percentage figure is wrapped in .num
  const shelf = Reality.renderShelf(Reality.shelfSample(), true)
  expect(shelf).toMatch(/headline APY <span class="num">/) // the shelf card's headline number pops
})

test("DESIGN PASS — P2 (scannable tier rail): the axis-tier glyph keeps its SHAPE cue AND gains a verdict color+weight; the render wraps the glyph", () => {
  expect(css).toMatch(/\.axis-tier\{font-weight:700/)
  expect(css).toMatch(/\.axis-tier\.pass\{color:var\(--v-SOLID\)\}/)
  expect(css).toMatch(/\.axis-tier\.fail\{color:var\(--v-AVOID\)\}/)
  expect(css).toMatch(/\.axis-tier\.unverified\{color:var\(--v-UNVERIFIED\)\}/)
  const rc = Reality.realityCheck(`defillama:pool:${require("../../src/dataplane/providers/defillama").DefiLlama.SAMPLE_POOLS[0].pool}`, Date.parse("2026-07-09T00:00:00Z"))
  const html = rc ? Reality.renderRealityCheck(rc.name, rc.scored, rc.history, "defillama:pool:x") : ""
  expect(html).toMatch(/<span class="axis-tier (pass|caution|fail|unverified)">[✓!✗?]<\/span>/) // the glyph (the non-color cue) is preserved inside the class
})

test("DESIGN PASS — P2 is AA-honest: EVERY axis-tier color clears WCAG-AA on BOTH the page ground and a card surface (a new pairing is PROVEN, never claimed)", () => {
  const bg = T.color.bg, surface = T.color.surface, AA = 4.5
  const map: Record<string, string> = { pass: T.semantic.verdict.SOLID.color, caution: T.semantic.verdict.CAUTION.color, fail: T.semantic.verdict.AVOID.color, unverified: T.semantic.verdict.UNVERIFIED.color }
  for (const [tier, color] of Object.entries(map)) {
    expect({ tier, ground: contrast(color, bg) >= AA }).toEqual({ tier, ground: true })
    expect({ tier, card: contrast(color, surface) >= AA }).toEqual({ tier, card: true })
  }
})

test("DESIGN PASS — P3 (section rhythm): the previously-unused h2 tier + --sp6 now carry major sections; the render emits h2 section headers", () => {
  // h2 uses the --sp6 top-margin (the token was emitted but used zero times before the pass)
  expect(css).toMatch(/h2\{[^}]*margin:var\(--sp6\)/)
  const rc = Reality.realityCheck(`defillama:pool:${require("../../src/dataplane/providers/defillama").DefiLlama.SAMPLE_POOLS[0].pool}`, Date.parse("2026-07-09T00:00:00Z"))
  const html = rc ? Reality.renderRealityCheck(rc.name, rc.scored, rc.history, "defillama:pool:x") : ""
  expect(html).toMatch(/<h2>The honesty scorecard<\/h2>/) // a true section is now an h2 chapter, not a flat h3
})

test("DESIGN PASS — P4 (meaning-only): the .band .rng decorative gradient is retired to a neutral rail (no semantic color spent on ornament)", () => {
  expect(css).toMatch(/\.band \.rng\{[^}]*background:var\(--border-strong\)/)
  expect(css).not.toMatch(/\.band \.rng\{[^}]*linear-gradient/) // the green→amber decoration is gone
})

test("DESIGN PASS — the one out-of-scope correctness finding (W-SO01 '4 of 3') was ROUTED to the red-team, not silently patched into an aesthetics-only pass", () => {
  const w = crit.assessmentA_designReview.outOfScopeFindings.find((f: { id: string }) => f.id === "W-SO01")
  expect(w).toBeDefined()
  expect(w.kind).toMatch(/DATA\/LOGIC|correctness/i)
  expect(w.handling).toMatch(/NOT touched by the design pass|PART E|red-team/i)
  expect(w.handling).toMatch(/re-capture|re-pin/i) // the fix's content-move is acknowledged as needing a conscious golden re-capture
})

test("DESIGN PASS — no runtime dependency entered: the deps stay EXACTLY hono+zod (impeccable dev-time-only; the pass shipped CSS + markup classes, never the tool)", () => {
  const pkg = JSON.parse(read("package.json"))
  expect(Object.keys(pkg.dependencies).sort()).toEqual(["hono", "zod"])
})
