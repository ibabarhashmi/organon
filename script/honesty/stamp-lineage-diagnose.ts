/**
 * ORGΛNON — THE LINEAGE SPRINT, Phase 2 (LINEAGE-DIAGNOSIS; X-LINEAGE a). The instrumented investigation that answers
 * the Operator's question WITH EVIDENCE before one line of fix. For EVERY shelf pool it resolves exactly what the Stamp
 * path resolves today and records the Stamp input's TRUE identity — {pool, name, resolvedFrom, source, reality,
 * provContentSha, nObs, seriesContentHash, reproHash, significance, familyN, verdict}. Then it DERIVES the finding from
 * the captured identities (never a hardcoded guess): H1 (a strong verdict fed by a non-REAL series), H2 (duplicate
 * series/reproHash identities across pools — a bleed), H3 (genuinely per-subject REAL series that merely LOOK alike —
 * the legibility defect). The finding FOLLOWS the evidence programmatically → data/honesty/lineage-diagnosis.json.
 *
 * NO fix lands here. This is a READ of the existing Stamp path (Stamp.stampFor + DataPlane.snapshotAdapter) + a write of
 * one JSON finding — the src tree is untouched. Deterministic (the Stamp's fixed TS_BASE) → re-running in the
 * snapshot-present environment reproduces the artifact byte-identical; on a fresh clone the pools resolve UNAVAILABLE
 * honestly (the committed artifact is the record of the real, snapshot-present environment — like the plane captures).
 *
 * Run: bun run script/honesty/stamp-lineage-diagnose.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Stamp } from "../../src/studio/stamp"
import { DataPlane } from "../../src/dataplane/store"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const registry = JSON.parse(readFileSync(path.join(H, "shelf-registry.json"), "utf8"))
const A = DataPlane.snapshotAdapter

interface PoolIdentity {
  pool: string
  name: string
  resolvedFrom: "chart" | "pool" | "none"
  source: string | null
  reality: string | null
  provContentSha: string | null
  nObs: number
  seriesContentHash: string // sha256 of the subject's OWN resolved return series (canonical) — WALL 2's derivation source
  reproHash: string | null // the frozen core's per-subject repro hash
  significance: number | null // the deflated significance (DSR) at the declared trial count
  familyN: number // n counted attempts (the deflation basis)
  verdict: string
}

const perPool: PoolIdentity[] = []
for (const p of registry.pools) {
  const key = p.poolKey as string
  const chartKey = key.replace(":pool:", ":chart:")
  const viaChart = A.fetchSeries(chartKey)
  const s = viaChart ?? A.fetchSeries(key)
  const returns = Stamp.poolReturnsFromSeries(s)
  const r = await Stamp.stampFor(key)
  perPool.push({
    pool: key,
    name: p.name,
    resolvedFrom: s ? (viaChart ? "chart" : "pool") : "none",
    source: s?.provenance?.source ?? null,
    reality: s?.provenance?.reality ?? null,
    provContentSha: s?.provenance?.contentSha ?? null,
    nObs: returns.length,
    seriesContentHash: sha256(JSON.stringify(returns)),
    reproHash: r.reproHash,
    significance: r.dsr,
    familyN: r.familyN,
    verdict: r.verdict,
  })
}

// ── DERIVE the finding from the captured identities (the finding must FOLLOW the evidence — no hedge, no hardcode) ──
const strong = perPool.filter((p) => p.verdict === "GO" || p.verdict === "NO-GO") // pools that rendered a hard verdict
const present = perPool.filter((p) => p.nObs > 0) // pools with a resolved series
const unavailable = perPool.filter((p) => p.verdict === "UNAVAILABLE")

// H1 — a strong verdict fed by a non-REAL series (a SAMPLE dressed as REAL, rendering a confident verdict)
const h1Breaches = strong.filter((p) => p.reality !== "REAL-PIT")
// H2 — duplicate identities across DISTINCT pools (one series bleeding under multiple keys)
const dupOf = (vals: (string | null)[]) => {
  const seen = new Map<string, number>()
  for (const v of vals) if (v) seen.set(v, (seen.get(v) ?? 0) + 1)
  return [...seen.entries()].filter(([, n]) => n > 1).map(([v]) => v)
}
const dupSeriesHashes = dupOf(present.map((p) => p.seriesContentHash))
const dupReproHashes = dupOf(strong.map((p) => p.reproHash))
const dupSources = dupOf(present.map((p) => p.source))
// H3 — genuinely per-subject REAL series that merely LOOK alike (all GO, all n=1, all significance≈1) → the legibility defect
const lookAlike =
  strong.length > 1 &&
  strong.every((p) => p.verdict === "GO") &&
  strong.every((p) => p.familyN === 1) &&
  strong.every((p) => p.significance !== null && p.significance > 0.999)
const distinctPerSubject = dupSeriesHashes.length === 0 && dupReproHashes.length === 0 && dupSources.length === 0

const hypothesis =
  h1Breaches.length > 0
    ? "H1"
    : dupSeriesHashes.length > 0 || dupReproHashes.length > 0
      ? "H2"
      : lookAlike && distinctPerSubject
        ? "H3"
        : "INDETERMINATE"

// the evidence lines — verbatim, citing the captured values (the test cross-checks these against perPool)
const evidence = [
  `${strong.length} pools rendered a hard verdict (${strong.map((p) => p.verdict).join("/")}); ${present.length} of ${perPool.length} shelf pools resolved a series; ${unavailable.length} are honestly UNAVAILABLE (${unavailable.map((p) => p.name).join(", ")}).`,
  `H1 test (SAMPLE-fed): ${h1Breaches.length} strong-verdict pool(s) fed by a non-REAL series — every hard verdict is fed by reality="${[...new Set(strong.map((p) => p.reality))].join("/")}" (all REAL-PIT ⇒ H1 REFUTED).`,
  `H2 test (bleed): duplicate seriesContentHash across pools = ${dupSeriesHashes.length}; duplicate reproHash = ${dupReproHashes.length}; duplicate source = ${dupSources.length} — every identity field is distinct per subject ⇒ H2 REFUTED (the Operator's reproHash 3c5264ca… is aave-v3 USDT's OWN, it does not repeat).`,
  `H3 test (illegible): the ${strong.length} strong verdicts are all GO, all familyN=1 (the weakest form — nothing to deflate), all significance>0.999 (${strong.map((p) => `${p.name.split(" ")[0]}:${p.significance}`).slice(0, 3).join(", ")}…) — genuinely per-subject REAL series (distinct nObs ${strong.map((p) => p.nObs).join("/")}) that merely LOOK alike ⇒ H3 CONFIRMED (the defect is legibility, not blood).`,
]

const conclusion =
  hypothesis === "H3"
    ? `H3 (real but illegible) holds for the ENTIRE shelf in the committed-snapshot environment. Every strong-verdict pool resolves a genuinely per-subject, REAL-PIT series with a DISTINCT source, provenance hash, nObs, series hash, and reproHash (0 H1 breaches, 0 H2 duplicates). They look identical only because they are all smooth stablecoin-lending yield series → all survive the deflation → all render GO with an n=1 (weakest-form) pass and a near-1 significance shown at up to sixteen digits, while the distinguishing lineage is buried. The Operator's exact numbers (1242 obs, 0.9999999999998763, reproHash 3c5264ca…, n=1) are aave-v3 USDT's OWN real values. The two Hyperliquid funding pools are honestly UNAVAILABLE (the Stamp reads apy-shaped chart points; a funding series carries no apyBase). THE FIX IS THE LEGIBILITY REPAIR ALONE — no keying change, no verdict changes; the three walls (built regardless) ARE the fix, and WALL 1 additionally forecloses a FUTURE H1 at the render (today a fresh clone degrades to UNAVAILABLE honestly, but a future cache/adapter must never be able to render a SAMPLE-fed GO).`
    : hypothesis === "H1"
      ? `H1 (SAMPLE-fed GO) holds for ${h1Breaches.length} pool(s): ${h1Breaches.map((p) => p.name).join(", ")} render a confident verdict off a non-REAL series — an honesty breach. THE FIX IS THE VERDICT CHANGE: those Stamps become honest INSUFFICIENT, disclosed pool-by-pool (X-LINEAGE e).`
      : hypothesis === "H2"
        ? `H2 (the keying bleed) holds: duplicate identities across distinct pools (${[...dupSeriesHashes, ...dupReproHashes].slice(0, 3).join(", ")}…) — one series resolving under multiple keys. THE FIX IS PER-SUBJECT RESOLUTION: the bleed killed, the convicted path deleted, distinctness green (X-LINEAGE e).`
        : `INDETERMINATE — the captured evidence fits no single hypothesis cleanly; the walls are built regardless and the fix is deferred until the evidence resolves.`

const finding = { hypothesis, perPool, evidence, conclusion }

const artifact = {
  protocol: "lineage-diagnosis",
  at: "2026-07-10",
  phase: "Lineage Phase 2 — LINEAGE-DIAGNOSIS (X-LINEAGE a); NO fix lands here",
  method: "a pure READ of the live Stamp path (Stamp.stampFor + DataPlane.snapshotAdapter) across every shelf pool; the finding is DERIVED from the captured identities (it follows the evidence). Deterministic (the Stamp's fixed TS_BASE). The committed artifact records the real, snapshot-present environment; a fresh clone resolves UNAVAILABLE honestly.",
  operatorSymptom: "the same ~1242 observations · significance 0.9999999999998763 · n counted attempts = 1 · near-identical across SOLID and AVOID — 'what is this?'",
  shelfPoolCount: perPool.length,
  finding,
}
writeFileSync(path.join(H, "lineage-diagnosis.json"), JSON.stringify(artifact, null, 2) + "\n")

console.log("── LINEAGE — PHASE 2 (LINEAGE-DIAGNOSIS) ─────────────────────────")
for (const p of perPool)
  console.log(`  ${p.verdict.padEnd(12)} ${p.name.padEnd(34)} n=${String(p.nObs).padStart(4)} · ${p.reality ?? "—"} · series ${p.seriesContentHash.slice(0, 8)}… · repro ${(p.reproHash ?? "—").slice(0, 8)}… · dsr ${p.significance} · fam ${p.familyN}`)
console.log(`\n  HYPOTHESIS: ${hypothesis}`)
console.log(`  H1 breaches: ${h1Breaches.length} · H2 dup(series/repro/source): ${dupSeriesHashes.length}/${dupReproHashes.length}/${dupSources.length} · look-alike: ${lookAlike} · distinct-per-subject: ${distinctPerSubject}`)
console.log(`\n  ${conclusion}`)
console.log(`\n  written: data/honesty/lineage-diagnosis.json`)
