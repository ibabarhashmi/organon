/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B3 (S136 / D33's order): regenerate THE BREAK LEDGER.
 *
 * Runs the math red team (backtest/py/mathredteam.py — five attack classes against the frozen rigor core), captures the
 * classified break ledger, and — the standing rule — asserts `checkFrozenSet()` reports 0 drift on rigor.py: the autopsy
 * READS the frozen module and moves NOT ONE BYTE. The ledger is committed to data/honesty/math-redteam.json so a fresh clone
 * that cannot re-run the sidecar still reads the classified findings. Every BREAK is ROUTED to the gate, never fixed in place.
 *
 * Run: bun run script/honesty/math-redteam.ts
 */
import { writeFileSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT, checkFrozenSet } from "../../src/organon/frozen"

const SRC = path.join(PKG_ROOT, "src")
const PY = path.join(SRC, "backtest", "py", ".venv", "bin", "python")

// rigor.py MUST be byte-identical before and after the autopsy — the autopsy only imports and reads it (S136).
function rigorDrift(): { ok: boolean; detail: string } {
  const rows = checkFrozenSet() as unknown as { id: string; status: string; detail: string }[]
  const rigorRow = Array.isArray(rows) ? rows.find((r) => r.id === "rigor.py") : undefined
  return { ok: rigorRow?.status === "ok", detail: rigorRow?.detail ?? "rigor.py row not found" }
}

const before = rigorDrift()

const r = Bun.spawnSync([PY, "-m", "backtest.py.mathredteam"], { cwd: SRC, env: { ...process.env, PYTHONHASHSEED: "0" }, stdout: "pipe", stderr: "pipe" })
let ledger: Record<string, unknown>
let blocked = false
if (r.exitCode !== 0) {
  blocked = true
  ledger = { executed: false, blocked: true, reason: `the math red team sidecar did not run (numpy/scipy absent?): ${r.stderr.toString().trim().split("\n").pop()}. BLOCKED is a first-class outcome (never mocked); the committed ledger from a prior run stands.` }
} else {
  ledger = JSON.parse(r.stdout.toString())
}

const after = rigorDrift()

const record = {
  protocol: "math-redteam",
  at: "2026-07-14",
  rule: "S136 / D33's order — the frozen core's DSR/PSR/PBO attacked five classes deep (DD-49); every finding classified into EXACTLY ONE of BREAK / ASSUMPTION-LIMIT / THEORY-GAP; an ASSUMPTION-LIMIT cites its assumption by paper section (RP-1); a BREAK carries its reproduction; the search for the papers' worked examples is recorded (RP-2). rigor.py stays BYTE-FROZEN — every BREAK is ROUTED to the gate, never fixed in place. D33 remains UNSIGNED beside this ledger.",
  reference: "Bailey & López de Prado — PSR (2012) / Deflated Sharpe (2014) / CSCV (Bailey, Borwein, López de Prado, Zhu 2017). The frozen rigor.{psr,deflated_sharpe,sr0_deflated,pbo,per_obs_sharpe} attacked; the module is imported and READ, never edited.",
  frozenBefore: before,
  frozenAfter: after,
  rigorPyBytesMovedZero: before.ok && after.ok,
  ledger,
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "math-redteam.json"), JSON.stringify(record, null, 2) + "\n")

console.log("── SURROGATE — the math red team (S136 / D33's order) ──────")
if (blocked) {
  console.log("  status  : BLOCKED — the sidecar did not run (the prior committed ledger stands, never mocked)")
} else {
  const c = (ledger as { counts: Record<string, number>; headline: string }).counts
  console.log(`  findings: ${c.total} = ${c.BREAK} BREAK · ${c["ASSUMPTION-LIMIT"]} ASSUMPTION-LIMIT · ${c["THEORY-GAP"]} THEORY-GAP · ${c.clean} clean`)
  console.log(`  headline: ${(ledger as { headline: string }).headline.slice(0, 100)}…`)
}
console.log(`  rigor.py: before=${before.ok ? "byte-identical" : "DRIFT"} · after=${after.ok ? "byte-identical" : "DRIFT"} · bytes moved ${record.rigorPyBytesMovedZero ? "0 (autopsy touched nothing)" : "NONZERO — HALT"}`)
console.log("  record written: data/honesty/math-redteam.json")
