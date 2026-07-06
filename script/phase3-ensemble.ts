/**
 * ORGΛNON — Ensemble Phase 3 (POOL-HONEST). THE POOL COMPOSER, through the open door. The park protocol's first delivered
 * capability: pooling that pays the union's K_eff bill, ratchets on every swap, recomputes with time, warns of the storm,
 * dies by kill-switch if noise ever survives it, and renders the n it was tested against. Run: bun run script/phase3-ensemble.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Surface } from "../src/studio/surface"
import { Pool } from "../src/analytics/pool"
import { Keff } from "../src/studio/keff"
import { Ledger } from "../src/ledger/ledger"
import { StudioScreens } from "../src/studio/screens"
import { Ratify } from "../src/studio/ratify"
import { VerdictDifferential } from "../src/studio/differential"
import { Console } from "../src/studio/console"

const D = path.join(PKG_ROOT, "data", "studio")
const T = Date.parse("2026-07-05T00:00:00Z")
function mul(seed: number): () => number { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function gauss(rng: () => number, n: number): number[] { const o: number[] = []; while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) } return o }
const members = (count: number, edge: number, seed: number): Pool.Member[] => Array.from({ length: count }, (_, k) => ({ specHash: `m${k}-${seed}`, family: "lending-carry", returns: gauss(mul(seed + k), 400).map((x) => edge + 0.01 * x) }))

// (1) the AMENDMENT — the screen set 9 → 10, closed again (SCREENS.length === 10)
const amendmentClosed = StudioScreens.SCREENS.length === 10 && StudioScreens.SCREENS[9] === "poolComposer"

// (2) the traversal evidence (happy + failure) admissible
const trav = Surface.loadTraversal(path.join(D, "traversal-pool-composer.json"))

// (3) the union charge + the swap ratchet
const store1 = new Ledger.Store()
const base = members(5, 0.0016, 100)
const v1 = await Pool.composeAndAdjudicate(store1, base, T)
const prior: Pool.PoolSpec[] = [{ family: Pool.POOL_FAMILY, memberHashes: base.map((m) => m.specHash), kEffCharge: v1.charge, rhoBar: v1.rhoBar }]
const swapped = [...base.slice(1), members(1, 0.0016, 999)[0]]
const v2 = await Pool.composeAndAdjudicate(new Ledger.Store(), swapped, T, { priorCompositions: prior })
const v3 = await Pool.composeAndAdjudicate(new Ledger.Store(), [...swapped.slice(1), members(1, 0.0016, 1234)[0]], T, { priorCompositions: [...prior, { family: Pool.POOL_FAMILY, memberHashes: swapped.map((m) => m.specHash), kEffCharge: v2.charge, rhoBar: v2.rhoBar }] })
const swapRatchets = v1.familySize < v2.familySize && v2.familySize < v3.familySize // n rises with each edit, never resets
const unionCharge = v1.charge === Keff.poolCharge(5, v1.rhoBar) // the pool is charged ceil(K_eff), not raw K unless diversified

// (4) K_eff recomputes on clock ticks (composition-time vs current), divergence rendered
const composed = base.map((m) => m.returns.slice(0, 200)) // the calm composition window
const current = base.map((m, k) => [...m.returns.slice(0, 200).map((x, t) => 0.7 * x + 0.3 * base[0].returns.slice(0, 200)[t])]) // members correlate later
const divergence = Pool.recomputeKeff(composed, current)

// (5) the pooled-noise permanent wall (clean) + the seeded kill
const wallClean = await Pool.pooledNoiseWall(12, { timestamp: T })
const wallSeeded = await Pool.pooledNoiseWall(6, { timestamp: T, seedSurvivor: true })

// (6) K-LEGIBLE neutral (the pool report renders n · scoping · a neutral comparability note; no shaming)
const poolResult = await Console.runComposedPool(members(5, 0.0016, 55), T)
const legibleNeutral = poolResult.render.includes("Deflation basis") && poolResult.render.includes("not a judgement") && !/\b(worse|inferior|bad strategy|loser|shame)\b/i.test(poolResult.render)

// (7) depth-1 recursion refused
let recursionRefused = false
try { await Pool.composeAndAdjudicate(new Ledger.Store(), [{ specHash: "p", family: Pool.POOL_FAMILY, returns: base[0].returns }, base[1]], T) } catch { recursionRefused = true }

// (8) the verdict differential byte-identical (the pool landed; NO baseline verdict moved)
const pinnedFp = JSON.parse(readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8")).fingerprintSetSha
const differentialByteIdentical = (await VerdictDifferential.fingerprintSetSha()) === pinnedFp

// (9) the ensemble ADOPT authorizes the pool artifact (the ratification wall maps it back)
const rat = Ratify.load(path.join(D, "research-ratification-v13.json"))
const poolRatified = Ratify.artifactRatified(rat.entries, "src/analytics/pool.ts") && Ratify.unratifiedArtifacts(rat.entries).length === 0

// (10) census diff — the pool composer enters the law
const prevSurfaced = JSON.parse(readFileSync(path.join(D, "phase2-builder-whole-v13.json"), "utf8")).censusDiff.newlySurfaced as string[]
const censusDiff = Surface.censusDiff([...prevSurfaced, "guided-builder-funding", "guided-builder-basis"], [{ capability: "pool-composer", kind: "user-facing", traversal: "data/studio/traversal-pool-composer.json", evidence: "the pool composer traversal (union family + K_eff + stress caveat; failure: <2 members)" }], PKG_ROOT)

const out = {
  protocol: "phase3-pool-honest-v13", at: "2026-07-05", gate: "POOL-HONEST", doorState: "OPEN-WITH-CONDITIONS",
  amendmentClosed, screens: StudioScreens.SCREENS.length,
  traversal: { admissible: trav.ok, theater: trav.artifact ? Surface.isTheater(trav.artifact) : true, issues: trav.issues },
  unionChargeAndRatchet: { unionCharge, kEff: +v1.kEff.toFixed(3), charge: v1.charge, familySizes: [v1.familySize, v2.familySize, v3.familySize], swapRatchets },
  keffRecompute: { atComposition: +divergence.atComposition.toFixed(3), current: +divergence.current.toFixed(3), divergence: +divergence.divergence.toFixed(3), render: divergence.render },
  pooledNoiseWall: { clean: wallClean.allClean, survivors: wallClean.survivors, seededKillTripped: wallSeeded.killSwitch.tripped, seededSurvivors: wallSeeded.survivors },
  legibleNeutral, recursionRefused,
  verdictDifferential: { byteIdentical: differentialByteIdentical, pinned: pinnedFp },
  poolRatified, censusDiff: { newlySurfaced: censusDiff.newlySurfaced, ok: censusDiff.ok },
  stressCaveatMandatory: poolResult.render.includes(Pool.STRESS_CAVEAT.slice(0, 30)),
}
writeFileSync(path.join(D, "phase3-pool-honest-v13.json"), JSON.stringify(out, null, 2) + "\n")

const gateOk = amendmentClosed && trav.ok && !Surface.isTheater(trav.artifact!) && unionCharge && swapRatchets && wallClean.allClean && wallSeeded.killSwitch.tripped && legibleNeutral && recursionRefused && differentialByteIdentical && poolRatified && out.stressCaveatMandatory
console.log("═══ ENSEMBLE PHASE 3 — POOL-HONEST ═══")
console.log(`amendment closed (SCREENS===10, poolComposer): ${amendmentClosed}`)
console.log(`traversal admissible=${trav.ok} theater=${trav.artifact ? Surface.isTheater(trav.artifact) : "?"}`)
console.log(`union charge=ceil(K_eff)=${v1.charge} (K_eff=${v1.kEff.toFixed(2)}) · swap ratchet family ${v1.familySize}→${v2.familySize}→${v3.familySize} (${swapRatchets})`)
console.log(`K_eff recompute: ${divergence.render}`)
console.log(`pooled-noise wall clean=${wallClean.allClean} (${wallClean.survivors} survivors) · seeded kill tripped=${wallSeeded.killSwitch.tripped} (${wallSeeded.survivors})`)
console.log(`K-LEGIBLE neutral=${legibleNeutral} · stress caveat mandatory=${out.stressCaveatMandatory} · depth-1 recursion refused=${recursionRefused}`)
console.log(`verdict differential byte-identical=${differentialByteIdentical} · pool ratified=${poolRatified}`)
console.log(`POOL-HONEST gate: ${gateOk ? "✅ satisfiable" : "❌ NOT satisfiable"}`)
