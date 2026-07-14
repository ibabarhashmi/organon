/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 4: Reach.fact() — REACH IS A FACT, structural, never surveyed (X-REACH(e)).
 *
 * reach = { installPath, firstRunSeconds, published, reachableHumans } where reachableHumans = published ? UNJUDGEABLE : 1.
 * ORGANON does not guess how many strangers exist. Unpublished → exactly ONE human (the Operator) can reach it. Published
 * → the count is UNJUDGEABLE and SAYS SO (attack #9: reach is never a made-up number).
 *
 * RP-4 (the Part-F correction): `published` is DERIVED from the git remote state — is HEAD reachable from any remote ref?
 * (git branch -r --contains HEAD). A DECLARED published flag is the same defect X-RECKON was minted to kill, reintroduced
 * in a new field. The honest limit: remote-tracking refs reflect the last fetch; the UNPUBLISHED case (empty) cannot
 * false-positive to published without an actual push, which is exactly the direction that matters for the kill-criterion.
 */
import { Published } from "./published"

export namespace Reach {
  export interface Fact {
    installPath: string
    firstRunSeconds: number | null // MEASURED (DD-14 / R-8) — never estimated; null until a measurement is supplied
    published: boolean // DERIVED from the git remote (RP-4), never declared
    publishedDetail: string // how it was derived + which remote refs contain HEAD (transparency)
    reachableHumans: number | "UNJUDGEABLE"
  }

  // DERIVE published — Socket V37 (S109/DD-26): delegated to Published.derive, which fixes G-4's defect (the V35/V36
  // predicate `git branch -r --contains HEAD` returned TRUE ON ANY CLONE). Publication now requires a remote containing HEAD
  // whose URL is a PUBLIC HOST (a stranger can clone it) — a local-clone origin derives false, proven on the pristine clone.
  export function derivePublished(): { published: boolean; detail: string } {
    return Published.derive()
  }

  export function fact(opts: { installPath?: string; firstRunSeconds?: number | null } = {}): Fact {
    const { published, detail } = derivePublished()
    return {
      installPath: opts.installPath ?? "clone the repo · have Bun ≥ 1.3 · `./organon.sh` — or the built single-file binary + one line (D49, unsigned)",
      firstRunSeconds: opts.firstRunSeconds ?? null,
      published,
      publishedDetail: detail,
      reachableHumans: published ? "UNJUDGEABLE" : 1, // structural (X-REACH(e)) — never surveyed
    }
  }

  // the structural invariant (X-REACH(e)): reachableHumans is EXACTLY published ? "UNJUDGEABLE" : 1 — never surveyed. A
  // seeded published:false with reachableHumans > 1, or a seeded published:true with a numeric count, VIOLATES it (S96).
  export function validFact(f: { published: boolean; reachableHumans: number | "UNJUDGEABLE" }): { ok: boolean; reason: string } {
    if (f.published) return f.reachableHumans === "UNJUDGEABLE" ? { ok: true, reason: "published → UNJUDGEABLE (ORGANON does not count strangers)" } : { ok: false, reason: `published → reachableHumans must be UNJUDGEABLE, got ${f.reachableHumans} (a surveyed count is forbidden, attack #9)` }
    return f.reachableHumans === 1 ? { ok: true, reason: "unpublished → exactly 1 (the Operator)" } : { ok: false, reason: `unpublished → reachableHumans must be 1, got ${f.reachableHumans} (zero doors ≠ many reachers)` }
  }

  // the one sentence this sprint exists to make sayable — beside THE NUMBER in the gate.
  export function reachSentence(f: Fact): string {
    return f.published
      ? `published: true · reachableHumans: UNJUDGEABLE — ORGANON does not count strangers.`
      : `published: false · reachableHumans: 1 — the number is what it is, and until now exactly one human could have made it otherwise.`
  }

  // ── SURROGATE ADDENDUM (V38-B, S139/D51) — THE INSTRUMENT'S FRAME ────────────────────────────────────────────────────
  // The reach FACT stays derived (published ? UNJUDGEABLE : 1). Its INTERPRETATION is DERIVED from D51's recorded state in
  // the surrogate pins: once the pen answers D51 = INSTRUMENT (my personal tool), reachableHumans: 1 is BY-DESIGN — the spec,
  // not a deficiency. Before the ruling it is THE-OPEN-QUESTION. A producer framing the 1 as a failure FAILS (S139); the fact
  // never moves, only its reading.
  export type Interpretation = "BY-DESIGN" | "THE-OPEN-QUESTION"

  // read D51's answered state from the surrogate pins (the single source; derived, never declared here).
  function d51AnsweredInstrument(): boolean {
    try {
      const { readFileSync } = require("node:fs") as typeof import("node:fs")
      const path = require("node:path") as typeof import("node:path")
      const { PKG_ROOT } = require("./frozen") as { PKG_ROOT: string }
      const sg = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "surrogate-pins.json"), "utf8"))
      return sg?.thePenMoved?.rulings?.D51?.status === "ANSWERED" && /INSTRUMENT/.test(sg?.thePenMoved?.rulings?.D51?.inferenceStatedSeparately ?? "")
    } catch {
      return false // pre-addendum checkout → D51 still open
    }
  }

  export function interpretation(): Interpretation {
    return d51AnsweredInstrument() ? "BY-DESIGN" : "THE-OPEN-QUESTION"
  }

  // the instrument frame's sentence for reachableHumans: 1 — BY-DESIGN, never a deficiency (S139). Only rendered once D51 is
  // answered INSTRUMENT; a line framing the 1 as a failure, or any law as relaxable-because-personal, is forbidden.
  export function instrumentSentence(f: Fact): string {
    if (interpretation() !== "BY-DESIGN") return reachSentence(f)
    return `published: ${f.published} · reachableHumans: 1 — BY DESIGN. The pen answered D51: my personal tool. n=1 is the spec, not a deficiency — and an instrument for one person keeps all seventeen laws, because they were never about the audience.`
  }

  // S139 — a generated reach/framing line is VALID only if it does not frame the 1 as a failure and does not frame any law as
  // relaxable-because-personal. Seeded negatives fail.
  export function frameIsHonest(line: string): { ok: boolean; reason: string } {
    if (/reachableHumans[^.]*\b(deficiency|failure|failing|too few|not enough|nobody|no one uses)\b/i.test(line)) return { ok: false, reason: "frames reachableHumans: 1 as a failure — forbidden under D51 (it is BY-DESIGN)" }
    if (/\b(law|wall|rigor|honesty|moat)\b[^.]*\b(relax|soften|negotiable|loosen|waive)\b[^.]*\b(personal|private|instrument|one user|only reader)\b/i.test(line) || /\b(personal|private)\b[^.]*\b(relax|soften|negotiable|loosen|waive)\b[^.]*\b(law|wall|rigor|honesty)\b/i.test(line)) return { ok: false, reason: "frames a law as relaxable-because-personal — forbidden (an instrument for one person keeps all seventeen laws, S139)" }
    return { ok: true, reason: "honest frame — the 1 is BY-DESIGN, no law is relaxed" }
  }
}
