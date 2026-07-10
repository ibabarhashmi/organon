/**
 * ORGΛNON — the continuity-log resolver (AB7/DISC-1, D22). The sprint BUILDLOGs under sprint/sprint-result/ were
 * dev-time working files that were NEVER committed (no git history exists for them), so a pristine clone cannot read
 * them — 7 continuity tests were permanently red on arrival. The repo's own precedent for clone-absent artifacts
 * (honesty_record's "gitignored (fresh clone)" pattern) applies: when the log is PRESENT the caller asserts its
 * content in full; when ABSENT the absence must itself be RECORDED in the alpha audit's discrepancy list (DISC-1) —
 * a missing log on a clone that has NOT recorded the discrepancy still FAILS. Honest absence, never a silent skip.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../../src/organon/frozen"

export function continuityLog(rel: string): string | null {
  const abs = path.join(PKG_ROOT, rel)
  if (existsSync(abs)) return readFileSync(abs, "utf8")
  // the absence must be a RECORDED discrepancy, not a shrug — DISC-1 in the alpha audit names exactly this state
  const audit = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "alpha-audit.json"), "utf8"))
  const disc1 = (audit.discrepancies as { id: string; tree: string }[]).find((d) => d.id === "DISC-1")
  if (!disc1 || !/never-committed sprint\/sprint-result\/BUILDLOG/.test(disc1.tree)) {
    throw new Error(`${rel} is absent AND the absence is not recorded as DISC-1 in data/honesty/alpha-audit.json — an unrecorded gap is a fail, not a skip`)
  }
  console.log(`  (continuity) ${rel} — never committed (fresh clone); the absence is recorded as DISC-1 (alpha audit); the content assertions apply where the log exists`)
  return null
}
