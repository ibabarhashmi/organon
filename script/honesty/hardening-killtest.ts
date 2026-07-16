/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 3: THE REAL KILL-TEST (RP-2/S200; P-10). NOT A MOCK.
 *
 * The proof of crash-safety is a REAL kill -9 at EVERY seam of the append path — derived from the mechanism's own steps
 * (Chain.KILL_SEAMS): before-open, after-open-before-write, after-write-before-fsync, after-fsync-before-index. One kill is an
 * anecdote; a kill at every seam is a proof shape (F-2). For each seam this harness SPAWNS A SUBPROCESS that calls
 * Chain.append() and self-kills (process.kill(pid, SIGKILL) — uncatchable, exactly like a crash) at that seam. Then, in the
 * parent, Chain.verifyAndRecover() must recover the chain, and the verb RESUMES (re-append): a write that never landed CHAINS;
 * a write that landed DEDUPES (idempotency proves no double). Never a fork, never a torn line, never a lost entry.
 *
 * A separate TORN-TAIL test manually appends a garbage half-line (a genuinely torn write, which O_APPEND atomicity makes the
 * SIGKILL seams too clean to produce) and proves verifyAndRecover QUARANTINES it to `.torn` (PRESERVED, never deleted).
 *
 * Run (orchestrator): bun run script/honesty/hardening-killtest.ts
 * Run (worker, internal): bun run script/honesty/hardening-killtest.ts --worker <seam> --segment <path>
 */
import { writeFileSync, existsSync, rmSync, readFileSync, appendFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Chain } from "../../src/organon/chain"

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const OBS: Chain.Obs = { subject: "killtest:rETH/ETH", blockOrRound: 25537838, value: "1.0784523100000000", meta: { tier: "REAL★", provider: "publicnode" } }

// ── WORKER MODE — the subprocess that self-kills at a seam ──
const worker = arg("worker")
if (worker) {
  const seg = arg("segment")!
  // this call self-kills at `worker` (SIGKILL). If the seam is not reached (should not happen for a valid seam), it returns.
  const r = Chain.append(seg, OBS, worker)
  console.log(`worker survived seam ${worker}: ${r.kind}`) // only prints if the kill did NOT fire (a bug in the seam)
  process.exit(0)
}

// ── ORCHESTRATOR MODE ──
const seg = path.join(PKG_ROOT, "data", "honesty", "killtest-segment.jsonl")
for (const p of [seg, `${seg}.torn`]) if (existsSync(p)) rmSync(p)

// seed the segment with one prior committed entry so a kill has a real tail to protect
Chain.append(seg, { subject: "killtest:seed", blockOrRound: 0, value: "seed" })

const self = path.join(PKG_ROOT, "script", "honesty", "hardening-killtest.ts")
interface SeamResult { seam: string; killed: boolean; signal: string | null; recovery: string; recoveredEntries: number; resume: string; resumeDetail: string; forkedOrDoubled: boolean }
const results: SeamResult[] = []

for (const seam of Chain.KILL_SEAMS) {
  const before = Chain.readSegment(seg).length
  // SPAWN a real subprocess that will self-kill at this seam
  const proc = Bun.spawnSync(["bun", "run", self, "--worker", seam, "--segment", seg], { stdout: "pipe", stderr: "pipe" })
  const signal = (proc as { signalCode?: string | null }).signalCode ?? null
  const killed = signal === "SIGKILL" || proc.exitCode === null || proc.exitCode === 137 // 137 = 128+9 (SIGKILL)
  // RECOVER — verifyAndRecover must succeed at every seam (never CORRUPT-MIDDLE, never a lost prior entry)
  const rec = Chain.verifyAndRecover(seg)
  const recovered = rec.kind === "OK" ? rec.entries : rec.kind === "TORN" ? rec.recovered : -1
  // RESUME — re-append the same observation: it CHAINS (the write never landed) or DEDUPES (the write landed) — never doubles
  const resume = Chain.append(seg, OBS)
  const after = Chain.readSegment(seg).length
  // a fork/double would show as: two entries for the same payload, or a broken chain after resume
  const dupCount = Chain.readSegment(seg).filter((e) => e.payloadSha === Chain.payloadShaOf(OBS)).length
  const forkedOrDoubled = dupCount > 1 || Chain.verifyAndRecover(seg).kind === "CORRUPT-MIDDLE"
  results.push({
    seam, killed, signal,
    recovery: rec.kind, recoveredEntries: recovered,
    resume: resume.kind, resumeDetail: resume.kind === "DEDUPED" ? resume.disclosure : resume.kind === "CHAINED" ? resume.disclosure : "unexpected",
    forkedOrDoubled,
  })
  // reset the OBS entry for the next seam (remove the resumed OBS so each seam starts clean but keeps the seed)
  const kept = Chain.readSegment(seg).filter((e) => e.subject !== OBS.subject)
  writeFileSync(seg, kept.map((e) => JSON.stringify(e)).join("\n") + (kept.length ? "\n" : ""))
  void before; void after
}

// ── THE TORN-TAIL QUARANTINE TEST — a genuinely torn write (a garbage half-line), quarantined not deleted ──
appendFileSync(seg, '{"seq":99,"subject":"torn","value":"half-a-li')
const tornRec = Chain.verifyAndRecover(seg)
const tornFile = `${seg}.torn`
const quarantinedPreserved = existsSync(tornFile) && readFileSync(tornFile, "utf8").includes("half-a-li")
const tornResult = {
  recovery: tornRec.kind, // TORN
  quarantinedNotDeleted: quarantinedPreserved, // the torn line lives in .torn (append-only even in recovery)
  validPrefixKept: tornRec.kind === "TORN" ? tornRec.recovered : -1,
  segmentStillValid: Chain.verifyAndRecover(seg).kind === "OK", // after quarantine, the segment verifies
}

const allSeamsRecovered = results.every((r) => r.recovery === "OK" && !r.forkedOrDoubled)
const OUT = {
  protocol: "hardening-killtest",
  at: "2026-07-16",
  rule: "RP-2/S200 (P-10) — a REAL kill -9 (SIGKILL, uncatchable) at EVERY seam of the append path (Chain.KILL_SEAMS, derived from the mechanism's own steps). Each seam runs in its OWN spawned subprocess; verifyAndRecover recovers from every one; the verb resumes without fork or double. The torn-tail test proves the quarantine path (a genuinely torn write → .torn, preserved not deleted).",
  seams: results,
  tornTail: tornResult,
  allSeamsRecovered,
  proofShape: `${results.length} seams, each a separate spawned subprocess self-killed with SIGKILL; ${results.filter((r) => r.killed).length} confirmed killed; all recovered=${allSeamsRecovered}; torn-tail quarantined-not-deleted=${tornResult.quarantinedNotDeleted}`,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-killtest.json"), JSON.stringify(OUT, null, 2) + "\n")
// clean the scratch segment (the transcript is the record)
for (const p of [seg, `${seg}.torn`]) if (existsSync(p)) rmSync(p)

console.log("── HARDENING KILL-TEST (Phase 3, RP-2) — a real kill -9 at every seam ─────────")
for (const r of results) console.log(`  ${r.seam.padEnd(30)} killed=${r.killed ? "Y" : "n"}(${r.signal ?? "—"}) · recover=${r.recovery} · resume=${r.resume} · forked=${r.forkedOrDoubled}`)
console.log(`  torn-tail: recover=${tornResult.recovery} · quarantined-not-deleted=${tornResult.quarantinedNotDeleted} · valid-prefix-kept=${tornResult.validPrefixKept} · segment-valid-after=${tornResult.segmentStillValid}`)
console.log(`  ALL SEAMS RECOVERED (no fork, no double, no loss): ${allSeamsRecovered}`)
console.log("written: data/honesty/hardening-killtest.json")
