/**
 * ORGΛNON — the frozen-set manifest (the SINGLE SOURCE OF TRUTH) + integrity primitives (Rules VII, XXVIII).
 *
 * Every frozen artifact's pinned sha lives HERE and nowhere else — the 6 computational-core `.py` + the frozen loop
 * type-wall (`loop.ts`), plus the settled RWA verdict pin (`RWA-VERDICT.md`, a monorepo-generated doc, absent on a
 * standalone clone). Consumers (the wall tests, the runtime) import from this module; a drift is reconciled in ONE
 * place. `test/walls/core_byte_identity.test.ts` hashes every present frozen artifact against this manifest — a drift
 * in a tracked artifact is a Halt. The RWA verdict is a settled record checked by a byte-match against its pin.
 *
 * Re-baselining a pin here is a CONSCIOUS act (Rule XVII): update the literal + log the forensics in the BuildLog;
 * never silently bump a sha to turn a red test green (that hides drift — the anti-pattern the mechanism exists to stop).
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

// src/organon/ → PKG_ROOT (the repo root) → REPO_ROOT (identical; this standalone package IS the repo root).
// REACH V35 (D49): a compiled single-file binary (bun build --compile) virtualizes import.meta.dir, so the on-disk
// committed data/ would not resolve. ORGANON_ROOT lets the binary's entrypoint anchor PKG_ROOT to the working directory
// where data/ lives. Unset by default → byte-identical behaviour for `bun` / the battery / the evidence bundle.
export const PKG_ROOT = process.env.ORGANON_ROOT ? path.resolve(process.env.ORGANON_ROOT) : path.join(import.meta.dir, "..", "..")
export const REPO_ROOT = PKG_ROOT // STANDALONE-NATIVE: the package IS the repo root
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

// The standalone's RWA check is a plain byte-match against the pinned settled verdict (RWA_VERDICT_SHA). The monorepo's
// regeneration-vs-mutation drift CLASSIFIER is not carried here — it was unreachable: the RWA verdict GENERATOR
// (script/rwa-verdict.ts) lives only in the full monorepo, so RWA-VERDICT.md is never generated in the standalone and
// is always ABSENT on a clone (the honesty layer removed the dead RWA/fee-yield runtime). The pinned sha + the four
// structural INVARIANTS above ARE the standalone's checkable, immutable settled-verdict record (F-ENV; the ENVIRONMENTAL
// finding forbids a re-pin — the settled NO-GO/NOT-YET verdict must never silently move). checkFrozenSet() below
// classifies a (never-present-on-clone) RWA-VERDICT.md ok/drift by a byte-match against RWA_VERDICT_SHA.

// ───────────────────── the frozen loop type-wall (Rule XXI/XXVI) — git-tracked, byte-identical ─────────────────────
// The compile-time DiscoveryVerdict wall + runtime leak tripwire. Frozen everywhere in the standalone (the monorepo's
// fee-yield unfreeze path was a separate experiment and is NOT carried here — the honesty layer removed the dead paths).
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
  // The dead fee-yield forward-capture entries were removed with the fee-yield runtime (the honesty layer). The RWA
  // pinned discovery-snapshot manifest stays — it is part of the settled-RWA integrity anchor (gitignored local data,
  // absent on a clone; a present-but-CHANGED datum is a leak → fail).
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
  if (!existsSync(RWA_VERDICT_PATH)) out.push({ id: "RWA-VERDICT.md", kind: "generated-rwa", status: "absent", detail: "absent — the RWA verdict generator lives in the monorepo, not the standalone (inventory absence rwa-verdict-regeneration); the pinned RWA_VERDICT_SHA + INVARIANTS are the checkable settled-verdict record" })
  else {
    const got = sha256File(RWA_VERDICT_PATH)
    out.push({ id: "RWA-VERDICT.md", kind: "generated-rwa", status: got === RWA_VERDICT_SHA ? "ok" : "drift", detail: got === RWA_VERDICT_SHA ? "byte-identical to the pinned settled verdict" : `DRIFT ${got.slice(0, 12)}… ≠ pinned ${RWA_VERDICT_SHA.slice(0, 12)}… — the settled NO-GO/NOT-YET verdict must not silently move (F-ENV); investigate, do not re-pin` })
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
