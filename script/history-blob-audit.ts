/**
 * ORGΛNON — the HISTORY-BLOB DISCLOSURE AUDIT (End-User Phase 0; Rule E-PREVENT, V9 finding 3). This constitution
 * FORBIDS rewriting history — a filter-branch is a Halt, in all cases. So whatever large blobs already sit permanently
 * in this repository's history CANNOT be un-committed; the only honest response is to DISCLOSE them and prevent the
 * next one (the prevention walls). This script inventories the large blobs reachable in history, names W4-01's ~464KB
 * differential fixture (the sprint-introduced one) and the inherited transplant-ancestry blobs, and files the policy.
 * It READS history only — it never rewrites it. Run: bun run script/history-blob-audit.ts
 */
import { execSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"

const THRESHOLD = 262_144 // the same 256KiB cap the prevention wall enforces going forward
const D = path.join(PKG_ROOT, "data", "studio")

// blob object-name → path via rev-list; size via cat-file batch-check. Combined with a controlled shell pipeline.
const raw = execSync(
  `git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '$1=="blob"{print $3"\\t"$4}' | sort -rn | head -60`,
  { cwd: PKG_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
)

interface Blob { bytes: number; path: string; permanent: boolean; klass: "sprint-introduced (W4-01)" | "inherited transplant ancestry" | "other-permanent" }
const blobs: Blob[] = []
for (const line of raw.split("\n").map((l) => l.trim()).filter(Boolean)) {
  const [sizeStr, ...rest] = line.split("\t")
  const bytes = Number(sizeStr)
  const p = rest.join("\t").trim()
  if (!Number.isFinite(bytes) || !p) continue
  const permanent = bytes >= THRESHOLD
  const klass = /differential-fixture-v9\.json/.test(p) ? "sprint-introduced (W4-01)" as const : /^packages\//.test(p) ? "inherited transplant ancestry" as const : "other-permanent" as const
  blobs.push({ bytes, path: p, permanent, klass })
}

const large = blobs.filter((b) => b.permanent)
const w401 = blobs.find((b) => b.klass === "sprint-introduced (W4-01)") ?? null
const inherited = large.filter((b) => b.klass === "inherited transplant ancestry")

const audit = {
  protocol: "history-blob-disclosure-audit",
  version: "v10",
  at: "2026-07-05",
  rule: "E-PREVENT — history is permanent; prevention is the only medicine; rewriting history is a Halt in all cases (zero rewrites)",
  threshold_bytes: THRESHOLD,
  finding: {
    W4_01: w401
      ? `PRESENT + PERMANENT: ${w401.path} (${w401.bytes} bytes ≈ ${(w401.bytes / 1024).toFixed(0)}KB). V9's W4-01 committed the raw captured data inline; the walk slimmed the WORKING file to 1186B, but the 464KB blob is in git history FOREVER. It cannot be un-committed without a history rewrite, which this constitution forbids. Named, sized, disclosed — not shrugged.`
      : "the W4-01 differential fixture blob was not found in history (unexpected — investigate)",
    inherited_ancestry: `${inherited.length} large blobs (≥${THRESHOLD}B) are INHERITED from the transplant ancestry (paths under packages/): the standalone's git history descends from the monorepo, so the monorepo's large artifacts (e.g. fuzz-rag rows.indexed.json ~22MB, findings-final.json ~18MB, patterns-registry ~2MB) are permanent in THIS repository's history too. Disclosed honestly: the transplant carried the ancestry, and the ancestry carried these blobs. No rewrite.`,
    total_large_blobs: large.length,
  },
  policy: "This repository CANNOT un-commit. A large/raw/credential blob that reaches history is permanent. Therefore: (1) the pre-commit prevention walls (blob-size · raw-data · credential) refuse the NEXT one BEFORE it lands; (2) any existing permanent blob is DISCLOSED here, never rewritten away; (3) rewriting history (filter-branch, BFG, force-push over shared history) is a Halt. Prevention is the only medicine.",
  rewrites_performed: 0,
  large_blobs: large.map((b) => ({ bytes: b.bytes, kb: Number((b.bytes / 1024).toFixed(1)), path: b.path, klass: b.klass })),
}

writeFileSync(path.join(D, "history-blob-audit-v10.json"), JSON.stringify(audit, null, 2) + "\n")
console.log(`history-blob audit: ${large.length} permanent blobs ≥${THRESHOLD}B · W4-01 ${w401 ? `${(w401.bytes / 1024).toFixed(0)}KB (permanent, disclosed)` : "NOT FOUND"} · inherited ${inherited.length} · rewrites ${audit.rewrites_performed}`)
console.log(`written: data/studio/history-blob-audit-v10.json`)
