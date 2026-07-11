/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 3 wall (SCREEN-ON-TRUTH). The governance line LEADS the contract drawer; the
 * canonical proxy-shell noise collapses by WHITELIST when the admin resolved GATED; every finding the canonical match
 * cannot explain SURVIVES itemized. The S58 control (the sprint's gravest wall): a seeded genuinely-ungated `upgradeTo`
 * on a business contract with an EOA admin SURVIVES the collapse AND renders the damning grammar line — because nothing
 * folds when the admin is not gated. The census is an OUTCOME (recorded), the governance line renders even on an
 * UNVERIFIED implementation (the admin fact needs no source), and NO verdict moves (the governance fact is info/context).
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { Governance } from "../../src/contract/governance"

const govDir = path.join(PKG_ROOT, "data", "honesty", "governance")
const bundleFor = (key: string): Governance.RenderBundle | null => {
  const a = Governance.load(key, { readFile: (p) => readFileSync(p, "utf8"), readdir: (d) => readdirSync(d), dir: govDir })
  return a ? Governance.renderBundle(a, Governance.loadImpl(a.subject, { readFile: (p) => readFileSync(p, "utf8"), dir: govDir })) : null
}
const NOW = Date.parse("2026-07-05T00:00:00Z")
const COMPOUND = "defillama:pool:7da72d09-56ca-4ec5-a45f-59114353e487"
const AAVE = "defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501"

test("SCREEN — the governance line LEADS; compound's screen now runs on the REAL implementation source (bytecode-matched, GroundTruth S61)", () => {
  const rc = Reality.realityCheck(COMPOUND, NOW)!
  const html = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, COMPOUND, [], bundleFor(COMPOUND))
  expect(html).toContain("Who holds the upgrade key")
  expect(html).toMatch(/Admin: 0x1ec63b58…8779 — TIMELOCK\. Upgrade path gated; verify the signers\./)
  // GroundTruth: the impl's metadata-pinned build MATCHES the deployed bytecode → the findings describe the code that
  // EXECUTES (the real Comet source), not the proxy shell — the impl re-point Precision recorded UNVERIFIED, now realized.
  expect(html).toMatch(/whose metadata-pinned build MATCHES the deployed bytecode/)
  // the real structural surfaces render (Pro-only, drawered) — the impl is analyzed, not the proxy plumbing
  expect(html).toMatch(/structural surface/)
  // the governance line still leads + the collapse still folds the canonical machinery among the impl findings
  expect(html).toMatch(/canonical proxy-shell finding.*summarized in the governance line above/)
})

test("SCREEN (S58 — THE GRAVEST WALL) — a genuinely-ungated upgrade on a business contract + EOA admin SURVIVES the collapse AND renders the damning line", () => {
  const rc = Reality.realityCheck(COMPOUND, NOW)! // borrow a scored shell; override the governance bundle
  const seed: Governance.RenderBundle = {
    artifact: { subject: "seeded-rug", block: "1", implementation: "0xdeadbeef00000000000000000000000000000000", pattern: "UUPS/EIP-1967", canonicalMatch: true, adminSlotValue: "0x" + "0".repeat(24) + "1".repeat(40), adminAddr: "0x1111111111111111111111111111111111111111", adminClass: "EOA", how: "EOA", probes: {}, contentSha: "0" },
    line: Governance.governanceLine({ subject: "seeded-rug", block: "1", implementation: "0xdead", pattern: "UUPS/EIP-1967", canonicalMatch: true, adminSlotValue: "0x0", adminAddr: "0x1111111111111111111111111111111111111111", adminClass: "EOA", how: "", probes: {}, contentSha: "0" }),
    impl: { subject: "seeded-rug", implementation: "0xdeadbeef00000000000000000000000000000000", provenance: "REAL", verified: true, findings: [{ detail: "upgradeTo(address) in the resolved implementation has no _authorizeUpgrade / access-control gate — a genuinely ungated upgrade path", category: "upgrade-proxy-hazard", contract: "RuggableVault" }], contentSha: "0" },
  }
  const html = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, COMPOUND, [], seed)
  // the damning grammar line renders (the apostrophe is HTML-escaped at the render — esc(gov.line))
  expect(html).toMatch(/Admin: 0x11111111…1111 — EOA\. A single key can replace this contract/)
  // NOTHING is collapsed (EOA is not gated) and the ungated upgrade SURVIVES itemized VERBATIM
  expect(html).toMatch(/NOTHING is collapsed/)
  expect(html).toContain("a genuinely ungated upgrade path")
})

test("SCREEN — a real business-logic finding SURVIVES the collapse even on a GATED proxy (a whitelist, not a compressor)", () => {
  const c = Governance.collapse(
    [
      { detail: "_upgradeTo(address): state mutates after an external call", contract: "ERC1967Upgrade" }, // canonical OZ → folds
      { detail: "borrow(uint256): state mutates after an external call (a reentrancy window)", contract: "Comet" }, // business → survives
    ],
    true,
    "TIMELOCK",
  )
  expect(c.collapsed).toBe(true)
  expect(c.foldedCount).toBe(1)
  expect(c.survivors.map((s) => s.contract)).toEqual(["Comet"])
})

test("SCREEN — the governance line renders even on an UNVERIFIED implementation (aave: impl built but bytecode MISMATCH → UNVERIFIED, admin unresolved — the admin fact needs no source)", () => {
  const rc = Reality.realityCheck(AAVE, NOW)!
  const html = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, AAVE, [], bundleFor(AAVE))
  expect(html).toContain("Who holds the upgrade key")
  expect(html).toMatch(/unresolved; treat with EOA-grade caution/)
  // conservative — an UNRESOLVED admin collapses NOTHING (never a guessed reassurance)
  expect(html).toMatch(/NOTHING is collapsed|not resolved-gated/)
})

test("SCREEN — NO verdict moves: the scorecard verdict is byte-identical with and without the governance bundle (info/context)", () => {
  for (const key of [COMPOUND, AAVE]) {
    const rc = Reality.realityCheck(key, NOW)!
    const withGov = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, key, [], bundleFor(key))
    const withoutGov = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, key, [], null)
    // the verdict pill + the one-liner + every axis row are identical (the governance block is purely ADDITIVE detail)
    const verdictLine = (h: string) => h.slice(h.indexOf("<h1>"), h.indexOf("</h1>") + 5)
    expect(verdictLine(withGov)).toBe(verdictLine(withoutGov))
    // the governance line is present only WITH the bundle
    expect(withGov.includes("Who holds the upgrade key")).toBe(true)
    expect(withoutGov.includes("Who holds the upgrade key")).toBe(false)
  }
})

test("SCREEN — the alarm-fatigue census is recorded (an OUTCOME) and re-verifies (compound 39→0 collapsed; aave 27→27 conservative)", () => {
  const census = JSON.parse(readFileSync(path.join(govDir, "alarm-census.json"), "utf8"))
  const { contentSha, ...body } = census
  expect(require("node:crypto").createHash("sha256").update(JSON.stringify(body)).digest("hex")).toBe(contentSha)
  const comp = census.rows.find((r: { subject: string }) => r.subject === "compound-v3-usdc")
  expect(comp).toMatchObject({ adminClass: "TIMELOCK", before: 39, after: 0, collapsed: true })
  const aave = census.rows.find((r: { subject: string }) => r.subject === "aave-v3-pool")
  expect(aave).toMatchObject({ adminClass: "UNRESOLVED", before: 27, after: 27, collapsed: false })
  expect(census.rule).toMatch(/OUTCOME, never a target|A′#9/i)
})
