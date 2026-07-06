/**
 * ORGΛNON STUDIO — the RESEARCH RATIFICATION LAW (Spine Phase 0; Rule R-RATIFY, A′#4). A research report is a proposal,
 * not a verdict — the same physics that governs strategies governs ideas. So research enters the constitution ONLY by
 * ratification: every adoption, deferral, and rejection is filed as a VALUE with its reason and its pre-registered
 * FLIP-CRITERIA (what evidence would reverse the call). This module makes "adopting because a report said so" — the
 * research-worship anti-pattern — structurally impossible: an append-only, hash-chained ledger that REFUSES
 *   · an ADOPT without the SPECIFIC research finding it cites AND its cheap pre-build test AND its flip-criteria AND
 *     at least one named build artifact (a row that cannot cite is re-dispositioned; an adoption-as-prose is refused);
 *   · a PARK-WITH-EXPERIMENT without the four park fields AND a designed experiment (hypothesis · method · the
 *     pre-registered outcome that decides the item) AND its flip-criteria (a park without its experiment is a shrug);
 *   · a REJECT without its reason AND its flip-criteria (a rejection must say what would change its mind).
 * The wall (research_ratified.test.ts) then refuses a BUILD ARTIFACT whose item lacks an ADOPT row — research that
 * skips ratification is just a fancier scope note. The frozen seven are never touched; this is governance, added around.
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { REPO_ROOT } from "../organon/frozen"

export namespace Ratify {
  // SUPERSEDE (Reachability, U-RESUPERSEDE): an append-only change of mind — when build evidence changes what a ratified
  // item IS (the VoC→OOS regime change), or an experiment disposes its park (a park-disposing outcome), a SUPERSEDE
  // entry references the ORIGINAL row's hash and states the change + its evidence. The original is never edited; the
  // supersession is filed in the same phase as the evidence. A table built to hold changes of mind must receive them.
  export type Disposition = "ADOPT" | "PARK-WITH-EXPERIMENT" | "REJECT" | "SUPERSEDE"
  // what a SUPERSEDE points back at + the change it records
  export interface Supersedes {
    item: string // the item being superseded
    originalHash: string // the ORIGINAL ratification row's hash (64-hex) — the anchor a superseded-never-re-pointed audit follows
    regimeChange: string // what the item now IS (or the park disposition: "NO — closes with evidence" / "YES — future-sprint ADOPT")
  }

  // the four park fields (C-PARK) — a park is never a convenience shrug
  export interface Park {
    context: string
    rationale: string
    impact: string
    nextSteps: string
  }
  // a designed experiment whose PRE-REGISTERED outcome decides a parked item (A′#7) — building before it answers is a Halt
  export interface Experiment {
    hypothesis: string
    method: string
    preRegisteredOutcome: string // stated in advance: "if X, adopt; if Y, keep parked" — the answer cannot be back-fit
  }

  export interface Entry {
    seq: number
    item: string // the research item, e.g. "breadth-panel", "voc-sandboxed-proposer", "ensemble"
    disposition: Disposition
    researchFinding: string // the SPECIFIC finding this rests on — REQUIRED for ADOPT (a row that cannot cite is re-dispositioned)
    reason: string
    cheapTest: string // the research's cheap pre-build validation test — REQUIRED for ADOPT
    flipCriteria: string // what evidence would REVERSE this call — REQUIRED for every disposition
    buildArtifacts: string[] // the build modules an ADOPT authorizes (repo-relative) — the wall maps artifact → row
    park: Park | null // REQUIRED for PARK-WITH-EXPERIMENT
    experiment: Experiment | null // REQUIRED for PARK-WITH-EXPERIMENT
    supersedes?: Supersedes // REQUIRED for SUPERSEDE — present ONLY on supersession entries (absent elsewhere, so prior hashes reproduce)
    note: string
    stamp: string // deterministic label (never Date.now — Rule VIII)
    prev: string
    hash: string
  }

  export class RatifyError extends Error {}
  export const GENESIS = "0".repeat(64)
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as Record<string, unknown>).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  // The law, as a pure predicate — a disposition is LEGAL iff its required fields are present. This is what makes
  // research-worship impossible without a legible, reversible record.
  export function validate(input: Pick<Entry, "item" | "disposition" | "researchFinding" | "reason" | "cheapTest" | "flipCriteria" | "buildArtifacts" | "park" | "experiment" | "supersedes">): { ok: boolean; reason: string } {
    const { disposition, researchFinding, reason, cheapTest, flipCriteria, buildArtifacts, park, experiment, supersedes } = input
    if (!flipCriteria.trim()) return { ok: false, reason: "every disposition REQUIRES flip-criteria — the evidence that would reverse the call, filed in advance (R-RATIFY)" }
    if (disposition === "SUPERSEDE") {
      if (!supersedes || !supersedes.item.trim()) return { ok: false, reason: "SUPERSEDE REQUIRES the superseded item (U-RESUPERSEDE)" }
      if (!/^[0-9a-f]{64}$/.test(supersedes.originalHash)) return { ok: false, reason: "SUPERSEDE REQUIRES the ORIGINAL row's 64-hex hash — the anchor a superseded-never-re-pointed audit follows (T-SUPERSEDE)" }
      if (!supersedes.regimeChange.trim()) return { ok: false, reason: "SUPERSEDE REQUIRES the regime change it records (what the item now IS, or the park disposition)" }
      if (!reason.trim()) return { ok: false, reason: "SUPERSEDE REQUIRES its evidence (the reason — the computed result / the root-cause / the derived outcome)" }
      return { ok: true, reason: "SUPERSEDE — references the original hash, states the change + its evidence, flip-criteria filed" }
    }
    if (disposition === "ADOPT") {
      if (!researchFinding.trim()) return { ok: false, reason: "ADOPT REQUIRES the specific research finding it cites — a row that cannot cite is re-dispositioned (an adoption-as-prose is refused, A′#4)" }
      if (!cheapTest.trim()) return { ok: false, reason: "ADOPT REQUIRES a cheap pre-build validation test — each phase's first act runs it; a failed cheap test refuses the build (R-RATIFY)" }
      if (!buildArtifacts.length) return { ok: false, reason: "ADOPT REQUIRES ≥1 named build artifact — the artifact the ratification wall maps back to this row" }
      return { ok: true, reason: "ADOPT — cited, cheap-tested, flip-criteria filed, artifacts named" }
    }
    if (disposition === "PARK-WITH-EXPERIMENT") {
      if (!park || !park.context.trim() || !park.rationale.trim() || !park.impact.trim() || !park.nextSteps.trim())
        return { ok: false, reason: "PARK-WITH-EXPERIMENT REQUIRES the four park fields (context · rationale · impact · next steps) — a park without them is a convenience shrug (C-PARK)" }
      if (!experiment || !experiment.hypothesis.trim() || !experiment.method.trim() || !experiment.preRegisteredOutcome.trim())
        return { ok: false, reason: "PARK-WITH-EXPERIMENT REQUIRES a designed experiment (hypothesis · method · pre-registered outcome) — building before it answers is a Halt (A′#7)" }
      return { ok: true, reason: "PARK-WITH-EXPERIMENT — four fields + a designed experiment with a pre-registered outcome" }
    }
    if (disposition === "REJECT") {
      if (!reason.trim()) return { ok: false, reason: "REJECT REQUIRES its reason" }
      return { ok: true, reason: "REJECT — reason + flip-criteria (what would change our mind) filed" }
    }
    return { ok: false, reason: `unknown disposition ${disposition}` }
  }

  // The append-only, hash-chained ratification ledger — same tamper-evidence as the trial ledger + the ATTEMPT law.
  export class Ledger {
    private entries: Entry[] = []

    private nextPrev(): string {
      return this.entries.length === 0 ? GENESIS : this.entries[this.entries.length - 1].hash
    }

    record(input: { item: string; disposition: Disposition; researchFinding?: string; reason?: string; cheapTest?: string; flipCriteria: string; buildArtifacts?: string[]; park?: Park | null; experiment?: Experiment | null; supersedes?: Supersedes; note?: string; stamp: string }): Entry {
      const partial = {
        item: input.item,
        disposition: input.disposition,
        researchFinding: input.researchFinding ?? "",
        reason: input.reason ?? "",
        cheapTest: input.cheapTest ?? "",
        flipCriteria: input.flipCriteria,
        buildArtifacts: input.buildArtifacts ?? [],
        park: input.park ?? null,
        experiment: input.experiment ?? null,
      }
      const v = validate({ ...partial, supersedes: input.supersedes })
      if (!v.ok) throw new RatifyError(`ratification REFUSED for "${input.item}": ${v.reason}`)
      const seq = this.entries.length
      const prev = this.nextPrev()
      // supersedes is included in the hashed payload ONLY when present — so prior (pre-U-RESUPERSEDE) hashes reproduce
      const payload = { ...partial, ...(input.supersedes ? { supersedes: input.supersedes } : {}), note: input.note ?? "", stamp: input.stamp, seq }
      const hash = sha256(`${prev}|${stable(payload)}`)
      const e: Entry = { ...payload, prev, hash }
      this.entries.push(e)
      return e
    }

    all(): readonly Entry[] {
      return this.entries
    }

    verifyChain(): { ok: boolean; brokenAt: number | null } {
      let prev = GENESIS
      for (const e of this.entries) {
        if (e.prev !== prev) return { ok: false, brokenAt: e.seq }
        const payload = { item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, ...(e.supersedes ? { supersedes: e.supersedes } : {}), note: e.note, stamp: e.stamp, seq: e.seq }
        if (sha256(`${prev}|${stable(payload)}`) !== e.hash) return { ok: false, brokenAt: e.seq }
        prev = e.hash
      }
      return { ok: true, brokenAt: null }
    }

    toJSON(): { protocol: "research-ratification"; chainOk: boolean; entries: Entry[] } {
      return { protocol: "research-ratification", chainOk: this.verifyChain().ok, entries: [...this.entries] }
    }

    render(): string {
      return this.entries.map((e) => {
        const head = `#${e.seq} ${e.item}: ${e.disposition} (${e.stamp}) hash=${e.hash.slice(0, 12)}…`
        const body = e.disposition === "ADOPT"
          ? `\n    finding: ${e.researchFinding}\n    cheap-test: ${e.cheapTest}\n    artifacts: ${e.buildArtifacts.join(", ")}`
          : e.disposition === "PARK-WITH-EXPERIMENT"
            ? `\n    experiment: ${e.experiment?.hypothesis} — outcome: ${e.experiment?.preRegisteredOutcome}`
            : `\n    reason: ${e.reason}`
        return `${head}${body}\n    flip-criteria: ${e.flipCriteria}`
      }).join("\n")
    }
  }

  // Load a persisted ratification table (the value-filed .json) and re-verify its embedded chain. A tamper throws.
  export function load(absPath: string): { entries: Entry[]; chainOk: boolean } {
    if (!existsSync(absPath)) throw new RatifyError(`ratification table absent: ${absPath}`)
    const parsed = JSON.parse(readFileSync(absPath, "utf8")) as { entries: Entry[] }
    const led = new Ledger()
    // rebuild the chain from the persisted entries — record() re-validates + re-hashes, so a hand-edited table fails
    for (const e of parsed.entries) {
      led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })
    }
    const rebuilt = led.all()
    // provenance: the rebuilt hashes must equal the persisted hashes (else the file was edited after filing)
    for (let i = 0; i < rebuilt.length; i++) {
      if (rebuilt[i].hash !== parsed.entries[i].hash) throw new RatifyError(`ratification entry #${i} ("${parsed.entries[i].item}") hash mismatch — the table was edited after it was filed (R-RATIFY)`)
    }
    return { entries: [...rebuilt], chainOk: led.verifyChain().ok }
  }

  // Is a build artifact (repo-relative path) authorized by an ADOPT row? The wall's core question.
  export function artifactRatified(entries: readonly Entry[], artifactRel: string): boolean {
    return entries.some((e) => e.disposition === "ADOPT" && e.buildArtifacts.includes(artifactRel))
  }

  // ── U-RESUPERSEDE helpers ──
  // the supersession(s) that reference a given original hash (append-only; the original row is never edited)
  export function supersessionsFor(entries: readonly Entry[], originalHash: string): Entry[] {
    return entries.filter((e) => e.disposition === "SUPERSEDE" && e.supersedes?.originalHash === originalHash)
  }
  // the EFFECTIVE record for an item: its latest SUPERSEDE if any, else its original disposition row. A ratified call's
  // current meaning follows its supersessions — a change of mind that was FILED is legible here, never lost.
  export function effectiveRecord(entries: readonly Entry[], item: string): Entry | null {
    const sup = entries.filter((e) => e.disposition === "SUPERSEDE" && e.supersedes?.item === item)
    if (sup.length) return sup[sup.length - 1]
    const orig = entries.filter((e) => e.item === item && e.disposition !== "SUPERSEDE")
    return orig.length ? orig[orig.length - 1] : null
  }
  // a SUPERSEDE is COHERENT iff its originalHash actually exists in the chain (no dangling supersession)
  export function supersessionsCoherent(entries: readonly Entry[]): { ok: boolean; dangling: string[] } {
    const hashes = new Set(entries.map((e) => e.hash))
    const dangling = entries.filter((e) => e.disposition === "SUPERSEDE" && !hashes.has(e.supersedes!.originalHash)).map((e) => `${e.item} → ${e.supersedes!.originalHash.slice(0, 12)}…`)
    return { ok: dangling.length === 0, dangling }
  }

  // The SPINE build surfaces the wall scans: any NEW module under these roots must be covered by an ADOPT row (real
  // forward teeth — a module added later without a ratification row goes red). Directories scanned + specific files.
  export const SCANNED_DIRS = ["src/analytics", "src/proposers"] as const
  export const SCANNED_FILES = ["src/dataplane/hyperliquid.ts", "src/dataplane/basis.ts"] as const

  // ── THE EXPERIMENT REGISTRY (Explanation Phase 0; X-DEFAULT) ──
  // The ratification wall scans src/analytics + src/proposers. But parked-EXPERIMENT runners (hrp.ts, experiments.ts,
  // preconditions.ts) live in src/studio — OUTSIDE the scan — so they escaped the ADOPT requirement not by being
  // authorized but by being invisible. That discretionary bypass is made EXPLICIT here: every parked-experiment runner
  // is registered with the item it decides; the coherence check then proves each registered experiment maps to a
  // PARK-WITH-EXPERIMENT or a disposing SUPERSEDE row (an experiment posing as product — an ADOPT masquerade, or a
  // registered module with no disposition — is caught). The exemption is now legible, not a silent hole.
  export const EXPERIMENT_REGISTRY = [
    { module: "src/studio/hrp.ts", item: "hrp-portfolio-construction", note: "López-de-Prado HRP fixture — disposed NO (does not dominate OOS; stays parked)" },
    { module: "src/studio/experiments.ts", item: "portfolio-of-strategies-ensemble", note: "the V11 parked-experiment runners (ensemble + coherence), disposed by U-EXPERIMENT (SUPERSEDE)" },
    { module: "src/studio/preconditions.ts", item: "portfolio-of-strategies-ensemble", note: "the pool preconditions (K-PRECOND middle/stress cells) — scaffolding for the disposed ensemble park (SUPERSEDE)" },
    { module: "src/studio/selection.ts", item: "pool-member-selection-pricing", note: "the selection door (X-SELECT) — a PARK-WITH-EXPERIMENT in Phase 0, disposed by SUPERSEDE in Phase 1 with the derived outcome (TERM/RESTRICT/NO-INFLATION)" },
  ] as const

  // a registered experiment is COHERENT iff its item has an effective record that is a PARK-WITH-EXPERIMENT or a
  // disposing SUPERSEDE (never an ADOPT posing-as-product, never a missing disposition). Returns the incoherent ones.
  export function experimentRegistryCoherent(entries: readonly Entry[]): { ok: boolean; issues: string[] } {
    const issues: string[] = []
    for (const reg of EXPERIMENT_REGISTRY) {
      const rec = effectiveRecord(entries, reg.item)
      if (!rec) { issues.push(`${reg.module}: registered experiment item "${reg.item}" has NO ratification record (a parked-experiment runner must map to its disposition)`); continue }
      if (rec.disposition !== "PARK-WITH-EXPERIMENT" && rec.disposition !== "SUPERSEDE")
        issues.push(`${reg.module}: item "${reg.item}" is ${rec.disposition}, not a parked/disposed experiment (an experiment posing as product is an unratified build artifact)`)
    }
    return { ok: issues.length === 0, issues }
  }

  // Every existing build artifact under the scanned surfaces that lacks an ADOPT row — the wall asserts this is empty.
  export function unratifiedArtifacts(entries: readonly Entry[], root: string = REPO_ROOT): string[] {
    const found: string[] = []
    for (const d of SCANNED_DIRS) {
      const abs = path.join(root, d)
      if (!existsSync(abs)) continue
      for (const f of readdirSync(abs)) if (f.endsWith(".ts")) found.push(`${d}/${f}`)
    }
    for (const f of SCANNED_FILES) if (existsSync(path.join(root, f))) found.push(f)
    return found.filter((rel) => !artifactRatified(entries, rel))
  }
}
