/**
 * WALL — H-GATE. The gatekeeper refuses an ADVANCE that is not backed by hash-resolving evidence or a preserved-original
 * amendment; it flags weakening amendments; it reports PENDING independence until a non-author run exists; and its trail
 * is append-only + hash-chained. This is the sprint's central improvement — the paperwork gets the same walls as the
 * bytes — so it is itself positive-controlled: every refusal path is exercised.
 */
import { describe, test, expect } from "bun:test"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Checkpoint } from "../../src/studio/checkpoint"

const crit = [{ id: "c1", text: "the battery is 6/6 green" }]
const dir = mkdtempSync(path.join(tmpdir(), "gate-"))
const evPath = path.join(dir, "evidence.txt")
writeFileSync(evPath, "40/40 green\n")

function gate() {
  const g = new Checkpoint.Gate()
  g.declare("P", crit)
  return g
}

describe("WALL checkpoint_gate — no unregistered gate decisions (H-GATE)", () => {
  test("ADVANCE with a DANGLING evidence link is refused", () => {
    expect(() => gate().record({ phase: "P", decision: "ADVANCE", stamp: "t0", resolutions: [{ id: "c1", evidence: { path: path.join(dir, "nope.txt"), sha256: "deadbeef" } }] })).toThrow(Checkpoint.GateError)
  })

  test("ADVANCE with a WRONG-HASH evidence (artifact edited after the pin) is refused", () => {
    expect(() => gate().record({ phase: "P", decision: "ADVANCE", stamp: "t0", resolutions: [{ id: "c1", evidence: { path: evPath, sha256: "0".repeat(64) } }] })).toThrow(/hash mismatch/)
  })

  test("ADVANCE with NO evidence and NO amendment (a free-text ADVANCE) is refused", () => {
    expect(() => gate().record({ phase: "P", decision: "ADVANCE", stamp: "t0", resolutions: [] })).toThrow(/free-text ADVANCE is not a recordable state/)
  })

  test("ADVANCE with an amendment that did NOT preserve the original text is refused", () => {
    expect(() =>
      gate().record({ phase: "P", decision: "ADVANCE", stamp: "t0", resolutions: [{ id: "c1", amendment: { reason: "scope", originalText: "the battery is GREEN", newText: "some walls" } }] }),
    ).toThrow(/did not preserve the ORIGINAL/)
  })

  test("ADVANCE with an amendment missing a reason is refused", () => {
    expect(() =>
      gate().record({ phase: "P", decision: "ADVANCE", stamp: "t0", resolutions: [{ id: "c1", amendment: { reason: "  ", originalText: crit[0].text, newText: "x" } }] }),
    ).toThrow(/lacks a stated reason/)
  })

  test("ADVANCE with HASH-RESOLVING evidence records; the trail is append-only + chained", () => {
    const g = gate()
    const rec = g.record({ phase: "P", decision: "ADVANCE", stamp: "t1", resolutions: [{ id: "c1", evidence: Checkpoint.pin(evPath) }] })
    expect(rec.decision).toBe("ADVANCE")
    expect(rec.criteria[0].status).toBe("evidenced")
    expect(g.verifyChain().ok).toBe(true)
  })

  test("a WEAKENING amendment is recorded but FLAGGED for review (legible, not hidden)", () => {
    const g = gate()
    const rec = g.record({ phase: "P", decision: "ADVANCE", stamp: "t1", resolutions: [{ id: "c1", amendment: { reason: "descoped to built walls only", originalText: crit[0].text, newText: "some" } }] })
    expect(rec.criteria[0].weakened).toBe(true)
    expect(g.render()).toContain("WEAKENED")
  })

  test("independence is PENDING until a non-author run is recorded (H-EARN)", () => {
    const g = gate()
    g.record({ phase: "P", decision: "ADVANCE", stamp: "t1", author: "author-run", resolutions: [{ id: "c1", evidence: Checkpoint.pin(evPath) }] })
    expect(g.independence()).toBe("pending-non-author")
    const g2 = gate()
    g2.record({ phase: "P", decision: "ADVANCE", stamp: "t2", author: "non-author-run", resolutions: [{ id: "c1", evidence: Checkpoint.pin(evPath) }] })
    expect(g2.independence()).toBe("verified-by-non-author")
  })

  test("a STOP is an honest terminal — recordable without meeting criteria (walking skeleton)", () => {
    const g = gate()
    const rec = g.record({ phase: "P", decision: "STOP", stamp: "t1", resolutions: [{ id: "c1", amendment: { reason: "live run blocked: no free-model key in this environment", originalText: crit[0].text, newText: "pending" } }] })
    expect(rec.decision).toBe("STOP")
    expect(g.verifyChain().ok).toBe(true)
  })
})
