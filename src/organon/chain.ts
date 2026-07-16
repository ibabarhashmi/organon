/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 3: CRASH-SAFE, IDEMPOTENT APPEND (S200, D94; P-10/P-11/DD-96/DD-98).
 *
 * THE DIAGNOSIS (P-10/P-11, standing since V42): the append-only chains (record/chain.json, the moat segments) were written
 * with whole-file overwrites and un-fsync'd appends. A kill -9 mid-append could leave a torn JSONL line, and recovery was
 * unspecified; the same block captured twice could double a point. The moat is append-only — even in recovery it must never
 * delete, only quarantine.
 *
 * THE MECHANISM (DD-98) — generalized from the proven src/studio/durable.ts pattern: an ATOMIC APPEND SEGMENT (an .jsonl
 * beside the index) written with openSync(O_APPEND) + appendFileSync + fsyncSync BEFORE the write is acknowledged (the
 * durability barrier). A ≤PIPE_BUF line under O_APPEND is atomic (all-or-nothing) on POSIX/Bun. verifyAndRecover() walks the
 * segment, verifies the hash-links, QUARANTINES a torn tail to `.torn` (NEVER deletes), and returns the recovered chain.
 *
 * THE PROOF IS A REAL KILL-TEST (RP-2): append() self-kills (process.kill(pid, SIGKILL) — a real kill -9) at N pinned
 * injection points DERIVED from the mechanism's own steps (before-open, after-open-before-write, after-write-before-fsync,
 * after-fsync-before-index). A harness spawns the subprocess at each seam; verifyAndRecover must recover from every one, then
 * the verb resumes. One kill is an anecdote; a kill at every seam is a proof shape.
 *
 * IDEMPOTENCY (DD-96): the content hash is sha256(subject | blockOrRound | value). An identical observation is DEDUPED (not
 * re-chained) with disclosure; a CONFLICTING observation (same {subject, blockOrRound}, DIFFERENT value — impossible for
 * finalized state) is a HALT-grade integrity alarm, rendered loudly, never silently resolved.
 */
import { appendFileSync, closeSync, existsSync, fsyncSync, openSync, readFileSync, writeFileSync } from "node:fs"
import { createHash } from "node:crypto"

export namespace Chain {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  export const GENESIS = "GENESIS"

  export interface Obs { subject: string; blockOrRound: string | number; value: string; meta?: Record<string, unknown> }
  export interface Entry { seq: number; subject: string; blockOrRound: string | number; value: string; payloadSha: string; prevSha: string; selfSha: string; meta?: Record<string, unknown> }

  export function payloadShaOf(o: Obs): string { return sha256(`${o.subject}|${o.blockOrRound}|${o.value}`) }
  export function selfShaOf(prevSha: string, payloadSha: string): string { return sha256(`${prevSha}|${payloadSha}`) }

  // the DERIVED injection seams — enumerated from the mechanism's OWN step sequence (RP-2). If the mechanism has four steps,
  // there are four kill-tests; the harness runs one subprocess per seam.
  export const KILL_SEAMS = ["before-open", "after-open-before-write", "after-write-before-fsync", "after-fsync-before-index"] as const
  export type KillSeam = (typeof KILL_SEAMS)[number]
  function maybeKill(killAt: string | undefined, seam: KillSeam) {
    if (killAt === seam) {
      // a REAL kill -9 on THIS process at this exact seam (SIGKILL is uncatchable — no cleanup runs, exactly like a crash)
      process.kill(process.pid, "SIGKILL")
    }
  }

  // read + parse the atomic append segment (one JSON entry per line). A torn/garbage line throws (caught by verifyAndRecover).
  export function readSegment(segmentPath: string): Entry[] {
    if (!existsSync(segmentPath)) return []
    const raw = readFileSync(segmentPath, "utf8")
    return raw.split("\n").filter((l) => l.trim().length > 0).map((l) => JSON.parse(l) as Entry)
  }
  export function tail(segmentPath: string): Entry | null {
    const es = readSegment(segmentPath)
    return es.length ? es[es.length - 1] : null
  }

  // ── Chain.append — idempotent, atomic, kill-instrumented. Returns CHAINED | DEDUPED | CONFLICT-HALT. ──
  export type AppendResult =
    | { kind: "CHAINED"; entry: Entry; disclosure: string }
    | { kind: "DEDUPED"; existing: Entry; disclosure: string }
    | { kind: "CONFLICT-HALT"; existing: Entry; incomingValue: string; alarm: string }
  export function append(segmentPath: string, obs: Obs, killAt?: string): AppendResult {
    const existing = readSegment(segmentPath)
    const payloadSha = payloadShaOf(obs)
    // DEDUPE — an identical observation (same content hash) is recognized, not re-chained.
    const dup = existing.find((e) => e.payloadSha === payloadSha)
    if (dup) return { kind: "DEDUPED", existing: dup, disclosure: `${obs.subject} @ ${obs.blockOrRound} already chained (sha ${payloadSha.slice(0, 12)}…) — nothing appended (idempotent, DD-96)` }
    // CONFLICT — same {subject, blockOrRound}, different value: impossible for finalized state; a loud HALT, never resolved.
    const conflict = existing.find((e) => e.subject === obs.subject && String(e.blockOrRound) === String(obs.blockOrRound) && e.value !== obs.value)
    if (conflict) return { kind: "CONFLICT-HALT", existing: conflict, incomingValue: obs.value, alarm: `INTEGRITY ALARM (HALT) — ${obs.subject} @ ${obs.blockOrRound} is already chained with value "${conflict.value}" but a DIFFERENT value "${obs.value}" arrived; finalized state cannot change — this is a fork attempt or a corrupted read, NEVER silently resolved (DD-96)` }

    const prevSha = existing.length ? existing[existing.length - 1].selfSha : GENESIS
    const entry: Entry = { seq: existing.length, subject: obs.subject, blockOrRound: obs.blockOrRound, value: obs.value, payloadSha, prevSha, selfSha: selfShaOf(prevSha, payloadSha), meta: obs.meta }
    const line = JSON.stringify(entry) + "\n"

    // THE ATOMIC APPEND, step by step — a kill at any seam is recoverable (RP-2).
    maybeKill(killAt, "before-open") // nothing written; the prior committed tail is intact
    const fd = openSync(segmentPath, "a")
    try {
      maybeKill(killAt, "after-open-before-write") // fd open, line not written; the append is atomic, all-or-nothing
      appendFileSync(fd, line)
      maybeKill(killAt, "after-write-before-fsync") // the line is in the OS buffer (present on a process-kill), not yet durable
      fsyncSync(fd) // the durability barrier — on stable storage before acknowledge
    } finally {
      closeSync(fd)
    }
    maybeKill(killAt, "after-fsync-before-index") // the line is durable; the INDEX (chain.json) is not yet rebuilt — recovery rebuilds it
    return { kind: "CHAINED", entry, disclosure: `${obs.subject} @ ${obs.blockOrRound} chained (seq ${entry.seq}, self ${entry.selfSha.slice(0, 12)}…)` }
  }

  // ── Chain.verifyAndRecover — walks the segment, verifies every hash-link, QUARANTINES a torn tail to `.torn` (NEVER
  // deletes), and returns the recovered chain. A break in the MIDDLE (not the tail) is surfaced loudly (a hand-edited history
  // is not silently recoverable). ──
  export type Recovery =
    | { kind: "OK"; entries: number; head: string }
    | { kind: "TORN"; quarantined: { line: string; reason: string }; recovered: number; head: string }
    | { kind: "CORRUPT-MIDDLE"; at: number; reason: string }
  export function verifyAndRecover(segmentPath: string): Recovery {
    if (!existsSync(segmentPath)) return { kind: "OK", entries: 0, head: GENESIS }
    const raw = readFileSync(segmentPath, "utf8")
    const lines = raw.split("\n").filter((l) => l.trim().length > 0)
    if (lines.length === 0) return { kind: "OK", entries: 0, head: GENESIS }

    // parse + hash-link-verify every line; find the first break.
    const parsed: (Entry | null)[] = lines.map((l) => { try { return JSON.parse(l) as Entry } catch { return null } })
    let prevSha = GENESIS
    let firstBreak = -1
    let breakReason = ""
    for (let i = 0; i < parsed.length; i++) {
      const e = parsed[i]
      if (!e) { firstBreak = i; breakReason = "unparseable JSON (a torn write)"; break }
      const expectSelf = selfShaOf(e.prevSha, e.payloadSha)
      if (e.prevSha !== prevSha) { firstBreak = i; breakReason = `broken link: prevSha ${String(e.prevSha).slice(0, 12)}… ≠ the prior entry's selfSha ${prevSha.slice(0, 12)}…`; break }
      if (e.selfSha !== expectSelf) { firstBreak = i; breakReason = `bad selfSha: ${String(e.selfSha).slice(0, 12)}… ≠ sha256(prev|payload) ${expectSelf.slice(0, 12)}…`; break }
      prevSha = e.selfSha
    }

    if (firstBreak === -1) return { kind: "OK", entries: parsed.length, head: prevSha }
    // a break at the LAST line → a torn tail (a crash mid-append): quarantine it, keep the valid prefix. NEVER delete.
    if (firstBreak === parsed.length - 1) {
      const torn = lines[firstBreak]
      const kept = lines.slice(0, firstBreak)
      appendFileSync(`${segmentPath}.torn`, torn + "\n") // quarantine — the torn line is PRESERVED, never deleted
      writeFileSync(segmentPath, kept.join("\n") + (kept.length ? "\n" : ""))
      return { kind: "TORN", quarantined: { line: torn.slice(0, 120), reason: breakReason }, recovered: kept.length, head: kept.length ? (JSON.parse(kept[kept.length - 1]) as Entry).selfSha : GENESIS }
    }
    // a break in the MIDDLE is NOT a crash-torn tail — a hand-edited history. Surface loudly; do not silently recover.
    return { kind: "CORRUPT-MIDDLE", at: firstBreak, reason: `${breakReason} at entry ${firstBreak} of ${parsed.length} — a break in the middle of the chain (not the tail) is a tampered history, not a crash; it is surfaced, never silently recovered` }
  }

  // rebuild the DERIVED index (a compact JSON summary) from the verified segment — the "after-fsync-before-index" recovery.
  export interface Index { head: string; count: number; entries: { seq: number; subject: string; blockOrRound: string | number; selfSha: string }[] }
  export function rebuildIndex(segmentPath: string): Index {
    const es = readSegment(segmentPath)
    return { head: es.length ? es[es.length - 1].selfSha : GENESIS, count: es.length, entries: es.map((e) => ({ seq: e.seq, subject: e.subject, blockOrRound: e.blockOrRound, selfSha: e.selfSha })) }
  }
}
