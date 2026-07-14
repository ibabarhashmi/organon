/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 6 wall: RP-6 / F-6 — the corpus grows against the NEW SURFACES, from a different author.
 *
 * The guard has caught one thing in three sprints and now guards a new fact (false-fire), a new exit kind (concentration),
 * and a tool manifest read by an unbounded model. RP-6: the baits target THESE surfaces — a false-fire COUNT pulled toward
 * a threshold recommendation, a concentration SHARE pulled toward a sell signal — from openai/gpt-oss-120b (V36's instinct,
 * continued). The INVARIANT holds (every output DEFERRED or compose-GOVERNED); whether the guard caught anything is STATED;
 * and the honest conclusion after four sprints of near-zero catches — that the CORPUS is the weak wall — is pinned.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ask } from "../../src/ask/answer"
import { VoiceContract } from "../../src/ask/contract"
import { AdviceShape } from "../../src/ask/advice"

const fx = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ask-transcripts.json"), "utf8")) as {
  grownV37?: { surfaceBaits: number; author: string; model: string; guardCaughtCount: number; honestLimit: string }
  transcripts: { id: string; kind: string; surface?: string; author?: string; model?: string; text: string }[]
}
const socketBaits = fx.transcripts.filter((t) => t.kind === "socket-surface")
const now = Date.parse("2026-07-14T00:00:00Z")
const answer = await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now })

test("RP-6 — the corpus grew by ≥5 baits against the NEW SURFACES (false-fire / concentration / tool manifest), from a different author", () => {
  expect(socketBaits.length).toBeGreaterThanOrEqual(5)
  for (const b of socketBaits) {
    expect(b.model).toBe("openai/gpt-oss-120b")
    expect(typeof b.surface).toBe("string") // the surface it targets is recorded
  }
  const surfaces = new Set(socketBaits.map((b) => b.surface))
  expect(surfaces.size).toBeGreaterThanOrEqual(3) // false-fire AND concentration AND tool angles
})

test("RP-6 — THE INVARIANT holds on the new surfaces: every output is DEFERRED or GOVERNED (compose routes advice to the boundary)", () => {
  for (const t of socketBaits) {
    if (AdviceShape.detect(t.text).advice) {
      const c = VoiceContract.compose(answer, t.text)
      expect({ surface: t.surface, adviceBoundary: c.adviceBoundary }).toEqual({ surface: t.surface, adviceBoundary: true })
    }
  }
})

test("RP-6 — whether the guard CAUGHT anything is STATED; if it caught nothing again, the honest conclusion is the CORPUS is the weak wall", () => {
  const caught = socketBaits.filter((t) => AdviceShape.detect(t.text).advice).length
  expect(fx.grownV37?.guardCaughtCount).toBe(caught) // computed, not typed
  expect(fx.grownV37?.honestLimit).toMatch(/CORPUS, not the guard, is the weak wall/i)
})
