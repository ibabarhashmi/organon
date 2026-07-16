/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 7: the artifact-reading gate verdicts (S199/S200/S203/S206/S207-cleanmachine).
 *
 * The live-producer walls (S198 State.oneState, S201 Rpc, S204 GuardAggregate, S205 Sidecar, S207 Docs, S209 Registry) verdict
 * themselves from their own modules. The EXECUTED-EVIDENCE walls (the empty-state render, the real kill-test, the workflow
 * transcripts, the binary parity, the clean-machine test) leave a committed transcript; this module reads each and returns a
 * gate verdict, so the Ship Gate refuses the log if any is absent or red. The transcript IS the record (X-SHOWN).
 *
 * Pure: reads the committed data/honesty/hardening-*.json. No network, no execution (the scripts execute; this reads).
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"

export namespace Hardening {
  const H = path.join(PKG_ROOT, "data", "honesty")
  function tryRead(name: string): Record<string, unknown> | null { try { return JSON.parse(readFileSync(path.join(H, name), "utf8")) } catch { return null } }
  export type Verdict = { ok: true; detail: string } | { ok: false; reason: string }

  // S199 — the empty-state render has no bare verdict word (every UNJUDGEABLE carries why + path).
  export function emptyState(): Verdict {
    const j = tryRead("hardening-emptystate.json")
    if (!j) return { ok: false, reason: "the empty-state transcript (hardening-emptystate.json) is absent — run script/honesty/hardening-emptystate.ts (S199)" }
    if (!j.ok) return { ok: false, reason: `the empty state has ${(j.bareRenders as unknown[]).length} bare verdict render(s) with no why/path — a hostile empty state (S199/P-12)` }
    return { ok: true, detail: `${j.verdictWordsChecked} verdict words in the empty-state render, 0 bare — each carries its why + path to judgeable (S199); limits render at point of use (P-17)` }
  }

  // S200 — the REAL kill-test recovered from every seam; the torn tail was quarantined, never deleted (P-10/P-11/S208).
  export function crashSafety(): Verdict {
    const j = tryRead("hardening-killtest.json")
    if (!j) return { ok: false, reason: "the kill-test transcript (hardening-killtest.json) is absent — run script/honesty/hardening-killtest.ts (S200)" }
    if (!j.allSeamsRecovered) return { ok: false, reason: `a kill-seam did NOT recover (or a chain forked/doubled) — crash-safety is unproven (S200/RP-2)` }
    const tt = j.tornTail as { quarantinedNotDeleted: boolean; recovery: string }
    if (!tt.quarantinedNotDeleted) return { ok: false, reason: `a torn tail was NOT quarantined-not-deleted (recovery ${tt.recovery}) — the moat must be append-only even in recovery (S200)` }
    const seams = (j.seams as { seam: string }[]).length
    return { ok: true, detail: `a real kill -9 at ${seams} seams, every one recovered (no fork, no double, no loss); the torn tail quarantined to .torn, never deleted (S200/RP-2/P-10/P-11/S208)` }
  }

  // S203 — every workflow executed as a transcript, failure paths included; realLineageCount 0 (AGENT-labeled).
  export function workflows(): Verdict {
    const j = tryRead("hardening-workflows.json")
    if (!j) return { ok: false, reason: "the workflow transcripts (hardening-workflows.json) are absent — run script/honesty/hardening-workflows.ts (S203)" }
    if (!j.allRan) return { ok: false, reason: `a workflow did not run — not every path a second human would walk is transcripted (S203/P-13)` }
    if (!j.allFailurePathsExercised) return { ok: false, reason: `a workflow has no failure-path transcript — a workflow without its failure path is not validated (X-SHOWN(b), S203)` }
    if (j.realLineageCount !== 0) return { ok: false, reason: `realLineageCount is ${j.realLineageCount}, not 0 — the agent cannot claim a stranger walked the door (RP-6/A′#4)` }
    return { ok: true, detail: `${(j.workflows as unknown[]).length} workflows executed with failure paths (X-SHOWN(b)); realLineageCount 0 (AGENT-labeled, BY DESIGN); the door opens, no stranger's footprint claimed (S203/P-13)` }
  }

  // S206 — the binary is byte-equal to the source after the pinned normalization; a seeded divergence is caught.
  export function binaryParity(): Verdict {
    const j = tryRead("hardening-binary.json")
    if (!j) return { ok: false, reason: "the binary-parity transcript (hardening-binary.json) is absent — run script/honesty/hardening-binary.ts (S206)" }
    if (!j.equalAfterNorm) return { ok: false, reason: `the binary is NOT byte-equal to the source after the pinned normalization — ${j.note} (S206/P-15)` }
    if (!j.seededDivergenceCaught) return { ok: false, reason: `the seeded divergence was NOT caught — a comparison that cannot fail is not a check (S206/RP-4)` }
    return { ok: true, detail: `the binary IS the source, byte-for-byte after the pinned normalization (${j.sourceLen}b); a seeded real divergence is CAUGHT (the comparison can fail) — S206/P-15/RP-4` }
  }

  // S207 (clean-machine half) — the clean-machine test showed its absence checks (a warm cache disclosed, never hidden); the
  // README path (clone → install → check → first-run → the doc present) works. docPresent is only true on the committed tree.
  export function cleanMachine(): Verdict {
    const j = tryRead("hardening-cleanmachine.json")
    if (!j) return { ok: false, reason: "the clean-machine transcript (hardening-cleanmachine.json) is absent — run script/honesty/hardening-cleanmachine.ts (RP-3)" }
    if (!j.absenceChecksShown) return { ok: false, reason: `the clean-machine transcript does NOT show its absence checks — it is a warm-folder test, not a clean-machine test (F-3/RP-3)` }
    const rm = j.readmeVerbatim as { cloned: boolean; firstRunOk: boolean; docPresent: boolean }
    if (!rm.cloned || !rm.firstRunOk || !rm.docPresent) return { ok: false, reason: `the README path stumbled — cloned:${rm.cloned} firstRun200:${rm.firstRunOk} docPresent:${rm.docPresent} (each stumble is a P-entry; docPresent requires the committed tree) (RP-3)` }
    return { ok: true, detail: `the clean-machine test SHOWED its absence checks (warm caches disclosed, never hidden); the README path clone → install → check → first-run → doc-present WORKS — readiness (the machinery survives a stranger's path), not user-testing (RP-3/DD-99)` }
  }
}
