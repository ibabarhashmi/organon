/**
 * ORGΛNON — THE SURFACE SPRINT, Phase 2 walls (SYSTEM-BUILT; X-SURFACE a,b). The single stylesheet is BUILT from the
 * pinned tokens deterministically, and NO runtime design dependency entered the mass path. NO screen is restyled here —
 * the foundation + the gate stand first.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const tokens = JSON.parse(read("data/honesty/design-tokens.json"))
const css = read("public/organon.css")

test("SYSTEM — public/organon.css is BUILT from the pinned tokens deterministically (a regen byte-matches the committed file — a token change would regenerate it)", () => {
  const r = Bun.spawnSync(["bun", "run", "script/build-stylesheet.ts", "--check"], { cwd: PKG_ROOT })
  expect(r.exitCode).toBe(0) // --check exits non-zero if the committed CSS ≠ a fresh regen (determinism / the lock)
})

test("SYSTEM — the stylesheet carries the TOKEN values (it is a function of the tokens, not a hand-authored parallel)", () => {
  expect(css).toContain(`--bg:${tokens.color.bg}`)
  expect(css).toContain(`--ink:${tokens.color.ink}`)
  expect(css).toContain(`--accent:${tokens.color.accent}`)
  expect(css).toContain(`--v-SOLID:${tokens.semantic.verdict.SOLID.color}`)
  expect(css).toContain(`--v-AVOID:${tokens.semantic.verdict.AVOID.color}`)
  // the h1 size from the type scale (a real hierarchy — not flat)
  expect(css).toContain(`font-size:${tokens.type.scale.h1.size}`)
})

test("SYSTEM — the non-color cues are IN the stylesheet (glyph ::before + border-style), keyed on the classes — the HTML content stays untouched (S36)", () => {
  // verdict + stamp glyphs render via ::before (a non-color cue), not via the HTML
  expect(css).toMatch(/\.pill\.SOLID::before\{content:"●/)
  expect(css).toMatch(/\.pill\.AVOID::before\{content:"▲/)
  expect(css).toMatch(/\.pill\.GO::before\{content:"▲/)
  expect(css).toMatch(/\.pill\.NOGO::before\{content:"▼/)
  // REAL/SAMPLE carry a border-style cue (solid vs dashed) — never color alone
  expect(css).toMatch(/\.badge\.REAL\{[^}]*border-style:solid/)
  expect(css).toMatch(/\.badge\.SAMPLE\{[^}]*border-style:dashed/)
  // BOUNDARY tier carries a dashed border (a non-color pattern cue); the ANALYSIS eyebrow is REASONING's cue
  expect(css).toMatch(/\.blk\.boundary\{[^}]*border-style:dashed/)
  expect(css).toMatch(/\.analysis-label\{/)
})

test("SYSTEM — NO side-tab accent border is generated (the #1 AI-slop tell the baseline had — X-SURFACE c), motion is ease-out (no bounce), reduced-motion present", () => {
  // no thick single-side accent border (side-tab) on cards/blocks; the trust tiers use full borders now
  expect(css).not.toMatch(/border-left:\s*3px/)
  expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/)
  expect(css).not.toMatch(/cubic-bezier\([^)]*1\.5|elastic|bounce/) // no bounce/elastic easing
  expect(css).toContain(tokens.motion.easing) // the pinned ease-out curve
})

test("SYSTEM (X-SURFACE b) — NO runtime design dependency entered the mass path: the deps stay EXACTLY hono+zod", () => {
  const pkg = JSON.parse(read("package.json"))
  expect(Object.keys(pkg.dependencies).sort()).toEqual(["hono", "zod"])
  // impeccable / a CSS framework must NOT be a runtime dependency (dev-time-only)
  const deps = JSON.stringify(pkg.dependencies)
  for (const forbidden of ["impeccable", "tailwind", "styled-components", "emotion", "@stitches", "bootstrap"]) expect(deps).not.toContain(forbidden)
})
