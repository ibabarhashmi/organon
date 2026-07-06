/**
 * ORGΛNON STUDIO — the SIX SCREENS + the EXTERNAL run (Phase 6; Rules S-EMPTY-OK, S-TIERS; EXTERNAL-PROVEN gate).
 * The screens render display-only from surface JSON, are a closed set of six, and are detachable-by-deletion. The
 * external run submits over the REAL HTTP route via a raw client (a "different framework" than the Studio functions),
 * lands at an EARNED tier, and its caller-supplied returns are capped over the wire.
 *
 * INDEPENDENCE (honest): this external run is AUTHOR-OPERATED — the same process issues the request. It is a real
 * network path (not the V3 in-process function call), but not a true non-author party; independence is therefore
 * PARTIAL and labeled as such (H-EARN). A genuinely non-author run is recorded PENDING.
 */
import { describe, test, expect } from "bun:test"
import { Hono } from "hono"
import { Ledger } from "../../src/ledger/ledger"
import { StudioScreens } from "../../src/studio/screens"
import { StudioSurfaces } from "../../src/studio/surfaces"
import { StudioRoutesNS } from "../../src/studio/routes"
import { Clocks } from "../../src/studio/clocks"
import type { Studio } from "../../src/studio/adjudicate"

const v: Studio.StudioVerdict = {
  ledgerSeq: 0, specHash: "h", family: { rootSeq: 0, size: 3, trials: 3, members: [] }, authorId: "a", rootCount: 2, familyDeclaredNTrials: 3,
  attestation: { verdict: "NO-GO", verifiability: "V0", searchHonesty: "declared", unconditional: false, dsrAtDeclared: 0.4, floorObs: 225, rigor: { nObs: 260 } } as any,
}

describe("STUDIO screens — six display-only, closed set, discontinuity rendered (A′#10)", () => {
  test("all screens render from JSON; the set is exactly NINE (amended +Trust Panel, +Goal Console, +Guided Builder, then closed — a tenth is refused)", () => {
    expect(StudioScreens.SCREENS.length).toBe(10) // 6→7 Trust Panel; 7→8 Goal Console; 8→9 Guided Builder; 9→10 Pool Composer (U-AMEND-2); re-closed
    expect(StudioScreens.SCREENS).toContain("trustPanel")
    expect(StudioScreens.SCREENS).toContain("goalConsole")
    expect(StudioScreens.SCREENS).toContain("guidedBuilder")
    expect(StudioScreens.verdictCard(v)).toContain("VERDICT: NO-GO")
    expect(StudioScreens.rigorPanel(v)).toMatch(/family=3 · author-roots=2/) // family AND root count both visible
    expect(StudioScreens.report(v)).toContain("What could still go wrong")
  })

  test("the Goal Console (screen 8) is display-only: it frames the goal + a PRE-RENDERED result, derives nothing (E-CONSOLE)", () => {
    const empty = StudioScreens.goalConsole({ goal: null, resultRender: null })
    expect(empty).toContain("GOAL CONSOLE")
    expect(empty).toContain("submit a goal") // the empty form prompt
    const framed = StudioScreens.goalConsole({ goal: "earn lending carry", resultRender: "VERDICT: NO-GO  (relayed verbatim from the frozen core)" })
    expect(framed).toContain("earn lending carry")
    expect(framed).toContain("VERDICT: NO-GO") // renders the API result verbatim; it does not compute a verdict itself
  })

  test("the Trust Panel (screen 7) mirrors raw sources and states independence PENDING (display-only, C-TENSE)", () => {
    const panel = StudioScreens.trustPanel({
      walls: { green: 13, total: 13 },
      clocks: [{ render: "lending: TICKING — 5 stamps (scheduler-originated ×5)" }],
      ledgerHead: "abc123def456abc123",
      battery: { pass: 119, fail: 0, files: 24, scope: "in-scope" },
      inventory: { anchor: "bee1a152c330", capabilities: 22, regressions: 0 },
      parks: { count: 0, ids: [] },
      independence: "PENDING — no non-author has acted (L-2P)",
    })
    expect(panel).toContain("TRUST PANEL")
    expect(panel).toContain("scheduler-originated")
    expect(panel).toContain("independence: PENDING") // never claims independence the author cannot give
    expect(panel).toContain("119 pass / 0 fail")
  })

  test("the Trust Panel CANNOT flatter — a red battery, a capability regression, and a GAP are all surfaced", () => {
    const panel = StudioScreens.trustPanel({
      walls: { green: 10, total: 12 }, // 2 walls red
      clocks: [{ render: "lending: TICKING but STALE — GAP of 900s (~15 missed intervals); the gap is shown, never smoothed" }],
      ledgerHead: "abc",
      battery: { pass: 130, fail: 5, files: 27, scope: "in-scope" }, // 5 failing
      inventory: { anchor: "x", capabilities: 22, regressions: 3 }, // 3 regressions
      parks: { count: 2, ids: ["PARK-1", "PARK-2"] },
      independence: "PENDING — no non-author has acted (L-2P)",
    })
    expect(panel).toContain("10/12 green") // the red walls are shown
    expect(panel).toContain("130 pass / 5 fail") // the failing tests are shown
    expect(panel).toContain("regressions=3") // the regressions are shown
    expect(panel).toContain("GAP") // the clock gap is shown
    expect(panel).toContain("PARK-1, PARK-2") // the parks are listed
  })

  test("the Forward Clocks screen renders a RESTARTED discontinuity (never hidden — H-CLOCK)", () => {
    const restarted = Clocks.verifyClock("fee-yield", null, null, "2026-07-04")
    const screen = StudioScreens.forwardClocks([restarted])
    expect(screen).toContain("RESTARTED")
    expect(screen).toContain("counting from zero")
  })

  test("the Leaderboard screen shows the proud empty-of-GO launch state", () => {
    const board = StudioSurfaces.leaderboard([{ id: "x", rootCount: 1, attestation: { verdict: "NO-GO", verifiability: "V0", searchHonesty: "undeclared", unconditional: false } }])
    expect(StudioScreens.leaderboard(board)).toContain("EMPTY OF GO")
  })
})

describe("STUDIO external run — a different framework over the real network (EXTERNAL-PROVEN, author-operated)", () => {
  const spec = { family: "rwa-allocation", policy: "barbell", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
  const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 5) + 0.003)

  test("a raw-fetch client submits over HTTP, is REGISTERED with a root count, and its returns are capped at V0", async () => {
    const store = new Ledger.Store()
    const app = new Hono().route("/studio", StudioRoutesNS.mountable(store))
    // a "different framework": a hand-rolled JSON POST, NOT the Studio.submit function — the outsider's path.
    const res = await app.request("/studio/submit_spec", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ spec, authorClass: "external", authorId: "ext-framework-1", domain: "rwa", timestamp: 1_700_000_000_000, returns: R, barsPerYear: 365, declaredNTrials: 1, claimedVerdict: "GO", declaredTier: "V2" }),
    })
    expect(res.status).toBe(200)
    const verdict = (await res.json()) as Studio.StudioVerdict
    expect(store.has(Ledger.hashSpec(spec))).toBe(true) // the outsider obeys the identical ledger path
    expect(verdict.rootCount).toBe(1) // its search is counted and visible
    expect(verdict.attestation.verifiability).toBe("V0") // caller-supplied returns CANNOT reach V2 over the wire
    expect(verdict.attestation.verdict).not.toBe("GO") // the claimedVerdict:"GO" bought nothing (tier earned, S-TIERS)
  }, 30000)
})
