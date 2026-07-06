/**
 * ORGΛNON — the PRE-COMMIT PREVENTION scanner (End-User Phase 0; Rule E-PREVENT). Run by .githooks/pre-commit over the
 * STAGED tree: it reads `git diff --cached` (added/modified blobs), runs the three pure Prevent walls (blob-size,
 * raw-data, credential), and EXITS NON-ZERO on any violation — refusing the commit BEFORE a bad blob becomes permanent.
 * History cannot be un-committed (a rewrite is a Halt); this gate is the medicine. Run manually: bun run script/precommit-prevent.ts
 */
import { execFileSync } from "node:child_process"
import { Prevent } from "../src/studio/prevent"

function staged(): Prevent.StagedFile[] {
  // added (A), copied (C), modified (M) staged paths — deletions/renames-away are irrelevant to a bloat/secret gate
  const out = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACM"], { encoding: "utf8" })
  const paths = out.split("\n").map((s) => s.trim()).filter(Boolean)
  const files: Prevent.StagedFile[] = []
  for (const p of paths) {
    let bytes = 0
    let content = ""
    try {
      // read the STAGED blob (the index version), not the worktree — what will actually be committed
      const buf = execFileSync("git", ["show", `:${p}`], { maxBuffer: 256 * 1024 * 1024 })
      bytes = buf.length
      // decode as utf8 only if it looks textual (no NUL in the first 8KB) — a binary blob still gets its size checked
      const head = buf.subarray(0, 8192)
      content = head.includes(0) ? "" : buf.toString("utf8")
    } catch {
      continue // a path in the index we cannot show (submodule, etc.) — skip, never crash the commit
    }
    files.push({ path: p, bytes, content })
  }
  return files
}

const violations = Prevent.scanStaged(staged())
if (violations.length) {
  console.error("✗ PRE-COMMIT REFUSED (E-PREVENT) — prevention is the only medicine; history cannot be un-committed:")
  for (const v of violations) console.error(`  · [${v.wall}] ${v.path}\n      ${v.reason}`)
  console.error("\nFix the staged content (gitignore raw data + commit its provenance chain; move secrets to env; allow-list a genuinely-large artifact with a reason), then re-commit.")
  process.exit(1)
}
console.log("✓ pre-commit prevention walls clean (blob-size · raw-data · credential)")
process.exit(0)
