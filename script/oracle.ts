/**
 * ORGΛNON — the DIFFERENTIAL ORACLE harness (Data-Plane Phase 0; Rules D-DIFF, A′#9). The frozen monorepo is the only
 * judge that cannot flatter the port: it runs READ-ONLY as the differential oracle. This harness proves the oracle can
 * JUDGE before anything is ported to it — it feeds a KNOWN lending fixture (whose expected equity curve is HAND-VERIFIED
 * from first principles: a constant 3.65% APY compounds at a daily factor of exactly 1.0001) through the monorepo's
 * byte-identical `lending_accrual.py`, and asserts the oracle reproduces the hand computation. The old tree is touched
 * by NOTHING: its `git status --porcelain` is captured before AND after and asserted UNCHANGED (an oracle run that
 * dirties the old tree is a Halt, A′#9). On a fresh clone (no monorepo) the oracle is BLOCKED, stated — never faked.
 *
 * Run: bun run script/oracle.ts        (override the oracle location with ORGANON_ORACLE_ROOT=/path/to/solidity-sentinel)
 */
import { spawnSync } from "node:child_process"
import { existsSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"

export const ORACLE_ROOT = process.env.ORGANON_ORACLE_ROOT ?? "/Users/babar/Projects/organon/packages/solidity-sentinel"
const D = path.join(PKG_ROOT, "data", "studio")
const DAY_MS = 86_400_000

// ── the KNOWN, HAND-VERIFIED fixture ────────────────────────────────────────────────────────────────────────────────
// One market, static full weight, capital 1.0, three consecutive UTC days at a constant 3.65% APY. The lending engine
// accrues at the point-in-time daily factor 1 + (apy/100)/365; for apy=3.65 that is 1 + 0.0365/365 = 1.0001 EXACTLY.
// With no rebalance (all one month, static policy) the equity index is simply 1.0001 compounded once per day.
const T0 = 20000 * DAY_MS
const days = [T0, T0 + DAY_MS, T0 + 2 * DAY_MS]
export const FIXTURE = {
  spec: { family: "lending-carry", policy: "static", rebalance: { trigger: "monthly" }, markets: [{ key: "aave-usdc", weight: 1.0 }] },
  window: { start: days[0], end: days[2] },
  capitalUsd: 1.0,
  costs: { slippageK: 0.1, feeBps: 0, gasUsd: 0 },
  markets: [{ key: "aave-usdc", weight: 1.0, series: { apyBase: days.map((t) => [t, 3.65]) } }],
}

// the HAND expectation, recomputed with the identical IEEE-754 op order the sidecar uses (1.0001 compounded per day)
const FACTOR = 1.0 + 3.65 / 100.0 / 365.0
function handExpected(): [number, number][] {
  let h = 1.0 // init: static weight 1.0 × capital 1.0
  return days.map((t) => {
    h = h * FACTOR
    return [t, h / 1.0]
  })
}

function gitStatus(root: string): string {
  const r = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" })
  return (r.stdout ?? "").trim()
}

export interface OracleResult { blocked: boolean; ok: boolean; detail: string; expected?: [number, number][]; got?: [number, number][]; statusBefore?: string; statusAfter?: string }

export function runOracle(): OracleResult {
  if (!existsSync(ORACLE_ROOT) || !existsSync(path.join(ORACLE_ROOT, "src", "backtest", "py", "lending_accrual.py"))) {
    return { blocked: true, ok: false, detail: `oracle BLOCKED — the frozen monorepo is absent at ${ORACLE_ROOT} (expected on a fresh clone; set ORGANON_ORACLE_ROOT to enable). A blocked oracle is an honest state; a faked one is a Halt.` }
  }
  const statusBefore = gitStatus(ORACLE_ROOT)
  // run the monorepo sidecar READ-ONLY: python3 -m backtest.py.lending_accrual (stdlib-only; no venv, no network, no write)
  const r = spawnSync("python3", ["-m", "backtest.py.lending_accrual"], {
    cwd: path.join(ORACLE_ROOT, "src"),
    input: JSON.stringify(FIXTURE),
    encoding: "utf8",
    env: { ...process.env, PYTHONHASHSEED: "0" },
  })
  const statusAfter = gitStatus(ORACLE_ROOT)
  if (r.status !== 0) return { blocked: false, ok: false, detail: `oracle sidecar failed (exit ${r.status}): ${(r.stderr ?? "").slice(0, 500)}`, statusBefore, statusAfter }
  const out = JSON.parse(r.stdout) as { equity_curve: [number, number][] }
  const got = out.equity_curve
  const expected = handExpected()
  // structural + value equivalence: same length, same timestamps, values within IEEE-754 float tolerance of the hand math
  const structureOk = got.length === expected.length && got.every((p, i) => p[0] === expected[i][0])
  const valuesOk = got.every((p, i) => Math.abs(p[1] - expected[i][1]) < 1e-12)
  const cleanTree = statusBefore === statusAfter
  const ok = structureOk && valuesOk && cleanTree
  const detail = ok
    ? `oracle JUDGES CORRECTLY — the monorepo lending engine reproduces the hand-verified 1.0001-per-day compounding (${got.length} points, last=${got[got.length - 1][1]}); the old tree is UNCHANGED (git status identical before/after)`
    : `oracle MISMATCH — structure=${structureOk} values=${valuesOk} cleanTree=${cleanTree}`
  return { blocked: false, ok, detail, expected, got, statusBefore, statusAfter }
}

if (import.meta.main) {
  const res = runOracle()
  console.log(`oracle root: ${ORACLE_ROOT}`)
  console.log(`git status BEFORE: ${JSON.stringify(res.statusBefore ?? "(n/a)")}`)
  console.log(`git status AFTER:  ${JSON.stringify(res.statusAfter ?? "(n/a)")}`)
  if (res.got) {
    console.log(`hand-verified expected: ${JSON.stringify(res.expected)}`)
    console.log(`oracle produced:        ${JSON.stringify(res.got)}`)
  }
  console.log(res.blocked ? `BLOCKED: ${res.detail}` : `${res.ok ? "OK ✓" : "FAIL ✗"}: ${res.detail}`)

  const out = {
    protocol: "oracle-v9",
    at: "2026-07-04",
    gate: "CENSUS-TRUE (the oracle limb)",
    rule: "D-DIFF — the frozen monorepo runs read-only as the differential oracle; it must prove it can JUDGE before the port trusts it (A′#9: zero old-tree writes)",
    oracleRoot: ORACLE_ROOT,
    fixture: FIXTURE,
    handVerified: { mechanism: "constant 3.65% APY → daily factor exactly 1.0001; three-day compounding; static full weight; no rebalance", dailyFactor: FACTOR, expectedLast: handExpected()[2][1] },
    expected: res.expected,
    got: res.got,
    oldTreeGitStatusBefore: res.statusBefore ?? null,
    oldTreeGitStatusAfter: res.statusAfter ?? null,
    oldTreeUnchanged: res.statusBefore === res.statusAfter,
    blocked: res.blocked,
    ok: res.ok,
    detail: res.detail,
  }
  writeFileSync(path.join(D, "oracle-v9.json"), JSON.stringify(out, null, 2) + "\n")
  console.log(`written: data/studio/oracle-v9.json`)
  // a BLOCKED oracle on a fresh clone is honest (exit 0 with the blocked state recorded); a MISMATCH on a present oracle is a failure
  process.exit(res.blocked || res.ok ? 0 : 1)
}
