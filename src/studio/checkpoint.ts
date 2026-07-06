/**
 * ORGΛNON STUDIO — the CHECKPOINT GATEKEEPER (Phase 0; Rule H-GATE). The sprint's own governance gets the ledger
 * treatment: no unregistered gate decisions. A phase's exit criteria are held as DATA; recording ADVANCE requires,
 * PER criterion, either a hash-resolving evidence artifact (the file exists and its sha256 matches the recorded pin)
 * or a pre-decision AMENDMENT (a stated reason + the original criterion text preserved beside the new one). A free-text
 * ADVANCE is not a recordable state. Decisions are stored append-only and hash-chained (the same tamper-evidence the
 * trial ledger uses) — a checkpoint recorded any other way is void.
 *
 * This is why the pivot's failure — recording ADVANCE against unmet criteria via a cheap scope note — becomes
 * structurally impossible: the gate is code, and it refuses.
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { Surface } from "./surface"
import { Criteria } from "./criteria"

export namespace Checkpoint {
  export type Decision = "ADVANCE" | "REPEAT" | "REGRESS" | "STOP"
  export class GateError extends Error {}

  export interface Criterion {
    id: string
    text: string // the exit-criterion, verbatim — the thing that must be evidenced or formally amended
    gate?: boolean // MAKE-OR-BREAK (L-GATE2): a gate criterion is UNAMENDABLE — an amendment can record STOP/REPEAT, never ADVANCE
    surface?: boolean // U-SURFACE: a user-facing criterion — satisfiable ONLY by console-path traversal evidence, never module evidence alone
    unflagReason?: string // K-COMPLETE: a filed reason lifting a lexicon auto-flag (naming the real consumer) — auditable, never silent
    expectedBehavior?: string // X-DEFAULT: the specific behavior a surface criterion's traversal must EXERCISE (the exercise assertion — the traversal must name a step whose recorded behavior matches this; the W8-01 many-to-one loophole, closed)
  }

  export interface EvidenceRef {
    path: string // an artifact on disk (a results manifest, a test-output capture, a git-clean proof)
    sha256: string // the artifact's content hash, pinned at decision time — a dangling/edited artifact fails to resolve
    note?: string
  }

  // An amendment makes a weakening LEGIBLE: the original criterion is preserved beside the new text + a reason. The
  // audit trail flags any criterion-text diff for review — a silent scope note can no longer masquerade as a met gate.
  export interface Amendment {
    reason: string
    originalText: string
    newText: string
  }

  export interface Resolution {
    id: string // must match a declared criterion id
    evidence?: EvidenceRef
    amendment?: Amendment
  }

  export interface ResolvedCriterion {
    id: string
    text: string
    status: "evidenced" | "amended"
    detail: string
    weakened: boolean // an amendment whose newText ⊊ originalText intent — surfaced, never hidden
  }

  export interface Record {
    seq: number
    phase: string
    decision: Decision
    stamp: string // a caller-supplied deterministic label (NOT Date.now() — determinism, Rule VIII)
    author: "author-run" | "non-author-run"
    criteria: ResolvedCriterion[]
    prev: string
    hash: string
  }

  export const GENESIS = "0".repeat(64)

  const sha256 = (b: Buffer | string) => createHash("sha256").update(b).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as { [x: string]: unknown }).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  // resolve an evidence artifact: it must EXIST and its content hash must equal the pinned sha. A link to nothing, or
  // to an artifact edited after the pin, does not resolve — this is what kills "evidence links to nothing" (H-GATE).
  export function evidenceResolves(ref: EvidenceRef): { ok: boolean; detail: string } {
    if (!existsSync(ref.path)) return { ok: false, detail: `evidence artifact missing: ${ref.path}` }
    const got = sha256(readFileSync(ref.path))
    if (got !== ref.sha256) return { ok: false, detail: `evidence hash mismatch for ${ref.path}: got ${got.slice(0, 12)}… ≠ pinned ${ref.sha256.slice(0, 12)}…` }
    return { ok: true, detail: `evidence resolves: ${ref.path} (${ref.sha256.slice(0, 12)}…)` }
  }

  export class Gate {
    private records: Record[] = []
    // phase → its declared exit criteria (held as data, the H-GATE substrate). opts.enforceAutoFlag controls the
    // K-COMPLETE auto-flag law AT THE GATE. X-DEFAULT (Explanation): the law now DEFAULTS ON — a criterion whose text
    // hits the user-facing lexicon and was NOT lifted with an unflagReason gates on a traversal even if it forgot its
    // explicit `surface` flag (the W7-01/W8-01 class, extinct). V6–V13's gates are grandfathered by criterion id (they
    // predate the lexicon — a grandfathered id keeps explicit-only under the default, so no historical gate turns red,
    // the exact A′#9 attack closed). A gate OPTING OUT (enforceAutoFlag:false) MUST file a grandfatheredReason — a
    // silent opt-out is refused (the unflag pattern, one level up).
    constructor(private criteria: Record2<string, Criterion[]> = {}, private opts: { enforceAutoFlag?: boolean; grandfatheredReason?: string } = {}) {
      if (opts.enforceAutoFlag === false && !(opts.grandfatheredReason && opts.grandfatheredReason.trim()))
        throw new GateError(`Gate refused (X-DEFAULT): opting OUT of the default-on auto-flag law requires a filed grandfatheredReason (naming why this gate uses explicit-surface-only). A silent opt-out is the exact regression X-DEFAULT closes.`)
    }

    declare(phase: string, criteria: Criterion[]): void {
      this.criteria[phase] = criteria
    }

    // whether the auto-flag law is enforced at this gate — ON unless explicitly opted out (X-DEFAULT default-on).
    private get enforcing(): boolean {
      return this.opts.enforceAutoFlag !== false
    }

    // the EFFECTIVE surface flag for a criterion: explicit surface:true always; under the default-on law, a lexicon
    // auto-flag not lifted by a reason also counts (the law bites at the gate) UNLESS the criterion id is grandfathered
    // (a V6–V13 gate that predates the lexicon — explicit-only). An opted-out gate uses explicit-only for everything.
    private isSurface(c: Criterion): boolean {
      if (c.surface) return true
      if (!this.enforcing) return false
      if (Criteria.isGrandfathered(c.id)) return false // grandfathered: predates the lexicon, explicit-only (A′#9)
      return Criteria.effectiveSurface({ id: c.id, text: c.text, gate: !!c.gate, surface: c.surface, unflagReason: c.unflagReason })
    }

    // Record a checkpoint decision. ADVANCE is refused unless EVERY declared criterion for the phase resolves (evidence
    // hash-resolves OR a valid amendment). STOP/REPEAT/REGRESS are honest terminals that do NOT claim criteria met, so
    // they record with whatever resolutions are supplied (typically the failing criterion named). All are append-only.
    record(input: { phase: string; decision: Decision; stamp: string; author?: Record["author"]; resolutions?: Resolution[] }): Record {
      const declared = this.criteria[input.phase] ?? []
      const resolutions = input.resolutions ?? []
      const resolved: ResolvedCriterion[] = []

      if (input.decision === "ADVANCE") {
        for (const c of declared) {
          const r = resolutions.find((x) => x.id === c.id)
          if (!r || (!r.evidence && !r.amendment))
            throw new GateError(`ADVANCE refused (H-GATE): criterion "${c.id}" has neither hash-resolving evidence nor a pre-decision amendment. A free-text ADVANCE is not a recordable state.`)
          if (r.evidence) {
            const e = evidenceResolves(r.evidence)
            if (!e.ok) throw new GateError(`ADVANCE refused (H-GATE): criterion "${c.id}" — ${e.detail}`)
            // U-SURFACE: a user-facing criterion is satisfiable ONLY by console-path traversal evidence (a real served
            // request through the real route, with a failure state) — module/renderer evidence is REFUSED (the V11 disease).
            const surface = this.isSurface(c)
            let exercised = false
            if (surface) {
              const t = Surface.loadTraversal(r.evidence.path)
              if (!t.ok) throw new GateError(`ADVANCE refused (U-SURFACE): criterion "${c.id}" is user-facing (auto-flagged by the K-COMPLETE lexicon or explicitly surfaced) — its evidence must be a console-path traversal (fresh serve → real interaction → rendered result → a failure state). ${t.issues.join("; ")}`)
              // X-DEFAULT: the per-criterion EXERCISE ASSERTION. A surface criterion that names an expectedBehavior may
              // no longer be satisfied by a many-to-one bundle traversal that never exercised it (the W8-01 loophole):
              // the traversal must carry a mapping for this criterion whose referenced step's recorded behavior matches.
              if (c.expectedBehavior && c.expectedBehavior.trim()) {
                const ex = Surface.verifyExercise(t.artifact!, c.id, c.expectedBehavior)
                if (!ex.ok) throw new GateError(`ADVANCE refused (X-DEFAULT exercise-assertion): criterion "${c.id}" — ${ex.detail}. A traversal must NAME the step that exercises this criterion's expected behavior ("${c.expectedBehavior}"); a many-to-one bundle that never exercised it is inadmissible (the W8-01 class).`)
                exercised = true
              }
            }
            resolved.push({ id: c.id, text: c.text, status: "evidenced", detail: `${e.detail}${surface ? " · U-SURFACE traversal verified" : ""}${exercised ? " · exercise-assertion matched" : ""}`, weakened: false })
          } else if (r.amendment) {
            // L-GATE2 (Gatekeeper v2) — a make-or-break GATE criterion is structurally UNAMENDABLE. This is the exact
            // V4 failure mode (well-documented amendments converting mandated STOPs into ADVANCEs) closed by construction.
            if (c.gate)
              throw new GateError(`ADVANCE refused (L-GATE2): criterion "${c.id}" is a MAKE-OR-BREAK gate — it is UNAMENDABLE. An amendment on a gate can record STOP or REPEAT, never ADVANCE. Wait for reality (REPEAT) or stop honestly (STOP).`)
            if (!r.amendment.reason.trim()) throw new GateError(`ADVANCE refused (H-GATE): amendment for "${c.id}" lacks a stated reason`)
            if (r.amendment.originalText !== c.text)
              throw new GateError(`ADVANCE refused (H-GATE): amendment for "${c.id}" did not preserve the ORIGINAL criterion text (preserved="${r.amendment.originalText}" ≠ declared="${c.text}")`)
            const weakened = r.amendment.newText.length < c.text.length // a heuristic diff flag; the trail shows both texts for review
            resolved.push({ id: c.id, text: c.text, status: "amended", detail: `AMENDED — reason: ${r.amendment.reason} | original preserved | new: ${r.amendment.newText}`, weakened })
          }
        }
      } else {
        // a non-ADVANCE decision: record the supplied resolutions verbatim (evidence still hash-checked if present).
        for (const r of resolutions) {
          const c = declared.find((x) => x.id === r.id)
          const text = c?.text ?? r.id
          if (r.evidence) {
            const e = evidenceResolves(r.evidence)
            resolved.push({ id: r.id, text, status: "evidenced", detail: e.ok ? e.detail : `(unresolved) ${e.detail}`, weakened: false })
          } else if (r.amendment) {
            resolved.push({ id: r.id, text, status: "amended", detail: `AMENDED — ${r.amendment.reason}`, weakened: r.amendment.newText.length < text.length })
          }
        }
      }

      const seq = this.records.length
      const prev = seq === 0 ? GENESIS : this.records[seq - 1].hash
      const payload = { seq, phase: input.phase, decision: input.decision, stamp: input.stamp, author: input.author ?? "author-run", criteria: resolved }
      const hash = sha256(`${prev}|${stable(payload)}`)
      const rec: Record = { ...payload, prev, hash }
      this.records.push(rec)
      return rec
    }

    trail(): readonly Record[] {
      return this.records
    }

    // append-only integrity, identical discipline to the trial ledger
    verifyChain(): { ok: boolean; brokenAt: number | null } {
      let prev = GENESIS
      for (const r of this.records) {
        if (r.prev !== prev) return { ok: false, brokenAt: r.seq }
        const payload = { seq: r.seq, phase: r.phase, decision: r.decision, stamp: r.stamp, author: r.author, criteria: r.criteria }
        if (sha256(`${r.prev}|${stable(payload)}`) !== r.hash) return { ok: false, brokenAt: r.seq }
        prev = r.hash
      }
      return { ok: true, brokenAt: null }
    }

    // the aggregate independence state (H-EARN): if no non-author run has been recorded, the sprint's verification is
    // PENDING, never "verified" — an author cannot certify their own claims.
    independence(): "verified-by-non-author" | "pending-non-author" {
      return this.records.some((r) => r.author === "non-author-run") ? "verified-by-non-author" : "pending-non-author"
    }

    // render the trail for BuildLog v4 (the gatekeeper's own audit trail; weakened amendments flagged)
    render(): string {
      return this.records
        .map((r) => {
          const head = `#${r.seq} ${r.phase} → ${r.decision} [${r.author}] (${r.stamp}) hash=${r.hash.slice(0, 12)}…`
          const lines = r.criteria.map((c) => `    · ${c.id}: ${c.status}${c.weakened ? " ⚠ WEAKENED (review)" : ""} — ${c.detail}`)
          return [head, ...lines].join("\n")
        })
        .join("\n")
    }
  }

  // helper for callers: pin an artifact's current hash so it can be cited as evidence
  export function pin(path: string, note?: string): EvidenceRef {
    if (!existsSync(path)) throw new GateError(`cannot pin missing artifact: ${path}`)
    return { path, sha256: sha256(readFileSync(path)), note }
  }

  // C-ARMS — a phase headline is the MINIMUM of its arms (worst arm wins). A single REPEAT arm can NEVER be outvoted
  // by ADVANCE arms — this retires the V5 "ADVANCE on the built machinery" move where a REPEAT arm was headlined
  // ADVANCE. The order is STOP < REGRESS < REPEAT < ADVANCE (STOP is the strongest brake). An empty arm list is a
  // caller error (a phase reporting arms must have declared them). Gate criteria are never arms (never split).
  const DECISION_RANK: Record<Decision, number> = { STOP: 0, REGRESS: 1, REPEAT: 2, ADVANCE: 3 }
  export function headlineFromArms(arms: Decision[]): Decision {
    if (arms.length === 0) throw new GateError("C-ARMS: a phase reporting arms must declare at least one arm")
    return arms.reduce((worst, a) => (DECISION_RANK[a] < DECISION_RANK[worst] ? a : worst))
  }
}

// a tiny alias so the generic Record<K,V> is still reachable despite the namespace exporting `Record`
type Record2<K extends string, V> = { [P in K]?: V }
