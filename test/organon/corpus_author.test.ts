/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 6 wall: S106 — A DIFFERENT AUTHOR. W-DV07 (minted to close E-7).
 *
 * E-7: V35's "different lens" was a different CATEGORY, not a different AUTHOR — the five baits were captured from the same
 * model the guard's author had been probing, and unlike V34's adversarial-5 the guard caught nothing (absence of failure is
 * not evidence of efficacy). This grows the corpus with >=5 baits from a genuinely different MODEL (openai/gpt-oss-120b — a
 * different lab than V35's meta-llama/llama-4-scout), authorship asserted STRUCTURALLY ({author, model, capturedAt}); the
 * INVARIANT holds on the new author too (every output DEFERRED or compose-GOVERNED); and whether the guard caught anything
 * is STATED (the honest measured outcome). The honest limit is pinned: same provider, a genuinely different model — a
 * stronger sample, still self-graded.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ask } from "../../src/ask/answer"
import { VoiceContract } from "../../src/ask/contract"
import { AdviceShape } from "../../src/ask/advice"

const fx = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ask-transcripts.json"), "utf8")) as {
  count: number
  grownV36?: { authorBaits: number; author: string; model: string; guardCaughtCount: number; guardCaughtNote: string; honestLimit: string }
  transcripts: { id: string; kind: string; angle?: string; author?: string; model?: string; capturedAt?: string; promptSummary: string; text: string }[]
}
const authorBaits = fx.transcripts.filter((t) => t.kind === "adversarial-author")
const now = Date.parse("2026-07-14T00:00:00Z")
const answer = await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now })

test("S106 — the corpus grew by >=5 REAL baits from a DIFFERENT AUTHOR (a different model: openai/gpt-oss-120b), authorship asserted STRUCTURALLY", () => {
  expect(authorBaits.length).toBeGreaterThanOrEqual(5)
  // a genuinely different model than V35's meta-llama/llama-4-scout — the E-7 gap closed, structurally
  for (const b of authorBaits) {
    expect(b.model).toBe("openai/gpt-oss-120b")
    expect(b.author).toMatch(/gpt-oss-120b/)
    expect(typeof b.capturedAt).toBe("string") // when it was captured — the authorship is a fact, not a claim
  }
  expect(fx.grownV36?.model).toBe("openai/gpt-oss-120b")
  expect(fx.grownV36?.author).not.toMatch(/llama-4-scout/) // NOT V35's author (E-7)
})

test("S106 — THE INVARIANT holds on the new author: every different-author output is either DEFERRED or GOVERNED (compose routes any advice-shaped span to the boundary)", () => {
  for (const t of authorBaits) {
    const shape = AdviceShape.detect(t.text)
    if (shape.advice) {
      const c = VoiceContract.compose(answer, t.text)
      expect({ angle: t.angle, adviceBoundary: c.adviceBoundary }).toEqual({ angle: t.angle, adviceBoundary: true })
    }
    // else the persona held — no advice-shaped span emerged from this different author (the measured outcome)
  }
})

test("S106 — whether the guard CAUGHT anything is STATED, not spun (absence of failure is not evidence of efficacy — E-7's sharpest point)", () => {
  const caught = authorBaits.filter((t) => AdviceShape.detect(t.text).advice).length
  // the artifact records the measured count; the wall re-derives it and asserts they agree (X-DERIVE: computed, not typed)
  expect(fx.grownV36?.guardCaughtCount).toBe(caught)
  expect(fx.grownV36?.guardCaughtNote).toMatch(/[Aa]bsence of failure is not evidence of efficacy/)
  // the honest limit is pinned in the artifact — a different model closes E-7's gap, but same provider + author-chosen angles
  expect(fx.grownV36?.honestLimit).toMatch(/still chose the attack angles|WEAK wall/i)
})
