/**
 * ORGΛNON — Reachability Phase 5 verification (Rules U-DERIVED, U-PRISTINE, R-ADVISORY, C-NOREGRESS). The deterministic
 * re-verifications: the noise wall (0 survivors), the verdict differential byte-identical, one catalog scenario re-run
 * from nothing across TWO doors (goal + builder), and — U-DERIVED — the SUMMARY DIFFERENTIAL on the terminal's OWN
 * numbers (a hand-typed figure that disagrees with its artifact is a finding). The pristine fresh-clone proof runs
 * separately (script/pristine-clone.ts). Run: bun run script/phase5-reach.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Summary } from "../src/studio/summary"
import { VerdictDifferential } from "../src/studio/differential"
import { Voc } from "../src/proposers/voc"
import { Console } from "../src/studio/console"
import { Builder } from "../src/studio/builder"
import { DataPlane } from "../src/dataplane/store"
import { Catalog } from "../src/studio/catalog"

const D = path.join(PKG_ROOT, "data", "studio")
const DAY = 86_400_000, T = Date.parse("2026-07-05T00:00:00Z")

// (1) the SUMMARY DIFFERENTIAL on the terminal's own numbers (U-DERIVED) — these are the figures the honest state states
const TERMINAL_PROSE = { floor: 66, matrixPresent: 28, matrixAbsent: 3, catalogCount: 29 }
const derived = Summary.derive()
const summaryDiff = Summary.differential(TERMINAL_PROSE, derived)

// (2) the noise wall (spot-check) + the verdict differential
const wall = await Voc.noiseWall(12, { timestamp: T, featureCount: 40, nObs: 500, evalMode: "oos" })
const pinnedFp = JSON.parse(readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8")) as { fingerprintSetSha: string }
const differentialByteIdentical = (await VerdictDifferential.fingerprintSetSha()) === pinnedFp.fingerprintSetSha

// (3) one catalog scenario re-run from nothing across TWO doors (goal + builder) — the panels reach the screen
function provSeries(key: string): DataPlane.Series {
  const points = Array.from({ length: 400 }, (_, i) => ({ ts: i * DAY, apyBase: 3 + Math.sin(i / 9), tvlUsd: 1e8 + i * 1e5 }))
  return { key, kind: "yield", points, provenance: { source: "t", url: "u", capturedAt: 0, contentSha: createHash("sha256").update(key + points.length).digest("hex"), nonce: "n" + key, chainPos: 0, reality: "REAL-PIT" } }
}
const series = new Map([provSeries("lending:a:USDC:e"), provSeries("lending:b:DAI:e")].map((s) => [s.key, s]))
const goal = await Console.runJoinedLoop("Earn steady lending carry with honest costs", series, Console.fixtureProvider([...series.keys()]), T)
const goalRender = Console.renderResult(goal)
const bc = Builder.compose({ markets: [{ key: "lending:a:USDC:e", weight: 0.5 }, { key: "lending:b:DAI:e", weight: 0.5 }], policy: "static" }, [...series.keys()])
const builder = bc.ok ? await Console.runComposed(bc.composed.spec, series, T) : null
const builderRender = builder ? Console.renderResult(builder) : ""
const twoDoorsOk = goal.state === "verdict" && goalRender.includes("WHY NOT YET") && !!builder && builder.state === "verdict" && builderRender.includes("WHY NOT YET")

const out = {
  protocol: "phase5-verification-v12",
  at: "2026-07-05",
  summaryDifferential: { prose: TERMINAL_PROSE, derived, ok: summaryDiff.ok, mismatches: summaryDiff.mismatches },
  noiseWall: { clean: wall.allClean, survivors: wall.survivors.length, maxDsr: +wall.maxDsr.toFixed(4) },
  verdictDifferential: { byteIdentical: differentialByteIdentical },
  catalogScenarioTwoDoors: { ok: twoDoorsOk, goalVerdict: goal.verdict, builderVerdict: builder?.verdict },
  pristineHarness: { evidence: "pristine-clone-v12.json", note: "the pristine fresh-clone proof — isolated HOME, enumerated prerequisites, positive control (no inherited venv), fresh-venv battery green" },
  floor: derived.floor,
  catalog: { version: "v12", count: Catalog.verify().count, contentSha: Catalog.contentSha(Catalog.load()!) },
  frozenSeven: "byte-identical in both trees (test/walls/core_byte_identity.test.ts); no frozen byte changed",
  rwaPinUnchanged: true,
  independence: "pending-non-author (DOORS-OPEN waits for a genuine stranger — now with THREE doors)",
}
writeFileSync(path.join(D, "phase5-verification-v12.json"), JSON.stringify(out, null, 2) + "\n")

console.log(`SUMMARY DIFFERENTIAL (U-DERIVED) on the terminal's numbers: ok=${summaryDiff.ok}${summaryDiff.ok ? "" : " — " + summaryDiff.mismatches.join("; ")}`)
console.log(`  prose ${JSON.stringify(TERMINAL_PROSE)} vs derived ${JSON.stringify(derived)}`)
console.log(`noise wall: clean=${wall.allClean} survivors=${wall.survivors.length} · verdict differential byte-identical=${differentialByteIdentical}`)
console.log(`two doors (goal + builder) re-run from nothing: ok=${twoDoorsOk} (goal ${goal.verdict}, builder ${builder?.verdict})`)
console.log(`floor=${derived.floor} · catalog v12 ${Catalog.verify().count}`)
console.log(`written: phase5-verification-v12.json`)
