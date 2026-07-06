/**
 * ORGΛNON STUDIO — FORWARD ENROLLMENT: the product loop (Phase 6; Rule L-LOOP). The product's most common output is
 * "not yet" (INSUFFICIENT / NO-GO). Enrollment makes that ACTIONABLE and un-cherry-pickable: from a real verdict, the
 * author pre-registers the spec for forward observation — anchored (spec hash + timestamp + verdict id), the author's
 * family+root counts attached, capped per author×domain, and PERMANENTLY, PUBLICLY listed. Enrollments render as
 * OBSERVED with a clock (fresh capture stamps accrue against them), NEVER "performing"; they are UN-DELETABLE and
 * UN-HIDABLE — a withdrawal is itself a permanent, displayed event, never an erasure. Forgetting is impossible, so
 * cherry-picking is impossible.
 */
import { createHash } from "node:crypto"
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"

export namespace Enroll {
  export const CAP_PER_AUTHOR_DOMAIN = 5 // a per-author×domain enrollment cap (L-LOOP; sybil residual inherited, H-SCOPE)

  export class EnrollError extends Error {}

  // an enrollment event is append-only: CREATED or WITHDRAWN. There is no DELETE event — permanence by construction.
  export type EventKind = "enrolled" | "withdrawn"
  export interface Event {
    kind: EventKind
    enrollmentId: string
    specHash: string
    authorId: string
    domain: string
    verdictId: string
    verdict: string // the verdict this enrollment was born from (INSUFFICIENT / NO-GO — refusals may enroll)
    familySize: number
    rootCount: number
    preRegAnchor: { specHash: string; anchoredAt: number } // the pre-registration commitment (hash + time)
    at: number
    reason?: string // for a withdrawal — itself permanently recorded
  }

  export interface View {
    enrollmentId: string
    specHash: string
    authorId: string
    domain: string
    verdict: string
    state: "OBSERVED" | "WITHDRAWN" // NOTE: there is deliberately no "PERFORMING" state
    familySize: number
    rootCount: number
    enrolledAt: number
    withdrawnAt: number | null
    stampsObserved: number
  }

  const sha256 = (s: string) => createHash("sha256").update(s).digest("hex")

  export class Book {
    private events: Event[] = []
    constructor(private file: string) {
      if (existsSync(file)) this.events = readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l) as Event)
      else writeFileSync(file, "")
    }

    private append(e: Event): void {
      this.events.push(e)
      appendFileSync(this.file, JSON.stringify(e) + "\n")
    }

    private enrolledCount(authorId: string, domain: string): number {
      const ids = new Set<string>()
      for (const e of this.events) if (e.kind === "enrolled" && e.authorId === authorId && e.domain === domain) ids.add(e.enrollmentId)
      return ids.size
    }

    // Enroll a spec for forward observation. Requires a real verdict that is INSUFFICIENT or NO-GO (refusals may enroll;
    // a GO doesn't need a clock). Enforces the per-author×domain cap. Pre-registration anchor = the spec hash + now.
    enroll(input: { specHash: string; authorId: string; domain: string; verdictId: string; verdict: string; familySize: number; rootCount: number; at: number }): Event {
      if (input.verdict !== "INSUFFICIENT-EVIDENCE" && input.verdict !== "NO-GO" && input.verdict !== "CONDITIONAL" && input.verdict !== "CANNOT-VERIFY-SEARCH" && input.verdict !== "CANNOT-VERIFY-DATA")
        throw new EnrollError(`cannot enroll a ${input.verdict} — enrollment is for a not-yet verdict that needs a forward clock (L-LOOP)`)
      if (this.enrolledCount(input.authorId, input.domain) >= CAP_PER_AUTHOR_DOMAIN)
        throw new EnrollError(`enrollment cap reached: ${input.authorId} already has ${CAP_PER_AUTHOR_DOMAIN} enrollments in ${input.domain} (L-LOOP cap)`)
      const enrollmentId = sha256(`${input.specHash}|${input.authorId}|${input.at}`).slice(0, 16)
      const e: Event = {
        kind: "enrolled", enrollmentId, specHash: input.specHash, authorId: input.authorId, domain: input.domain,
        verdictId: input.verdictId, verdict: input.verdict, familySize: input.familySize, rootCount: input.rootCount,
        preRegAnchor: { specHash: input.specHash, anchoredAt: input.at }, at: input.at,
      }
      this.append(e)
      return e
    }

    // Withdraw = a permanent, displayed EVENT. It does NOT delete the enrollment; the enrollment stays listed as
    // WITHDRAWN with its history. There is no method that removes an enrollment from the record (capability absence).
    withdraw(enrollmentId: string, reason: string, at: number): Event {
      const created = this.events.find((e) => e.kind === "enrolled" && e.enrollmentId === enrollmentId)
      if (!created) throw new EnrollError(`no such enrollment ${enrollmentId}`)
      const e: Event = { ...created, kind: "withdrawn", at, reason }
      this.append(e)
      return e
    }

    // The public listing — ALL enrollments incl. withdrawn incl. failures; OBSERVED or WITHDRAWN, never PERFORMING.
    // `stampsFor` counts fresh capture stamps for the enrollment's domain (the clock accruing against it).
    list(stampsFor: (domain: string) => number = () => 0): View[] {
      const byId = new Map<string, View>()
      for (const e of this.events) {
        if (e.kind === "enrolled") {
          byId.set(e.enrollmentId, {
            enrollmentId: e.enrollmentId, specHash: e.specHash, authorId: e.authorId, domain: e.domain, verdict: e.verdict,
            state: "OBSERVED", familySize: e.familySize, rootCount: e.rootCount, enrolledAt: e.at, withdrawnAt: null, stampsObserved: stampsFor(e.domain),
          })
        } else if (e.kind === "withdrawn") {
          const v = byId.get(e.enrollmentId)
          if (v) { v.state = "WITHDRAWN"; v.withdrawnAt = e.at } // still listed — withdrawal is disclosure, not erasure
        }
      }
      return [...byId.values()]
    }

    events_(): readonly Event[] {
      return this.events
    }
  }
}
