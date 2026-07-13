/**
 * ORGΛNON — THE CADENCE SPRINT, Phase 5 (INERT-AT-COUNT; S75). A committed fixture lineage grown to ≥ 20 trials — DELIBERATELY
 * AT the ≥ 20–50-trials-per-family trigger's LOWER BOUND. This sprint's cadence makes trials accumulate far faster than manual
 * compiles ever did, so the inert wall is re-proven WHERE IT NOW MATTERS: a 20-trial lineage STILL shows `familyN === 1` in
 * every Stamp output and the K-door STILL refuses without BOTH the trigger AND D33. A DISTINCT lineage from the Manifest
 * sprint's 3-trial fixture (which the V31 walls read verbatim) — additive, so no V31 assertion moves. Idempotent (rewritten).
 * Run: bun run script/honesty/cadence-fixture.ts
 */
import { existsSync, rmSync } from "node:fs"
import path from "node:path"
import { Manifest } from "../../src/strategy/manifest"
import { StrategyStore } from "../../src/strategy/store"
import { StrategyResolve } from "../../src/strategy/resolve"
import { StrategyTrial } from "../../src/strategy/trial"

export const CADENCE_TRIAL_COUNT = 23 // ≥ 20, at the trigger's lower bound (the near-the-line count the wall exists for)

const raw = {
  schemaVersion: 1,
  positions: [
    { subjectKey: "defillama:pool:SAMPLE-aave-usdc", size: 25000, units: "USDC" },
    { subjectKey: "defillama:pool:SAMPLE-dai-lending", size: 25000, units: "DAI", assumptions: "monitored on the capture cadence" },
  ],
  // a DISTINCT thesis → a distinct identity hash → a distinct lineage (the V31 3-trial fixture is untouched).
  thesis: "A monitored blue-chip stablecoin pair, re-judged each capture cycle against a fixed registration baseline. I am testing whether the cadence itself changes what I do — and whether twenty-plus recorded cycles are still ONE bet, never counted.",
  exitCriterion: { kind: "peg-floor", threshold: 0.99, subjectScope: "portfolio" },
  journal: { priorIntent: "I want the trial count to grow past twenty and confirm the deflation stays inert at count." },
}

const parsed = Manifest.parse(raw)
if (!parsed.ok) {
  console.error("CADENCE FIXTURE INVALID —", parsed.error)
  process.exit(1)
}
const id = StrategyStore.save(parsed.manifest, StrategyStore.FIXTURE_DIR)
const config = StrategyStore.manifestHash(parsed.manifest)

// NOTE — the baseline is DELIBERATELY NOT committed as a fixture. A committed baseline would set registeredAtMs on this
// lineage's /check render, making the thesis-age gate wall-clock-dependent (UNJUDGEABLE-YET flips after 30 real days) — a
// time bomb. The baseline surface (governance classes included — MR3) is proven by test/organon/baseline.test.ts; the
// monitoring block render is proven by a constructed MonitoringView. This fixture is the ≥20-trial lineage for S75 ONLY.
const T0 = Date.parse("2026-07-13T00:00:00Z")
const { composed } = await StrategyResolve.resolveAndCompile(parsed.manifest, T0)

// the committed ≥20-trial lineage (fixed timestamps, hash-chained; RECORDED, NEVER COUNTED — each carries counted:false).
const trialFile = path.join(StrategyTrial.FIXTURE_TRIAL_DIR, `${config}.jsonl`)
if (existsSync(trialFile)) rmSync(trialFile) // idempotent
const metric = { effectiveK: composed.effectiveBets?.effectiveK ?? null, worstAxisTier: composed.worstAxis?.tier ?? null, exitFired: composed.exit?.judgeable ? composed.exit.fired : null, reachable: composed.catchAggregation.totalReachable }
for (let i = 0; i < CADENCE_TRIAL_COUNT; i++) StrategyTrial.append(config, composed.lines, metric, T0 + i * 86_400_000, StrategyTrial.FIXTURE_TRIAL_DIR)
const chk = StrategyTrial.verify(config, StrategyTrial.FIXTURE_TRIAL_DIR)

console.log("── CADENCE — the committed ≥20-trial lineage (inert AT COUNT; S75) ──")
console.log(`  lineage id  : ${id}`)
console.log(`  trials      : ${chk.count} hash-chained (verify: ${chk.ok ? "OK" : "FAIL — " + chk.reason}) — AT the ≥20 lower bound`)
console.log(`  readout     : ${StrategyTrial.readout(config, StrategyTrial.FIXTURE_TRIAL_DIR)}`)
console.log(`  path        : /check/manifest:${id}`)
console.log(`  written     : fixtures/${id}.json · fixtures/trials/${config}.jsonl (baseline NOT committed — a thesis-age time bomb; proven in baseline.test.ts)`)
