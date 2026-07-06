/**
 * ORGΛNON — the TRANSFORM DIFFERENTIAL (End-User Phase 1; Rules E-SANDBOX, D-DIFF, D-TWOWAY's spirit; V9 finding 1).
 * V9 proved the frozen ENGINE (the Python sidecar) byte-equivalent, but never ran the TS TRANSFORM the standalone
 * rewrote against its ORIGINAL — the monorepo had no installed deps. This closes it: a throwaway SANDBOX copy of the
 * monorepo (deps installed only there; the frozen tree takes zero writes/installs) runs the ORIGINAL `Runner.legSeries`
 * (yield branch) + `Runner.commonWindow` — the monorepo's EXACT bytes — on identical captured snapshots, and the output
 * is byte-diffed against the standalone `DataPlaneEngine` rewrite. The full monorepo Job (RWA legs, pegMark, benchmarks,
 * seed/nTrials feeding the FULL accrual.py) and the slim lending Job (feeding lending_accrual.py) are different SHAPES;
 * the honest, load-bearing comparison is THE PER-MARKET SERIES the accrual consumes (apyBase · tvl · turnover) + the
 * window — the exact thing V9's "byte-faithful to Runner.commonWindow" claim asserted-by-copy. Exactly one outcome.
 *
 * Fixtures pinned BEFORE the run (inputSha, recorded pre-transform — neither side can re-derive to force a MATCH). Raw
 * captured points pass to the sandbox via a GITIGNORED temp (A′#12 + the prevention wall: no raw data committed); only
 * the SLIM fixture (hashes + shapes + outcome + the sandbox disclosure) is committed. Run: bun run script/transform-differential.ts
 */
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { writeFileSync, mkdtempSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { DataPlane } from "../src/dataplane/store"
import { DataPlaneEngine } from "../src/dataplane/engine"

const SANDBOX = process.env.ORGANON_SANDBOX_ROOT ?? "/tmp/organon-sandbox-v10"
const D = path.join(PKG_ROOT, "data", "studio")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
function stable(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v)
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
  const k = Object.keys(v as Record<string, unknown>).sort()
  return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
}
// canonical sha of a per-market series {apyBase, tvl, turnover} — key-order-independent, so a differing key order
// (mono: apyBase/tvl/turnover; port: apyBase/turnover/tvl) is NOT a false mismatch; a differing VALUE is a real one.
const seriesSha = (s: { apyBase: unknown; tvl: unknown; turnover: unknown }) => sha256(stable({ apyBase: s.apyBase, tvl: s.tvl, turnover: s.turnover }))

if (!existsSync(path.join(SANDBOX, "transform-harness.ts"))) {
  console.error(`SANDBOX absent at ${SANDBOX} — build it first (see BUILDLOG-V10 §1: copy the monorepo package + util, bun install, shim storage/db, export legSeries/buildJob). BLOCKED, disclosed.`)
  process.exit(2)
}

// ── load the REAL captured lending series (gitignored payloads; the committed provenance chain proves them) ──
const chain = DataPlane.verifyProvenanceChain()
const lendingKeys = Object.keys(chain.keys).filter((k) => k.startsWith("lending:")).sort()
const seriesByKey = new Map<string, DataPlane.Series>()
for (const k of lendingKeys) {
  const s = DataPlane.snapshotAdapter.fetchSeries(k)
  if (s) seriesByKey.set(k, s)
}
if (seriesByKey.size < 3) {
  console.error(`only ${seriesByKey.size} lending series resolve (payloads gitignored on a fresh clone) — re-capture via bun run script/capture-dataplane.ts. BLOCKED, disclosed.`)
  process.exit(2)
}

// ── PIN the input BEFORE running either transform (E-SANDBOX): the raw points + the window ──
const window = DataPlaneEngine.commonWindow([...seriesByKey.values()])
const marketsInput = [...seriesByKey.entries()].map(([key, s]) => ({ key, points: s.points.map((p) => ({ ts: p.ts, apyBase: (p as any).apyBase ?? null, tvlUsd: (p as any).tvlUsd ?? null })) }))
const inputSha = sha256(stable({ window, markets: marketsInput }))

// ── run the PORT transform (standalone DataPlaneEngine.buildLendingJob → per-market series) ──
const spec: DataPlaneEngine.LendingSpec = { family: "lending-carry", policy: "static", rebalance: { trigger: "monthly" }, markets: [...seriesByKey.keys()].map((key) => ({ key, weight: 1 / seriesByKey.size })) }
const portJob = DataPlaneEngine.buildLendingJob(spec, window, seriesByKey)
const portByKey = new Map(portJob.markets.map((m) => [m.key, m.series]))

// ── run the MONO transform in the SANDBOX (Runner.legSeries + commonWindow, the monorepo's exact bytes) ──
const tmp = mkdtempSync(path.join(tmpdir(), "xform-diff-"))
const inFile = path.join(tmp, "in.json") // GITIGNORED (in tmpdir) — raw points never committed (prevention wall + A′#12)
const outFile = path.join(tmp, "out.json")
writeFileSync(inFile, JSON.stringify({ window, markets: marketsInput }))
execFileSync("bun", ["run", "transform-harness.ts", inFile, outFile], { cwd: SANDBOX, stdio: "inherit" })
const monoOut = JSON.parse(execFileSync("cat", [outFile], { encoding: "utf8" })) as { commonWindow: { start: number; end: number }; markets: { key: string; series: { apyBase: unknown; tvl: unknown; turnover: unknown } }[] }
const monoByKey = new Map(monoOut.markets.map((m) => [m.key, m.series]))

// ── the DIFFERENTIAL: byte-diff per market per field + the window. Direction-blind — byte-inequality is failure. ──
function diffMarket(key: string, port: any, mono: any) {
  const fields = ["apyBase", "tvl", "turnover"] as const
  const perField = fields.map((f) => ({ field: f, match: stable(port[f]) === stable(mono[f]), portSha: sha256(stable(port[f])).slice(0, 12), monoSha: sha256(stable(mono[f])).slice(0, 12) }))
  return { key, portSeriesSha: seriesSha(port), monoSeriesSha: seriesSha(mono), match: seriesSha(port) === seriesSha(mono), perField }
}
const perMarket = [...seriesByKey.keys()].map((k) => diffMarket(k, portByKey.get(k), monoByKey.get(k)))
const windowMatch = window.start === monoOut.commonWindow.start && window.end === monoOut.commonWindow.end
const allMatch = windowMatch && perMarket.every((m) => m.match)

// ── SEEDED DIVERGENCE (red-team, direction-blind): a mis-floored turnover in the port MUST be caught at the byte level ──
const seededKey = [...seriesByKey.keys()][0]
const seededPort = { ...portByKey.get(seededKey)! }
// drop the MIN_TURNOVER_FRACTION/1 floor on the seeded market (a "flattering" lower-turnover-lower-cost transform)
seededPort.turnover = (seededPort.turnover as [number, number][]).map(([ts, v]) => [ts, v * 0.5])
const seededCaught = seriesSha(seededPort) !== seriesSha(monoByKey.get(seededKey)!) // direction-blind: byte-inequality IS the catch

const outcome = allMatch ? "MATCH" : "MISMATCH"
const fixture = {
  protocol: "transform-differential-v10",
  at: "2026-07-05",
  rule: "E-SANDBOX, D-DIFF — the ORIGINAL monorepo transform vs the standalone rewrite on identical pinned snapshots; exactly one derived outcome",
  sandbox: {
    root: SANDBOX,
    disclosure: "a throwaway copy of the monorepo package + @solidity-sentinel/util; deps installed IN THE COPY only (bun install); storage/db.ts SHIMMED (an unreached seam — the transform never touches the DB, Series is injected); `export` added to legSeries/buildJob (visibility only — the FUNCTION BODIES are the monorepo's exact bytes, unedited). The frozen tree took zero writes and zero installs.",
    transformRun: "Runner.legSeries (yield branch) + Runner.commonWindow — the monorepo's exact bytes",
    scope: "the load-bearing PER-MARKET SERIES the accrual consumes (apyBase · tvl · turnover) + the common window; the full monorepo Job's RWA scaffolding (pegMark, benchmarks, redemption/issuer/assetClass metadata, seed/nTrials) is out-of-scope-by-construction (the slim lending sidecar does not consume it) — named, not hidden",
  },
  inputPin: { inputSha, markets: lendingKeys.length, note: "pinned BEFORE either transform ran; the raw points are gitignored (passed via a tmpdir file), never committed (prevention wall + A′#12)" },
  window: { port: window, mono: monoOut.commonWindow, match: windowMatch },
  perMarket,
  outcome,
  seededDivergence: { market: seededKey, transform: "turnover × 0.5 (dropped the MIN_TURNOVER_FRACTION/1 floor — a flattering lower-cost port)", caught: seededCaught, directionBlind: true },
  allMatch,
}
writeFileSync(path.join(D, "transform-differential-v10.json"), JSON.stringify(fixture, null, 2) + "\n")

console.log(`\nTRANSFORM DIFFERENTIAL → ${outcome}`)
console.log(`  window: port ${JSON.stringify(window)} ${windowMatch ? "==" : "!="} mono ${JSON.stringify(monoOut.commonWindow)}`)
for (const m of perMarket) console.log(`  ${m.key}: ${m.match ? "MATCH" : "MISMATCH"} (port ${m.portSeriesSha.slice(0, 10)}… ${m.match ? "==" : "!="} mono ${m.monoSeriesSha.slice(0, 10)}…)${m.match ? "" : " · fields: " + m.perField.filter((f) => !f.match).map((f) => f.field).join(",")}`)
console.log(`  seeded divergence caught (direction-blind): ${seededCaught}`)
console.log(`  input pin: ${inputSha.slice(0, 16)}… (pre-run)`)
console.log(`written: data/studio/transform-differential-v10.json`)
