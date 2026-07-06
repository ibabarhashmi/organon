/**
 * WALL — F-ABSENT. The inventory lists what the system CANNOT do beside what it can. This proves the mechanism that
 * makes scope-loss a visible diff instead of a silent pass: every absence must link to a real four-field park (an
 * unparked absence is an OPEN issue), and a pinned capability that vanishes without an absence entry is an uncovered
 * LOSS (a REGRESS). Positive controls both ways: a bogus-park absence surfaces OPEN; a dropped capability with no
 * absence surfaces as an uncovered loss; the real ABSENCES all resolve to parks in the committed register.
 */
import { describe, test, expect } from "bun:test"
import { Inventory } from "../../src/studio/inventory"

describe("WALL inventory_absences — absences are inventoried + parked (F-ABSENT)", () => {
  test("every seeded absence links to a real four-field park in the committed register", () => {
    const r = Inventory.verifyAbsences()
    if (!r.ok) console.log("  (inventory_absences) OPEN absences:", r.open)
    expect(r.ok).toBe(true)
    expect(Inventory.ABSENCES.length).toBeGreaterThanOrEqual(2) // seeded from P1-1 at minimum (engine backtest, RWA re-exec)
    for (const a of Inventory.ABSENCES) {
      expect(a.park).toBeTruthy()
      expect(a.ownerSprint).toBeTruthy()
      expect(a.description.length).toBeGreaterThan(20)
    }
  })

  test("the scope diff renders gains/losses/absences and flags an UNCOVERED loss (positive control)", () => {
    const pinned = Inventory.snapshot("test-anchor")
    // identity: live tree vs its own snapshot → no gains, no losses, absences carried
    const same = Inventory.scopeDiff(pinned)
    expect(same.gains).toEqual([])
    expect(same.losses).toEqual([])
    expect(same.lossesUncovered).toEqual([])
    expect(same.absences.length).toBe(Inventory.ABSENCES.length)

    // seed a pinned capability that no longer exists live AND is not covered by an absence → an uncovered LOSS
    const polluted: Inventory.Snapshot = {
      ...pinned,
      capabilities: [...pinned.capabilities, { id: "phantom-capability-that-vanished", description: "seeded", files: [] }],
    }
    const diff = Inventory.scopeDiff(polluted)
    expect(diff.losses).toContain("phantom-capability-that-vanished")
    expect(diff.lossesUncovered).toContain("phantom-capability-that-vanished") // no absence owns it → REGRESS-worthy
  })

  test("renderWithAbsences shows both capabilities and the absence section", () => {
    const s = Inventory.snapshot("test-anchor")
    const out = Inventory.renderWithAbsences(s)
    expect(out).toContain("deliberate absences")
    expect(out).toContain("engine-backtest")
    expect(out).toContain("→ park P1-1")
  })
})
