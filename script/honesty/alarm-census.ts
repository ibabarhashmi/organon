/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 3 (SCREEN-ON-TRUTH). THE ALARM-FATIGUE CENSUS — the before→after itemized-finding
 * count per governance-resolved shelf subject, an OUTCOME metric (never a target that licenses hiding a survivor — A′#9).
 * "before" = the proxy-shell findings the screen used to render as a wall; "after" = the findings that SURVIVE the
 * whitelist collapse (0 when the whole surface was canonical proxy-shell plumbing explained by the resolved governance;
 * the full count when the admin is not resolved-gated — conservative). Deterministic: reads the committed contract-registry
 * + the committed governance artifacts, applies the pure collapse. Run: bun run script/honesty/alarm-census.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Governance } from "../../src/contract/governance"
import type { ContractFinding } from "../../src/contract/facts"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const govDir = path.join(PKG_ROOT, "data", "honesty", "governance")
const registry = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "contract-registry.json"), "utf8"))
const caps = registry.captures ?? registry

const rows: { subject: string; poolKey: string; adminClass: string; governanceLine: string; before: number; after: number; folded: number; collapsed: boolean }[] = []
for (const f of readdirSync(govDir)) {
  if (!f.endsWith(".json") || f === "census.json" || f === "alarm-census.json") continue
  const art = JSON.parse(readFileSync(path.join(govDir, f), "utf8")) as Governance.Artifact & { poolKeys?: string[] }
  if (!art.poolKeys) continue
  const poolKey = art.poolKeys[0]
  const cap = caps[poolKey]
  if (!cap) continue // no contract capture for this subject (e.g. curve/fluid are not in the registry)
  const impl = Governance.loadImpl(art.subject, { readFile: (p) => readFileSync(p, "utf8"), dir: govDir })
  const findings: ContractFinding[] = impl?.verified && impl.findings.length ? (impl.findings as ContractFinding[]) : (cap.facts.findings as ContractFinding[])
  const col = Governance.collapse(findings, art.canonicalMatch, art.adminClass)
  rows.push({ subject: art.subject, poolKey, adminClass: art.adminClass, governanceLine: Governance.governanceLine(art), before: findings.length, after: col.survivors.length, folded: col.foldedCount, collapsed: col.collapsed })
}

const body = {
  protocol: "alarm-fatigue-census",
  at: "2026-07-11",
  rule: "X-PRECISION — before→after itemized-finding count per governance-resolved subject; the governance line LEADS the contract drawer (the depositor reads WHO HOLDS THE KEY first). The count is an OUTCOME, never a target (A′#9): a subject collapses ONLY when the admin resolved GATED and every folded finding was canonical proxy-shell plumbing; an unresolved-gated admin collapses NOTHING (conservative). Real business-logic findings always survive.",
  rows: rows.sort((a, b) => a.subject.localeCompare(b.subject)),
}
writeFileSync(path.join(govDir, "alarm-census.json"), JSON.stringify({ ...body, contentSha: sha256(JSON.stringify(body)) }, null, 1) + "\n")
console.log("── ALARM-FATIGUE CENSUS ─────────")
for (const r of body.rows) console.log(`  ${r.subject.padEnd(18)} ${r.adminClass.padEnd(11)} ${r.before} → ${r.after}${r.collapsed ? " (collapsed)" : " (conservative — not resolved-gated)"}`)
