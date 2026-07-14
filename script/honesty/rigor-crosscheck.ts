/**
 * ORGΛNON — THE REACH SPRINT (V35), S94: regenerate the FROZEN-CORE CROSS-CHECK record.
 *
 * X-REACH(b) + X-SHOWN(e): the cross-check EXECUTES (Rigor.crossCheck → the frozen rigor math vs the independent purgedcv
 * oracle), and its numeric output is committed to data/honesty/rigor-crosscheck.json so the EVIDENCE survives the
 * environment — a fresh clone that cannot re-run it (purgedcv not yet provisioned) still reads the record. When the env
 * CAN run it, the S94 wall re-executes live and asserts agreement (executed, shown). BLOCKED is a first-class outcome:
 * if purgedcv is absent this writes the honest red with its actionable reason — NEVER a mock (attack #2).
 *
 * Run: bun run script/honesty/rigor-crosscheck.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rigor } from "../../src/backtest/rigor"

const cc = Rigor.crossCheck()
const record = {
  protocol: "rigor-crosscheck",
  at: "2026-07-14",
  rule: "S94 — the frozen core's DSR/PSR/PBO cross-check EXECUTED against the INDEPENDENT purgedcv oracle. Never mocked (RP-2): a BLOCKED result carries its actionable reason. The numbers are a RECORD OF EXECUTION (env-stamped), not a determinism golden — a re-run on different BLAS may shift the low bits; the load-bearing claim is dsrAgree (|DSR_rigor − DSR_purgedcv| < 0.02) and executed=true.",
  reference: "Bailey & López de Prado — the Deflated Sharpe Ratio 'incorporates information about the unselected trials'; the frozen rigor.deflated_sharpe (sha-pinned in frozen.ts) is cross-checked against purgedcv==0.1.2 on a golden-noise universe (true Sharpe 0, seed 20260627, T=504, N=1000) identical to selftest.py's k==0 construction.",
  crossCheck: cc,
  frozenNote: "not one .py byte moved — S94 installs the sidecar's MISSING dependency (purgedcv), it edits no frozen byte; checkFrozenSet asserts 0 DRIFT on rigor.py.",
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "rigor-crosscheck.json"), JSON.stringify(record, null, 2) + "\n")

console.log("── REACH — the frozen-core cross-check (S94) ───────────────")
if (Rigor.isBlocked(cc)) {
  console.log(`  status : BLOCKED — ${cc.reason}`)
} else {
  console.log(`  status : EXECUTED`)
  console.log(`  DSR    : rigor=${cc.dsr.toFixed(6)} · purgedcv=${cc.dsrPurgedcv.toFixed(6)} · |Δ|=${cc.dsrDiff.toExponential(2)} · agree=${cc.dsrAgree}`)
  console.log(`  PSR(0) : ${cc.psr.toFixed(6)} · PBO=${cc.pbo.toFixed(4)} · deflation-collapse=${cc.deflationCollapse.toFixed(4)}`)
  console.log(`  DSR↓   : n10=${cc.dsrByNTrials.n10.toFixed(4)} > n100=${cc.dsrByNTrials.n100.toFixed(4)} > n1000=${cc.dsrByNTrials.n1000.toFixed(4)} (monotonic=${cc.dsrMonotonic})`)
  console.log(`  env    : purgedcv ${cc.purgedcvVersion} · numpy ${cc.numpyVersion}`)
}
console.log("  record written: data/honesty/rigor-crosscheck.json")
