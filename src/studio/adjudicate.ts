/**
 * ORGΛNON STUDIO — the WRITE-THEN-INVOKE bridge (Phase 1 + 2; Rules S-FAMILY, S-CORE, S-PROPOSE).
 *
 * This is the ONLY adjudication path in the product. It:
 *   (1) REGISTERS the proposal in the trial ledger (the write), then
 *   (2) reads back the registered FAMILY SIZE, then
 *   (3) invokes the existing, untouched attestation core (AttestAdjudicate.adjudicate) with that family size supplied
 *       as the honest n_trials — so the engine's deflation counts the builder's own iteration.
 *
 * `adjudicateRegistered` REFUSES (a Halt — LedgerBypassError) any spec that is not already in the ledger: there is no
 * family-honest adjudication without a registered trial. The bypass wall proves the alternative fails.
 *
 * FROZEN-CORE DISCIPLINE (S-CORE): the injection uses an EXISTING engine input (Attest.Submission.declaredNTrials).
 * No byte of rigor.py or the adjudicator changes; the honesty is added AROUND the core, never inside it. The relay is
 * verbatim — this module never softens, annotates, or overrides the verdict the core returns (S-PROPOSE, Rule XXI).
 */
import { Ledger } from "../ledger/ledger"
import { Attest } from "../attest/submission"
import { AttestAdjudicate } from "../attest/adjudicate"

export namespace Studio {
  // A Halt (S-FAMILY): adjudication of an unregistered spec must be impossible through this surface.
  export class LedgerBypassError extends Error {}

  // Everything the caller may pass THROUGH to the core, minus the search-honesty n_trials (the ledger owns that).
  export interface SubmitExtras {
    id?: string
    returns?: number[]
    data?: { returns?: number[]; panel?: unknown }
    useOwnData?: boolean
    declaredNTrials?: number // a caller MAY declare a broader search than this lineage; we take max(declared, family)
    preRegistration?: Attest.PreRegistration
    claimedSharpe?: number
    barsPerYear?: number
  }

  export interface SubmitInput extends SubmitExtras {
    spec: unknown
    authorClass: Ledger.AuthorClass
    authorId?: string // the key-scoped identity (H-SCOPE); defaults to authorClass
    domain: string
    parentSeq?: number | null
    timestamp: number
  }

  // The verdict as the product returns it: the core's Attestation RELAYED VERBATIM, wrapped with the ledger provenance
  // (family size, the honest n_trials consumed, the trial's seq). The wrapper adds context; it never changes `verdict`.
  export interface StudioVerdict {
    ledgerSeq: number
    specHash: string
    family: Ledger.FamilyReport
    authorId: string // the identity whose search this counts against (H-SCOPE)
    rootCount: number // the author's registered ROOT count in this domain — re-rooting is counted, not just iteration
    familyDeclaredNTrials: number // the honest n_trials fed to deflation = max(callerDeclared, familySize, rootCount)
    attestation: AttestAdjudicate.Attestation // the core verdict, verbatim
  }

  // Register a proposal as a trial. Thin pass-through to the ledger — the only write path (S-FAMILY).
  export function register(store: Ledger.Store, input: SubmitInput): Ledger.Entry {
    return store.register({ spec: input.spec, authorClass: input.authorClass, authorId: input.authorId, domain: input.domain, parentSeq: input.parentSeq ?? null, timestamp: input.timestamp })
  }

  // Adjudicate a spec that is ALREADY registered. Refuses (Halt) an unregistered spec — no family-honest verdict can
  // exist without a counted trial. Feeds the registered family size to the core as the honest n_trials.
  export async function adjudicateRegistered(store: Ledger.Store, spec: unknown, extras: SubmitExtras = {}): Promise<StudioVerdict> {
    const specHash = Ledger.hashSpec(spec)
    if (!store.has(specHash))
      throw new LedgerBypassError(
        `refusing to adjudicate spec ${specHash.slice(0, 12)}… — it is NOT registered in the trial ledger. ` +
          `Every proposal is a registered trial (S-FAMILY); adjudication is only reachable through registration.`,
      )

    const family = store.family(specHash)
    const entry = store.find(specHash)!
    // H-SCOPE — the honest multiple-testing n counts BOTH search dimensions: iteration WITHIN a lineage (family size)
    // AND architecture search ACROSS lineages (this author's registered root count in the domain). max() ensures the n
    // never drops below either — re-rooting 25 distinct specs deflates exactly like iterating one 25 times.
    const rootCount = store.rootCount(entry.authorId, entry.domain)
    const familyDeclaredNTrials = Math.max(extras.declaredNTrials ?? 0, family.size, rootCount)

    const submission: Attest.Submission = {
      id: extras.id ?? specHash.slice(0, 16),
      spec,
      returns: extras.returns,
      data: extras.data,
      useOwnData: extras.useOwnData,
      declaredNTrials: familyDeclaredNTrials, // ← the ledger's honest family size drives deflation (the fix)
      preRegistration: extras.preRegistration,
      claimedSharpe: extras.claimedSharpe,
      barsPerYear: extras.barsPerYear,
    }

    const attestation = await AttestAdjudicate.adjudicate(submission) // the core, untouched; verdict relayed verbatim
    return { ledgerSeq: entry.seq, specHash, family, authorId: entry.authorId, rootCount, familyDeclaredNTrials, attestation }
  }

  // The public product path: register THEN invoke, atomically ordered (write-then-invoke). No exported symbol
  // adjudicates without first registering — this is the structural guarantee the bypass wall verifies.
  export async function submit(store: Ledger.Store, input: SubmitInput): Promise<StudioVerdict> {
    register(store, input) // write FIRST
    const { spec, authorClass, domain, parentSeq, timestamp, ...extras } = input
    return adjudicateRegistered(store, spec, extras) // THEN invoke — with the family size now counting this trial
  }
}
