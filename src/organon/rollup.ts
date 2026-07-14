/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 1: Rollup — THE LOG IS GENERATED (X-DERIVE(a), S100).
 *
 * "The header, the gate's checkboxes, and the terminal marker are GENERATED, never written. The agent writes prose in the
 * phase bodies; the machine writes the claims. A build log's summary is a REPORT over committed artifacts, and a report that
 * a human types is an opinion." Rollup.{header,gate,terminalMarker}() are pure reads that assemble the Claim producers into
 * the log's summary — their OUTPUT is what the agent pastes into the build log. This retires the marker-discipline problem
 * permanently (E-9): a slot cannot regress because the generator always emits it; a claim cannot be typed because its value
 * comes from a producer; a "green" cannot be asserted over a non-zero exit because verify is a derived object (X-REACH(c)).
 *
 * The run-measured values that no committed artifact can hold at generation time — the FULL two-run battery count and the
 * FULL verify object (which spawns the evidence bundle) — are passed in by the generator script (script/honesty/rollup.ts)
 * after the actual runs. Everything else is read from committed artifacts by a producer.
 */
import { checkFrozenSet } from "./frozen"
import { Claim } from "./claim"
import { Verify } from "./verify"
import { State, Evidence } from "./state"

export namespace Rollup {
  export interface RunMeasured {
    fullBattery: { pass: number; skip: number; fail: number; files: number; expect: number; twoRunsIdentical: boolean }
    verify?: Verify.Result // the FULL verify (with the evidence bundle) — else the fast skipBundle verify is used
    goldenMoves?: number
    at?: string
  }

  // gather a claim's value (throws for an unregistered claim — X-DERIVE(b))
  function v(name: string): unknown {
    return Claim.producer(name).value
  }

  // the frozen-set coverage as an N/M string that Marker.validate accepts (names the absent, X-SHOWN(e))
  export function frozenCoverage(): string {
    const fs = checkFrozenSet()
    const ok = fs.filter((c) => c.status === "ok").length
    return ok === fs.length ? `${ok}/${fs.length}` : `${ok}/${fs.length} (${fs.length - ok} absent on a clone — monorepo-generated / gitignored, named in frozen-set-coverage.json)`
  }

  // THE HEADER — every claim COMPUTED (X-DERIVE(a)). Returns a structured object; renderHeader() turns it into the text block.
  export function header(m: RunMeasured): Record<string, unknown> {
    return {
      pinsSha: v("pinsSha"),
      terminalTree: v("terminalTree"),
      commitSha: v("commitSha"),
      pushed: v("pushed"),
      battery: `${m.fullBattery.pass}/${m.fullBattery.skip}/${m.fullBattery.fail} · ${m.fullBattery.files} files · ${m.fullBattery.expect} expect() · two runs identical: ${m.fullBattery.twoRunsIdentical ? "y" : "n"}`,
      batteryDelta: v("battery"), // {pass, fail, files, removed, removedReason[]} — RP-4
      crossCheck: { dsr: v("crossCheckDsr"), psr: v("crossCheckPsr"), pbo: v("crossCheckPbo") },
      d33: v("d33"),
      census: v("census"),
      d50: { i: v("d50i_binary"), ii: v("d50ii_install"), iii: v("d50iii_published"), iv: v("d50iv_window") },
      reach: v("reach"),
      theNumber: v("theNumber"),
      laws: v("laws"),
      newProductCapability: v("newProductCapability"),
      verifyOnClone: v("verifyOnClone"),
    }
  }

  // THE GATE — the FIRST section is TWO items alone (D33 + D67); every deviation STATE comes from the ONE State.deviations()
  // producer (S150/MR18/J-4) — the "product or instrument?" question is ANSWERED (INSTRUMENT), so it is RETIRED and the base
  // gate renders the supersession pointer instead of contradicting PART B. The menu is presented, never chosen (LN5).
  export function gate(): Record<string, unknown> {
    const num = Claim.producer("theNumber").value as { manifestsReal: number; cyclesUnpromptedReal: number; realLineageCount: number }
    const reach = Claim.producer("reach").value as { published: boolean; reachableHumans: number | string }
    const d51 = State.byId("D51") // the SINGLE authority — no hardcoded "OPEN"
    const flipEvidence = Evidence.forStateFlip("D33") // S141/J-3 — the z that flipped D33, SHOWN not claimed
    return {
      // FAMILY V39 (S150/MR18) — the first line reads the deviation-state producer; D51 ANSWERED = INSTRUMENT, so the base
      // gate no longer asks the question PART B already answered (the exact V38 contradiction, J-4).
      firstLine: `the instrument speaks · manifests (real) ${num.manifestsReal} · cycles unprompted (real) ${num.cyclesUnpromptedReal} · published ${reach.published} · reachableHumans ${reach.reachableHumans} (BY DESIGN) · D51 ${d51?.state ?? "OPEN"} = INSTRUMENT`,
      // the FIRST gate section — TWO items, alone (blueprint Phase 7): D33 (recomputed + rider) and D67 (⟨N⟩ still empty).
      firstSection: {
        d33: { ...(Claim.producer("d33").value as Record<string, unknown>), flipEvidence, note: "recomputed with the D56 SEARCH counted (RP-1: testRedesigns carried in state, never resets); the i.i.d. rider on the SAME LINE (S142); the deciding z SHOWN (S141); presented, NEVER signed (LN5)." },
        d67: "the amended kill-criterion — ⟨N⟩ STILL EMPTY, awaiting the pen; and now, for the first time, the instrument can FEED it: the false-fire count says a number, so changedByCompile has something to be changed BY.",
      },
      d51: {
        state: d51?.state ?? "OPEN", // ANSWERED — from the ONE producer (S150)
        detail: d51?.detail,
        supersedes: d51?.supersedes, // MR18 — the pointer where the stale "product or instrument?" question stood
        agentComputes: "the fact; the pen ALREADY chose (INSTRUMENT) — the agent records it and never signs (LN5).",
      },
      deviationStates: State.deviations().map((d) => ({ id: d.id, state: d.state })), // S150 — the single source, rendered whole
      d33: Claim.producer("d33").value,
      d50: { i: v("d50i_binary"), ii: v("d50ii_install"), iii: v("d50iii_published"), iv: v("d50iv_window") },
      laws: Claim.producer("laws").value,
      newProductCapability: Claim.producer("newProductCapability").value,
    }
  }

  // THE TERMINAL MARKER — a Marker-validatable object (REQUIRED_SLOTS.terminal), every slot COMPUTED. verifyOutput is
  // DERIVED from the verify object so a "green" is never typed over a non-zero exit (X-REACH(c) carried into the generator).
  export function terminalMarker(m: RunMeasured): Record<string, unknown> {
    const verify = m.verify ?? Verify.run({ skipBundle: true })
    const verifyOutput = verify.exitCode === 0
      ? `verify exit 0 — every sub-check passed (${verify.subchecks.map((s) => s.name).join(", ")})`
      : `verify exit ${verify.exitCode} — failing: ${verify.subchecks.filter((s) => s.status === "fail" || s.status === "blocked").map((s) => s.name).join(", ")}` // NEVER the word "green"
    return {
      treeHash: v("terminalTree"),
      commitSha: v("commitSha"),
      pinsSha: v("pinsSha"),
      battery: `${m.fullBattery.pass}/${m.fullBattery.skip}/${m.fullBattery.fail}`,
      expect: String(m.fullBattery.expect),
      verify, // the derived object {exitCode, subchecks[]}
      verifyOutput,
      verifyCoverage: frozenCoverage(),
      goldenMoves: String(m.goldenMoves ?? 0),
      // the X-DERIVE claims, so the successor can reconstruct the whole state from the marker (the auditor's ask)
      crossCheck: { dsr: v("crossCheckDsr"), psr: v("crossCheckPsr"), pbo: v("crossCheckPbo") },
      d33: v("d33"),
      census: v("census"),
      d50: { i: v("d50i_binary"), ii: v("d50ii_install"), iii: v("d50iii_published"), iv: v("d50iv_window") },
      reach: v("reach"),
      theNumber: v("theNumber"),
      laws: v("laws"),
      newProductCapability: v("newProductCapability"),
      verifyOnClone: v("verifyOnClone"),
    }
  }

  // render the terminal marker as the log's text block (what the agent pastes — the machine wrote the claims).
  export function renderMarker(m: Record<string, unknown>): string {
    return "```\n" + Object.entries(m).map(([k, val]) => `${k}: ${typeof val === "object" ? JSON.stringify(val) : val}`).join("\n") + "\n```"
  }
}
