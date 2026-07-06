/**
 * WALL — trail immutability (Transplant Phase 0; Rule T-SUPERSEDE). Records are immutable; truth is corrected by
 * APPEND. This wall pins both directions, with the V6 §0.7 re-pointing as the canonical POSITIVE CONTROL:
 *   (1) a re-pointed (in-place-edited) past record FAILS verify() loudly;
 *   (2) a proper superseding entry that references the old hash PASSES and carries the corrected truth;
 *   (3) the V6 §0.7 case — the phase-0 inventory evidence, which was re-pointed to a "stable bundle" — is re-expressed
 *       here as a proper supersession, and the re-point version is shown to fail.
 * If this wall existed in V6, the re-point would have been caught before it was committed.
 */
import { describe, test, expect } from "bun:test"
import { Supersede } from "../../src/studio/supersede"

describe("WALL trail_immutability — records immutable, corrections appended (T-SUPERSEDE)", () => {
  test("a proper supersession APPENDS a correction referencing the old hash and verifies", () => {
    const log: Supersede.Record[] = []
    const orig = Supersede.append(log, "phase-0-inventory", { evidence: "bee1a152", note: "capability floor anchor" })
    Supersede.supersede(log, "phase-0-inventory", orig.hash, { evidence: "4888ef49", note: "floor rose bee1a152→4888ef49 (C-NOREGRESS working); corrects the anchor, references the old", supersedes: orig.hash })
    const v = Supersede.verify(log)
    expect(v.ok).toBe(true) // the old record is byte-intact; the correction is a new appended record
    // the current-truth view shows the original as superseded and the correction as live
    const cur = Supersede.current(log)
    expect(cur[0].supersededBy).not.toBeNull()
    expect(cur[1].supersededBy).toBeNull()
    expect((cur[1].payload as { evidence: string }).evidence).toBe("4888ef49")
  })

  test("POSITIVE CONTROL — a RE-POINTED past record (in-place edit) is CAUGHT", () => {
    const log: Supersede.Record[] = []
    Supersede.append(log, "phase-0-inventory", { evidence: "bee1a152" })
    Supersede.append(log, "phase-1-solid", { evidence: "96536f5e" })
    expect(Supersede.verify(log).ok).toBe(true)
    // now RE-POINT the past record the V6 way: edit its payload in place (repoint the evidence anchor), leaving its hash
    log[0] = { ...log[0], payload: { evidence: "4888ef49" } } // the anti-pattern: a rewrite of history, not an append
    const v = Supersede.verify(log)
    expect(v.ok).toBe(false)
    expect(v.brokenAt).toBe("phase-0-inventory")
    expect(v.reason).toContain("RE-POINT DETECTED")
  })

  test("a supersession referencing a NON-existent hash is refused (a correction must cite a real prior record)", () => {
    const log: Supersede.Record[] = []
    Supersede.append(log, "a", { x: 1 })
    expect(() => Supersede.supersede(log, "a", "f".repeat(64), { x: 2 })).toThrow(/no such record/)
  })

  test("the V6 §0.7 re-point, re-expressed properly, verifies; the re-point itself fails", () => {
    // reconstruct the V6 trail record for phase-0's inventory evidence, then correct it the RIGHT way
    const log: Supersede.Record[] = []
    const p0 = Supersede.append(log, "checkpoint-v6/phase-0", { decision: "ADVANCE", inventoryEvidence: "capability-inventory.json@bee1a152", trailHash: "02d6ff383fdd" })
    // V6 wanted the trail reproducible while the floor legitimately rose — the RIGHT move is a supersession:
    const fix = Supersede.supersede(log, "checkpoint-v6/phase-0", p0.hash, {
      correction: "phase-0 inventory evidence cited the STABLE Phase-0 bundle (embeds anchor bee1a152) so the trail re-derives while the C-NOREGRESS floor rises bee1a152→4888ef49; this supersession records that WITHOUT re-pointing the original.",
      supersedesHash: p0.hash,
    })
    expect(Supersede.verify(log).ok).toBe(true)
    expect(fix.supersedes).toBe(p0.hash)
  })
})
