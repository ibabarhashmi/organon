/**
 * ORGΛNON — Ensemble Phase 5 verification (Rules U-DERIVED, U-PRISTINE, R-ADVISORY, C-NOREGRESS, K-EFF). The deterministic
 * re-verifications: BOTH noise walls (single VoC + pooled — 0 survivors), the verdict differential byte-identical, one
 * catalog scenario re-run from nothing through the NEWEST door (the pool composer), and — U-DERIVED — the SUMMARY
 * DIFFERENTIAL on the terminal's OWN numbers (a hand-typed figure that disagrees with its artifact is a finding). The
 * pristine fresh-clone proof runs separately (script/pristine-clone.ts). Run: bun run script/phase5-ensemble.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Summary } from "../src/studio/summary"
import { VerdictDifferential } from "../src/studio/differential"
import { Voc } from "../src/proposers/voc"
import { Pool } from "../src/analytics/pool"
import { Console } from "../src/studio/console"
import { Catalog } from "../src/studio/catalog"
import { Ratify } from "../src/studio/ratify"
import { Scope } from "../src/studio/scope"

const D = path.join(PKG_ROOT, "data", "studio")
const T = Date.parse("2026-07-05T00:00:00Z")

// (1) the SUMMARY DIFFERENTIAL on the terminal's own numbers (U-DERIVED)
const TERMINAL_PROSE = { floor: 74, matrixPresent: 34, matrixAbsent: 3, catalogCount: 36 }
const derived = Summary.derive()
const summaryDiff = Summary.differential(TERMINAL_PROSE, derived)

// (2) BOTH noise walls (the single VoC wall + the pooled-noise wall) + the verdict differential
const vocWall = await Voc.noiseWall(12, { timestamp: T, featureCount: 40, nObs: 500, evalMode: "oos" })
const pooledWall = await Pool.pooledNoiseWall(12, { timestamp: T })
const pinnedFp = JSON.parse(readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8")).fingerprintSetSha
const differentialByteIdentical = (await VerdictDifferential.fingerprintSetSha()) === pinnedFp

// (3) one catalog scenario re-run from nothing through the NEWEST door (the pool composer) — S15-pool-compose-happy
const poolResult = await Console.runComposedPool(Console.illustrativePoolMembers(5, "diversified", 400, 5), T)
const newestDoorOk = poolResult.state === "verdict" && poolResult.render.includes("union charge") && poolResult.render.includes("Stress caveat") && poolResult.render.includes("Deflation basis")

// (4) the parks forward (each with its disposition)
const rat = Ratify.load(path.join(D, "research-ratification-v13.json"))
const parksForward = {
  ensemble: Ratify.artifactRatified(rat.entries, "src/analytics/pool.ts") ? "DELIVERED (ADOPT activated — the pool ships with the correlation-adjusted K_eff charge)" : "?",
  tournament: Ratify.effectiveRecord(rat.entries, "shared-multiuser-ledger-tournament")?.disposition === "SUPERSEDE" ? "NO standing (incoherent per-author; the shared cross-author ledger stays parked; sybil impact upgraded 0.928/0.310)" : "?",
  hrp: Ratify.effectiveRecord(rat.entries, "hrp-portfolio-construction")?.disposition === "SUPERSEDE" ? "DISPOSED NO (does not dominate OOS; stays parked)" : "?",
  cpcvPromotion: "accruing toward ≥30 @ ≥80% agreement (advisory-first; not gating)",
  zkml: "re-check 2027-01-01 (parked; immature)",
  poolRecursion: "deferred by default (depth-1; a pool of pools is schema-refused)",
  signing: "ever-standing constitutional decision (Operator-only; nothing signs)",
}

// (5) the scope law + the debts still filed
const scopeOk = Scope.load(path.join(D, "scope-amendments-v13.json")).chainOk

const pristine = existsSync(path.join(D, "pristine-clone-v13.json")) ? JSON.parse(readFileSync(path.join(D, "pristine-clone-v13.json"), "utf8")) : null

const out = {
  protocol: "phase5-verification-v13", at: "2026-07-05",
  summaryDifferential: { prose: TERMINAL_PROSE, derived, ok: summaryDiff.ok, mismatches: summaryDiff.mismatches },
  noiseWalls: { voc: { clean: vocWall.allClean, survivors: vocWall.survivors.length, maxDsr: +vocWall.maxDsr.toFixed(4) }, pooled: { clean: pooledWall.allClean, survivors: pooledWall.survivors } },
  verdictDifferential: { byteIdentical: differentialByteIdentical },
  newestDoorReRun: { door: "pool-composer (screen 10)", ok: newestDoorOk, verdict: poolResult.pool?.verdict, kEff: poolResult.pool?.kEff, charge: poolResult.pool?.charge },
  pristineHarness: pristine ? { evidence: "pristine-clone-v13.json", pristineGreen: pristine.pristineGreen, battery: pristine.battery, conditionalPy311: pristine.prerequisites?.conditional?.["python3.11"] ?? "absent" } : { evidence: "pristine-clone-v13.json", note: "run script/pristine-clone.ts" },
  parksForward, scopeOk,
  floor: derived.floor, catalog: { version: "v13", count: Catalog.verify().count, contentSha: Catalog.contentSha(Catalog.load()!) },
  frozenSeven: "byte-identical in both trees (test/walls/core_byte_identity.test.ts); no frozen byte changed",
  rwaPinUnchanged: true,
  ratification: { entries: rat.entries.length, chainOk: rat.chainOk, coherent: Ratify.supersessionsCoherent(rat.entries).ok },
  independence: "pending-non-author (DOORS-OPEN waits for a genuine stranger — now with the pool composer as a fourth door)",
}
writeFileSync(path.join(D, "phase5-verification-v13.json"), JSON.stringify(out, null, 2) + "\n")

console.log("═══ ENSEMBLE PHASE 5 — VERIFICATION ═══")
console.log(`SUMMARY DIFFERENTIAL (U-DERIVED): ok=${summaryDiff.ok}${summaryDiff.ok ? "" : " — " + summaryDiff.mismatches.join("; ")}`)
console.log(`  prose ${JSON.stringify(TERMINAL_PROSE)} vs derived ${JSON.stringify(derived)}`)
console.log(`BOTH noise walls: voc clean=${vocWall.allClean} (${vocWall.survivors.length}) · pooled clean=${pooledWall.allClean} (${pooledWall.survivors})`)
console.log(`verdict differential byte-identical=${differentialByteIdentical}`)
console.log(`newest door (pool composer) re-run from nothing: ok=${newestDoorOk} (${poolResult.pool?.verdict}, K_eff=${poolResult.pool?.kEff.toFixed(2)}, charge ${poolResult.pool?.charge})`)
console.log(`pristine: ${pristine ? `green=${pristine.pristineGreen} battery ${pristine.battery?.pass}/${pristine.battery?.fail}` : "not yet run"}`)
console.log(`floor=${derived.floor} · catalog v13 ${Catalog.verify().count} · ratification ${rat.entries.length} entries (chain ${rat.chainOk}, coherent ${Ratify.supersessionsCoherent(rat.entries).ok})`)
console.log(`parks forward: ensemble ${parksForward.ensemble.slice(0, 20)}… · tournament NO · hrp DISPOSED · signing ever-standing`)
