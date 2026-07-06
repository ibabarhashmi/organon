/**
 * ORGΛNON — the DIFFERENTIAL harness (Data-Plane Phase 2; Rules D-DIFF, D-DOMAIN, A′#2, A′#9). The only judge that
 * cannot flatter the port. A real captured lending fixture is transformed by the standalone-native buildJob into a Job
 * (the shared, hash-pinned fixture), then run through BOTH the frozen monorepo oracle (`lending_accrual.py`, read-only)
 * AND the standalone port — the equity_curve must be BYTE-IDENTICAL, or the domain cannot claim DONE. The differential
 * is direction-blind: a seeded flattering divergence (a higher apyBase) is caught by byte-inequality regardless of
 * which side looks better. The sidecar is regression-locked (sha256 == the oracle's). The oracle touches the old tree
 * by nothing (git status unchanged, pasted). RWA is BLOCKED-on-credential, stated. Run: bun run script/differential.ts
 */
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { DataPlane } from "../src/dataplane/store"
import { DataPlaneEngine } from "../src/dataplane/engine"
import { DataPlaneCapture } from "../src/dataplane/capture"
import { Runner } from "../src/backtest/runner"

const ORACLE_ROOT = process.env.ORGANON_ORACLE_ROOT ?? "/Users/babar/Projects/organon/packages/solidity-sentinel"
const D = path.join(PKG_ROOT, "data", "studio")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

// run lending_accrual.py from a given tree, read-only, system python3 (stdlib-only sidecar) — the isolatable variable
// is the sidecar's own bytes + the Job. Returns the parsed result.
function runSidecar(root: string, job: unknown): { ok: boolean; out?: DataPlaneEngine.LendingResult; err?: string } {
  const r = spawnSync("python3", ["-m", "backtest.py.lending_accrual"], { cwd: path.join(root, "src"), input: JSON.stringify(job), encoding: "utf8", env: { ...process.env, PYTHONHASHSEED: "0" } })
  if (r.status !== 0) return { ok: false, err: (r.stderr ?? "").slice(0, 500) }
  return { ok: true, out: JSON.parse(r.stdout) as DataPlaneEngine.LendingResult }
}
function gitStatus(root: string): string {
  return (spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).stdout ?? "").trim()
}

// ── build the shared fixture (a Job) from REAL captured lending series ────────────────────────────────────────────
const KEYS = ["lending:aave-v3:USDC:ethereum", "lending:sparklend:DAI:ethereum", "lending:fluid-lending:USDC:ethereum"]
const seriesByKey = new Map<string, DataPlane.Series>()
for (const k of KEYS) {
  const s = DataPlane.snapshotAdapter.fetchSeries(k)
  if (s) seriesByKey.set(k, s)
}
const haveData = seriesByKey.size >= 2

interface DomainDiff { domain: string; blocked: boolean; ok: boolean; fixtureSha?: string; oracleSha?: string; portSha?: string; detail: string }
const results: DomainDiff[] = []

if (!haveData) {
  results.push({ domain: "lending", blocked: true, ok: false, detail: `lending fixture ABSENT (${seriesByKey.size} series) — fresh clone; re-capture keyless via script/capture-dataplane.ts. A blocked differential is honest; a skipped one is a Halt.` })
} else {
  const spec: DataPlaneEngine.LendingSpec = { family: "lending-carry", policy: "carry-tilt", rebalance: { trigger: "monthly" }, markets: [...seriesByKey.keys()].map((key) => ({ key, weight: 1 / seriesByKey.size })) }
  const window = DataPlaneEngine.commonWindow([...seriesByKey.values()])
  const job = DataPlaneEngine.buildLendingJob(spec, window, seriesByKey)
  const fixtureJson = JSON.stringify(job)
  const fixtureSha = sha256(fixtureJson) // hash-pinned BEFORE the first run (fixtures cannot be adjusted post-hoc)

  // oracle: the frozen monorepo sidecar, read-only, old tree unchanged
  const oracleAvailable = existsSync(path.join(ORACLE_ROOT, "src", "backtest", "py", "lending_accrual.py"))
  const statusBefore = oracleAvailable ? gitStatus(ORACLE_ROOT) : ""
  const oracle = oracleAvailable ? runSidecar(ORACLE_ROOT, job) : { ok: false, err: "oracle absent (fresh clone)" }
  const statusAfter = oracleAvailable ? gitStatus(ORACLE_ROOT) : ""

  // port: the standalone sidecar (same runtime, isolating the sidecar bytes) AND the real .venv path (Runner.sidecar)
  const port = runSidecar(PKG_ROOT, job)
  const portRuntime = (await Runner.sidecar("lending_accrual", job)) as DataPlaneEngine.LendingResult

  const oracleEquity = oracle.ok ? JSON.stringify(oracle.out!.equity_curve) : null
  const portEquity = port.ok ? JSON.stringify(port.out!.equity_curve) : null
  const portRuntimeEquity = JSON.stringify(portRuntime.equity_curve)

  const runtimeParity = portEquity === portRuntimeEquity // the .venv path == the direct python3 path
  if (!oracleAvailable) {
    results.push({ domain: "lending", blocked: true, ok: false, fixtureSha, portSha: portEquity ? sha256(portEquity) : undefined, detail: `oracle BLOCKED (monorepo absent at ${ORACLE_ROOT}); the port ran (${portRuntime.equity_curve.length} pts, runtimeParity=${runtimeParity}) but a differential with no oracle is BLOCKED, stated — never faked green` })
  } else {
    const byteIdentical = oracleEquity !== null && portEquity !== null && oracleEquity === portEquity
    const cleanTree = statusBefore === statusAfter
    const ok = byteIdentical && runtimeParity && cleanTree
    results.push({
      domain: "lending",
      blocked: false,
      ok,
      fixtureSha,
      oracleSha: oracleEquity ? sha256(oracleEquity) : undefined,
      portSha: portEquity ? sha256(portEquity) : undefined,
      detail: ok
        ? `BYTE-IDENTICAL — the standalone port reproduces the frozen oracle on the shared Job (${portRuntime.equity_curve.length} pts, ${seriesByKey.size} markets, carry-tilt); oracleSha==portSha; runtime-parity (.venv==python3) ${runtimeParity}; old tree UNCHANGED`
        : `MISMATCH — byteIdentical=${byteIdentical} runtimeParity=${runtimeParity} cleanTree=${cleanTree} (oracleErr=${oracle.err ?? "-"} portErr=${port.err ?? "-"})`,
    })

    // ── the SIDECAR REGRESSION LOCK (D-SEAM): the ported engine body is byte-identical to the oracle's ──────────────
    const portSidecarSha = sha256(readFileSync(path.join(PKG_ROOT, "src/backtest/py/lending_accrual.py"), "utf8"))
    const oracleSidecarSha = sha256(readFileSync(path.join(ORACLE_ROOT, "src/backtest/py/lending_accrual.py"), "utf8"))
    const sidecarLocked = portSidecarSha === oracleSidecarSha

    // ── the SEEDED DIVERGENCE (direction-blind): a flattering apyBase transform must be CAUGHT ────────────────────
    // A realistic port bug: the buildJob systematically over-reports yield (a one-line `.map(+1.0)` flattering the whole
    // series). The port would look BETTER — yet the byte differential must still FAIL. (A single early point does NOT
    // propagate under carry-tilt — that market carries ~0 weight in month one and _asof supersedes it at the next
    // rebalance — so the seed bumps the whole series, guaranteeing the flattering error reaches the equity.)
    const flatteringJob = JSON.parse(fixtureJson) as DataPlaneEngine.LendingJob
    flatteringJob.markets[0].series.apyBase = flatteringJob.markets[0].series.apyBase.map(([ts, v]) => [ts, (v ?? 0) + 1.0])
    const seededPort = runSidecar(PKG_ROOT, flatteringJob)
    const seededEquity = seededPort.ok ? JSON.stringify(seededPort.out!.equity_curve) : null
    const seededCaught = seededEquity !== null && seededEquity !== oracleEquity // the divergence is DETECTED
    results.push({ domain: "lending:seeded-divergence", blocked: false, ok: seededCaught, detail: seededCaught ? `CAUGHT — a flattering +1.0 apyBase bump makes the port diverge from the oracle at the byte level (direction-blind); byte-inequality is failure regardless of which side looks better` : `MISSED — the seeded flattering divergence did not change the output (the differential is blind — HALT)` })
    results.push({ domain: "lending:sidecar-lock", blocked: false, ok: sidecarLocked, detail: sidecarLocked ? `LOCKED — the ported lending_accrual.py is byte-identical to the oracle's (sha ${portSidecarSha.slice(0, 12)}…) — the seam-faithful proof` : `DRIFT — the ported sidecar diverged from the oracle's (port ${portSidecarSha.slice(0, 12)}… ≠ oracle ${oracleSidecarSha.slice(0, 12)}…)` })

    // pin the shared fixture: commit ONLY a SLIM record (fixtureSha + shape) — NOT the raw Job, which embeds the
    // credential-free captured data points that A′#12 keeps gitignored. The full Job is re-derived deterministically from
    // the (re-capturable) snapshots each run, so the committed fixtureSha + the provenance chain are the guarantee (W-cycle1 fix).
    writeFileSync(path.join(D, "differential-fixture-v9.json"), JSON.stringify({ protocol: "differential-fixture-v9", note: "the SLIM record of the hash-pinned shared Job (derived from real captured lending snapshots). The raw Job is NOT committed (A′#12 — no raw data in the tree); it is re-derived deterministically from the snapshots, reproducing this fixtureSha.", fixtureSha, spec, window, markets: job.markets.map((m) => ({ key: m.key, points: m.series.apyBase.length })) }, null, 2) + "\n")

    // record the old-tree status pair (A′#9)
    writeFileSync(path.join(D, "oracle-session-v9.json"), JSON.stringify({ protocol: "oracle-session-v9", oracleRoot: ORACLE_ROOT, gitStatusBefore: statusBefore, gitStatusAfter: statusAfter, unchanged: cleanTree, note: "the differential oracle session — the old tree took zero writes (A′#9)" }, null, 2) + "\n")
  }
}

// ── the RWA differential — BLOCKED-on-credential (D-TWOWAY) ────────────────────────────────────────────────────────
const rwa = DataPlaneCapture.rwaSnapshotState()
results.push({ domain: "RWA", blocked: true, ok: false, detail: `BLOCKED-on-credential — ${rwa.reason} A blocked differential is honest; the pin STAYS NOT-YET (zero re-pins). unblock: ${rwa.unblock}` })

// ── verdict ───────────────────────────────────────────────────────────────────────────────────────────────────────
for (const r of results) console.log(`${r.blocked ? "▷ BLOCKED" : r.ok ? "✓" : "✗"} ${r.domain}: ${r.detail}`)
const claimed = results.filter((r) => !r.blocked)
const diffProven = claimed.length > 0 && claimed.every((r) => r.ok)
const out = {
  protocol: "differential-v9",
  at: "2026-07-04",
  gate: "DIFF-PROVEN",
  rule: "D-DIFF — a domain claims DONE only when byte-identical to the frozen oracle on a hash-pinned shared fixture; a blocked differential is stated, a skipped one is a Halt",
  domainsClaimed: claimed.map((r) => r.domain),
  domainsBlocked: results.filter((r) => r.blocked).map((r) => r.domain),
  results,
  diffProven,
}
writeFileSync(path.join(D, "differential-v9.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`\nDIFF-PROVEN: ${diffProven} (claimed ${claimed.map((r) => r.domain).join(", ")}; blocked ${out.domainsBlocked.join(", ")}); written data/studio/differential-v9.json`)
process.exit(diffProven ? 0 : 1)
