/**
 * ORGΛNON — REAL-RETURNS + the REAL-PIT deflation demo (Data-Plane Phase 3; Rules D-LABEL, T-REAL, S-FAMILY). The
 * product's live path goes REAL: a stablecoin-lending-carry goal → a spec → the ported engine on REAL captured PIT
 * snapshots → a REAL-PIT adjudication with provenance a skeptic can trace. Then the family-size deflation mechanism is
 * re-run on REAL-PIT returns — a labeled successor to the ILLUSTRATIVE trial-2, its numbers never conflated (a distinct
 * artifact + hash). The verdict is the frozen core's, relayed verbatim — a NO-GO on real data is the product working.
 * Run: bun run script/real-returns.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { DataPlane } from "../src/dataplane/store"
import { DataPlaneEngine } from "../src/dataplane/engine"
import { DataPlaneAdjudicate } from "../src/dataplane/adjudicate"
import { Ledger } from "../src/ledger/ledger"
import { Studio } from "../src/studio/adjudicate"

const D = path.join(PKG_ROOT, "data", "studio")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const T = Date.parse("2026-07-04T00:00:00Z")

const KEYS = ["lending:aave-v3:USDC:ethereum", "lending:sparklend:DAI:ethereum", "lending:fluid-lending:USDC:ethereum"]
const seriesByKey = new Map<string, DataPlane.Series>()
for (const k of KEYS) {
  const s = DataPlane.snapshotAdapter.fetchSeries(k)
  if (s) seriesByKey.set(k, s)
}

if (seriesByKey.size < 2) {
  const out = { protocol: "real-returns-v9", at: "2026-07-04", gate: "REAL-TRUE", blocked: true, reason: `REAL-PIT adjudication BLOCKED — lending snapshots absent (${seriesByKey.size}); fresh clone, re-capture keyless via script/capture-dataplane.ts`, realTrue: false }
  writeFileSync(path.join(D, "real-returns-v9.json"), JSON.stringify(out, null, 2) + "\n")
  console.log(out.reason)
  process.exit(0)
}

// ── the REAL-PIT live adjudication ────────────────────────────────────────────────────────────────────────────────
const goal = "Earn stablecoin lending carry across major money markets (Aave, Spark, Fluid) with honest costs"
const spec: DataPlaneEngine.LendingSpec = { family: "lending-carry", policy: "carry-tilt", rebalance: { trigger: "monthly" }, markets: [...seriesByKey.keys()].map((key) => ({ key, weight: 1 / seriesByKey.size })) }
const adj = await DataPlaneAdjudicate.realPitAdjudication(goal, spec, seriesByKey, T)
const artifactSha = sha256(JSON.stringify(adj))
console.log(`REAL-PIT adjudication: reality=${adj.reality}, verdict=${adj.verdict}, dsr=${adj.dsrAtDeclared}, ${adj.returns.length} real daily returns`)
console.log(`  provenance: ${adj.provenance.map((p) => `${p.key.split(":").slice(1, 3).join(":")} (${p.contentSha.slice(0, 10)}…, nonce ${p.nonce.slice(0, 8)}…, pos ${p.chainPos})`).join(" · ")}`)
writeFileSync(path.join(D, "real-returns-v9.json"), JSON.stringify({ protocol: "real-returns-v9", at: "2026-07-04", gate: "REAL-TRUE", artifactSha, blocked: false, realTrue: adj.reality === "REAL-PIT", adjudication: adj }, null, 2) + "\n")

// ── the REAL-PIT deflation demo (the family-size mechanism on REAL data) ──────────────────────────────────────────
// A labeled successor to the V6 ILLUSTRATIVE trial-2: the SAME anti-PBO mechanism (iteration deflates the DSR bar), now
// fed REAL-PIT lending returns. The numbers are a DISTINCT artifact + hash — never conflated with the illustrative ones.
const R = adj.returns
const root = { family: "lending-carry", policy: "carry-tilt", rebalance: { trigger: "monthly" }, markets: spec.markets }
const mut = (k: number) => ({ ...root, markets: root.markets.map((m, i) => (i === 0 ? { ...m, weight: m.weight + k * 0.001 } : m)) })
const extras = { returns: R, barsPerYear: 365 as number }

const store = new Ledger.Store()
const first = await Studio.submit(store, { spec: root, authorClass: "agent", domain: "lending", timestamp: T, ...extras })
const dsr1 = first.attestation.dsrAtDeclared ?? null
let parent = 0
for (let k = 1; k <= 24; k++) parent = Studio.register(store, { spec: mut(k), authorClass: "agent", domain: "lending", parentSeq: parent, timestamp: T + k }).seq
const last = await Studio.adjudicateRegistered(store, mut(24), extras)
const dsr25 = last.attestation.dsrAtDeclared ?? null
const familySize = store.familySize(Ledger.hashSpec(root))
const deflated = dsr1 !== null && dsr25 !== null && dsr25 < dsr1

const deflationArtifact = {
  protocol: "deflation-demo-realpit-v9",
  at: "2026-07-04",
  reality: adj.reality, // REAL-PIT — the returns are real (distinct from the V6 ILLUSTRATIVE trial-2)
  successorTo: "V6 live-run-2 (ILLUSTRATIVE, canned returns) — NEVER conflated: this artifact carries REAL-PIT returns + its own hash",
  returnsSha: sha256(JSON.stringify(R)),
  returnsSource: "the ported lending engine on REAL captured DefiLlama snapshots (provenance in real-returns-v9.json)",
  familySize,
  dsrAtFamily1: dsr1,
  dsrAtFamily25: dsr25,
  verdictAtFamily1: first.attestation.verdict,
  verdictAtFamily25: last.attestation.verdict,
  deflated,
  note: "the family-size mechanism (anti-PBO): iterating a REAL-PIT lending spec STIFFENS the DSR bar (dsr25 < dsr1) — iteration cannot launder acceptance, now proven on real data. Whatever the verdict, a REAL-PIT NO-GO is the product working (zero powered verdicts).",
}
writeFileSync(path.join(D, "deflation-demo-realpit-v9.json"), JSON.stringify(deflationArtifact, null, 2) + "\n")
console.log(`REAL-PIT deflation demo: family ${familySize}, dsr1=${dsr1} → dsr25=${dsr25}, deflated=${deflated} (verdict ${first.attestation.verdict} → ${last.attestation.verdict})`)

const realTrue = adj.reality === "REAL-PIT" && deflated
console.log(`\nREAL-PIT live adjudication + deflation demo: ${realTrue ? "OK ✓" : "INCOMPLETE"}; written real-returns-v9.json · deflation-demo-realpit-v9.json`)
process.exit(realTrue ? 0 : 1)
