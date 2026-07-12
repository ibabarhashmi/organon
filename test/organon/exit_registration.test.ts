/**
 * ORGΛNON — THE MANIFEST SPRINT, Phase 2 wall (FILED-HONESTLY; S73 groundwork). The exit criterion is the user's
 * kill-criterion: EVALUABLE-or-refused (the reason quoted), CONTENT-HASHED at registration, immutable-without-a-disclosed-
 * re-pin (a silent edit DETECTED), and DETERMINISTIC over the captured facts (byte-identical ×2; UNJUDGEABLE on absent
 * data — never a fabricated fired/not-fired). Outputs SHOWN (CV3).
 */
import { test, expect } from "bun:test"
import { ExitCriterion } from "../../src/strategy/exit"

test("EXIT — a valid criterion registers + is content-hashed (the goalpost fixed, exactly as 8b4e094b is)", () => {
  const r = ExitCriterion.register({ kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" })
  expect(r.ok).toBe(true)
  if (!r.ok) return
  expect(r.hash).toMatch(/^[0-9a-f]{64}$/)
  // the hash is STABLE (canonical key order) — re-registering the same criterion yields the same hash
  const r2 = ExitCriterion.register({ subjectScope: "portfolio", kind: "peg-floor", threshold: 0.995 })
  expect(r2.ok && r2.hash).toBe(r.hash)
})

test("EXIT — an UNEVALUABLE criterion is REFUSED with the reason (a kind the engine cannot read)", () => {
  const r = ExitCriterion.register({ kind: "twitter-sentiment", threshold: 1, subjectScope: "portfolio" })
  expect(r.ok).toBe(false)
  if (r.ok) return
  console.log("  refusal:", r.error)
  expect(r.error).toMatch(/not evaluable over facts the engine captures/i)
  expect(r.error).toMatch(/Twitter sentiment.*refused/i)
  expect(r.error).toMatch(/peg-floor.*funding-flip-count.*tvl-drawdown.*governance-change/)
})

test("EXIT — an INSANE threshold for the kind is refused with the reason (evaluable-in-practice)", () => {
  const peg = ExitCriterion.register({ kind: "peg-floor", threshold: 42, subjectScope: "portfolio" })
  expect(peg.ok).toBe(false)
  if (!peg.ok) console.log("  refusal:", peg.error)
  expect(peg.ok ? "" : peg.error).toMatch(/peg floor must be a price near par/i)
  const dd = ExitCriterion.register({ kind: "tvl-drawdown", threshold: 1.5, subjectScope: "portfolio" })
  expect(dd.ok).toBe(false)
  if (!dd.ok) console.log("  refusal:", dd.error)
  expect(dd.ok ? "" : dd.error).toMatch(/fraction in \(0, 1\)/i)
  const flip = ExitCriterion.register({ kind: "funding-flip-count", threshold: 2.5, subjectScope: "portfolio" })
  expect(flip.ok).toBe(false)
  expect(flip.ok ? "" : flip.error).toMatch(/whole number ≥ 1/i)
})

test("EXIT — a SILENT edit to a registered criterion is DETECTED (the content hash diverges) (S73)", () => {
  const reg = ExitCriterion.register({ kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" })
  expect(reg.ok).toBe(true)
  if (!reg.ok) return
  // the goalpost stands — the same criterion is not a silent edit
  expect(ExitCriterion.isSilentEdit(reg.hash, { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" })).toBe(false)
  // a moved threshold (0.995 → 0.95, quietly loosening the exit) is DETECTED
  expect(ExitCriterion.isSilentEdit(reg.hash, { kind: "peg-floor", threshold: 0.95, subjectScope: "portfolio" })).toBe(true)
})

test("EXIT — the ONLY amendment is a DISCLOSED re-pin recording {old, new, reason} (never a silent move) (S73)", () => {
  const old = { kind: "peg-floor" as const, threshold: 0.995, subjectScope: "portfolio" }
  const rp = ExitCriterion.repin(old, { kind: "peg-floor", threshold: 0.99, subjectScope: "portfolio" }, "widened the floor after the venue's historical peg range proved wider than 0.995", "2026-07-12T00:00:00Z")
  expect(rp.ok).toBe(true)
  if (!rp.ok) return
  console.log("  re-pin:", `${rp.repin.oldHash.slice(0, 8)}… → ${rp.repin.newHash.slice(0, 8)}… · ${rp.repin.reason}`)
  expect(rp.repin.oldHash).not.toBe(rp.repin.newHash)
  expect(rp.repin.reason.length).toBeGreaterThan(0)
  // a re-pin WITHOUT a reason is refused — a goalpost cannot move in silence
  const noReason = ExitCriterion.repin(old, { kind: "peg-floor", threshold: 0.99, subjectScope: "portfolio" }, "  ", "2026-07-12T00:00:00Z")
  expect(noReason.ok).toBe(false)
  if (!noReason.ok) expect(noReason.error).toMatch(/must state WHY/i)
})

test("EXIT — evaluate is DETERMINISTIC over the captured facts (byte-identical ×2); the why is number-traced", () => {
  const c = { kind: "peg-floor" as const, threshold: 0.995, subjectScope: "portfolio" }
  const notFired = ExitCriterion.evaluate(c, { peg: 0.9989 })
  const notFired2 = ExitCriterion.evaluate(c, { peg: 0.9989 })
  expect(JSON.stringify(notFired)).toBe(JSON.stringify(notFired2)) // byte-identical ×2
  expect(notFired.fired).toBe(false)
  expect(notFired.judgeable).toBe(true)
  console.log("  eval:", notFired.why)
  expect(notFired.why).toMatch(/peg 0.9989 ≥ floor 0.995 → NOT FIRED/)
  const fired = ExitCriterion.evaluate(c, { peg: 0.98 })
  expect(fired.fired).toBe(true)
  expect(fired.why).toMatch(/peg 0.98 < floor 0.995 → FIRED/)
})

test("EXIT — evaluate is UNJUDGEABLE (never a fabricated fired/not-fired) when the fact is absent", () => {
  const c = { kind: "peg-floor" as const, threshold: 0.995, subjectScope: "portfolio" }
  const u = ExitCriterion.evaluate(c, { peg: null })
  expect(u.judgeable).toBe(false)
  expect(u.fired).toBe(false)
  console.log("  eval:", u.why)
  expect(u.why).toMatch(/UNJUDGEABLE — no captured peg/i)
})

test("EXIT — every evaluable kind fires deterministically over its own captured fact", () => {
  expect(ExitCriterion.evaluate({ kind: "funding-flip-count", threshold: 3, subjectScope: "x" }, { fundingNegPeriods: 5, fundingTotalPeriods: 30 }).fired).toBe(true)
  expect(ExitCriterion.evaluate({ kind: "funding-flip-count", threshold: 3, subjectScope: "x" }, { fundingNegPeriods: 1, fundingTotalPeriods: 30 }).fired).toBe(false)
  expect(ExitCriterion.evaluate({ kind: "tvl-drawdown", threshold: 0.3, subjectScope: "x" }, { tvlDrawdown: 0.4 }).fired).toBe(true)
  expect(ExitCriterion.evaluate({ kind: "tvl-drawdown", threshold: 0.3, subjectScope: "x" }, { tvlDrawdown: 0.1 }).fired).toBe(false)
  expect(ExitCriterion.evaluate({ kind: "governance-change", threshold: 0, subjectScope: "x" }, { governanceChanged: true }).fired).toBe(true)
  expect(ExitCriterion.evaluate({ kind: "governance-change", threshold: 0, subjectScope: "x" }, { governanceChanged: false }).fired).toBe(false)
})
