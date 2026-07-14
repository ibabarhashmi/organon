/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 2: Verify.run() — the DERIVED verify object (X-REACH(c)).
 *
 * "A gate expected to be partially red is not a gate." And green is a DERIVED VALUE, never a typed word. This produces
 * the marker's verify slot as a STRUCTURED OBJECT — { exitCode, subchecks: [{name, status, detail}] } — read from the
 * real exit codes of the verify sub-checks, so no human sentence can assert a health the machine did not observe
 * (attack #6: the irony of a grep-wall forbidding the string "verify green" is total — the fix is to make green a value).
 *
 * The sub-checks mirror `./organon.sh verify`: (1) the deterministic evidence bundle reproduces (build-evidence --check —
 * the "no verdict moved" proof), (2) the frozen set is intact (checkFrozenSet 0 drift), and (optionally) (3) the curated
 * battery count matches the committed evidence. A caller that has a live battery count passes it in; the terminal marker
 * captures the full object at the sprint's close.
 */
import { spawnSync } from "node:child_process"
import { PKG_ROOT, checkFrozenSet } from "./frozen"

export namespace Verify {
  export type Status = "pass" | "fail" | "retired" | "blocked"
  export interface SubCheck { name: string; status: Status; detail: string }
  export interface Result { exitCode: number; subchecks: SubCheck[] }

  // ── SOCKET V37 (S114 / D54, G-2) — THE SUB-CHECK SET IS DECLARED AND STABLE ────────────────────────────────────────────
  // verify silently lost a sub-check between V35 (three) and V36 (two): the V36 generator called Verify.run without a battery
  // count, so `battery-count-matches-committed` — the one V35 spent a phase repairing under Rule XVII — vanished with no
  // deviation entry (X-DEVLEDGER: a silent deviation is a Halt). D54 RESTORES it; this DECLARED set is the contract, and
  // S114 fails if the full run's actual sub-checks ever diverge from it (G-2 never again).
  export const DECLARED_SUBCHECKS = ["evidence-bundle-reproduces", "frozen-set-intact", "battery-count-matches-committed"] as const

  // the sub-check names a FULL run (bundle + battery) must produce — a silent removal is caught by comparing to DECLARED.
  export function subcheckNames(r: Result): string[] {
    return r.subchecks.map((s) => s.name)
  }
  export function subcheckSetStable(r: Result): { ok: boolean; missing: string[]; extra: string[] } {
    const actual = new Set(subcheckNames(r))
    const declared = new Set<string>(DECLARED_SUBCHECKS)
    const missing = [...declared].filter((n) => !actual.has(n))
    const extra = [...actual].filter((n) => !declared.has(n))
    return { ok: missing.length === 0 && extra.length === 0, missing, extra }
  }

  export interface Options {
    // when provided, the curated battery-count sub-check is included (live vs committed evidence)
    battery?: { live: string; committed: string }
    // skip the (slower) evidence-bundle subprocess — used by fast unit tests that only exercise the shape
    skipBundle?: boolean
  }

  // exitCode is DERIVED: 0 iff every non-retired sub-check passed. A "retired" sub-check (X-REACH(c): a failing check
  // retired WITH disclosure) does not fail the gate but is recorded by name. A "blocked" sub-check DOES fail (an
  // absence is not a pass) unless the caller has explicitly chosen to treat it otherwise.
  export function exitCodeFrom(subchecks: SubCheck[]): number {
    return subchecks.some((s) => s.status === "fail" || s.status === "blocked") ? 1 : 0
  }

  export function run(opts: Options = {}): Result {
    const subchecks: SubCheck[] = []

    if (!opts.skipBundle) {
      const r = spawnSync("bun", ["run", "script/build-evidence.ts", "--check"], {
        cwd: PKG_ROOT, encoding: "utf8", timeout: 120_000,
        env: { ...process.env, GROQ_API_KEY: "", GOOGLE_AI_STUDIO_KEY: "", GEMINI_API_KEY: "", OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "" },
      })
      const out = (r.stdout || "") + (r.stderr || "")
      const shaM = out.match(/sha ([0-9a-f]{16})/)
      subchecks.push({
        name: "evidence-bundle-reproduces",
        status: r.status === 0 ? "pass" : "fail",
        detail: r.status === 0 ? `deterministic bundle reproduces (${shaM?.[1] ?? "sha ok"}); every claim + live number resolves; frozen seven git-clean` : `build-evidence --check exited ${r.status}: ${out.trim().split("\n").pop()?.slice(0, 200)}`,
      })
    }

    const fs = checkFrozenSet()
    const drift = fs.filter((c) => c.status === "drift")
    const ok = fs.filter((c) => c.status === "ok").length
    subchecks.push({
      name: "frozen-set-intact",
      status: drift.length === 0 ? "pass" : "fail",
      detail: drift.length === 0 ? `${ok}/${fs.length} present & byte-identical, 0 drift (${fs.length - ok} absent on a clone, named)` : `DRIFT: ${drift.map((d) => d.id).join(", ")}`,
    })

    if (opts.battery) {
      const match = opts.battery.live === opts.battery.committed
      subchecks.push({
        name: "battery-count-matches-committed",
        status: match ? "pass" : "fail",
        detail: match ? `curated battery ${opts.battery.live} == committed evidence ${opts.battery.committed}` : `curated battery ${opts.battery.live} ≠ committed evidence ${opts.battery.committed} — regenerate + re-pin (DD-10)`,
      })
    }

    return { exitCode: exitCodeFrom(subchecks), subchecks }
  }

  // ── S95 predicate ───────────────────────────────────────────────────────────────────────────────────────────────

  // S95 — a marker may not TYPE the word green for a command whose exit code was non-zero. The derived object is the
  // authority; the prose must not contradict it. Returns the violation reason, or null when consistent.
  export function greenConsistency(verify: Result, prose: string): string | null {
    if (verify.exitCode !== 0 && /\bgreen\b/i.test(prose))
      return `the marker types "green" but the verify object's exitCode is ${verify.exitCode} (failing sub-checks: ${verify.subchecks.filter((s) => s.status === "fail" || s.status === "blocked").map((s) => s.name).join(", ")}) — X-REACH(c): green is a derived value, not a typed word`
    return null
  }
}
