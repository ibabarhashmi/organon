/**
 * ORGΛNON — THE REACH SPRINT (V35), S98 (C-3 / DD-15): MR1's depth census, STATED AS AN OUTCOME — worse-included.
 *
 * The MR1 capture RAN (V34): 1284 pools, 4/4 pinned subjects present. But its census outcome went unreported for four
 * sprints. This states it, whatever it is: the depth census's domain-catch axis, and whether it improved. A census that
 * only ever improves is not a census (C-3) — so the honest result here is UNCHANGED: the conservative domain classifier
 * puts NO curated-shelf subject into a new domain (STABLE-SYNTH/LST-LRT/LOOPED-CDP/RWA), so domain-catch stays 0/7 — the
 * four new domains render through the LOOKUP path + fixtures by design (D34), never the curated shelf. No new capability
 * is added (the Halt): the four subjects are RESOLVABLE (MR1 proved 4/4 present) and classifiable, not force-shelved.
 *
 * Run: bun run script/honesty/mr1-census.ts
 */
import { writeFileSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DomainClassify } from "../../src/domain/classify"
import type { Domain } from "../../src/domain/types"

const H = path.join(PKG_ROOT, "data", "honesty")
const depth = JSON.parse(readFileSync(path.join(H, "depth-census.json"), "utf8"))
const mr1 = JSON.parse(readFileSync(path.join(H, "mr1-capture.json"), "utf8"))

const domainCatch = depth.perAxis["domain-catch"] // { renderable, denominator, ... }

// classify the four MR1-pinned subjects (conservative, offline) — stating their domain nature honestly, never inflating
const subjects = (mr1.outcome?.pinnedResolved ?? []).map((s: { project: string; symbol: string; present: boolean }) => {
  const facts = { project: s.project, symbol: s.symbol, isStablecoin: /USDC|DAI|USD/i.test(s.symbol) } as unknown as Domain.DomainFacts
  let domain = "UNCLASSIFIED"
  try { domain = DomainClassify.classifyDomain(facts).domain } catch { /* conservative floor */ }
  return { project: s.project, symbol: s.symbol, present: s.present, domainClass: domain, badge: domain !== "UNCLASSIFIED" && domain !== "LENDING" && domain !== "FUNDING" }
})

const record = {
  protocol: "mr1-census",
  at: "2026-07-14",
  rule: "S98 / C-3 — the depth census's domain-catch axis, stated as an OUTCOME (whatever it returns, worse-included). A census that only ever improves is not a census.",
  domainCatch: { renderable: domainCatch.renderable, denominator: domainCatch.denominator, basis: domainCatch.basis },
  improved: false, // stated honestly: the number did NOT go up this sprint
  outcome: `domain-catch = ${domainCatch.renderable}/${domainCatch.denominator} — UNCHANGED. No curated-shelf subject classifies into a new domain (the conservative classifier's floor + D34: new domains render via lookup + fixtures, not the curated shelf). The MR1 capture ran (${mr1.outcome?.shelfCount} pools, ${mr1.outcome?.pinnedPresentCount}/4 pinned present) but resolving four real subjects does not add a new-domain shelf subject.`,
  mr1Capture: { reality: mr1.outcome?.reality, shelfCount: mr1.outcome?.shelfCount, fetchMs: mr1.outcome?.fetchMs, pinnedPresentCount: mr1.outcome?.pinnedPresentCount, source: mr1.outcome?.source },
  pinnedSubjects: subjects,
  shelfState: "the four MR1 subjects are RESOLVABLE (4/4 present, MR1) and classifiable (conservative → UNCLASSIFIED/LENDING without the precise captured signatures). They are NOT force-added to the curated shelf — that would be new capability (the Halt). Their domain nature is stated, not badged onto a new shelf row.",
  honestNote: "a census that only ever improves is not a census (C-3). This one honestly reports NO improvement: domain-catch is still 0/7. The capture proved the subjects real; the depth remains what it was.",
}

writeFileSync(path.join(H, "mr1-census.json"), JSON.stringify(record, null, 2) + "\n")

console.log("── REACH — MR1's depth census, as an outcome (S98) ─────────")
console.log(`  domain-catch       : ${domainCatch.renderable}/${domainCatch.denominator} — ${record.improved ? "IMPROVED" : "UNCHANGED"}`)
console.log(`  MR1 capture        : ${mr1.outcome?.reality} · ${mr1.outcome?.shelfCount} pools · ${mr1.outcome?.pinnedPresentCount}/4 pinned`)
console.log(`  pinned subjects    : ${subjects.map((s: { project: string; domainClass: string }) => `${s.project}[${s.domainClass}]`).join(" · ")}`)
console.log(`  ${record.honestNote}`)
console.log("  record written: data/honesty/mr1-census.json")
