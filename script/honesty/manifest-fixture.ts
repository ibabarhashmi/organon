/**
 * ORGΛNON — THE MANIFEST SPRINT. The committed FIXTURE strategy manifest + its committed TRIAL LINEAGE — deterministic,
 * clone-robust artifacts the walls (and the /check manifest path) read on a pristine clone. The manifest references
 * SAMPLE pool ids (resolvable OFFLINE via the scorecard's SAMPLE x-ray), so `/check/manifest:<id>` renders a complete
 * Composed Reality Check with NO network. The trial lineage (3 hash-chained trials, FIXED timestamps) proves the ledger
 * re-verifies on a clone (S72) and backs the drawer's readout. Idempotent (the trial file is rewritten, never accumulated).
 * Run: bun run script/honesty/manifest-fixture.ts
 */
import { existsSync, rmSync } from "node:fs"
import path from "node:path"
import { Manifest } from "../../src/strategy/manifest"
import { StrategyStore } from "../../src/strategy/store"
import { StrategyResolve } from "../../src/strategy/resolve"
import { StrategyTrial } from "../../src/strategy/trial"

const raw = {
  schemaVersion: 1,
  positions: [
    { subjectKey: "defillama:pool:SAMPLE-aave-usdc", size: 10000, units: "USDC" },
    { subjectKey: "defillama:pool:SAMPLE-dai-lending", size: 5000, units: "DAI", assumptions: "held through the next rate decision" },
  ],
  thesis: "Blue-chip stablecoin lending across two venues holds its base yield through the next rate cut; I exit if either loses its $1 peg. I am testing whether these two 'safe, different' stables are actually one bet.",
  exitCriterion: { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" },
  journal: { priorIntent: "I was about to chase a higher-APY farm; I want to check whether the safe pair is actually diversified before I move." },
}

const parsed = Manifest.parse(raw)
if (!parsed.ok) {
  console.error("FIXTURE INVALID —", parsed.error)
  process.exit(1)
}
const id = StrategyStore.save(parsed.manifest, StrategyStore.FIXTURE_DIR)

// the committed trial lineage — compile the fixture (offline; SAMPLE x-ray) and append 3 hash-chained trials with FIXED
// timestamps (a user compiling the same manifest three times). RECORDED, NEVER COUNTED (each trial carries counted: false).
const { composed } = await StrategyResolve.resolveAndCompile(parsed.manifest, Date.parse("2026-07-01T00:00:00Z"))
const config = StrategyStore.manifestHash(parsed.manifest)
const trialFile = path.join(StrategyTrial.FIXTURE_TRIAL_DIR, `${config}.jsonl`)
if (existsSync(trialFile)) rmSync(trialFile) // idempotent — rewrite the fixture lineage, never accumulate
const metric = { effectiveK: composed.effectiveBets?.effectiveK ?? null, worstAxisTier: composed.worstAxis?.tier ?? null, exitFired: composed.exit?.fired ?? null, reachable: composed.catchAggregation.totalReachable }
for (let i = 0; i < 3; i++) StrategyTrial.append(config, composed.lines, metric, Date.parse("2026-07-01T00:00:00Z") + i * 86400000, StrategyTrial.FIXTURE_TRIAL_DIR)
const chk = StrategyTrial.verify(config, StrategyTrial.FIXTURE_TRIAL_DIR)

console.log("── MANIFEST — the committed fixture strategy + trial lineage written ──")
console.log(`  positions   : ${parsed.manifest.positions.map((p) => `${p.subjectKey} (${p.size} ${p.units})`).join(" · ")}`)
console.log(`  exit        : ${parsed.manifest.exitCriterion.kind} ${parsed.manifest.exitCriterion.threshold} (${parsed.manifest.exitCriterion.subjectScope})`)
console.log(`  lineage id  : ${id}`)
console.log(`  trials      : ${chk.count} hash-chained (verify: ${chk.ok ? "OK" : "FAIL — " + chk.reason})`)
console.log(`  readout     : ${StrategyTrial.readout(config, StrategyTrial.FIXTURE_TRIAL_DIR)}`)
console.log(`  path        : /check/manifest:${id}`)
console.log(`  written     : data/strategies/fixtures/${id}.json + fixtures/trials/${config}.jsonl`)
