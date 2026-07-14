/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 3: Falsify.census() — X-REACH(a) made mechanical.
 *
 * "A check that cannot fail is not a check." Every wall S1-S99 is bucketed by a PURE READ over the committed test tree —
 * never a hand-written document (RP-6: a living wall), never an INVENTED origin (RP-1: the exact unfalsifiable claim this
 * sprint was minted to end). The derivation reports only what the committed bytes show:
 *
 *   · hasControl        — the wall's test context carries a seeded-negative / must-fail assertion (a demonstrated failure)
 *   · recordedOrigin    — the wall's COMMITTED context names its originating defect (a W-xxNN tag, "minted for", …). The
 *                         build logs are untracked (gitignored sprint/); only committed test headers + pins count, so the
 *                         census is clone-stable and cannot depend on prose absent from a fresh clone.
 *   · structuralAbsence — the wall greps for the ABSENCE of a thing (no model on the verdict path, no daemon, screens==3);
 *                         its negative is unrepresentable in a passing tree → EXEMPT (reasoned, enumerated, counted).
 *
 * Buckets (RP-1's four): DEMONSTRATED (control + recorded origin) · WEAK (recorded origin, arbitrary negative — a manual
 * override, empty unless found) · EXEMPT (structural absence) · ORIGIN_UNRECORDED (a control but NO recorded origin — the
 * majority; the census cannot claim its negative is the ORIGINAL defect). A wall with NO control and not EXEMPT is a
 * DECORATION (NOT HELD, X-SHOWN(b)): it lands in ORIGIN_UNRECORDED flagged decoration=true, and the count is stated out loud.
 */
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"

export namespace Falsify {
  export const WALL_MIN = 1
  export const WALL_MAX = 127 // Substance V38: bumped 115→127 for the S116..S127 band (two owed to V39 as gaps: oracle-staleness + the algebra); a test that references S(>MAX) is an ORPHAN (RP-6 living wall)

  export type Bucket = "DEMONSTRATED" | "WEAK" | "EXEMPT" | "ORIGIN_UNRECORDED"
  // Derivation V36 (S104/DD-20): the census gets a TREATMENT. An ORIGIN_UNRECORDED wall is processed via one route, in
  // order, recorded in the COMMITTED test context (a living-wall annotation, RP-6): RECOVERED (git archaeology surfaced the
  // originating defect) → DEMONSTRATED, route "recovered"; RE-FOUNDED (no origin recoverable, so the defect it catches TODAY
  // is stated + seeded) → DEMONSTRATED, route "reFounded" COUNTED APART (RP-3: a purpose reconstructed ≠ a purpose
  // remembered). A wall minted with a W-tag is DEMONSTRATED route null ("remembered").
  export type Route = "recovered" | "reFounded" | null
  export interface WallRow {
    id: string // "S45"
    n: number
    files: string[] // the test files that reference it
    hasControl: boolean
    recordedOrigin: string | null // the matched origin signal (a W-tag / "minted for" phrase), or null
    originStrength: "W-TAG" | "REFERENCE" | null // W-TAG = a named originating defect (strongest); REFERENCE = a sprint re-pin / audit-finding ref
    structuralAbsence: boolean
    decoration: boolean // no control and not exempt — a wall with no demonstrated failure
    route: Route // S104 — how an ORIGIN_UNRECORDED wall was treated this sprint (recovered / re-founded), or null
    bucket: Bucket
    note: string
  }

  // WEAK overrides — walls with a recorded origin whose seeded negative is a KNOWN arbitrary mutation (to strengthen).
  // Populated only when a concrete case is found; empty is honest (the mechanical derivation cannot judge arbitrariness).
  const WEAK_OVERRIDES = new Set<string>()

  // EXEMPT overrides — the REASONED, ENUMERATED structural-absence class (X-REACH(a): "never silently excused"). Only the
  // clearest pure grep-for-absence walls, whose defining negative (introduce the forbidden thing) is unrepresentable in a
  // passing tree. Kept deliberately SHORT — a wall with any behavioural/positive control is NOT here (it is demonstrable).
  const EXEMPT_OVERRIDES: Record<string, string> = {
    S38: "grep-wall — the design detector is DEV-TIME-ONLY (deps stay hono+zod); a runtime-dependency negative is unrepresentable in a tree whose deps are exactly two",
    S82: "grep-wall — the served GET routes minus the pinned non-screen allowlist are EXACTLY the conscious 3; a 4th screen is unrepresentable in a passing tree",
  }

  const TEST_DIRS = [path.join(PKG_ROOT, "test", "organon"), path.join(PKG_ROOT, "test", "walls")]

  // a seeded-negative / must-fail signal — a genuine demonstrated failure the wall catches. Includes this codebase's
  // pervasive DEGRADED-VERDICT idiom (a bad/seeded input → SAMPLE / UNVERIFIED / UNJUDGEABLE / not SOLID / AVOID / a
  // rejected verdict) and its DETERMINISM controls (byte-identical / deterministic), which ARE demonstrated failures
  // even though they never write `toBe(false)`.
  const CONTROL_RE = /toBe\(false\)|\.not\.toBe\(|\.toThrow|→ ?FAILS?\b|\bFAILS\b|\bmust fail\b|positive control|\bseeded\b|REFUSES?\b|\brejects?\b|\brejected\b|neutraliz|\bSAMPLE\b|UNVERIFIED|UNJUDGEABLE|not SOLID|\bAVOID\b|degrade|byte-identical|deterministic|absorbed|\bNO-GO\b|BLOCKED/i
  // a PURE structural-absence grep-wall — the negative (introduce the forbidden thing) is unrepresentable in a passing
  // tree. Tightened to precise grep-wall phrasings; combined with !hasControl so a wall with a real seeded control is
  // never mistaken for an absence wall.
  const ABSENCE_RE = /\bZERO (model|new model|LLM|models)\b|imports NOTHING|NOTHING from Sentinel|no model (in|on) the|stays (the )?conscious (3|three)|screen set (is|stays|==|remains)|(non-screen )?allowlist (is )?PINNED|DEV-TIME-ONLY|no daemon|zero transitive|must not exist in the tree|no new (mass-path )?dep/i
  // a COMMITTED recorded-origin signal — names WHY the wall exists / what defect it was minted to catch. The STRONGEST
  // form is a W-xxNN named originating defect (unambiguous); weaker-but-real REFERENCES (a sprint re-pin RP-N / audit
  // finding C-N / an explicit "minted for") are RECORDED and shown but DO NOT upgrade a wall to DEMONSTRATED (RP-1: only
  // a named defect earns the strong claim; a generic re-pin ref could bleed).
  const WTAG_RE = /W-[A-Z]{1,4}\d{2}/
  const ORIGIN_REF_RE = /minted for|minted to catch|was minted to|the original defect the wall|originating defect|\bRP-\d\b|\bC-\d\b/i
  // Derivation V36 (S104) — the census TREATMENT annotations, committed in the test context (RP-6 living wall). RECOVERED
  // = git archaeology surfaced the ORIGINATING defect (quoted, with its commit/sprint); RE-FOUNDED = no origin was
  // recoverable, so the defect the wall catches TODAY is stated + seeded. They are DISTINCT and counted APART (RP-3).
  const RECOVERED_RE = /RECOVERED-ORIGIN:/
  const REFOUNDED_RE = /RE-FOUNDED:/

  // Walls DELETED this sprint via route 3 (DELETE-WITH-PROOF, D52). Each entry preserves the wall's source so it can be
  // restored (attack #3). EMPTY is the expected outcome — re-founding, not deleting, is the expected route for the 83.
  export const DELETED_WALLS: { id: string; reason: string; proofOfNoDownstreamChange: string; source: string }[] = []

  function testFiles(): { file: string; text: string }[] {
    const out: { file: string; text: string }[] = []
    for (const dir of TEST_DIRS) {
      for (const f of readdirSync(dir).filter((x) => x.endsWith(".test.ts")).sort()) {
        out.push({ file: path.relative(PKG_ROOT, path.join(dir, f)), text: readFileSync(path.join(dir, f), "utf8") })
      }
    }
    return out
  }

  // A "segment" is a BOUNDED block — the file header/imports (segment 0) or one test()/describe() block. Splitting on
  // block boundaries (never a fixed line window) is what stops one wall's origin tag from bleeding into its neighbours
  // (RP-1: a retroactively-attributed origin is indistinguishable from an invented one). A segment is attributed to
  // exactly the wall ids that appear WITHIN it.
  interface Segment { file: string; text: string }
  function segmentsOf(files: { file: string; text: string }[]): Segment[] {
    const segs: Segment[] = []
    for (const { file, text } of files) {
      // split immediately before each top-level test( / describe( — the block owns everything up to the next block
      for (const s of text.split(/\n(?=\s*(?:test|describe)\s*\()/)) segs.push({ file, text: s })
    }
    return segs
  }

  // gather the context for a wall id = the concatenation of every SEGMENT (bounded block) that references it.
  function contextsFor(n: number, segs: Segment[]): { ctx: string; inFiles: string[] } {
    const re = new RegExp(`\\bS${n}\\b`)
    const parts: string[] = []
    const inFiles = new Set<string>()
    for (const s of segs) {
      if (re.test(s.text)) { parts.push(s.text); inFiles.add(s.file) }
    }
    return { ctx: parts.join("\n"), inFiles: [...inFiles].sort() }
  }

  export function census(): { rows: WallRow[]; counts: Record<Bucket, number>; decorationCount: number; wallCount: number; orphans: string[] } {
    const files = testFiles()
    const segs = segmentsOf(files)
    const rows: WallRow[] = []
    // known wall ids = those that actually appear in a test title or body within [MIN, MAX]
    for (let n = WALL_MIN; n <= WALL_MAX; n++) {
      const { ctx, inFiles } = contextsFor(n, segs)
      if (inFiles.length === 0) continue // no such wall referenced (a gap in the numbering) — not counted
      const hasControl = CONTROL_RE.test(ctx)
      const structuralAbsence = ABSENCE_RE.test(ctx)
      const wtag = ctx.match(WTAG_RE)
      const ref = ctx.match(ORIGIN_REF_RE)
      const recovered = RECOVERED_RE.test(ctx)
      const reFounded = REFOUNDED_RE.test(ctx)
      const recordedOrigin = wtag ? wtag[0] : ref ? ref[0] : null
      const originStrength: WallRow["originStrength"] = wtag ? "W-TAG" : ref ? "REFERENCE" : null
      let bucket: Bucket
      let decoration = false
      let route: Route = null
      let note = ""
      if (EXEMPT_OVERRIDES[`S${n}`]) {
        bucket = "EXEMPT"
        note = EXEMPT_OVERRIDES[`S${n}`]
      } else if (WEAK_OVERRIDES.has(`S${n}`)) {
        bucket = "WEAK"
        note = "recorded origin present but the seeded negative is an arbitrary mutation — to strengthen"
      } else if (hasControl && originStrength === "W-TAG") {
        // a real seeded negative WITH a NAMED originating defect (W-tag) — the strong claim, and only this earns it
        bucket = "DEMONSTRATED"
        note = `a seeded negative + a named originating defect (${recordedOrigin}) in the committed context`
      } else if (hasControl && recovered) {
        // S104 RECOVER — git archaeology surfaced the ORIGINATING defect, quoted in the committed context (route "recovered")
        bucket = "DEMONSTRATED"
        route = "recovered"
        note = "ORIGIN RECOVERED — the originating defect was surfaced by git archaeology and quoted in the committed context (S104)"
      } else if (hasControl && reFounded) {
        // S104 RE-FOUND — no origin recoverable; the defect the wall catches TODAY is stated + seeded (route "reFounded",
        // counted APART, RP-3: a purpose reconstructed is not a purpose remembered)
        bucket = "DEMONSTRATED"
        route = "reFounded"
        note = "RE-FOUNDED — no origin was recoverable; the defect this wall catches today is stated + seeded (S104; DEMONSTRATED(re-founded), counted apart, RP-3)"
      } else if (structuralAbsence && !hasControl) {
        // a PURE grep-for-absence wall — no seeded control, and the negative is structurally unrepresentable
        bucket = "EXEMPT"
        note = "structural absence — the negative (introduce the forbidden thing) is unrepresentable in a passing tree"
      } else if (!hasControl) {
        // NOTE (attack #10, honest): this is a HEURISTIC flag, not a proof the wall cannot fail — the automated scan found
        // no explicit seeded-negative / must-fail / degraded-verdict / determinism signal in the committed context. It is
        // a LOWER BOUND on demonstrability for the auditor to verify, and it is COUNTED, never silently dropped.
        bucket = "ORIGIN_UNRECORDED"
        decoration = true
        note = "no seeded-negative signal found by the scan (a heuristic flag / lower bound — NOT a proof the wall cannot fail); counted for the auditor (X-REACH(a), attack #10)"
      } else {
        bucket = "ORIGIN_UNRECORDED"
        note = recordedOrigin
          ? `a seeded negative + a WEAKER origin reference (${recordedOrigin}), not a named defect — cannot claim it is the ORIGINAL defect (RP-1)`
          : "a seeded negative exists, but NO recorded originating defect in the committed context — cannot claim it is the ORIGINAL defect (RP-1)"
      }
      rows.push({ id: `S${n}`, n, files: inFiles, hasControl, recordedOrigin, originStrength, structuralAbsence, decoration, route, bucket, note })
    }
    const counts: Record<Bucket, number> = { DEMONSTRATED: 0, WEAK: 0, EXEMPT: 0, ORIGIN_UNRECORDED: 0 }
    for (const r of rows) counts[r.bucket]++
    const decorationCount = rows.filter((r) => r.decoration).length
    // S104 — recovered and re-founded counted APART (RP-3), and the deleted walls (D52) named with their proof.
    const recovered = rows.filter((r) => r.route === "recovered").length
    const reFounded = rows.filter((r) => r.route === "reFounded").length
    return { rows, counts, decorationCount, wallCount: rows.length, orphans: orphanWallIds(files), recovered, reFounded, deleted: DELETED_WALLS }
  }

  // RP-6 — the living wall: a test that references S(>MAX) is an ORPHAN; the census range must be bumped consciously.
  export function orphanWallIds(files = testFiles()): string[] {
    const seen = new Set<number>()
    for (const { text } of files) for (const m of text.matchAll(/\bS(\d+)\b/g)) seen.add(Number(m[1]))
    return [...seen].filter((n) => n > WALL_MAX).map((n) => `S${n}`).sort()
  }
}
