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
import { Freshness } from "./freshness"
import { Consistency } from "./consistency"
import { Continuity } from "./continuity"
import { Capability } from "./capability"
import { Capture } from "../strategy/capture"
import { D33 } from "../backtest/crosscheck"
import { Contagion } from "../strategy/contagion"
import { Backfill } from "../plane/backfill"
import { Delegation } from "./delegation"
import { Registry } from "./registry"
import { HistoricalAct } from "./historical"

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
      // PROVENANCE V42 (S172/S173, M-4/M-5) — the cross-sprint battery continuity and the full census identity, DISPLAYED
      // (not merely gated): prev + added − removed === now, and demonstrated + weak + exempt + originUnrecorded === total.
      batteryContinuity: Consistency.batteryFullDelta().display,
      censusIdentity: Consistency.censusIdentity().display,
      // BACKFILL V43 (S181/S183) — CONTINUITY MADE TOTAL: every cross-sprint countable reconciled through the ONE reconciler
      // (the census MOVEMENT shown as a transfer, not asserted — N-2), and the capability→verdict isolation fence, RENDERED.
      continuity: continuityLine(),
      capabilityIsolation: Capability.verdictIsolationLine(),
      // BACKFILL V43 (S189/F-2/RP-2) — the own-archive tier mix + ratio (REAL★ own live + REAL-DERIVED backfilled history),
      // confidence capped by the weakest dominant tier; the false-fire own-leg's re-derivable series depth.
      ownArchive: Capture.ownArchive().mix.label,
      d50: { i: v("d50i_binary"), ii: v("d50ii_install"), iii: v("d50iii_published"), iv: v("d50iv_window") },
      reach: v("reach"),
      theNumber: v("theNumber"),
      laws: v("laws"),
      newProductCapability: v("newProductCapability"),
      verifyOnClone: v("verifyOnClone"),
      reckoning: reckoningSection(),
      hardening: hardeningSection(),
    }
  }

  // ── PROVENANCE V42 (M-2/S170, RP-2) — THE D33 NOTE IS CARRIED-AND-RE-VERIFIED, NOT ECHOED. ──
  // V41's D33 note was V39's prose reproduced verbatim in a generated field. Here the SIGNABILITY note is tagged carried:{from,
  // why, reverified} and its ONLY input (D33's state) is recomputed — the carry is honest iff D33 is still SIGNABLE. A state
  // that moved makes the recompute differ, and the carry becomes a lie the gate refuses (S170).
  const D33_SIGNABILITY_NOTE = "recomputed with the D56 SEARCH counted (RP-1: testRedesigns carried in state, never resets); the i.i.d. rider on the SAME LINE (S142); the deciding z SHOWN (S141); presented, NEVER signed (LN5)."
  export function d33NoteClass(): Freshness.Carried {
    const state = (Claim.producer("d33").value as { state: string }).state
    return Freshness.carried(
      "gate.firstSection.d33.note", "V39",
      "the D33 SIGNABILITY note is unchanged since the autopsy; recomputing re-derives the identical SIGNABLE-state note (RP-2: its only input is D33's state, which did not move this sprint)",
      D33_SIGNABILITY_NOTE, ["d33.state"],
      () => (state === "SIGNABLE" ? D33_SIGNABILITY_NOTE : `D33 state is now ${state} — the carried SIGNABLE note no longer holds; RECOMPUTE (X-DERIVE(a))`),
    )
  }
  // the D67 line references the FALSE-FIRE count, which the REAL★ archive now feeds — COMPUTED this run (RP-2/F-2: a claim
  // whose input moved this sprint is recomputed, not carried). PROVENANCE V42: the own-count is the HUMAN REAL★ own-count
  // (Capture.realStarWindow — the archive that feeds the false-fire leg), NOT the TVL window. At ownCaptures 0 it renders
  // UNJUDGEABLE, honestly (an AGENT proof capture is quarantined and never counts).
  export function d67Line(): { line: string; cls: Freshness.Computed } {
    // BACKFILL V43 (S189, DD-87) — the own-capture false-fire leg now has a REAL★+REAL-DERIVED series with real depth. D67's
    // ⟨N⟩ is STILL EMPTY (the manifest is the pen's), but changedByCompile has a re-derivable point-in-time series to be
    // changed BY. The own-archive renders a COUNT with its tier mix + ratio, never a verdict.
    const oa = Capture.ownArchive()
    const line = `the amended kill-criterion — ⟨N⟩ STILL EMPTY, awaiting the pen; and now the own-capture false-fire leg has a REAL★+REAL-DERIVED series with real depth: ${oa.mix.label}. ${oa.render}`
    return { line, cls: Freshness.computed("gate.firstSection.d67", "Capture.ownArchive (REAL★ + REAL-DERIVED, mix + ratio) + the amended D67", line) }
  }
  // BACKFILL V43 (S181, N-2) — the CONTINUITY line: every cross-sprint countable reconciled through the ONE reconciler, and
  // the census MOVEMENT shown as a TRANSFER (the demonstrated bucket's movement decomposed into new walls + reclassification),
  // not a delta from nowhere. COMPUTED this run (X-DERIVE(a)).
  export function continuityLine(): string {
    const chk = Continuity.check()
    const census = chk.reconciliations.find((r) => r.type === "PARTITION")
    const transfer = census?.moved ? ` · census MOVED: ${census.moved.display}` : ""
    return chk.ok ? `${chk.detail}${transfer}` : `NOT TOTAL — ${chk.reason}`
  }

  // S170 — the freshness audit over the generated header/gate fields. Every field is COMPUTED (a producer ran this run) or
  // carried:{from,why,reverified}; Freshness.honest() refuses a carried claim that would recompute differently.
  export function freshnessAudit(): Freshness.Class[] {
    return [
      d33NoteClass(),
      d67Line().cls,
      Freshness.computed("header.pinsSha", "Claim.producer(pinsSha) → Pins.head", String(v("pinsSha"))),
      Freshness.computed("header.batteryDelta", "Claim.producer(battery) → battery-baseline (full)", JSON.stringify(v("battery"))),
      Freshness.computed("header.census", "Claim.producer(census) → Falsify.census", JSON.stringify(v("census"))),
      Freshness.computed("terminalTree", "git rev-parse HEAD^{tree}", String(v("terminalTree"))),
      // BACKFILL V43 — the continuity + capability lines are COMPUTED this run (S181/S183 producers).
      Freshness.computed("header.continuity", "Continuity.check → the ONE reconciler + marker-diff", continuityLine()),
      Freshness.computed("header.capabilityIsolation", "Capability.verdictIsolation → the import fence", Capability.verdictIsolationLine()),
    ]
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
      // PROVENANCE V42 (M-2/S170): the D33 note is CARRIED-and-re-verified (noteFreshness), not echoed; D67 is COMPUTED from
      // the live own-capture count (the REAL★ archive now feeds it — RP-2/F-2).
      firstSection: {
        d33: { ...(Claim.producer("d33").value as Record<string, unknown>), flipEvidence, note: d33NoteClass().value, noteFreshness: d33NoteClass() },
        d67: d67Line().line,
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
      reckoning: reckoningSection(),
      hardening: hardeningSection(),
    }
  }

  // ── RECKONING V44 — the pen's reckoning + the moat's third stone, rendered in the marker (strings/booleans; the numeric
  // leaves are exempt via MARKER_EXEMPT `^reckoning\.` — verdict-state + per-manifest facts, derived this run, NOT cross-sprint
  // countables). The operatorSigned:false flags are what the LN5 mechanization (S192/Ln5.verify) scans — a seeded true REFUSES. ──
  export function reckoningSection(): Record<string, unknown> {
    const d33 = D33.verdict()
    const two = Continuity.reconcileAll().results.find((r) => r.key === "census")?.twoIdentity ?? null
    const arch = Capture.ownArchive()
    return {
      d33Verdict: {
        implementation: d33.implementation, // SOUND
        application: d33.application, // SIGNABLE (N_eff enforced)
        riderEnforced: d33.riderEnforced, // the N_eff correction is the enforced default (bites on autocorrelated input)
        recommendedForSignature: d33.recommendedForSignature,
        operatorSigned: d33.operatorSigned, // false — LN5 (a seeded true REFUSES via S192)
      },
      accountabilitySplit: d33.accountabilitySplit, // RP-4 — agent: the math verdict; Operator: the decision to rely on it
      censusTwoIdentities: { conservation: two?.conservation.sumsToZero ?? null, growth: two?.growth.reconciles ?? null }, // S190
      contagionGuardComplete: Contagion.mutationRate().complete, // S196 — the dedicated advisory guard is complete
      backfill: { rateSpace: Backfill.rateSpaceVerdict().ok, judgeableTier: arch.judgeableTier }, // S194/S195
      // HARDENING V45 (P-1/S198) — THE DELEGATION STATES ARE READ FROM THE ONE PRODUCER, never hardcoded. V44 hardcoded
      // "AGENT-RATIFIED" here while State.deviations() said "RESERVED" — the S150 two-state defect. Now this block READS
      // State.byId(id).state; a block cannot hold a second state because it is the producer's state (S198 asserts it).
      delegation: { D87: State.byId("D87")?.state, D88: State.byId("D88")?.state, D89: State.byId("D89")?.state, operatorSigned: false }, // S197/S198 — the producer's state, ratified not signed
      bundle: "9c1e7bd8 byte-identical — the strict bar + N_eff land in the opt-in Stamp (off the mass path, outside the deterministic bundle); the Stamp's own verdict change is versioned in stamp-strict-record.json (F-1 ground truth, RP-1's scoped diff manifest)",
    }
  }

  // ── HARDENING V45 — the production-readiness section: the registry census (RP-1), the terminal state (RP-6), the one-state
  // proof (S198), BOTH psr statistics with the rider scoped (P-2/S202), the rebased tag inline (P-3), and the disposition
  // census. Strings/booleans; the numeric leaves are exempt via MARKER_EXEMPT `^hardening\.` (per-run counts + verdict-core
  // floats, DERIVED this run — the countables are already registered). Rendered in the marker + header. ──
  export function hardeningSection(): Record<string, unknown> {
    const both = D33.both()
    const reb = HistoricalAct.rebasing() // the raw tag {from,to,scheme,at} — P-3 rendered inline
    const oneState = State.oneStateVerdict({ deviationStates: State.deviations().map((d) => ({ id: d.id, state: d.state })), reckoning: reckoningSection() })
    const c = Registry.census()
    return {
      terminalState: "READY-UNVERIFIED-BY-A-SECOND-HUMAN", // RP-6 — the pinned enum; VERIFIED settable only by a HUMAN-tier event
      registryCensus: Registry.censusLine(), // RP-1 — FIXED n · ACCEPTED m (each with its clause) · PEN'S k
      registryProven: Registry.check().ok, // S209 — every FIX proven, every ACCEPT cites a clause, every built wall traces
      oneState: oneState.ok, // S198 — every generated block's deviation-state claims === the ONE producer (P-1 closed)
      crossCheckBoth: both.display, // S202/P-2 — PSR naive AND PSR N_eff, side by side
      riderScope: both.riderScope, // P-2 — riderEnforced scoped inline (to the Stamp)
      rebasedTag: reb ? `rebased:{from:${reb.from.slice(0, 8)}, to:${reb.to.slice(0, 8)}, scheme:${reb.scheme}, at:${reb.at}}${reb.stable ? " (stable)" : " (DRIFTED)"}` : "no re-basing tagged", // P-3 — the tag inline
      stampScopeByDesign: "the strict bar + N_eff are Stamp-scoped BY DESIGN — the mass path carries no verdicts (P-5, pinned)",
      mr13: "CLOSED — undischargeable-by-agent, converted to the standing IN2·realLineageCount line (P-6)",
      discovery: Registry.discover()?.summary ?? "discovery artifact absent", // DD-94 — the three sweeps' result
      dispositions: { fixed: c.fixed, accepted: c.accepted.length, pens: c.pens }, // RP-1 — the census
      ln5: "operatorSigned:false on every deviation — the pen's six keystrokes render at the gate, none made",
    }
  }

  // render the terminal marker as the log's text block (what the agent pastes — the machine wrote the claims).
  export function renderMarker(m: Record<string, unknown>): string {
    return "```\n" + Object.entries(m).map(([k, val]) => `${k}: ${typeof val === "object" ? JSON.stringify(val) : val}`).join("\n") + "\n```"
  }
}
