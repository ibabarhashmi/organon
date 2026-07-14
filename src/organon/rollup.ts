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

  // THE GATE — THE NUMBER + the reach fact + D51 first, alone; the menu presented, never chosen (LN5).
  export function gate(): Record<string, unknown> {
    const num = Claim.producer("theNumber").value as { manifestsReal: number; cyclesUnpromptedReal: number; realLineageCount: number }
    const reach = Claim.producer("reach").value as { published: boolean; reachableHumans: number | string }
    return {
      firstLine: `manifests (real) ${num.manifestsReal} · cycles unprompted (real) ${num.cyclesUnpromptedReal} · published ${reach.published} · reachableHumans ${reach.reachableHumans} · pens unmoved: 2 sprints. Is ORGΛNON a product, or an instrument?`,
      d51: {
        subject: "the kill-criterion's subject — PRODUCT or INSTRUMENT (presented, never chosen — LN5)",
        menu: {
          option1: "IN2 + publish → the number becomes meaningful in 90 days (D50's window)",
          option2: "declare ORGΛNON an INSTRUMENT (n=1 by design) → the market kill-criterion (8b4e094b) is a category error and must be AMENDED, not fired — and the amendment is a SEARCH under X-RECKON, incrementing trialsPerFamily in the moat forever; choosing (2) RETIRES the Socket, the curator conversation, D42, and the distribution arc",
          option3: "stop",
        },
        agentComputes: "the fact; the pen chooses",
      },
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
