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
}
