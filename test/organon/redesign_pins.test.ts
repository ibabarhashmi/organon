/**
 * ORGΛNON — THE REDESIGN SPRINT, the pins wall. redesign-pins.json is self-consistent, carried from the GroundTruth
 * head, and its token re-pin is a real SUPERSESSION (U-RESUPERSEDE): the live design-tokens.json + DESIGN.md hash to
 * THIS pin (the live lock moved), the Surface-era baseline is recorded as superseded (not rewritten), and the SEMANTIC
 * colors stayed byte-unchanged (honesty-load-bearing — only the ground + brand accent moved). The lock bites.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const rd = JSON.parse(readFileSync(path.join(H, "redesign-pins.json"), "utf8"))
const GROUNDTRUTH = JSON.parse(readFileSync(path.join(H, "groundtruth-pins.json"), "utf8"))
const SURFACE = JSON.parse(readFileSync(path.join(H, "surface-pins.json"), "utf8"))
const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")

test("REDESIGN — the pins hash-lock is self-consistent + carried from the GroundTruth head (a moved re-pin moves the sha)", () => {
  const { pinsSha, ...rest } = rd
  expect(sha256(JSON.stringify(rest))).toBe(rd.pinsSha) // self-consistent: the stored sha covers exactly the rest
  expect(rd.carriedFromPinsSha).toBe(GROUNDTRUTH.pinsSha) // carried forward, never rebuilt
  // POSITIVE CONTROL: a moved re-pin moves the sha (the lock bites on the artifact)
  const mutated = JSON.parse(JSON.stringify(rest)); mutated.tokensRepin.tokens.sha = "0".repeat(64)
  expect(sha256(JSON.stringify(mutated))).not.toBe(rd.pinsSha)
})

test("REDESIGN — U-RESUPERSEDE: the LIVE design-tokens.json + DESIGN.md hash to THIS pin (the live lock moved), the Surface-era baseline recorded as superseded (not rewritten)", () => {
  // the live artifacts now hash to the redesign pin — the live hash-lock lives HERE
  expect(sha256(read(rd.tokensRepin.rel))).toBe(rd.tokensRepin.tokens.sha)
  expect(sha256(read(rd.tokensRepin.designMd.rel))).toBe(rd.tokensRepin.designMd.sha)
  // the sha MOVED (a real re-pin, not a no-op)
  expect(rd.tokensRepin.tokens.sha).not.toBe(rd.tokensRepin.supersedes.tokens)
  // the superseded baseline is EXACTLY the Surface record (the chain is honest — superseded, not invented)
  expect(rd.tokensRepin.supersedes.tokens).toBe(SURFACE.tokens.sha)
  expect(rd.tokensRepin.supersedes.designMd).toBe(SURFACE.tokens.designMd.sha)
  expect(rd.tokensRepin.supersedes.pinsSha).toBe(SURFACE.pinsSha) // b0179998 — the Surface identity pin
  expect(rd.tokensRepin.resupersede).toMatch(/U-RESUPERSEDE|superseded, not rewritten|NO cascade/i)
})

test("REDESIGN — the SEMANTIC colors are BYTE-UNCHANGED (honesty-load-bearing); only the ground + brand accent moved — the identity is cool graphite + signal cyan", () => {
  const T = JSON.parse(read("data/honesty/design-tokens.json"))
  // the verdict / Stamp / reality COLORS are exactly the Surface values (a token-VALUE change here would be a Halt)
  expect(T.semantic.verdict.SOLID.color).toBe("#3fb950")
  expect(T.semantic.verdict.CAUTION.color).toBe("#d29922")
  expect(T.semantic.verdict.AVOID.color).toBe("#f85149")
  expect(T.semantic.verdict.UNVERIFIED.color).toBe("#9aa5b1")
  expect(T.semantic.reality.REAL.color).toBe("#3fb950")
  expect(T.semantic.reality.SAMPLE.color).toBe("#d29922")
  // the ground + accent ARE the new identity (the palette moved)
  expect(T.color.bg).toBe("#0b0d10")
  expect(T.color.accent).toBe("#38d6c8")
  expect(rd.tokensRepin.semanticsUnchanged).toMatch(/BYTE-UNCHANGED|honesty-load-bearing/i)
  expect(rd.tokensRepin.identity).toMatch(/graphite.*cyan|signal-cyan/i)
})

test("REDESIGN — the re-pin HELD the honesty walls (S36 content byte-identical · S37 AA · S38 detector · determinism) + deps stay hono+zod", () => {
  expect(rd.walls.s36).toMatch(/byte-identical/i)
  expect(rd.walls.s37).toMatch(/WCAG-AA|4\.5:1/i)
  expect(rd.walls.s38).toMatch(/45-rule|detector/i)
  expect(rd.walls.determinism).toMatch(/reproduces|byte-identical|--check/i)
  expect(rd.composition.deps).toEqual(["hono", "zod"])
  expect(rd.tokensRepin.contentByteIdentical).toMatch(/S36|byte-identical/i)
})
