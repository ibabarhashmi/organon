/**
 * ORGΛNON STUDIO — the E2E SCENARIO CATALOG, pinned (End-User Phase 0; Rule E-CATALOG). The objectivity fix for the
 * minimum-margin-convergence habit named a fourth time: "clean" is measured against a PINNED inventory written BEFORE
 * any fixing, not the walker's discretion. A CLEAN walk cycle must traverse this catalog in FULL; a scenario fails by
 * SUCCEEDING WRONGLY (violating its expected honest behavior), not only by erroring. Red-team may APPEND scenarios
 * mid-walk; nothing may be REMOVED — BASELINE_IDS is the anti-removal guarantee (a superset check catches a drop; the
 * content-sha pin, recorded in the log, gives provenance). Every scenario must name its `expected` honest behavior.
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"

export namespace Catalog {
  export const CATALOG_REL = "data/studio/e2e-catalog-v14.json"

  export interface Scenario {
    id: string
    persona: string
    class: "realistic" | "adversarial" | "edge"
    door: string
    workflow: string
    expected: string // the pre-declared HONEST behavior — the thing a scenario fails by violating (E-CATALOG)
  }
  export interface CatalogFile {
    protocol: "e2e-scenario-catalog"
    version: string
    pinnedAt: string
    note: string
    doors: string[]
    scenarios: Scenario[]
  }

  // The BASELINE — the Phase-0 pre-registered scenario ids. verify() refuses any catalog that has DROPPED one of these
  // (red-team may add ids beyond this set; it may never remove one of these). This is the mechanical anti-removal rule.
  export const BASELINE_IDS = [
    // v10's fifteen (carried, never removed — the anti-removal guarantee spans catalogs)
    "R1-newcomer-preset", "R2-goalwriter-realpit", "R3-enroller-clock", "R4-external-agent-skill", "R5-auditor-trace",
    "A1-goal-injection", "A2-malformed-input", "E1-dead-model-midgoal", "E2-stripped-provenance", "E3-concurrent-submits",
    "E4-ratelimit-storm", "E5-enroll-cap", "E6-midflow-restart", "E7-blocked-domain-requested", "E8-replayed-request",
    // v11's spine surfaces (pinned BEFORE any of them existed — E-CATALOG)
    "S1-breadth-why-not-yet", "S2-eta-hedged-range", "S3-cpcv-beside-frozen", "S4-cpcv-skipped-honest",
    "S5-voc-charge-visible", "S6-noise-injection", "S7-basis-tiers", "S8-pro-toggle-derives-nothing",
    // v12's reachability surfaces (the guided builder + experiment outcomes + pristine setup + traversal audit)
    "S9-builder-compose-happy", "S10-builder-invalid-refused", "S11-builder-defaults-conservative",
    "S12-experiment-outcomes-rendered", "S13-pristine-setup", "S14-traversal-audit",
    // v13's ensemble surfaces (pinned BEFORE any pool/builder-funding/basis/legibility surface existed — E-CATALOG)
    "S15-pool-compose-happy", "S16-pool-overcorrelated-honest", "S17-member-swap-stiffens",
    "S18-builder-funding", "S19-builder-basis-min-tier", "S20-legibility-neutral", "S21-lambda-sensitivity",
    // v14's explanation surfaces (pinned BEFORE the WHY panel / runner / selection outcome / funding parity existed)
    "S22-why-nogo-plain", "S23-why-quant-exact", "S24-why-killswitch", "S25-why-consistency",
    "S26-paraphrase-embellishment-rejected", "S27-runner-happy", "S28-runner-missing-prereq",
    "S29-runner-gate-unmet", "S30-funding-parity-real", "S31-selection-outcome-rendered",
  ] as const

  // the mandated adversarial + edge classes that MUST be represented (E-CATALOG) — a catalog missing a class is a gap
  export const MANDATED_CLASSES = ["realistic", "adversarial", "edge"] as const

  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as Record<string, unknown>).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  export function load(): CatalogFile | null {
    const abs = path.join(PKG_ROOT, CATALOG_REL)
    if (!existsSync(abs)) return null
    return JSON.parse(readFileSync(abs, "utf8")) as CatalogFile
  }

  // the content sha over the CANONICAL scenario set (order-independent) — recorded in the log as the pin's provenance.
  export function contentSha(cat: CatalogFile): string {
    const canon = [...cat.scenarios].map((s) => ({ id: s.id, persona: s.persona, class: s.class, door: s.door, workflow: s.workflow, expected: s.expected })).sort((a, b) => a.id.localeCompare(b.id))
    return sha256(stable(canon))
  }

  // verify: (1) every BASELINE id still present (no removal); (2) every scenario carries a non-empty `expected`; (3)
  // every mandated class represented; (4) no duplicate ids. Returns the mismatches for the wall / checkpoint to assert.
  export function verify(cat: CatalogFile | null = load()): { ok: boolean; issues: string[]; count: number; byClass: Record<string, number> } {
    const issues: string[] = []
    if (!cat) return { ok: false, issues: ["catalog file absent"], count: 0, byClass: {} }
    const ids = cat.scenarios.map((s) => s.id)
    const idSet = new Set(ids)
    for (const b of BASELINE_IDS) if (!idSet.has(b)) issues.push(`REMOVED baseline scenario "${b}" — the catalog may only GROW (E-CATALOG); a removal is a Halt`)
    if (ids.length !== idSet.size) issues.push(`duplicate scenario ids: ${ids.filter((x, i) => ids.indexOf(x) !== i).join(", ")}`)
    for (const s of cat.scenarios) {
      if (!s.expected || !s.expected.trim()) issues.push(`scenario "${s.id}" has no expected honest behavior — a scenario without one cannot fail by succeeding wrongly (E-CATALOG)`)
      if (!(MANDATED_CLASSES as readonly string[]).includes(s.class)) issues.push(`scenario "${s.id}" has an unknown class "${s.class}"`)
    }
    const byClass: Record<string, number> = {}
    for (const s of cat.scenarios) byClass[s.class] = (byClass[s.class] ?? 0) + 1
    for (const c of MANDATED_CLASSES) if (!byClass[c]) issues.push(`no scenarios of the mandated class "${c}"`)
    return { ok: issues.length === 0, issues, count: cat.scenarios.length, byClass }
  }
}
