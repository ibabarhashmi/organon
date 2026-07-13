/**
 * ORGΛNON — THE CADENCE SPRINT wall S78 (THE DOOR REFUSES AND AUTHORS NOTHING). The server-rendered manifest form is a thin,
 * honest shell over the .strict() zod schema: every invalid input is REFUSED before registration with its honest reason (never
 * coerced to a default); ZERO pre-filled judgment-bearing fields on the NEW form; no "most users choose" / social-proof /
 * highlighted-option shape (the ESMA ¶61 implicit-recommendation test); every form string passes guardLine + advicePattern;
 * the screens count is still 3; an edit is a disclosed re-pin. The door is a PATH, not a fourth screen.
 */
import { test, expect } from "bun:test"
import { Author } from "../../src/strategy/author"
import { Manifest } from "../../src/strategy/manifest"
import { Reality } from "../../src/studio/reality"
import { VoiceGates } from "../../src/ask/gates"
import { AdviceShape } from "../../src/ask/advice" // the Reckoning SHAPE guard — the door copy (incl. the period-less affordance line) goes through it
import { StrategyCompile } from "../../src/strategy/compile"

const valid = {
  pos0_subjectKey: "defillama:pool:x", pos0_size: "1000", pos0_units: "USDC",
  thesis: "steady base yield holds through the next rate cut", exit_kind: "peg-floor", exit_threshold: "0.995", exit_scope: "portfolio",
}

test("S78 — Author.parse REFUSES, never coerces: empty / missing-size / unknown-kind / over-length are each refused with a NAMED reason", () => {
  expect(Author.parse({}).ok).toBe(false) // no positions
  const r1 = Author.parse({ pos0_subjectKey: "x", pos0_units: "USDC", thesis: "t", exit_kind: "peg-floor", exit_threshold: "1", exit_scope: "portfolio" })
  expect(r1.ok).toBe(false) // missing size — NOT defaulted to 0/1
  if (!r1.ok) expect(r1.error).toMatch(/size|number/i)
  const r2 = Author.parse({ ...valid, exit_kind: "twitter-sentiment" })
  expect(r2.ok).toBe(false)
  if (!r2.ok) expect(r2.error).toMatch(/not an evaluable exit kind/i)
  const r3 = Author.parse({ ...valid, thesis: "x".repeat(5000) })
  expect(r3.ok).toBe(false) // over-length thesis
})

test("S78 — a position row with a size but NO subject is a malformed attempt → REFUSED (never silently dropped)", () => {
  const r = Author.parse({ pos0_size: "100", pos0_units: "USDC", thesis: "t", exit_kind: "peg-floor", exit_threshold: "1", exit_scope: "portfolio" })
  expect(r.ok).toBe(false)
  if (!r.ok) expect(r.error).toMatch(/no subject/i)
})

test("S78 — a valid declaration parses to exactly what the user typed — no invented field, no default on a judgment field", () => {
  const r = Author.parse(valid)
  expect(r.ok).toBe(true)
  if (r.ok) {
    expect(r.manifest.positions).toEqual([{ subjectKey: "defillama:pool:x", size: 1000, units: "USDC" }])
    expect(r.manifest.thesis).toBe("steady base yield holds through the next rate cut")
    expect(r.manifest.exitCriterion).toEqual({ kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" })
  }
})

test("S78 — the NEW door AUTHORS NOTHING: no default exit kind, no pre-filled thesis, no ranked/social-proof shape; every string passes both walls", () => {
  const html = Reality.renderManifestDoor({ mode: "new" })
  // the exit-kind select opens UNSELECTED (a placeholder), never a defaulted kind (no implicit recommendation)
  expect(html).toMatch(/<option value="" disabled selected>/)
  expect(html).not.toMatch(/most users choose|people like you|recommended|popular choice|we suggest/i)
  // the NEW form's judgment fields are empty (no pre-fill)
  expect(html).toMatch(/name="thesis"[^>]*>\s*<\/textarea>|name="thesis" rows="4"[^>]*><\/textarea>/)
  // every pinned door string passes guardLine + advicePattern
  for (const s of Reality.DOOR_COPY) {
    expect(AdviceShape.detect(s).advice).toBe(false)
    expect(StrategyCompile.guardLine(s).ok).toBe(true)
  }
})

test("S78 — the EDIT door pre-fills the USER's OWN prior declaration (their data, not a suggestion) + a REQUIRED reason", () => {
  const r = Author.parse(valid)
  expect(r.ok).toBe(true)
  if (!r.ok) return
  const html = Reality.renderManifestDoor({ mode: "edit", editId: "abc123", values: { thesis: r.manifest.thesis, exitKind: "peg-floor", exitThreshold: "0.995", exitScope: "portfolio", positions: [{ subjectKey: "defillama:pool:x", size: "1000", units: "USDC" }] } })
  expect(html).toContain("steady base yield holds through the next rate cut") // the user's own thesis, echoed
  expect(html).toMatch(/reason for the re-pin \(required\)/) // the disclosed re-pin's reason is required
  expect(html).toMatch(/<option value="peg-floor" selected>/) // the user's own kind is pre-selected (their data)
})

test("S78 — the door is a PATH, not a fourth screen — the conscious 3 are unchanged", () => {
  expect(Reality.SCREENS).toEqual(["shelf", "reality-check", "ask"])
  expect(Reality.SCREENS.length).toBe(3)
})

test("S78 — the manifest prefix + the schema's evaluable exit set back the door (the refusal surface IS the schema)", () => {
  expect(Manifest.MANIFEST_KEY_PREFIX).toBe("manifest:")
  expect(Manifest.EXIT_KINDS).toContain("peg-floor")
  expect(Manifest.EXIT_KINDS.length).toBe(4)
})
