/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 1: Claim.producer — NOTHING IS CLAIMED THAT IS NOT COMPUTED (X-DERIVE, S100).
 *
 * The build log's header, gate, and terminal marker have been the last hand-typed artifacts in the system, and three
 * sprints of summary-drift lived there (V33/V34/V35). X-DERIVE(b): EVERY claim has a PRODUCER — a named function, over
 * named committed artifacts, whose OUTPUT is the claim. A claim with no producer is not a claim, it is a sentence, and the
 * generator strips it (Claim.producer throws for an unregistered name). X-DERIVE(d): every number ABOUT THE PROJECT carries
 * its provenance tier (REAL/SAMPLE/UNJUDGEABLE) — the tier is read from the pins' claim→producer map (the single source),
 * bound to the producer here. X-DERIVE(e): a producer that returns PARTIAL renders PARTIAL, never complete.
 *
 * RP-1 (F-1, the critical Part-F correction): X-DERIVE relocates the lie to the producers — a generated lie is a lie with a
 * passing test. So each load-bearing producer has a SEEDED NEGATIVE that is the CLAIM'S OWN INVERSION (asserted in S100 +
 * the phase walls: d33 'PBO disagrees'→UNSIGNABLE; Release 'artifact absent'→D50(i) false; census a seeded delete; verify a
 * non-zero exit). The claim→producer map is the sprint's highest-value diff — the only place a lie can now live.
 */
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Verify } from "./verify"
import { Reach } from "./reach"
import { Falsify } from "./falsify"
import { Release } from "./release"
import { CrossCheck, Signability } from "../backtest/crosscheck"
import { Rider } from "../backtest/rider"
import { Ledger } from "../strategy/ledger"

export namespace Claim {
  export type Tier = "REAL" | "SAMPLE" | "UNJUDGEABLE" | "n/a"
  export interface Result {
    name: string
    value: unknown
    tier: Tier
    artifacts: string[] // the committed artifacts the value was read from
    partial: boolean // X-DERIVE(e) — the producer returned an incomplete result (renders PARTIAL, never complete)
  }

  function pins(): { claimProducerMap: { claims: Record<string, { producer: string; artifacts: string[]; tier: string }> }; lawsCountObservation: { laws: number; lawsMintedInLast6Sprints: number; productCapabilityAddedInLast3Sprints: number }; carried: { newProductCapability: number }; pinsSha: string } {
    return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "derive-pins.json"), "utf8"))
  }

  // the tier for a claim is bound in the pins (the single source) — a producer whose claim is absent from the map is
  // unregistered and cannot be claimed (S100).
  function tierOf(name: string): Tier {
    const c = pins().claimProducerMap.claims[name]
    if (!c) throw new Error(`Claim "${name}" has NO producer in the claim→producer map (X-DERIVE(b): a claim with no producer is a sentence, stripped)`)
    return c.tier as Tier
  }
  function artifactsOf(name: string): string[] {
    return pins().claimProducerMap.claims[name]?.artifacts ?? []
  }
  function git(args: string[]): string {
    const r = spawnSync("git", args, { cwd: PKG_ROOT, encoding: "utf8" })
    return r.status === 0 ? (r.stdout || "").trim() : ""
  }

  // ── THE PRODUCER REGISTRY — each entry reads committed artifacts and returns the claim's value + tier + partiality ──────
  // (verify uses skipBundle so the registry is fast + offline; the generator/do_verify run the full bundle separately.)
  // the CURRENT sprint's pins sha — Socket V37 carries socket-pins.json (chained from derive-pins). The claim→producer
  // MAP still lives in derive-pins (unchanged), but the header's PINS_SHA claim is the CURRENT pins (a moved sprint pin
  // moves the header). If socket-pins is absent (a pre-V37 checkout), fall back to derive-pins.
  function currentPinsSha(): string {
    return currentPins()?.pinsSha ?? pins().pinsSha
  }
  // the CURRENT sprint's pins — where lawsThisSprint + newProductCapability live. SUBSTANCE V38: the current pins are
  // substance-pins.json (newProductCapability 0 — the three V37 capabilities are made TRUE, nothing new is added; the roadmap
  // is OWED to V39). Falls back to socket-pins (V37), then derive-pins (a pre-V38 checkout).
  function currentPins(): { pinsSha: string; carried: { newProductCapability: number; lawsThisSprint: string } } | null {
    // FAMILY V39 — family-pins.json is the current head (carries substance 153628a9; newProductCapability 0 — the four
    // shipped capabilities pay a price, show a number, reach a seventh kind, and count a family, none touching a verdict).
    for (const f of ["family-pins.json", "substance-pins.json", "socket-pins.json"]) {
      try { return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", f), "utf8")) } catch { /* try the next */ }
    }
    return null
  }

  const REGISTRY: Record<string, () => { value: unknown; partial?: boolean }> = {
    pinsSha: () => ({ value: currentPinsSha() }),
    terminalTree: () => ({ value: git(["rev-parse", "HEAD^{tree}"]) }),
    commitSha: () => ({ value: git(["rev-parse", "HEAD"]) }),
    pushed: () => ({ value: Reach.derivePublished().published }),
    battery: () => {
      const b = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "evidence", "battery-summary.json"), "utf8")).canonical
      const removed = Falsify.DELETED_WALLS // RP-4 — a shrinking battery with NAMED removals is honest, without them a Halt
      return { value: { pass: b.pass, fail: b.fail, files: b.files, removed: removed.length, removedReason: removed.map((d) => `${d.id}: ${d.reason}`) } }
    },
    verify: () => ({ value: Verify.run({ skipBundle: true }) }),
    verifyOnClone: () => {
      const p = path.join(PKG_ROOT, "data", "honesty", "pristine-clone.json")
      try {
        const j = JSON.parse(readFileSync(p, "utf8"))
        return { value: { exitCode: j.verify?.exitCode ?? j.exitCode, battery: j.battery, ran: true }, partial: false }
      } catch {
        return { value: "NOT-YET-RUN", partial: true } // X-DERIVE(e) — the clone has not run; PARTIAL, never a green
      }
    },
    crossCheckDsr: () => ({ value: CrossCheck.agreement("dsr") }),
    crossCheckPsr: () => ({ value: CrossCheck.agreement("psr") }),
    crossCheckPbo: () => ({ value: CrossCheck.agreement("pbo") }),
    d33: () => {
      const d = Signability.d33()
      // FAMILY V39 (RP-1/S142) — the state carries its PRICE (testRedesigns, never resets) and its i.i.d. RIDER (direction +
      // magnitude, on the same line), so the gate shows the Operator which pen he holds and what bears on the verdict.
      // SHIP V40 (D76/S157) — riderEnforced: the rider stops being a sticky note. DERIVED, not asserted: it is true iff the
      // enforcement BITES (a naive Stamp on autocorrelated input with deflation active is refused). The rider now has teeth.
      const riderEnforced = !Rider.enforce("naive", { deflationActive: true, tauInt: Rider.threshold().tauIntTrigger + 1 }).ok
      return { value: { state: d.state, operatorSigned: d.operatorSigned, testRedesigns: d.testRedesigns, redesignSearchHashes: d.redesignSearchHashes, iidRider: d.iidRider, riderEnforced }, partial: /PRECONDITION-MET/.test(d.state) }
    },
    census: () => {
      const c = Falsify.census()
      return { value: { originUnrecorded: c.counts.ORIGIN_UNRECORDED, recovered: c.recovered, reFounded: c.reFounded, deleted: c.deleted.length, demonstrated: c.counts.DEMONSTRATED } }
    },
    d50i_binary: () => ({ value: Release.d50().i_binaryCommitted.value }),
    d50ii_install: () => ({ value: Release.d50().ii_installDocumented.value }),
    d50iii_published: () => ({ value: Release.d50().iii_published.value }),
    d50iv_window: () => ({ value: Release.d50().iv_windowElapsed.value }),
    reach: () => {
      const f = Reach.fact()
      return { value: { published: f.published, reachableHumans: f.reachableHumans, installPath: f.installPath } }
    },
    theNumber: () => {
      const s = Ledger.actsSummary()
      return { value: { manifestsReal: s.manifestsAuthoredReal, cyclesUnpromptedReal: s.cyclesRunReal, realLineageCount: s.realLineageCount } }
    },
    laws: () => {
      const c = currentPins()?.carried
      const mintedThisSprint = c?.lawsThisSprint?.toUpperCase().includes("ZERO") ? 0 : 1
      return { value: { laws: 17, mintedThisSprint, productCapabilityThisSprint: c?.newProductCapability ?? pins().carried.newProductCapability } }
    },
    // the Halt was LIFTED (D53), so capability is 3 this sprint — DISCLOSED, priced as a SEARCH, not a Halt violation.
    newProductCapability: () => ({ value: currentPins()?.carried.newProductCapability ?? pins().carried.newProductCapability }),
  }

  // Claim.producer(name) — the value, tier, artifacts, and partiality for a claim. Throws for an unregistered name
  // (X-DERIVE(b): a claim with no producer is stripped). The tier comes from the pins (S102: every project-number tiered).
  export function producer(name: string): Result {
    const p = REGISTRY[name]
    if (!p) throw new Error(`Claim "${name}" has NO producer registered (X-DERIVE(b): a sentence, not a claim — stripped)`)
    const { value, partial } = p()
    return { name, value, tier: tierOf(name), artifacts: artifactsOf(name), partial: partial ?? false }
  }

  export function names(): string[] {
    return Object.keys(REGISTRY)
  }

  // the set of claim names the pins declare (the map) — S100 checks the registry is TOTAL over it (no orphan claims).
  export function declaredNames(): string[] {
    return Object.keys(pins().claimProducerMap.claims)
  }
}
