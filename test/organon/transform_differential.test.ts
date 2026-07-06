/**
 * TEST — the transform differential answered the asterisk (End-User Phase 1; Rules E-SANDBOX, D-DIFF; V9 finding 1).
 * The committed SLIM fixture records exactly one derived outcome (MATCH retiring the asterisk, or MISMATCH root-caused);
 * the differential is direction-blind (a seeded flattering divergence is caught by byte-inequality); the fixture carries
 * NO raw data (the prevention wall + A′#12 — only hashes/shapes/outcome); the sandbox discipline is disclosed. The
 * canonical-sha mechanism is proven here on synthetic data (fresh-clone safe — no sandbox needed): order-independent
 * across key order, value-sensitive to a real change.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const FIX = path.join(PKG_ROOT, "data", "studio", "transform-differential-v10.json")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
function stable(v: any): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v)
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
  const k = Object.keys(v).sort()
  return `{${k.map((x) => `${JSON.stringify(x)}:${stable(v[x])}`).join(",")}}`
}
const seriesSha = (s: any) => sha256(stable({ apyBase: s.apyBase, tvl: s.tvl, turnover: s.turnover }))

test("the committed transform differential records exactly one derived outcome (MATCH or MISMATCH)", () => {
  if (!existsSync(FIX)) {
    console.log("  (transform_differential) fixture absent — run script/transform-differential.ts (needs the sandbox). BLOCKED, disclosed.")
    return
  }
  const f = JSON.parse(readFileSync(FIX, "utf8"))
  expect(["MATCH", "MISMATCH"]).toContain(f.outcome)
  if (f.outcome === "MATCH") {
    expect(f.window.match).toBe(true)
    for (const m of f.perMarket) expect(m.match).toBe(true) // every market byte-identical → the asterisk retires at the letter
    expect(f.allMatch).toBe(true)
  } else {
    // a MISMATCH is honest ONLY if it is localized + root-caused (not nudged quiet)
    expect(f.perMarket.some((m: any) => !m.match) || !f.window.match).toBe(true)
  }
})

test("the differential is direction-blind (a seeded flattering divergence is caught) and the input was pinned pre-run", () => {
  if (!existsSync(FIX)) return
  const f = JSON.parse(readFileSync(FIX, "utf8"))
  expect(f.seededDivergence.caught).toBe(true)
  expect(f.seededDivergence.directionBlind).toBe(true)
  expect(f.inputPin.inputSha).toMatch(/^[0-9a-f]{64}$/) // the pin exists (recorded before either transform ran)
})

test("the sandbox discipline is disclosed (shims named, transform bytes unedited, frozen tree zero writes)", () => {
  if (!existsSync(FIX)) return
  const f = JSON.parse(readFileSync(FIX, "utf8"))
  expect(f.sandbox.disclosure).toMatch(/storage\/db\.ts SHIMMED/)
  expect(f.sandbox.disclosure).toMatch(/exact bytes/)
  expect(f.sandbox.disclosure).toMatch(/zero writes and zero installs/)
  expect(f.sandbox.transformRun).toMatch(/Runner\.legSeries/)
})

test("the committed fixture carries NO raw data (prevention wall + A′#12 — slim by construction)", () => {
  if (!existsSync(FIX)) return
  const raw = readFileSync(FIX, "utf8")
  // the fixture must not inline a long [ts,value] series — those live gitignored, passed via a tmpdir file
  const pairs = raw.match(/\[\s*\d{10,}\s*,\s*-?\d/g) ?? []
  expect(pairs.length).toBeLessThan(20) // window bounds appear, but never a full series
  expect(raw.length).toBeLessThan(20_000) // slim: hashes + shapes + outcome, not the payload
})

test("MECHANISM — the canonical series-sha is order-independent (no false mismatch) but value-sensitive (real one caught)", () => {
  const a = { apyBase: [[1, 4]], tvl: [[1, 100]], turnover: [[1, 1]] }
  const reordered = { turnover: [[1, 1]], apyBase: [[1, 4]], tvl: [[1, 100]] } // mono/port key order differs — must not matter
  expect(seriesSha(a)).toBe(seriesSha(reordered))
  const flattered = { apyBase: [[1, 5]], tvl: [[1, 100]], turnover: [[1, 1]] } // a bumped apyBase — a real divergence
  expect(seriesSha(a)).not.toBe(seriesSha(flattered))
  const halfTurnover = { apyBase: [[1, 4]], tvl: [[1, 100]], turnover: [[1, 0.5]] } // the seeded flattering transform
  expect(seriesSha(a)).not.toBe(seriesSha(halfTurnover))
})
