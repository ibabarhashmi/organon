/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 3: Clone.pristine — THE FRESH CLONE, RUN AT LAST (S103).
 *
 * E-4: the pristine fresh-clone run was PROMOTED at D44 (V33) and never once executed — the only test of RP-2's durable
 * fix ("S94's green survives a fresh clone"), of the census's clone-stability, and of the frozen set's 7/9. The one class of
 * failure V35 existed to end is the one class it did not test against. This reads the transcript of a REAL clone (git clone
 * the LOCAL tree into an empty dir, HOME/PATH scrubbed of ORGΛNON state, no pre-existing venv → ./organon.sh setup → verify
 * → the full battery, from zero), written by script/honesty/pristine-clone.ts and committed.
 *
 * RP-6 (F-6): a clone of the LOCAL tree proves the tree is SELF-CONTAINED. It does NOT prove a STRANGER can build it (that
 * needs the published remote, the correct Bun, a clean OS, no cached ~/.bun). The strongest claim available is
 * "self-contained", and X-SHOWN(b) renders anything stronger NOT HELD — the transcript states both. NEVER simulated (DD-19):
 * a red S103 with a precise, checkable blocker is worth more than a green one that lied.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"

export namespace Clone {
  export interface Transcript {
    protocol: "pristine-clone"
    clonedCommit: string
    method: string
    setup: { exitCode: number; provisionedCrossCheck: boolean; detail: string }
    verify: { exitCode: number; detail: string }
    battery: { pass: number; skip: number; fail: number; files: number }
    proves: string
    doesNotProve: string
    blocker?: string // when the clone genuinely could not run — named in ONE checkable sentence (DD-19)
  }

  export function transcript(): Transcript | null {
    const p = path.join(PKG_ROOT, "data", "honesty", "pristine-clone.json")
    return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Transcript) : null
  }

  export type Result =
    | { ran: true; exitCode: number; verify: number; battery: Transcript["battery"]; proves: string; doesNotProve: string }
    | { ran: false; reason: string }

  // Clone.pristine() — the convergence proof, run from zero. Returns ran:false with a reason when the transcript is absent
  // (the clone has not been executed) or names a blocker; ran:true with verify's exit code + the battery ON THE CLONE.
  export function pristine(): Result {
    const t = transcript()
    if (!t) return { ran: false, reason: "the pristine-clone transcript is absent — the clone has not been executed in this tree" }
    if (t.blocker) return { ran: false, reason: t.blocker }
    // the clone RAN: exitCode is the max of setup/verify (a non-zero anywhere is a red)
    const exitCode = t.setup.exitCode !== 0 ? t.setup.exitCode : t.verify.exitCode !== 0 ? t.verify.exitCode : t.battery.fail > 0 ? 1 : 0
    return { ran: true, exitCode, verify: t.verify.exitCode, battery: t.battery, proves: t.proves, doesNotProve: t.doesNotProve }
  }

  // FAMILY V39 (S144 / J-6) — a STALE clone battery FAILS. V38's verifyOnClone carried V37's number (1668) — a clone that
  // never re-ran on the new tree. The teeth: the recorded clone's commit must match THIS terminal commit; a transcript whose
  // clonedCommit differs from the current terminal commit is STALE (its battery is a prior sprint's). Pure predicate — a
  // seeded stale commit is caught. (The LIVE freshness is proven at Phase 7 by re-running the clone on THIS tree.)
  export function staleAgainst(clonedCommit: string | null | undefined, terminalCommit: string): boolean {
    if (!clonedCommit) return true // no clone recorded → cannot claim a fresh clone (stale by default, never a silent green)
    return clonedCommit !== terminalCommit
  }
}
