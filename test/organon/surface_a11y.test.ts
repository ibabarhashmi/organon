/**
 * ORGΛNON — THE SURFACE SPRINT, Phase 4 wall S37 (a11y + honest degraded states; X-SURFACE f). WCAG-AA contrast is
 * COMPUTED from the pinned token file (deterministic sRGB relative-luminance); every verdict / Stamp / REAL-SAMPLE /
 * trust-tier distinction carries a NON-COLOR cue (a glyph, a border-style, or a weight — never color alone); the surface
 * is keyboard-reachable + responsive; and the DEGRADED states (UNVERIFIED / INSUFFICIENT / AI-off / empty-shelf) render
 * as INTENTIONAL designed states, not errors — because in an honesty-first tool the "we can't confirm this" state is the
 * product's core value, not something to hide.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import type { Stamp } from "../../src/studio/stamp"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const T = JSON.parse(read("data/honesty/design-tokens.json"))
const css = read("public/organon.css")

// ── WCAG contrast (sRGB relative luminance) ──
function lum(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const bg = T.color.bg, surface = T.color.surface
const AA = 4.5 // body / small-bold text threshold (the pills are small bold → held to 4.5, the strict bar)

test("S37 — WCAG-AA: the core text colors clear 4.5:1 on the ground", () => {
  expect(contrast(T.color.ink, bg)).toBeGreaterThanOrEqual(AA)
  expect(contrast(T.color.inkMuted, bg)).toBeGreaterThanOrEqual(AA)
  expect(contrast(T.color.inkFaint, bg)).toBeGreaterThanOrEqual(AA) // the .trust footer + eyebrow (small)
  expect(contrast(T.color.accent, bg)).toBeGreaterThanOrEqual(AA) // links
})

test("S37 — WCAG-AA: every VERDICT + STAMP word clears 4.5:1 (its color on its own tint — the pill treatment)", () => {
  for (const [word, v] of Object.entries(T.semantic.verdict as Record<string, { color: string; tint: string }>)) {
    expect({ word, ok: contrast(v.color, v.tint) >= AA }).toEqual({ word, ok: true })
  }
  for (const [word, v] of Object.entries(T.semantic.stamp as Record<string, { color: string; tint: string }>)) {
    expect({ word, ok: contrast(v.color, v.tint) >= AA }).toEqual({ word, ok: true })
  }
})

test("S37 — WCAG-AA: REAL/SAMPLE marks + the trust-tier text clear 4.5:1 (on both the page ground and a card surface)", () => {
  for (const g of [bg, surface]) {
    expect(contrast(T.semantic.reality.REAL.color, g)).toBeGreaterThanOrEqual(AA)
    expect(contrast(T.semantic.reality.SAMPLE.color, g)).toBeGreaterThanOrEqual(AA)
  }
  expect(contrast(T.semantic.trustTier.FACT.color, T.semantic.trustTier.FACT.tint)).toBeGreaterThanOrEqual(AA)
  expect(contrast(T.semantic.trustTier.REASONING.color, T.semantic.trustTier.REASONING.tint)).toBeGreaterThanOrEqual(AA)
  expect(contrast(T.semantic.trustTier.BOUNDARY.color, T.semantic.trustTier.BOUNDARY.tint)).toBeGreaterThanOrEqual(AA)
})

test("S37 — NON-COLOR cues: every verdict/Stamp has a glyph, REAL/SAMPLE differ by border-style, tiers by weight/eyebrow/border — never color alone (in the tokens AND the CSS)", () => {
  // tokens: each verdict + stamp word carries a distinct glyph
  const vGlyphs = Object.values(T.semantic.verdict as Record<string, { glyph: string }>).map((v) => v.glyph)
  const sGlyphs = Object.values(T.semantic.stamp as Record<string, { glyph: string }>).map((v) => v.glyph)
  expect(new Set(vGlyphs).size).toBe(4) // four DISTINCT glyphs (a shape cue, not color)
  expect(new Set(sGlyphs).size).toBe(4)
  // the CSS renders those glyphs via ::before (a non-color cue that survives greyscale)
  expect(css).toMatch(/\.pill\.SOLID::before\{content:/)
  expect(css).toMatch(/\.pill\.GO::before\{content:/)
  // REAL/SAMPLE differ by border-style (a non-color pattern cue)
  expect(css).toMatch(/\.badge\.REAL\{[^}]*border-style:solid/)
  expect(css).toMatch(/\.badge\.SAMPLE\{[^}]*border-style:dashed/)
  // the trust tiers: FACT a solid border + a ✓ eyebrow (weight), REASONING the ANALYSIS eyebrow, BOUNDARY a dashed border
  expect(css).toMatch(/\.blk\.fact::before\{content:"✓/)
  expect(css).toMatch(/\.blk\.boundary\{[^}]*border-style:dashed/)
})

test("S37 — keyboard-reachable (a visible :focus-visible ring) + responsive (a mobile breakpoint; no fixed-px-only layout)", () => {
  expect(css).toMatch(/:focus-visible\{outline:/)
  expect(css).toMatch(new RegExp(`@media \\(max-width:${T.layout.mobileBreakpoint}\\)`))
  expect(css).toMatch(/\.field\.grow\{width:100%\}/) // the input goes full-width on mobile (no horizontal scroll)
  expect(css).toMatch(/min-height:40px/) // touch targets ≥ 40px (buttons + fields)
})

test("S37 — the DEGRADED states render as INTENTIONAL designed states, not errors (UNVERIFIED · INSUFFICIENT · AI-off · empty-shelf)", () => {
  // empty-shelf (no live data) — a designed SAMPLE-mode card, an UNVERIFIED verdict pill with its glyph cue
  const shelf = Reality.renderShelf(Reality.shelfSample(), true)
  expect(shelf).toContain("SAMPLE mode") // the honest empty state is announced, designed as a card
  expect(shelf).toMatch(/class="pill UNVERIFIED"/) // UNVERIFIED is a first-class pill (with its ○ glyph via CSS), not a blank
  // AI-off — a designed badge, not a broken-looking fallback
  const ask = Reality.renderAsk({ register: "simple", raw: false, aiStatus: { keyed: false, provider: null } })
  expect(ask).toMatch(/class="badge SAMPLE">AI phrasing off/) // the AI-off state is a styled badge (intentional)
  // INSUFFICIENT — the Stamp renders the state as a pill with its ◔ glyph cue + the honest "forward clock" framing
  const insuff = { verdict: "INSUFFICIENT", available: false, nObs: 4, familyN: 0, dsr: null, reproHash: null, decay: null, icir: null, minTRL: null, cleanGo: false, reason: "INSUFFICIENT — not enough recorded observations yet to run the deflation; a forward clock, not a bad verdict." } as unknown as Stamp.StampResult
  const stamp = Reality.renderStamp("aave-v3 USDC", "defillama:pool:x", insuff, null) // INSUFFICIENT passes WALL 1 through (already honest); a null identity → the honest "no recorded series" lineage line
  expect(stamp).toMatch(/class="pill INSUFFICIENT"/) // INSUFFICIENT is a designed pill, not an error
  expect(stamp).toContain("forward clock") // the honest framing renders (not "bad")
})
