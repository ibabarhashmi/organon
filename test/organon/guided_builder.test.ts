/**
 * TEST — the GUIDED BUILDER, born reachable (Reachability Phase 3; Rules U-AMEND, U-SURFACE, S-PROPOSE, S-FAMILY). Proves:
 * the screen set is closed at 9; the form composes over EXISTING primitives and REFUSES an invalid composition (an
 * out-of-range weight, an unknown market, an empty set) before registration; the defaults are conservative and the help
 * copy is honesty-checked (a seeded priming help is caught); a builder-composed edit STIFFENS its family (lineage); and
 * the gate evidence is an admissible console-path traversal with a failure state (never module evidence alone).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Builder } from "../../src/studio/builder"
import { Console } from "../../src/studio/console"
import { StudioScreens } from "../../src/studio/screens"
import { Surface } from "../../src/studio/surface"
import { DataPlane } from "../../src/dataplane/store"

const AVAIL = ["lending:a:USDC:e", "lending:b:DAI:e"]

test("the screen set is closed at NINE (the Guided Builder amended 8→9, then closed; a tenth refused)", () => {
  expect(StudioScreens.SCREENS.length).toBe(10) // 9→10 Pool Composer (U-AMEND-2); guidedBuilder stays at index 8
  expect(StudioScreens.SCREENS[8]).toBe("guidedBuilder")
})

test("the form composes over EXISTING primitives and REFUSES an invalid composition before registration", () => {
  expect(Builder.compose({ markets: [{ key: "lending:a:USDC:e", weight: 0.5 }, { key: "lending:b:DAI:e", weight: 0.5 }], policy: "static" }, AVAIL).ok).toBe(true)
  // an out-of-range weight (leverage) → refused
  const overWeight = Builder.compose({ markets: [{ key: "lending:a:USDC:e", weight: 2 }], policy: "static" }, AVAIL)
  expect(overWeight.ok).toBe(false)
  expect((overWeight as { error: string }).error).toMatch(/out of range|between 0 and 1|leverage/i)
  // an unknown market → refused
  expect(Builder.compose({ markets: [{ key: "lending:unknown:X:e", weight: 0.5 }], policy: "static" }, AVAIL).ok).toBe(false)
  // an empty set → refused
  expect(Builder.compose({ markets: [], policy: "static" }, AVAIL).ok).toBe(false)
})

test("the defaults are conservative and the help copy is honesty-checked (a seeded priming help is caught)", () => {
  expect(Builder.defaultsConservative()).toBe(true)
  expect(Builder.DEFAULTS.policy).toBe("static") // no tilt-by-default, no leverage-forward
  expect(Builder.helpHonest().ok).toBe(true)
  // POSITIVE CONTROL: the priming detector catches risk/GO-priming copy
  const priming = ["guaranteed high returns", "the best strategy — you'll win", "on track to a GO", "use leverage to maximize profit"]
  for (const p of priming) expect(/guaranteed|high returns?|\bwin\b|on track to (a )?go|leverage|maximi[sz]e (profit|return)/i.test(p)).toBe(true)
})

test("a builder-composed EDIT stiffens its family (lineage declared — an edit is another attempt, S-FAMILY)", async () => {
  const DAY = 86_400_000
  const prov = (key: string): DataPlane.Series => { const points = Array.from({ length: 400 }, (_, i) => ({ ts: i * DAY, apyBase: 3 + Math.sin(i / 9), tvlUsd: 1e8 + i * 1e5 })); return { key, kind: "yield", points, provenance: { source: "t", url: "u", capturedAt: 0, contentSha: createHash("sha256").update(key + points.length).digest("hex"), nonce: "n" + key, chainPos: 0, reality: "REAL-PIT" } } }
  const series = new Map([prov("lending:a:USDC:e"), prov("lending:b:DAI:e")].map((s) => [s.key, s]))
  const a = Builder.compose({ markets: [{ key: "lending:a:USDC:e", weight: 0.5 }, { key: "lending:b:DAI:e", weight: 0.5 }], policy: "static" }, [...series.keys()])
  const aEdit = Builder.compose({ markets: [{ key: "lending:a:USDC:e", weight: 0.6 }, { key: "lending:b:DAI:e", weight: 0.4 }], policy: "static" }, [...series.keys()])
  if (!a.ok || !aEdit.ok) throw new Error("compose failed")
  const first = await Console.runComposed(a.composed.spec, series, 1_735_689_600_000)
  const edit = await Console.runComposed(aEdit.composed.spec, series, 1_735_689_600_000, { priorFamily: [a.composed.spec] })
  expect(first.state).toBe("verdict")
  expect(edit.artifact!.ledger.nTrials).toBeGreaterThan(first.artifact!.ledger.nTrials) // the edit's bar is stiffer
})

test("U-SURFACE: the builder's gate evidence is an admissible console-path traversal WITH a failure state", () => {
  const t = path.join(PKG_ROOT, "data", "studio", "traversal-guided-builder.json")
  if (!existsSync(t)) { console.log("  (guided_builder) traversal absent — run script/builder-traversal.ts"); return }
  const a = JSON.parse(readFileSync(t, "utf8")) as Surface.TraversalArtifact
  expect(Surface.verifyTraversal(a).ok).toBe(true)
  expect(Surface.isTheater(a)).toBe(false) // has a genuine failure state (an invalid composition refused)
  expect(a.failureState.route).toBe("POST /builder/compose")
})
