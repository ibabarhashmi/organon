/**
 * ORGΛNON — the frozen-set manifest (the SINGLE SOURCE OF TRUTH) + integrity primitives (Rules VII, XXVIII).
 *
 * Every frozen artifact's pinned sha lives HERE and nowhere else — the 6 computational-core `.py`, and the
 * settled RWA verdict (`RWA-VERDICT.md`). Consumers (the red-team tests, the verdict scripts, the dashboard)
 * import from this module; a drift is reconciled in ONE place. The mechanism `test/redteam/frozen_integrity.test.ts`
 * hashes every frozen artifact against this manifest and distinguishes a legitimate deterministic REGENERATION
 * (rendering / provenance changed, the verdict CLASS intact) from an illegitimate MUTATION (a verdict token or
 * figure changed). Reconciliation forensics + the regeneration-vs-mutation rule: BUILDLOG-V2-INTEGRITY.md Phase 0/1.
 *
 * Re-baselining a pin here is a CONSCIOUS act (Rule XVII): update the literal + log the forensics in the BuildLog;
 * never silently bump a sha to turn a red test green (that hides drift — the anti-pattern the mechanism exists to stop).
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

// src/organon/ → PKG_ROOT (…/solidity-sentinel) → REPO_ROOT (…/Sentinel Agent)
export const PKG_ROOT = path.join(import.meta.dir, "..", "..")
export const REPO_ROOT = PKG_ROOT // STANDALONE: the package IS the repo root (was monorepo packages/solidity-sentinel/../..)
export const PY_DIR = path.join(PKG_ROOT, "src", "backtest", "py")

export const sha256 = (buf: Buffer | string) => createHash("sha256").update(buf).digest("hex")
export const sha256File = (p: string) => sha256(readFileSync(p))

// ───────────────────── the 6 computational-core .py — byte-identical, never edited (Rule VII) ─────────────────────
export const FROZEN_PY: Record<string, string> = {
  "rigor.py": "58c88843cbcb9d81c8d41a01f7d7cc44e99b31116e90194bf1b1ddb3a2f86fb4",
  "neutralize.py": "448c25cedf9d4926f4456c1210949d0d816e255d72688e57b5da6b98ab36eb7a",
  "funding_discriminate.py": "6d97334eb7242d9ac3ffa5a255e00b7f4c4699c5c4dc2c23c0a61f24ce710d24",
  "effective_n.py": "5fc0eaacb4e180b03ca64ea0fd597995ecdccfe1e5e57885d3dbeca3701d7458",
  "funding_accrual.py": "03d3d6b1074b1756efbd397dca3ddb8b2dafb5fdf3377f1f7a471da9845c0d65",
  "funding_crossvenue.py": "160fc5d2c248ba75e4080b649f8fafbb6fe989dc4038f35456e4c2c05f48ac2c",
}

// ───────────────────── the settled RWA verdict (RWA-VERDICT.md) ─────────────────────
// The full byte sha of the current deterministic rendering (seed 1, pinned snapshot).
// RECONCILED 2026-07-03: d6e3f074… → 9cf94c8a… — a legitimate REGENERATION. The cohort-vs-asset generator
// `script/rwa-verdict.ts` (added in commit 3370a45) renders more prose; the Decision computation is byte-identical
// to v6 and the 6 `.py` above are unchanged, so the *verdict* did not move (still NO-GO / ASSET-BOUND / NOT-YET).
// The old pin predated this generator and was never updated. Forensics: BUILDLOG-V2-INTEGRITY.md Phase 0.
export const RWA_VERDICT_SHA = "9cf94c8abf3570f08dc474cb47c4e37c5fbda9fd9fd190f7571ad713277465a5"
export const RWA_VERDICT_PATH = path.join(REPO_ROOT, "RWA-VERDICT.md")

// The verdict CLASS — the invariants a legitimate regeneration PRESERVES and a mutation BREAKS. A prose/date regen
// keeps every one present; flipping NO-GO→GO (or ASSET-BOUND→COHORT-BOUND, NOT-YET→GO, …) removes one → MUTATION.
export const RWA_VERDICT_INVARIANTS: string[] = [
  "Downside-edge **NO-GO**",
  "Decision **NOT-YET**",
  "Conclusiveness **CONCLUSIVE**",
  "**NO-DISCRIMINATING-SIGNAL**",
  "ASSET-BOUND",
]

// Normalize the pure-PROVENANCE fields (calendar dates, the pipeline_run config hash) so the content-sha is stable
// across a date/window/config regeneration but flips on any change to a verdict FIGURE (SR0, DSR, counts, returns).
export function normalizeVerdictContent(md: string): string {
  return md
    .replace(/\d{4}-\d{2}-\d{2}/g, "<DATE>") // decision-window / conclusiveness calendar dates (snapshot-derived)
    .replace(/config [0-9a-f]{6,}…?/g, "config <HASH>") // the pipeline_run config hash (provenance, not the verdict)
}
export const verdictContentSha = (md: string) => sha256(normalizeVerdictContent(md))
// The pinned content-sha (dates/config normalized out). A finer signal than the full sha: it stays stable across a
// date-only regeneration and flips on a verdict-figure change. Recompute + re-bake consciously if normalization changes.
export const RWA_VERDICT_CONTENT_SHA = "c2959846169e304349db853f27549a2759e67a23ea741851606d0066ca0113a5"

export type DriftKind = "identical" | "regeneration" | "mutation"
export interface DriftReport {
  kind: DriftKind
  artifact: string
  message: string
  actual: string
  pinned: string
}

// Classify a detected RWA drift into the regeneration-vs-mutation distinction the blueprint requires. Two robust
// signals, in order of severity: (1) the AUTHORITATIVE H1 line (`md.split("\n")[0]`) must carry every verdict token —
// a headline flip (NO-GO→GO, ASSET-BOUND→COHORT-BOUND, NOT-YET→GO, …) removes one → MUTATION, even though the token
// still appears elsewhere in the body (so a whole-doc `includes()` would miss it — the trap this codifies against).
// (2) the CONTENT-sha (dates/config normalized out) must match — if the headline is intact but a body FIGURE moved
// (SR0, DSR, a count), the content-sha shifts → MUTATION/REVIEW. Only when BOTH hold (headline intact AND content-sha
// stable) is the drift a pure date/config/provenance REGENERATION, safe to re-pin consciously (Rule XVII).
export function classifyRwaDrift(md: string): DriftReport {
  const actual = sha256(md)
  const base = { artifact: "RWA-VERDICT.md", actual, pinned: RWA_VERDICT_SHA }
  if (actual === RWA_VERDICT_SHA) return { ...base, kind: "identical", message: "byte-identical to the pinned baseline" }
  const h1 = md.split("\n")[0] ?? ""
  const missingInH1 = RWA_VERDICT_INVARIANTS.filter((s) => !h1.includes(s))
  if (missingInH1.length > 0)
    return {
      ...base,
      kind: "mutation",
      message: `MUTATION — the H1 verdict signature changed: missing [${missingInH1.join(", ")}] in the headline. A settled NO-GO / ASSET-BOUND verdict must not silently flip. Do NOT re-pin; investigate.`,
    }
  if (verdictContentSha(md) !== RWA_VERDICT_CONTENT_SHA)
    return {
      ...base,
      kind: "mutation",
      message: `MUTATION/REVIEW — the H1 verdict class is intact but a body FIGURE or statement changed (content-sha moved after normalizing dates/config). Review the diff for a changed number/claim BEFORE any re-pin — do not assume prose-only.`,
    }
  return {
    ...base,
    kind: "regeneration",
    message: `DRIFT, but only provenance changed (calendar dates / config hash; the verdict class + every figure are intact — content-sha stable). This is a legitimate REGENERATION — re-pin RWA_VERDICT_SHA in src/organon/frozen.ts if intended (a conscious re-baseline, Rule XVII).`,
  }
}

// ───────────────────── the frozen loop type-wall (Rule XXI/XXVI) — git-tracked, byte-identical ─────────────────────
// The compile-time DiscoveryVerdict wall + runtime leak tripwire. Frozen everywhere; unfrozen ONLY for fee-yield via
// a SEPARATE file (src/loop/feeyield-loop.ts imports the wall types from here — it never edits this file's bytes).
export const FROZEN_TS: Record<string, string> = {
  "src/loop/loop.ts": "1518c897111454a6f9b4441c62fa82eb6ebce5f5e56305b6abdbfda139efc13c",
}

// ───────────────────── immutable, stamped LOCAL data (gitignored — present in a working env, absent on a clone) ─────
// The integrity property: a stamped T2 forward capture (and the pinned discovery snapshot) is IMMUTABLE. A
// present-but-CHANGED datum is a leak / fabrication and MUST fail; an ABSENT one (fresh clone, gitignored) is skipped,
// not a false-fail. Pinning these catches local tampering of a stamped capture — the worst integrity violation.
export interface ImmutableDatum {
  rel: string
  sha: string
  note: string
}
export const IMMUTABLE_DATA: ImmutableDatum[] = [
  { rel: "data/feeyield/forward/2026-07-03/MANIFEST.json", sha: "e6dd5fb5fa0ca7a8de2ff5e79d5b4c6453a9813b0190c40d4cc4dca65d3f125a", note: "fee-yield T2 forward capture (stamped 2026-07-03, immutable)" },
  { rel: "data/feeyield/forward/2026-07-03/prices.json", sha: "f6d9e0eef2c4f918a81114e54207f39cf09de1303a8a226779e478fe8a2ef96a", note: "fee-yield T2 forward prices (== the MANIFEST's pricesSha)" },
  // Re-pinned 2026-07-03 (Discernment sprint end-to-end live run): re-running `scripts/snapshot.ts` stamped a fresh
  // `pinnedAt` (a latent non-idempotence bug in that script, now fixed to PRESERVE the prior value). ONLY `pinnedAt`
  // changed — every RWA series entry AND the settled RWA verdict (RWA-VERDICT.md) stayed byte-identical, so NO verdict
  // moved. Re-pinned to the semantically-identical current bytes (a cosmetic timestamp re-stamp, disclosed).
  { rel: "data/snapshot/MANIFEST.json", sha: "62535a271cf37dded7d8ab81ad94aa2a6957624568156baee7e2412ba7553db8", note: "RWA pinned discovery-snapshot manifest (immutable; pinnedAt-only re-pin 2026-07-03, semantic content + RWA verdict unchanged)" },
]

export type FrozenStatus = "ok" | "drift" | "absent"
export type FrozenKind = "tracked-py" | "tracked-ts" | "generated-rwa" | "local-immutable"
export interface FrozenCheck {
  id: string
  kind: FrozenKind
  status: FrozenStatus
  detail: string
}

// A single pass over the WHOLE frozen set → one structured result per artifact. The mechanism test asserts on these;
// a drift in any TRACKED artifact (6 .py, the loop wall) or the RWA verdict is a failure; a local-immutable datum may
// be "absent" (fresh clone) but a present one that changed is "drift". Never throws — absence is a status, not a crash.
export function checkFrozenSet(): FrozenCheck[] {
  const out: FrozenCheck[] = []
  const pin = (id: string, kind: FrozenKind, abs: string, want: string): void => {
    if (!existsSync(abs)) return void out.push({ id, kind, status: "absent", detail: `MISSING — ${abs}` })
    const got = sha256File(abs)
    out.push({ id, kind, status: got === want ? "ok" : "drift", detail: got === want ? "byte-identical to the pin" : `DRIFT ${got.slice(0, 12)}… ≠ pinned ${want.slice(0, 12)}…` })
  }
  for (const [name, want] of Object.entries(FROZEN_PY)) pin(name, "tracked-py", path.join(PY_DIR, name), want)
  for (const [rel, want] of Object.entries(FROZEN_TS)) pin(rel, "tracked-ts", path.join(PKG_ROOT, rel), want)
  if (!existsSync(RWA_VERDICT_PATH)) out.push({ id: "RWA-VERDICT.md", kind: "generated-rwa", status: "absent", detail: "MISSING — run script/rwa-verdict.ts" })
  else {
    const r = classifyRwaDrift(readFileSync(RWA_VERDICT_PATH, "utf8"))
    out.push({ id: "RWA-VERDICT.md", kind: "generated-rwa", status: r.kind === "identical" ? "ok" : "drift", detail: `${r.kind.toUpperCase()} — ${r.message}` })
  }
  for (const d of IMMUTABLE_DATA) {
    const abs = path.join(REPO_ROOT, d.rel)
    if (!existsSync(abs)) {
      out.push({ id: d.rel, kind: "local-immutable", status: "absent", detail: `not present (gitignored local data — ${d.note})` })
      continue
    }
    const got = sha256File(abs)
    out.push({ id: d.rel, kind: "local-immutable", status: got === d.sha ? "ok" : "drift", detail: got === d.sha ? `immutable, intact — ${d.note}` : `TAMPERED ${got.slice(0, 12)}… ≠ ${d.sha.slice(0, 12)}… — ${d.note}` })
  }
  return out
}
