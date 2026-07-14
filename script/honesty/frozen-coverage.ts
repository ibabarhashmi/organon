/**
 * ORGΛNON — THE REACH SPRINT (V35), DD-16 / C-6: what would close checkFrozenSet 7/9 → 9/9, or the honest impossibility.
 *
 * The 2 absent frozen artifacts (RWA-VERDICT.md, data/snapshot/MANIFEST.json) carry their pinned golden SHA in frozen.ts
 * but no artifact to hash on a clone. DD-2 (V34) took the shrunk 7/9 claim; DD-16 follows through: can it be closed?
 *
 * The honest answer is NO — closing it would VIOLATE A BOUNDARY, and the pinned golden SHAs are therefore the entire
 * checkable record (R-6). This states it (X-SHOWN(e): a proof that silently covers 7 of 9 is a proof that lies by omission).
 *
 * Run: bun run script/honesty/frozen-coverage.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT, checkFrozenSet } from "../../src/organon/frozen"

const fs = checkFrozenSet()
const absent = fs.filter((c) => c.status === "absent")
const ok = fs.filter((c) => c.status === "ok")

const record = {
  protocol: "frozen-set-coverage",
  at: "2026-07-14",
  rule: "DD-16 / C-6 — state what would close checkFrozenSet 7/9 → 9/9, or record the honest impossibility (R-6).",
  coverage: `${ok.length}/${fs.length}`,
  present: ok.map((c) => c.id),
  absent: absent.map((c) => c.id),
  perAbsent: {
    "RWA-VERDICT.md": {
      whatWouldClose: "committing the generated RWA-VERDICT.md as a fixture so a clone has an artifact to hash",
      canClose: false,
      why: "its GENERATOR (script/rwa-verdict.ts) lives ONLY in the full monorepo — it is never generated in the standalone, so RWA-VERDICT.md is always absent on a clone. Committing a monorepo-generated file into the standalone imports a foreign artifact across the module boundary (wrong), and F-ENV forbids re-pinning the settled NO-GO/NOT-YET verdict. The pinned RWA_VERDICT_SHA + the four structural INVARIANTS in frozen.ts ARE the entire checkable record (R-6).",
    },
    "data/snapshot/MANIFEST.json": {
      whatWouldClose: "committing the gitignored local RWA discovery-snapshot manifest so a clone has an artifact to hash",
      canClose: false,
      why: "it is gitignored-LOCAL data by design (a stamped discovery snapshot, present in a working env, absent on a clone). Committing it would un-gitignore local data and change the repo's data-boundary policy. The pinned IMMUTABLE_DATA[].sha in frozen.ts is the checkable record — a present-but-CHANGED datum still fails (tamper), an absent one is an honest skip (R-6).",
    },
  },
  verdict: "7/9 CANNOT be honestly closed to 9/9 without a boundary violation (importing a monorepo artifact / committing gitignored local data). The pinned golden SHAs in frozen.ts are the entire record for the 2 absent — stated, never a silent 7-of-9 (X-SHOWN(e)).",
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "frozen-set-coverage.json"), JSON.stringify(record, null, 2) + "\n")
console.log("── REACH — frozen-set coverage (DD-16) ─────────────────────")
console.log(`  coverage : ${record.coverage} · absent: ${record.absent.join(", ")}`)
console.log(`  verdict  : ${record.verdict}`)
console.log("  record written: data/honesty/frozen-set-coverage.json")
