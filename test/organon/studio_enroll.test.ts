/**
 * ORGΛNON STUDIO — FORWARD ENROLLMENT battery (Phase 6; Rule L-LOOP; PRODUCT-LOOP gate). Proves the loop cannot
 * flatter: enroll only from a not-yet verdict, pre-registration anchored, per-author×domain cap enforced, permanent
 * public listing (withdrawal is an EVENT, not an erasure), OBSERVED-never-performing, and NO delete capability
 * (forgetting is impossible → cherry-picking is impossible).
 */
import { describe, test, expect } from "bun:test"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Enroll } from "../../src/studio/enroll"

function book(): Enroll.Book {
  return new Enroll.Book(path.join(mkdtempSync(path.join(tmpdir(), "enroll-")), "enroll.jsonl"))
}
const base = { authorId: "a", domain: "rwa", verdictId: "v", verdict: "INSUFFICIENT-EVIDENCE", familySize: 1, rootCount: 1 }

describe("enrollment — the loop that cannot flatter (L-LOOP)", () => {
  test("enroll from a not-yet verdict → listed, OBSERVED, pre-registration anchored", () => {
    const b = book()
    const e = b.enroll({ ...base, specHash: "spec1", at: 1000 })
    expect(e.preRegAnchor.specHash).toBe("spec1")
    const list = b.list()
    expect(list[0].state).toBe("OBSERVED")
    expect(list[0].verdict).toBe("INSUFFICIENT-EVIDENCE")
  })

  test("a GO cannot be enrolled (a GO doesn't need a clock; enrollment is for not-yet)", () => {
    expect(() => book().enroll({ ...base, verdict: "GO", specHash: "s", at: 1 })).toThrow(/cannot enroll a GO/)
  })

  test("the per-author×domain CAP is enforced", () => {
    const b = book()
    for (let i = 0; i < Enroll.CAP_PER_AUTHOR_DOMAIN; i++) b.enroll({ ...base, specHash: `s${i}`, at: i })
    expect(() => b.enroll({ ...base, specHash: "over", at: 99 })).toThrow(/cap reached/)
  })

  test("withdrawal is a permanent EVENT — the enrollment stays LISTED as WITHDRAWN, never erased", () => {
    const b = book()
    const e = b.enroll({ ...base, specHash: "s", at: 1 })
    b.withdraw(e.enrollmentId, "changed my mind", 2)
    const list = b.list()
    expect(list.length).toBe(1) // still there
    expect(list[0].state).toBe("WITHDRAWN")
    expect(list[0].withdrawnAt).toBe(2)
  })

  test("there is NO delete/remove/hide capability (forgetting is impossible → cherry-picking is impossible)", () => {
    const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(book()))
    for (const forbidden of ["delete", "remove", "hide", "erase", "purge"]) expect(proto).not.toContain(forbidden)
  })

  test("OBSERVED-never-performing — the View has no PERFORMING state, and stamps accrue as observations", () => {
    const b = book()
    b.enroll({ ...base, specHash: "s", at: 1 })
    const list = b.list((domain) => (domain === "rwa" ? 3 : 0)) // 3 capture stamps accrued
    expect(list[0].state).toBe("OBSERVED")
    expect(list[0].stampsObserved).toBe(3)
    expect((list[0] as any).state).not.toBe("PERFORMING")
  })

  test("cherry-pick simulation — enroll 5, withdraw 2 → all 5 remain listed with their trajectories", () => {
    const b = book()
    const ids = []
    for (let i = 0; i < 5; i++) ids.push(b.enroll({ ...base, specHash: `s${i}`, at: i }).enrollmentId)
    b.withdraw(ids[1], "looked bad", 10)
    b.withdraw(ids[3], "looked bad", 11)
    const list = b.list()
    expect(list.length).toBe(5) // nothing hidden; the 2 bad ones are visibly WITHDRAWN
    expect(list.filter((v) => v.state === "WITHDRAWN").length).toBe(2)
  })
})
