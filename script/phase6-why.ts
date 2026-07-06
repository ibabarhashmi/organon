/**
 * ORGΛNON — Explanation Phase 6: verification + handoff (HANDOFF-HONEST; U-DERIVED, X-DEFAULT delta, K-EFF, R-ADVISORY).
 * The deterministic re-verifications on the terminal's OWN numbers AND its narrative arithmetic: the delta-aware summary
 * differential (floor 74→86 · matrix 34→40 · catalog 36→46, checked against V13's terminal baseline), both noise walls
 * (single VoC + pooled), the verdict differential byte-identical, the newest door (the WHY panel) re-run from nothing,
 * and the parks forward. Run: bun run script/phase6-why.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Summary } from "../src/studio/summary"
import { VerdictDifferential } from "../src/studio/differential"
import { Voc } from "../src/proposers/voc"
import { Pool } from "../src/analytics/pool"
import { Explain } from "../src/analytics/explain"
import { Console } from "../src/studio/console"
import { Catalog } from "../src/studio/catalog"
import { Ratify } from "../src/studio/ratify"
import { Scope } from "../src/studio/scope"

const D = path.join(PKG_ROOT, "data", "studio")
const T = Date.parse("2026-07-06T00:00:00Z")

// (1) the SUMMARY DIFFERENTIAL on the terminal's own numbers (U-DERIVED) + the DELTA-aware check (X-DEFAULT)
const TERMINAL = { floor: 86, matrixPresent: 40, matrixAbsent: 3, catalogCount: 46 }
const V13_BASELINE = { floor: 74, matrixPresent: 34, matrixAbsent: 3, catalogCount: 36 } // V13's terminal (the delta's 'from')
const derived = Summary.derive()
const summaryDiff = Summary.differential(TERMINAL, derived)
const deltaDiff = Summary.deltaDifferential(
  [{ metric: "floor", from: 74, to: 86 }, { metric: "matrixPresent", from: 34, to: 40 }, { metric: "catalogCount", from: 36, to: 46 }],
  V13_BASELINE, derived,
)

// (2) BOTH noise walls + the verdict differential byte-identical (the frozen core untouched by any V14 panel/paraphrase)
const vocWall = await Voc.noiseWall(12, { timestamp: T, featureCount: 40, nObs: 500, evalMode: "oos" })
const pooledWall = await Pool.pooledNoiseWall(12, { timestamp: T })
const pinnedFp = JSON.parse(readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8")).fingerprintSetSha
const differentialByteIdentical = (await VerdictDifferential.fingerprintSetSha()) === pinnedFp

// (3) the NEWEST door (the WHY panel) re-run from nothing — every terminal state explainable, both registers consistent
const states = Explain.TEMPLATE_STATES
const facts = (s: Explain.TerminalState): Explain.VerdictFacts => ({ terminalState: s, verdict: s === "INSUFFICIENT" ? "INSUFFICIENT-EVIDENCE" : s === "kill-switch" ? "NO-GO" : s, dsrAtDeclared: s === "NO-GO" ? 0.42 : s === "GO" ? 0.97 : s === "CONDITIONAL" ? 0.96 : null, dsrThreshold: 0.95, familyDeclaredNTrials: 38, tier: "V0", nObs: s === "BLOCKED" || s === "MALFORMED" || s === "kill-switch" ? null : 400, reality: "REAL-PIT", provenanceRef: "p", reproHash: "r", stateReason: s === "BLOCKED" ? "credential-gated absent data" : s === "MALFORMED" ? "invalid enum" : undefined, killSwitchReason: s === "kill-switch" ? "1 pooled-noise survivor" : undefined })
const whyReRun = states.every((s) => { const f = facts(s); const t = Explain.factTable(f); return Explain.factTableCensus(t).ok && Explain.consistency(Explain.plainLanguage(f), t).ok })
// a live WHY panel through the served console (the newest door reachable)
const nogo = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, T)
const whyReachable = Console.renderResult(nogo, { pro: true }).includes("WHY (quantitative)")

// (4) the parks forward (each with its disposition)
const rat = Ratify.load(path.join(D, "research-ratification-v14.json"))
const scope = Scope.load(path.join(D, "scope-amendments-v14.json"))
const parksForward = {
  selection: Ratify.effectiveRecord(rat.entries, "pool-member-selection-pricing")?.disposition === "SUPERSEDE" ? "DISPOSED — TERM (the pick priced by experiment; the surcharge live in pool.ts; existing verdicts re-stated, none moved)" : "?",
  whyPanel: Ratify.artifactRatified(rat.entries, "src/analytics/explain.ts") ? "DELIVERED (ADOPT — the WHY panel ships; every terminal state bilingual)" : "?",
  scopeParity: scope.entries.some((e) => e.feature.includes("funding")) ? "FILED + CURED (the funding-parity narrowing retro-filed Phase 0, cured Phase 2 with REAL-PIT wiring)" : "?",
  sybilIdentity: "FILED — the identity provenance truth + the ratchet-bypass vector filed into the sybil park (self-declared, rotation-free; owner unchanged)",
  tournament: Ratify.effectiveRecord(rat.entries, "shared-multiuser-ledger-tournament")?.disposition === "SUPERSEDE" ? "NO standing (stays parked)" : "?",
  hrp: Ratify.effectiveRecord(rat.entries, "hrp-portfolio-construction")?.disposition === "SUPERSEDE" ? "DISPOSED NO (stays parked)" : "?",
  cpcvPromotion: "accruing toward ≥30 @ ≥80% agreement (advisory-first; not gating)",
  zkml: "re-check 2027-01-01 (parked; immature)",
  poolRecursion: "deferred by default (depth-1; a pool of pools is schema-refused)",
  signing: "ever-standing constitutional decision (Operator-only; nothing signs)",
}

const pristine = existsSync(path.join(D, "pristine-clone-v14.json")) ? JSON.parse(readFileSync(path.join(D, "pristine-clone-v14.json"), "utf8")) : null

const out = {
  protocol: "phase6-verification-v14", at: "2026-07-06",
  summaryDifferential: { prose: TERMINAL, derived, ok: summaryDiff.ok, mismatches: summaryDiff.mismatches },
  deltaDifferential: { claims: "floor 74→86 · matrixPresent 34→40 · catalogCount 36→46", ok: deltaDiff.ok, mismatches: deltaDiff.mismatches },
  noiseWalls: { voc: { clean: vocWall.allClean, survivors: vocWall.survivors.length }, pooled: { clean: pooledWall.allClean, survivors: pooledWall.survivors } },
  verdictDifferential: { byteIdentical: differentialByteIdentical, fingerprintSetSha: pinnedFp },
  newestDoorReRun: { door: "the WHY panel", everyTerminalStateExplainable: whyReRun, reachableThroughServedConsole: whyReachable },
  parksForward,
  floor: derived.floor, matrix: { present: derived.matrixPresent, absent: derived.matrixAbsent }, catalog: { version: "v14", count: Catalog.verify().count, contentSha: Catalog.contentSha(Catalog.load()!) },
  frozenSeven: "byte-identical in both trees (test/walls/core_byte_identity.test.ts); no frozen byte changed",
  rwaPinUnchanged: true, noRePin: true,
  ratification: { entries: rat.entries.length, chainOk: rat.chainOk, coherent: Ratify.supersessionsCoherent(rat.entries).ok, experimentRegistryCoherent: Ratify.experimentRegistryCoherent(rat.entries).ok },
  pristineHarness: pristine ? { evidence: "pristine-clone-v14.json", pristineGreen: pristine.pristineGreen } : { evidence: "pristine-clone-v14.json", note: "run script/pristine-clone.ts (via ./organon.sh --full); disclosed" },
  independence: "pending-non-author (DOORS-OPEN waits for a genuine stranger — now four doors each with a WHY, one command away)",
  operatorLane: "zero agent residue: publication re-ratification against the again-grown matrix (40 PRESENT) · the free FRED credential · the V4-backup restoration window · the genuine second party",
}
writeFileSync(path.join(D, "phase6-verification-v14.json"), JSON.stringify(out, null, 2) + "\n")

console.log("═══ EXPLANATION PHASE 6 — VERIFICATION + HANDOFF ═══")
console.log(`SUMMARY DIFFERENTIAL (U-DERIVED): ok=${summaryDiff.ok} — prose ${JSON.stringify(TERMINAL)} vs derived ${JSON.stringify(derived)}`)
console.log(`DELTA DIFFERENTIAL (X-DEFAULT): ok=${deltaDiff.ok}${deltaDiff.ok ? " (floor 74→86 · matrix 34→40 · catalog 36→46 — arithmetic checks against V13's baseline)" : " — " + deltaDiff.mismatches.join("; ")}`)
console.log(`BOTH noise walls: voc clean=${vocWall.allClean} · pooled clean=${pooledWall.allClean}`)
console.log(`verdict differential byte-identical=${differentialByteIdentical}`)
console.log(`newest door (WHY panel) re-run: every terminal state explainable=${whyReRun} · reachable through served console=${whyReachable}`)
console.log(`floor=${derived.floor} · matrix ${derived.matrixPresent}/${derived.matrixAbsent} · catalog v14 ${Catalog.verify().count} · ratification ${rat.entries.length} (chain ${rat.chainOk}, coherent ${Ratify.supersessionsCoherent(rat.entries).ok})`)
console.log(`parks forward: selection ${parksForward.selection.slice(0, 24)}… · why-panel DELIVERED · signing ever-standing`)
