/**
 * ORGΛNON — THE HARDENING SPRINT (V45), the pins builder. Builder Arc, sprint 15. Continues from the COMPLETE Reckoning sprint
 * (V44) — audited FULLY ACHIEVED. carriedFromPinsSha = the TRUE Reckoning head, READ FROM DISK (67d5cd44), with a throw-guard
 * asserting reckoning carries the Backfill head (7bf877ce). The chain is a linked list of self-consistent heads on disk.
 *
 * THE MANDATE IS PRODUCTION READINESS, EXCLUSIVELY. "comprehensively identify, validate, and resolve every known or
 * discoverable issue… red-team and adversarially test the entire system… a thoroughly hardened, production-ready system
 * suitable for external user testing." The tension — "external user testing" beside D51 (INSTRUMENT, n=1 BY DESIGN) — is
 * resolved by the state/act split: readiness is a STATE (the tool survives a stranger's path); reaching a stranger is an ACT
 * (publish, invite, sign D49), and every act stays the pen's. The terminal state says so in its name:
 * READY-UNVERIFIED-BY-A-SECOND-HUMAN.
 *
 * THE INVENTORY'S FIRST DISCOVERY IS A DEFECT NO AUDIT CAUGHT: V44's own marker holds TWO STATES for one deviation —
 * deviationStates lists D87/D88/D89 as RESERVED while the reckoning block, twenty lines below in the SAME generated artifact,
 * says AGENT-RATIFIED. The exact S150 "one producer, contradiction unrepresentable" defect class, recurring because a new
 * generated block was added that did not READ the one producer. CONFIRMED EMPIRICALLY before design (State.deviations() → D87
 * RESERVED; Rollup.reckoningSection().delegation → D87 AGENT-RATIFIED). A hardening sprint that cannot find the defect in its
 * OWN inventory document is theatre, so it leads the registry (P-1).
 *
 * THE METHOD IS THE ARC'S OWN, applied to itself one last time: A CLOSED-LOOP OPEN-ISSUES REGISTRY — every finding from every
 * audit (V38→V44) enumerated, each with a pinned disposition (FIX / ACCEPT-WITH-REASON / PEN'S — never silence), each FIX
 * proven by a wall or an executed transcript, and the gate ENUMERATES the registry and REFUSES the log if any entry lacks its
 * proof (S209). Then the system is hardened where a real second human would break it: crash-safety (a real kill -9 at every
 * seam of the append path), idempotency (the same block twice does not fork the moat), RPC honesty (a dead endpoint renders
 * UNREACHABLE, never a silent fallback), the empty-state experience (every UNJUDGEABLE carries its why and its path to
 * judgeable), every workflow executed as a committed transcript, the sidecar frozen reproducibly (uv.lock), the compiled
 * binary proven at parity with the source.
 *
 * NO NEW LAW — a TENTH sprint running. Seventeen stand. Every item is an existing law under-applied: S150/X-DERIVE (the
 * two-state deviation), X-HONEST (a bare UNJUDGEABLE; a silent RPC fallback), X-MOAT (a torn write; an idempotency hole),
 * X-SHOWN (a workflow claimed but never transcripted), X-REACH (a recovery path that has never recovered).
 *
 * This pins, BEFORE a byte of Phase code, every contract of V45. Hash-locked; deterministic; no network. The pinsSha field IS
 * the Phase-0 anchor (a self-hash — sha256 of the file content minus the pinsSha field); S169 (carried) asserts the emitted
 * header pins-sha equals it AND the file is self-consistent (unedited after Phase 0).
 *
 * Run: bun run script/honesty/hardening-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Reckoning head (V44 — the pen's maths audited + N_eff enforced + the moat's third stone) ──
// READ FROM DISK, never typed. The carry is itself the sprint's first identity check. The guard asserts the chain is what the
// sprint assumes: reckoning(67d5cd44) ← backfill(7bf877ce) ← provenance(04c606dd) ← variant(eb64cebe) ← …
const RECKONING = JSON.parse(readFileSync(path.join(H, "reckoning-pins.json"), "utf8"))
const CARRIED_FROM = RECKONING.pinsSha as string // 67d5cd44… — the TRUE V44 head, read from the file, not the blueprint
if (RECKONING.carriedFromPinsSha?.slice(0, 8) !== "7bf877ce") throw new Error("reckoning-pins.json does not carry from the Backfill head 7bf877ce — the chain is not what the sprint assumed; STOP and reconcile")

// ── DD-81 (CARRIED) — THE COUNTABLE REGISTRY. Every number that moves sprint-to-sprint, each with its RECONCILIATION TYPE.
// Unchanged from V44 (the discipline is total). This sprint adds NO cross-sprint countable EXCEPT the ones that are already
// registered and move honestly: deviations.count (D92–D96 named), battery, census, guardEfficacy (re-measured aggregate). ──
const COUNTABLE_REGISTRY = {
  rule: "DD-81/F-4 (carried V43): every cross-sprint COUNTABLE is enumerated here with its reconciliation TYPE, and EVERY countable routes through the ONE Continuity.reconcile(). The gate enumerates this registry and asserts each is reconciled this sprint (S181), AND diffs the whole marker against the previous marker and refuses the log if any number moved that is neither reconciled nor exempted (F-1/RP-1). The registry is a convenience; the marker-diff is the guarantee.",
  types: {
    ADDITIVE: "prev + added − removed === now (the battery pass/expect/files; the archive counts; the deviation count)",
    PARTITION: "Σ buckets === total, WITH TWO SEPARATE identities — CONSERVATION (inter-bucket transfers net to zero) + GROWTH (new walls change the total). V44/S190; this sprint EXERCISES conservation LIVE with a real reclassification (P-4).",
    DERIVED: "recomputed from its inputs, NOT reconciled across time (a ratio — guardEfficacy, this sprint RE-MEASURED as the aggregate across every render surface, S204); a moved DERIVED value is honest iff it recomputes from its inputs",
    INVARIANT: "must equal prev; a change REFUSES unless the registry consciously re-pins it (deps 2, screens 3, laws 17, exitKinds 7, battery.fail 0)",
  },
  countables: [
    { key: "battery.pass", type: "ADDITIVE", markerPath: "battery[0]", note: "the FULL battery pass count (Consistency.batteryFullDelta — prev + added − removed === now)" },
    { key: "battery.skip", type: "ADDITIVE", markerPath: "battery[1]", note: "env-gated skips (ask_live/eval_live) — additive, honest at any count" },
    { key: "battery.fail", type: "INVARIANT", markerPath: "battery[2]", note: "0 — any fail REFUSES the log" },
    { key: "battery.expect", type: "ADDITIVE", markerPath: "expect", note: "the assertion count — grows with new tests" },
    { key: "battery.files", type: "ADDITIVE", markerPath: "batteryDelta.files", note: "the test-file count — grows with new test files" },
    { key: "census", type: "PARTITION", markerPath: "census", note: "demonstrated + weak + exempt + originUnrecorded === total, reconciled as CONSERVATION + GROWTH (two identities, S190/O-1); conservation exercised LIVE this sprint (P-4)" },
    { key: "deviations.count", type: "ADDITIVE", markerPath: "gate.deviationStates.length", note: "the machine-readable deviation count — grows with D92–D96 (S174 carried); the ONE producer's states are now the SINGLE source (S198)" },
    { key: "ownArchive.realStar", type: "ADDITIVE", markerPath: "ownArchive.realStar", note: "the REAL★ own-capture count (block-pinned, own live)" },
    { key: "ownArchive.realDerived", type: "ADDITIVE", markerPath: "ownArchive.realDerived", note: "the REAL-DERIVED backfill count (third-party historical, re-derivable)" },
    { key: "ownArchive.retrospective", type: "ADDITIVE", markerPath: "ownArchive.retrospective", note: "the RETROSPECTIVE smoke-test count (revisable)" },
    { key: "ownArchive.humanCaptures", type: "INVARIANT", markerPath: "ownArchive.humanCaptures", note: "0 BY DESIGN — the agent cannot advance the HUMAN own-count; the first HUMAN capture is the Operator's" },
    { key: "laws", type: "INVARIANT", markerPath: "laws.laws", note: "17 — a change is a new law (a TENTH sprint without one)" },
    { key: "deps", type: "INVARIANT", markerPath: "deps", note: "2 (hono, zod) — a mass-path dep REFUSES; uv is the sidecar's installer, not a mass-path dep" },
    { key: "screens", type: "INVARIANT", markerPath: "screens", note: "3 (shelf, reality-check, ask)" },
    { key: "exitKinds", type: "INVARIANT", markerPath: "exitKinds", note: "7 — the algebra shipped; an eighth through the enum REFUSES" },
    { key: "guardEfficacy", type: "DERIVED", markerPath: "guardEfficacy.caught", note: "the mutation-testing ratio (caught/total) — recomputed from its inputs each sprint; this sprint the AGGREGATE across every render surface (S204), NOT reconciled across time" },
  ],
}

// ── THE PREVIOUS MARKER SNAPSHOT (V44 terminal countables) — the fixed point the F-1/RP-1 marker-diff runs against. Captured
// from the V44 tree (HEAD 17501f14 / tree 4665c709) BEFORE a byte of V45 code via Continuity.snapshot(): census {dem 108, weak
// 0, exempt 2, OU 78, total 188, reFounded 12}, battery 2024/2/0 · 303 files · 13450 expect, deviations 16, ownArchive
// {realStar 1, realDerived 185, retrospective 1, human 0}, guardEfficacy.caught 10. A number that moves vs this snapshot must
// be reconciled or exempted, or the log is not written. ──
const PREV_MARKER = {
  sprint: "V44 (Reckoning)",
  terminalCommit: "17501f14",
  countables: {
    "battery.pass": 2024, "battery.skip": 2, "battery.fail": 0, "battery.expect": 13450, "battery.files": 303,
    "census.demonstrated": 108, "census.weak": 0, "census.exempt": 2, "census.originUnrecorded": 78, "census.total": 188,
    "census.reFounded": 12,
    "deviations.count": 16,
    "ownArchive.realStar": 1, "ownArchive.realDerived": 185, "ownArchive.retrospective": 1, "ownArchive.humanCaptures": 0,
    laws: 17, deps: 2, screens: 3, exitKinds: 7,
    "guardEfficacy.caught": 10,
  },
}

// ── DD-95 — THE STATE VOCABULARY + THE ONE PRODUCER'S AUTHORITY MAP (P-1/S198). deviationStates (State.deviations()) is THE
// single source; every generated block that names a deviation's state READS it; a disagreeing block REFUSES the log. The
// vocabulary is extended so ONE word can be true everywhere — the two-state defect (RESERVED vs AGENT-RATIFIED) is closed for
// blocks that do not exist yet: a V50 block that names a state without reading the producer REFUSES at emit. ──
const STATE_VOCABULARY = [
  "ANSWERED",       // a delegated question the pen has ruled (D51 = INSTRUMENT)
  "SIGNABLE",       // audited, recommended, the pen's stroke owed (D33)
  "OFF",            // switched off by the pen (D63 — the deflation meter)
  "FIRST",          // first in the Operator gate queue, unsigned (D27)
  "STRICT",         // the Stamp's bar is the literature's now (a property carried in D27's detail; the vocabulary word exists)
  "AGENT-RATIFIED", // the agent's recorded engineering call under an explicit delegation, operatorSigned:false (D87/D88/D89)
  "SHIPPED",        // built and live this arc, off the verdict path (D90 — the contagion score)
  "RESERVED",       // recorded, awaiting the pen or a future sprint (D80–D86, D91, D92–D96)
  "CLOSED",         // discharged with its reason, removed from the carrying ledger (MR13)
]
// THE AUTHORITY MAP — the folded deviations' TRUE current state (the derived four, D51/D33/D63/D27, keep their live
// derivations). Before V45, State.deviations() hardcoded "RESERVED" for every folded deviation — THAT is the P-1 bug (D87/D88/
// D89 were AGENT-RATIFIED in V44, D90 was SHIPPED). Now the state comes from HERE, and the reckoning block reads the producer.
const DEVIATION_STATE_AUTHORITY: Record<string, string> = {
  D80: "RESERVED", D81: "RESERVED", D82: "RESERVED", D83: "RESERVED", D84: "RESERVED", D85: "RESERVED", D86: "RESERVED",
  D87: "AGENT-RATIFIED", D88: "AGENT-RATIFIED", D89: "AGENT-RATIFIED", // V44 DD-93 ratified — the state the reckoning block asserted, now THE producer's word
  D90: "SHIPPED",   // the contagion score — built + live this arc, off the verdict path
  D91: "RESERVED",  // the LN5-amendment question — the pen's
  D92: "RESERVED", D93: "RESERVED", D94: "RESERVED", D95: "RESERVED", D96: "RESERVED", // this sprint's decisions — the pen's
}

// ── DD-97 — THE RPC FAILURE POLICY (P-9). A dead endpoint renders honest UNREACHABLE, never a silent fallback that changes
// provenance. The existing rotation (4 pinned RPCs, 8s timeout, all-dead → null) IS the ordered pinned fallback list; this
// sprint makes UNREACHABLE first-class, records the SERVING provider per-observation, and walls a silent swap. ──
const RPC_POLICY = {
  rule: "DD-97: per attempt a pinned timeout; bounded retries (pinned count, no exponential creep); then honest UNREACHABLE{endpoint, attempts, lastError} — the verb exits nonzero with the reason, the chain untouched. An ORDERED PINNED fallback list is permitted (public RPCs die; a hardening sprint may name understudies) WITH the serving provider recorded IN each observation — provenance preserved per-point. A silent swap, an unpinned fallback, or a provider not recorded FAILS (S201).",
  timeoutMs: 8000,
  maxAttemptsPerEndpoint: 1, // one attempt per endpoint then rotate to the next understudy — bounded, no exponential creep; the ROTATION is the retry
  pinnedFallbackList: [
    { name: "llamarpc", url: "https://eth.llamarpc.com" },
    { name: "ankr", url: "https://rpc.ankr.com/eth" },
    { name: "publicnode", url: "https://ethereum.publicnode.com" },
    { name: "1rpc", url: "https://1rpc.io/eth" },
  ],
  fallbackListNote: "the ordered pinned understudy list (PlaneRpcState.ROTATION) — a 5th is a conscious re-pin. Each observation records the ACTUAL serving provider (the one that answered), not the generic 'rpc-rotation'; a silent swap to an unpinned endpoint FAILS S201.",
  unreachableRule: "when every pinned understudy is exhausted, the read is UNREACHABLE{endpoints:[…tried], attempts, lastError} — NEVER a fabricated point, NEVER a stale-cache lie stamped fresh. The verb degrades honestly (nothing appended); the point is UNREACHABLE, not REAL★.",
  geckoterminalGap: "P-9 sub-finding: geckoterminal.ts had NO fetch timeout (could hang indefinitely on an unresponsive endpoint) — the ONE dataplane fetch without an AbortSignal. Closed: an 8s AbortSignal.timeout matching DeFiLlama's pattern; a hung endpoint aborts, not hangs.",
}

// ── DD-98 — THE CRASH-SAFETY MECHANISM (P-10). Atomic append, a verify-chain recovery verb (quarantine, never delete), and a
// REAL kill-test at every seam of the append path — not a mock. ──
const CRASH_SAFETY = {
  rule: "DD-98: atomic append via openSync(O_APPEND) + appendFileSync + fsyncSync BEFORE the write is acknowledged (the durability barrier already proven in src/studio/durable.ts, generalized). organon.sh verify-chain walks a chain, verifies hash-links, detects a torn tail, and QUARANTINES it to a .torn sidecar (NEVER deletes) with a recovery message. THE PROOF IS A REAL KILL-TEST (RP-2): kill -9 at EVERY seam of the append path on the real emit path, then verify-chain detects and recovers, then the verb resumes — each transcripted.",
  mechanism: "O_APPEND single-writer + fsync durability barrier (Bun/POSIX guarantees an O_APPEND write of a line ≤ PIPE_BUF is atomic; fsync makes it durable before acknowledge). The RECORD CHAIN (record/chain.json) is the emit-path chain the kill-test targets; the recovery reads the append-log sidecar (record/chain.append.jsonl — the atomic-append segment) and rebuilds/verifies chain.json, quarantining a torn tail line to record/chain.append.jsonl.torn.",
  injectionPoints: [
    "before-open — the fd is not yet opened; nothing written; verify-chain finds the prior committed tail intact (a no-op recovery)",
    "after-open-before-write — the fd is open, the line not yet appended; verify-chain finds no torn line (the append is atomic, all-or-nothing)",
    "after-write-before-fsync — the line is in the OS buffer, not yet durable; verify-chain either sees the full line (durable early) or not at all — never a half-line (the write of a ≤PIPE_BUF line is atomic)",
    "after-fsync-before-index — the line is durable in the append segment but chain.json is not yet rebuilt; verify-chain REBUILDS chain.json from the durable append segment (the recovery's whole job)",
  ],
  rp2_note: "F-2/RP-2 (blocking): the kill-test runs at N pinned injection points derived from the mechanism's OWN steps (before-open, after-open-before-write, after-write-before-fsync, after-fsync-before-index) — if the mechanism has four steps there are four kill-tests. verify-chain must recover from every one. One kill is an anecdote; a kill at every seam is a proof shape.",
  dd96_idempotency: "DD-96: content-hash dedupe at the append site — an observation identical in {subject, blockNumber/roundId, decoded value} to an existing chained point is recognized and SKIPPED WITH DISCLOSURE ('block 25537838 already chained (sha …) — nothing appended'). A CONFLICTING observation (same block, different value — impossible for finalized state) is a HALT-grade integrity alarm, rendered loudly, never silently resolved. backfill over a walked range resumes from the last chained round.",
}

// ── RP-4 — THE BINARY PARITY SMOKE CONTRACT (P-15). The compiled single-file binary runs each verb + verify against fixtures;
// outputs byte-equal to the source run AFTER a PINNED, ENUMERATED normalization (nothing else normalized). A seeded real
// divergence is still CAUGHT through the normalization — proving the comparison can fail. ──
const BINARY_PARITY = {
  rule: "RP-4 (blocking): outputs are compared byte-equal AFTER a pinned normalization (the timestamp fields named, the path prefixes named — nothing else). A comparison that normalizes an un-pinned field FAILS. One deliberately-divergent negative (a seeded real difference) must still be CAUGHT through the normalization — the comparison can fail. Normalize exactly what is named, catch everything else.",
  smokeContract: {
    entry: "script/organon-cli.ts (bun build --compile → dist/organon)",
    verbs: ["first-run (the committed fixture Reality Check, offline)"],
    fixtureId: "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c",
    comparison: "the binary's first-run HTML output vs the source run's (script/organon-cli.ts under bun), byte-equal after the pinned normalization",
  },
  normalization: [
    { field: "capturedAt / at / asOf / generatedAt timestamps", why: "wall-clock, differs between the two runs by construction" },
    { field: "absolute path prefixes (the tmpdir, PKG_ROOT, the binary's own path)", why: "the source run and the binary run from different roots" },
    { field: "process/pid/host identifiers if present", why: "run-environment identity, not output content" },
  ],
  seededDivergence: "a seeded real difference (a mutated verdict word in the fixture render) must be CAUGHT after normalization — the normalization touches ONLY the named fields, so a real content divergence still fails the byte-equal.",
}

// ── RP-6 — THE TERMINAL STATE ENUM (P-16/F-6). Exactly three values; the third settable ONLY by a recorded HUMAN-tier event
// (a real second human's session in the moat), never by the agent, never by a flag. ──
const TERMINAL_STATE = {
  enum: ["NOT-READY", "READY-UNVERIFIED-BY-A-SECOND-HUMAN", "VERIFIED-BY-A-SECOND-HUMAN"],
  thisSprint: "READY-UNVERIFIED-BY-A-SECOND-HUMAN",
  rule: "RP-6: 'Ready' is doing enormous work in that phrase, and the qualifier is one refactor from deletion. So the state is a pinned enum with a wall: the third value (VERIFIED) is settable ONLY by a recorded HUMAN-tier event — a real second human's session in the moat (realLineageCount > 0 by a non-author) — never by the agent, never by a flag. The upgrade path exists, is honest, and is not the agent's to walk.",
  readinessMeaning: "READY = the machinery survives a stranger's path (clean-machine install, crash-safe append, honest UNREACHABLE, transcripted workflows, frozen sidecar, docs a stranger could follow). UNVERIFIED-BY-A-SECOND-HUMAN = no stranger has walked it (realLineageCount 0; reachableHumans 1 BY DESIGN; published false; D49 unsigned). An agent can prove a door opens; it cannot prove a stranger finds the handle — and the state names which it proved.",
}

// ── THE OPEN-ISSUES REGISTRY (P-1…P-18) — the sprint's spine. The gate ENUMERATES it and REFUSES the log if any entry lacks
// its disposition's proof (S209). Discovery passes (Phase 1) may ADD entries (source DISCOVERED); they may never remove one
// silently. Disposition ∈ {FIX, ACCEPT-WITH-REASON, PEN'S}. RP-1: ACCEPT-WITH-REASON is legal ONLY when the fix is (a) a
// pen-stroke, (b) constitutionally fenced, or (c) provably out of the agent's reach — and the reason names WHICH clause. ──
const REGISTRY = {
  rule: "the pinned inventory (P-entries). Each carries a disposition (FIX / ACCEPT-WITH-REASON{clause} / PEN'S) and a proof (a wall id or an executed-transcript path). The gate enumerates and refuses the log if any FIX entry lacks its wall-or-transcript proof, or any ACCEPT-WITH-REASON cites no clause a/b/c (RP-1). The registry may grow (Phase-1 DISCOVERED entries) and never silently shrink.",
  rp1_acceptClause: "ACCEPT-WITH-REASON is legal ONLY when the fix is (a) a pen-stroke (P-18), (b) constitutionally fenced, or (c) provably out of the agent's reach — and the reason names WHICH. Every other entry's disposition is FIX; a FIX without its proof REFUSES (S209). An ACCEPTED entry citing none of the three clauses is a seeded negative that must FAIL.",
  entries: [
    { id: "P-1", source: "DISCOVERED (this inventory)", issue: "V44's marker holds TWO STATES for D87/D88/D89 — deviationStates:RESERVED vs reckoning.delegation:AGENT-RATIFIED, in one generated artifact. The S150 defect class recurring: the new reckoning block did not read State.deviations(). Same for D90 (RESERVED but SHIPPED). CONFIRMED empirically before design.", disposition: "FIX", proof: "S198", detail: "deviationStates is THE single source (DEVIATION_STATE_AUTHORITY); every generated block that names a deviation's state READS it; a disagreeing block REFUSES. The vocabulary extended (AGENT-RATIFIED, SHIPPED, …) so one word is true everywhere." },
    { id: "P-2", source: "V44 audit D-2/High-1", issue: "the header cross-check shows naive psr 0.9989 beside riderEnforced:true — enforcement is Stamp-scoped, but the juxtaposition reads as contradiction.", disposition: "FIX", proof: "S202", detail: "the cross-check block renders BOTH psr(naive) and psr(N_eff) side by side, AND riderEnforced carries its scope inline (scope: the Stamp; the cross-check shows both statistics)." },
    { id: "P-3", source: "V44 audit D-3/High-2", issue: "the rebased:{from,to,scheme,at} tag for redesignSearchHashes is proven-stable but not rendered inline in the marker.", disposition: "FIX", proof: "S202-render", detail: "the tag renders inline where the hash renders (Rollup + HistoricalAct.rebasingVerdict.tag)." },
    { id: "P-4", source: "V44 audit D-4/Med-3", issue: "the census CONSERVATION identity has only been exercised trivially ([no transfers] — net-0 because empty). A check that has never checked anything is X-REACH(a)'s exact case.", disposition: "FIX", proof: "S190-live", detail: "a REAL reclassification this sprint (at least one census wall legitimately moves buckets during the sweep) exercises conservation live; plus the seeded-transfer negative." },
    { id: "P-5", source: "V44 audit Med-5", issue: "whether D27-strict/N_eff ever reach a mass-path surface is undocumented — Stamp-scoped by design or by accident?", disposition: "FIX", proof: "P5-pinned", detail: "documented PERMANENTLY in the pins: Stamp-scoped BY DESIGN (the mass path carries no verdicts; the Stamp is the verdict surface; the cross-check shows both statistics per P-2). A one-paragraph design record, pinned (stampScopeByDesign)." },
    { id: "P-6", source: "V40→V44, MR13 (ninth sprint)", issue: "MR13 (discharge MR9) has been carried unaddressed nine sprints; V40 recorded it undischargeable (IN2 is a human act).", disposition: "FIX", proof: "P6-closed", detail: "formally CLOSED as UNDISCHARGEABLE-BY-AGENT, CONVERTED to the standing gate line (IN2 · realLineageCount). Removed from the MR ledger with its reason (mr13 → CLOSED). The ledger stops carrying a ghost." },
    { id: "P-7", source: "V38→V44 (standing)", issue: "guardEfficacy was measured per-surface at different times (10/17 advice V41; contagion guard V44) — there is no single current aggregate across ALL render surfaces.", disposition: "FIX", proof: "S204", detail: "the mutation catalogue re-run across EVERY render surface in one pass; the aggregate + per-surface breakdown rendered; every uncaught mutation NAMED (lower-bound caveat carried)." },
    { id: "P-8", source: "V37/V38 (standing)", issue: "the Socket's protocol pin was live-verified in V38 — three sprints ago. Clients moved.", disposition: "FIX", proof: "S204-socket", detail: "the protocol negotiation re-verified LIVE (the pinned range exercised against the real negotiate()); the range re-pinned with the check's transcript." },
    { id: "P-9", source: "V42/V43 (standing)", issue: "RPC failure behavior is unspecified — a dead pinned endpoint, a timeout, a garbage response mid-walk: what renders? Nothing may silently fall back (provenance).", disposition: "FIX", proof: "S201", detail: "bounded retries, then honest UNREACHABLE; an ORDERED PINNED fallback list permitted ONLY with the serving provider recorded per-observation; a silent provider swap FAILS. Plus the geckoterminal no-timeout gap closed." },
    { id: "P-10", source: "V42/V43 (standing)", issue: "crash-safety of the append-only chains is unproven — a kill -9 mid-append could leave a torn JSONL line; recovery is unspecified.", disposition: "FIX", proof: "S200", detail: "atomic append (O_APPEND + fsync), a verify-chain recovery path (quarantine, never delete), and a REAL kill-test at every seam of the emit path (RP-2) — not a mock." },
    { id: "P-11", source: "V42/V43 (standing)", issue: "idempotency unspecified: capture at the same block twice, backfill over an already-walked range — does the moat fork or double?", disposition: "FIX", proof: "S200-dedupe", detail: "content-hash dedupe — an identical observation (same block/round/value) is recognized, not re-chained; the dedupe is disclosed; a conflicting value is a loud HALT." },
    { id: "P-12", source: "V32→V44 (standing UX)", issue: "the empty state is hostile: a new user sees UNJUDGEABLE everywhere with no why.", disposition: "FIX", proof: "S199", detail: "every UNJUDGEABLE render carries {why, whatWouldMakeItJudgeable} — machine-derived, pinned copy; a bare UNJUDGEABLE FAILS." },
    { id: "P-13", source: "standing", issue: "no end-to-end workflow has ever been executed as a committed transcript — install→first-run→author→capture→backfill→views→socket, including failure paths.", disposition: "FIX", proof: "S203", detail: "every workflow executed and committed, failure paths included; authoring runs to the brink AGENT-quarantined and honestly labeled." },
    { id: "P-14", source: "research V52 (always a hardening item)", issue: "the Python sidecar's reproducibility is asserted, not frozen — no uv.lock, no exact-pin proof on a clean clone.", disposition: "FIX", proof: "S205", detail: "uv.lock committed, uv sync --frozen on the clone, the frozen seven byte-attested post-install." },
    { id: "P-15", source: "D49 (standing)", issue: "the compiled single-file binary (bun build --compile) has never been proven at parity with the source run.", disposition: "FIX", proof: "S206", detail: "a pinned smoke contract — the binary executes first-run + verify against fixtures; outputs byte-equal to the source run after a PINNED normalization; a seeded divergence CAUGHT." },
    { id: "P-16", source: "standing", issue: "no documentation a second human could use exists — and 'suitable for external user testing' requires it.", disposition: "FIX", proof: "S207", detail: "a README for the second human — the honest limits FIRST (a falsifier that mostly says INSUFFICIENT, by design), the tier ladder, the three screens, the verbs, the laws in one page; no number embedded that a producer doesn't emit (docs reference live outputs); guard-checked." },
    { id: "P-17", source: "V39 D-10 / V40 (standing)", issue: "oracle-staleness frozen at a 3-feed named subset (D79); selectionRank demonstrated on a family of 2. Honest freezes — but the user-facing rendering of these limits must be checked (does the door say 'this kind resolves for 3 protocols' before a user relies on it?).", disposition: "FIX", proof: "S199-limits", detail: "the frozen limits render at the point of use, not only in the log (Unjudgeable.limitAtPointOfUse)." },
    { id: "P-18", source: "THE PEN'S", issue: "D33 signature · D67 ⟨N⟩ · D91 (LN5 amendment) · D49 (install/publish) · IN2 (the first real manifest) · the first HUMAN capture.", disposition: "PEN'S", proof: "gate-first-section", detail: "rendered at the gate, first section, as always. The sprint makes each a one-keystroke act; it makes none of them (LN5). ACCEPT-clause (a)." },
  ],
}

// ── DD-94 — the three discovery passes (the registry may grow, never silently shrink) ──
const DD94_DISCOVERY = {
  rule: "DD-94: is the registry COMPLETE? Three discovery passes, each appending DISCOVERED entries: (1) the marker/artifact sweep — every generated block cross-read against State.deviations() (the P-1 class hunted everywhere); (2) the grep sweep — TODO/FIXME/placeholder/⟨…⟩ slots, bare catch{}, unhandled rejections, any-typed mass-path seams; (3) the empty-state walkthrough — a pristine clone, zero data, every screen and verb visited, every hostile/bare/unexplained render logged. The sweep, not the memory, is the guarantee (A′#3).",
  producer: "Registry.discover() → {crossRead: {blocksChecked, twoStateFound}, grep: {findings[]}, emptyState: {bareRenders[]}} — the three sweeps, mechanical, appended as DISCOVERED entries with dispositions.",
}
const DD95_ONE_PRODUCER = {
  rule: "DD-95: State.deviations() remains THE producer; the fix is a WALL, not a promise: S198 walks every generated block, extracts every (deviationId, state) claim, and asserts each equals the producer's value. A new block added in V50 that names a state without reading the producer REFUSES the log at emit — the defect class is closed for blocks that do not exist yet.",
  vocabulary: STATE_VOCABULARY,
  authority: DEVIATION_STATE_AUTHORITY,
  producer: "State.deviationClaims(artifact) → [(id, state)]; every claim matched to State.byId(id).state (S198). A seeded two-state artifact REFUSES on the emit path.",
}
const DD96_IDEMPOTENCY = CRASH_SAFETY.dd96_idempotency
const DD99_READY = {
  rule: "DD-99: READY-UNVERIFIED-BY-A-SECOND-HUMAN requires the CLEAN-MACHINE TEST — a pristine environment (each absence SHOWN, RP-3: no cloned repo, no Bun cache, no uv cache, no PATH remnants — each shown absent before the run) → follow the README verbatim → install, first run, one full workflow — transcripted. Every failure a fresh machine hits is a P-entry. The terminal state claims READINESS (the machinery survives a stranger's path) and explicitly does NOT claim user-testing (no stranger has walked it). published:false, D49 unsigned, reachableHumans:1 — unmoved.",
  rp3_note: "F-3/RP-3 (blocking): the clean-machine transcript MUST record the environment's provenance — a fresh clone into a temp dir + explicitly enumerated cache state (each shown present/absent before the run). A clean-machine transcript that does not show the absence checks REFUSES. Where a cache is warm on this machine, it is DISCLOSED (not hidden) — the honest label beats the false claim.",
}
const DD100_SIDECAR = {
  rule: "DD-100: uv.lock committed; exact numpy/scipy pins (respecting the frozen seven's byte-hashes); uv sync --frozen in the clone path; post-install, checkFrozenSet() re-attests the seven byte-hashes. If the platform wheel differs while the frozen seven attest identical, that is RECORDED (the wheels are the environment; the seven are the law).",
  producer: "Sidecar.frozen() → {lockCommitted, lockSha, frozenSevenAttested, note} — the lock, the clone proof, the attestation.",
}

const PINS = {
  protocol: "hardening-pins",
  sprint:
    "THE HARDENING SPRINT (V45): production readiness, exclusively. The mandate — 'comprehensively identify, validate, and resolve every known or discoverable issue… red-team the entire system… a thoroughly hardened, production-ready system suitable for external user testing' — asks for readiness as a STATE, not the act of reaching a stranger. The first thing the inventory found is a defect no audit caught: V44's own marker holds TWO STATES for one deviation (deviationStates:RESERVED vs reckoning.delegation:AGENT-RATIFIED — the S150 defect class recurring because a new generated block did not read the one producer). So the method is the arc's own, turned on itself: a CLOSED-LOOP OPEN-ISSUES REGISTRY (P-1…P-18), every audit finding enumerated, each dispositioned (FIX with a wall-or-transcript / ACCEPT-WITH-REASON under a named clause / PEN'S), the gate REFUSING the log while any entry lacks its proof (S209) — grown by three mechanical discovery passes (DD-94), never silently shrunk. The one-state rule becomes a WALL over every generated block that will ever exist (S198); the cross-check shows BOTH psr(naive) and psr(N_eff) so an enforced rider never again sits beside an unscoped naive number (S202); the census conservation identity finally checks a REAL transfer (P-4); MR13, nine sprints a ghost, is CLOSED (P-6). Then the system is hardened where a stranger breaks it: a kill -9 at EVERY seam of the append path leaves a chain that detects, quarantines, and RECOVERS — never deletes (S200, a REAL kill-test); the same block twice dedupes and says so, a conflicting value is a loud HALT (P-11); a dead endpoint is an honest UNREACHABLE with its attempts counted, and if an understudy serves its name is IN the observation — provenance per point, no silent swaps (S201); the sidecar is frozen under a committed uv.lock and the seven attest byte-identical on a bare clone (S205); the single-file binary is byte-equal to the source through a normalization pinned field by field, a seeded divergence proving the comparison can fail (S206). Every workflow a second human would walk — install, empty first run, authoring to its brink (AGENT-quarantined, labeled), capture, backfill, every view, the socket — is EXECUTED and committed as a transcript, failure paths included (S203). Every UNJUDGEABLE now explains itself and names its path to judgeable (S199). And the README a stranger reads leads with what the tool will NOT do — advise, rank, optimize — and why it mostly says INSUFFICIENT: by design, the honest answer to short, autocorrelated DeFi history (S207); a docs-match-producers wall keeps it from rotting. STILL NO NEW LAW (a TENTH sprint). The terminal state, named in advance: READY-UNVERIFIED-BY-A-SECOND-HUMAN — the door has a handle, a signpost, a paved path, a recovery plan, and documentation a stranger could follow, and no footprints; the pen's six keystrokes render at the gate, each one keystroke away, none made (LN5).",
  at: "2026-07-16",
  continues:
    "THE RECKONING SPRINT (V44) — battery 2024/2/0 across 303 files / 13450 expect() (two runs identical + clone from zero), verify exit 0 with three domain-named sub-checks, the CONTINUITY-TOTAL + IDENTITY-HARDENED + LN5-MECHANIZED Ship Gate holds (a seeded agent operatorSigned:true REFUSES the log — proven on the emit path), frozen 0 drift, bundle 9c1e7bd8 byte-identical (no verdict moved since Alpha), deps 2, screens 3, exit kinds 7, familyN 1, 17 laws / 0 minted for NINE sprints; ownArchive 1 REAL★ + 185 REAL-DERIVED + 1 RETROSPECTIVE, realLineageCount 0, reachableHumans 1 (BY DESIGN); D33 implementation SOUND · application SIGNABLE · RECOMMENDED · operatorSigned:false, D27 STRICT (PSR(N_eff)>0.95 ∧ MinTRL), D63 OFF, D87-R/D88-R/D89-R AGENT-RATIFIED, D90 (contagion) SHIPPED, D91 RESERVED. Audited FULLY ACHIEVED.",
  carriedFromPinsSha: CARRIED_FROM, // the Reckoning head (67d5cd44) — READ FROM DISK, the sprint's first identity check
  chain: `${CARRIED_FROM.slice(0, 8)} (Reckoning) ← 7bf877ce (Backfill) ← 04c606dd (Provenance) ← eb64cebe (Variant) ← c0777d9a (Ship) ← 2c299b9e (Family) ← 153628a9 (Substance) ← ab4900ee (Socket) ← 257684c0 (Derive) ← 8c80367a (Reach) ← 07d27f81 (Show) ← 96469dbb (Reckon) ← d90df3c7 (Cadence) ← 98a44bd8 (Manifest) ← 2b1dd373 (Domain) ← cc08a77b (Coverage) ← 6b285eba (Redesign) ← 3d0ef3bb (GroundTruth)`,
  chainProvenanceNote: "the carried head is READ FROM reckoning-pins.json ON DISK (67d5cd44), not typed from the blueprint's prose. The ground-truth chain is the linked list of self-consistent heads.",

  // ── NO NEW LAW — a TENTH sprint running ──
  noNewLaw: {
    rule: "SEVENTEEN laws stand; ZERO minted this sprint (the tenth running). Every item is an EXISTING law under-applied: S150/X-DERIVE (the two-state deviation — a block that did not read the one producer), X-HONEST (a bare UNJUDGEABLE; a silent RPC fallback; riderEnforced beside an unscoped naive PSR), X-MOAT (a torn write that could fork the chain; an idempotency hole that could double a point), X-SHOWN (a workflow claimed but never transcripted), X-REACH (a recovery path that has never recovered). The constitution was always sufficient for production; production IS the constitution, applied without mercy. If hardening required a new law, that would be the signal the arc is over — it does not.",
    laws: 17,
    minted: 0,
    sprintsWithoutALaw: 10,
  },

  // ── THE FRAME ──
  frame: {
    mandateTension: "'suitable for external user testing' sits beside D51 (INSTRUMENT, n=1 BY DESIGN) and published:false / D49 unsigned. The inference (strikeable): the mandate asks for readiness as a STATE — the tool must be capable of surviving a second human — not the act of reaching one. So this sprint validates the install on a clean machine, writes the second-human docs, hardens every failure path, and terminates in READY-UNVERIFIED-BY-A-SECOND-HUMAN — while published, D49, and any invitation remain pen-strokes the agent never makes. If the Operator intends this mandate as a D51 revision or a D49 signature, that is his stroke; the sprint makes it a one-keystroke stroke.",
    noNewScope: "the no-new-scope rule, mechanized: every unit of work traces to a NAMED registry entry (an audit finding, a discovered defect, a named failure mode). Work that traces to nothing is REFUSED (S209) — hardening is the one sprint where scope creep wears the most virtuous clothes.",
    thesis: "ORGΛNON is a strategy FALSIFIER, and a falsifier is only useful if it survives real use. This sprint hardens it to survive a stranger's path — crash-safe, dedupe-safe, honestly UNREACHABLE, transcripted, frozen, documented — and names the honest terminal state: READY, UNVERIFIED by a second human, because no second human has walked it.",
    reachableHumans: 1,
    reachableHumansNote: "reachableHumans:1 is BY DESIGN under D51. realLineageCount:0 — the door has never been opened. A hardening sprint can pave every meter of the stranger's path and cannot make a stranger — or its own Operator — take the first step (F-7).",
  },

  // ── DD-94..DD-100 ──
  delegatedDecisions: {
    DD81: COUNTABLE_REGISTRY,
    DD94: DD94_DISCOVERY,
    DD95: DD95_ONE_PRODUCER,
    DD96: { rule: DD96_IDEMPOTENCY },
    DD97: RPC_POLICY,
    DD98: CRASH_SAFETY,
    DD99: DD99_READY,
    DD100: DD100_SIDECAR,
  },

  // ── THE OPEN-ISSUES REGISTRY ──
  registry: REGISTRY,

  // ── THE STATE VOCABULARY + AUTHORITY MAP (P-1/S198/DD-95) ──
  stateVocabulary: STATE_VOCABULARY,
  deviationStates: DEVIATION_STATE_AUTHORITY,

  // ── THE RPC POLICY (P-9/DD-97), CRASH-SAFETY (P-10/DD-98), BINARY PARITY (P-15/RP-4), TERMINAL STATE (P-16/RP-6) ──
  rpcPolicy: RPC_POLICY,
  crashSafety: CRASH_SAFETY,
  binaryParity: BINARY_PARITY,
  terminalState: TERMINAL_STATE,

  // ── P-5 — the Stamp-scoped-BY-DESIGN design record, pinned permanently ──
  stampScopeByDesign: {
    rule: "P-5: D27-strict and the N_eff correction are Stamp-scoped BY DESIGN, not by accident. The mass path (the Reality Check scorecard) carries NO verdicts — it renders SOLID/CAUTION/AVOID/UNVERIFIED facts, no Sharpe. The Stamp (the opt-in overfit stress test) is the ONLY harness surface that renders a Sharpe-derived verdict, so it is the ONLY surface where a strict PSR(N_eff) bar belongs. The cross-check block shows BOTH psr(naive) and psr(N_eff) (P-2/S202) so the correction is visible on the mass-path-adjacent header without moving a mass-path verdict. This is why the bundle 9c1e7bd8 does not move (the Stamp is off the mass path and outside the deterministic bundle) — a permanent design fact, not a coincidence to be rediscovered.",
  },

  // ── THE FENCE — refused this sprint, by name ──
  fence: {
    refused: [
      "ANY new capability (this sprint builds none — work that traces to no registry entry is REFUSED, S209)",
      "the agent moving operatorSigned, published, D49, D67's ⟨N⟩, or D91 (LN5 — the pen's six keystrokes are listed at the gate and made easy; none is made)",
      "claiming 'user-tested' (the terminal state is READY-UNVERIFIED-BY-A-SECOND-HUMAN — RP-6; the words 'user-tested' anywhere are a Halt)",
      "valuation / USD",
      "any mass-path dependency (deps stay 2 — uv is the sidecar's installer, not a mass-path dep)",
      "the deflation METER lit (D63 OFF)",
      "the Proposer · the Adversary · the post-mortem · D38",
      "any daemon / cron / scheduler / service / port / listener (the socket is stdio, not a listener)",
      "a hosted tier · reports/API-as-product · execution / custody / wallets · Markowitz / any optimizer",
      "the Merkle layer (DEAD) · marketplace / leaderboard",
      "a second law (seventeen; TEN sprints)",
      "a silent RPC fallback (provenance is per-point or the point is UNREACHABLE)",
      "deleting a torn chain segment (quarantine, never delete — the moat is append-only even in recovery)",
      "an eighth exit kind",
      "docs that describe strategies rather than the tool (X-ADVICE reaches the README)",
      "moving the mass-path bundle 9c1e7bd8 (hardening moves no verdict)",
    ],
  },

  // ── THE BUILD PHASES — the shed order, PINNED. Phases 1–5 NEVER SHED; Phase 6 may REDUCE to the limits-first README, never vanish. ──
  shedOrder: {
    rule: "Phases 1–5 NEVER SHED (a hardening sprint that sheds its hardening is nothing). Phase 6 may REDUCE to its minimal honest form (the limits-first README) but may not vanish.",
    neverShed: ["1_discovery", "2_ledgerDisclosure", "3_resilience", "4_userPath", "5_fullRerun"],
    mayReduce: ["6_secondHumanDocs"],
  },

  // ── THE BUILD PHASES ──
  phase1_discovery: {
    rule: "DISCOVERY (DD-94) — NEVER SHEDS. The registry is seeded; now it is grown by three mechanical passes: (a) the cross-read sweep (the P-1 class hunted everywhere), (b) the grep sweep (TODO/FIXME/placeholder/bare catch), (c) the empty-state walkthrough (a pristine clone, zero data). Every finding appends a DISCOVERED P-entry; the registry grows, never silently shrinks.",
    gate: "THE-DEBT-IS-ENUMERATED (the sweep, not the memory, is the guarantee)",
  },
  phase2_ledgerDisclosure: {
    rule: "THE LEDGER & DISCLOSURE FIXES (S198, S202; P-1…P-6) — NEVER SHEDS.",
    s198: "the state vocabulary extended; deviationStates re-rendered as THE single source (D87/D88/D89 → AGENT-RATIFIED; D90 → SHIPPED; D91 → RESERVED); every generated block's state claims READ the producer; a disagreeing block REFUSES — proven by a seeded two-state artifact on the emit path. (W-HD01)",
    s202: "the cross-check renders psr(naive) AND psr(N_eff) side by side, riderEnforced scoped inline (P-2); the rebased tag renders inline (P-3); the Stamp-scope pinned BY DESIGN (P-5); MR13 CLOSED (P-6). (W-HD04)",
    p4: "a REAL census reclassification this sprint exercises CONSERVATION live (plus the seeded negative) — the conservation identity finally checks a real transfer.",
  },
  phase3_resilience: {
    rule: "RESILIENCE (S200, S201, S205, S208; P-9…P-11, P-14) — NEVER SHEDS. Where a second human actually breaks it.",
    s200: "atomic append; organon.sh verify-chain (detects a torn tail, quarantines to .torn, NEVER deletes); THE REAL KILL-TESTS (RP-2): kill -9 at EVERY seam of the append path → verify-chain recovers → the verb resumes — each transcripted; content-hash dedupe (a duplicate skipped + disclosed); a same-block-different-value CONFLICT is a loud HALT. (W-HD02)",
    s201: "bounded retries → honest UNREACHABLE{endpoint, attempts}; the pinned fallback list with the serving provider recorded per-observation; a silent swap FAILS; the geckoterminal no-timeout gap closed. (W-HD03)",
    s205: "uv.lock committed; uv sync --frozen on the clone; the frozen seven byte-attested post-install. (W-HD07)",
    s208: "two simultaneous verb invocations cannot corrupt a chain (the O_APPEND atomicity holds). (folded into S200)",
  },
  phase4_userPath: {
    rule: "THE USER'S PATH (S199, S203; P-12, P-13, P-17) — NEVER SHEDS.",
    s199: "every UNJUDGEABLE render carries {why, whatWouldMakeItJudgeable} — machine-derived from the fact's own inputs, copy pinned; a bare UNJUDGEABLE FAILS; the frozen limits render at the point of use (P-17). (W-HD05)",
    s203: "every workflow executed and committed as a transcript, failure paths included: install → first run (empty state) → author-to-the-brink (AGENT-quarantined, labeled, realLineageCount untouched) → capture (incl. UNREACHABLE path) → backfill (incl. resume + dedupe) → false-fire count → variant ledger → family enumerator → dependency map → contagion → the Socket session. A workflow without its failure-path transcript is not validated (X-SHOWN(b)). (W-HD06)",
  },
  phase5_fullRerun: {
    rule: "THE FULL-SYSTEM ADVERSARIAL RE-RUN (S204, S206; P-7, P-8, P-15) — NEVER SHEDS.",
    s204: "the mutation catalogue re-run across every render surface in one pass — aggregate guardEfficacy + per-surface breakdown + every uncaught mutation NAMED (lower-bound caveat carried); doc-shaped baits added (A′#6); the Socket's protocol negotiation re-verified LIVE, the range re-pinned (P-8). (W-HD08)",
    s206: "the compiled single-file binary runs the pinned smoke contract (first-run + verify against fixtures) with outputs byte-equal to the source run after the PINNED normalization — and a seeded real divergence is CAUGHT through it. S1–S197 re-run whole under the Ship Gate against the shipped artifacts. (W-HD09)",
  },
  phase6_secondHumanDocs: {
    rule: "THE SECOND-HUMAN DOCS (S207; P-16) — MAY REDUCE, never vanish. The README, limits FIRST: what this tool is (a falsifier that prices your search), what it refuses (advice, rankings, optimization), why it mostly says INSUFFICIENT (by design — the honest answer to short, autocorrelated DeFi history), the tier ladder, the three screens, the verbs, the seventeen laws in one page. No embedded number a producer doesn't emit (docs reference live outputs); a docs-match-producers wall greps the README's structural claims against the producers. The README passes the ONE GUARD; doc-shaped mutations must FAIL.",
    s207: "the README leads with limits, embeds no unproduced number, matches its producers, and passes the guard; a doc-embedded stale number or a doc-shaped advice bait FAILS. DD-99/RP-3: the clean-machine test — a pristine environment (each absence shown), the README followed verbatim, install → first run → one workflow, transcripted. (W-HD10)",
  },

  // ── PART A′ — THE ADVERSARIAL VALIDATION RECORD (this plan, attacked before design) ──
  adversarialRecord_partA: {
    A1_productContradictsD51: "'Production-ready for external user testing contradicts D51 (INSTRUMENT, n=1 BY DESIGN). You are quietly building the product the pen said this is not.' The mandate's one real tension. Resolved by the state/act split: readiness is a STATE (the tool survives a stranger's path); reaching is an ACT (publish, invite, sign D49) — every act stays the pen's. The terminal state says so in its name. If the Operator intends more, the gate lists exactly which keystrokes produce it, each made one keystroke.",
    A2_scopeInVirtueClothes: "'A hardening sprint invents scope in virtue's clothing — fallback RPCs, locking, recovery verbs, docs — each required by an identified gap if you squint.' The most likely failure mode of THIS sprint. Lands. S209: every unit of work traces to a named registry entry; the trace is IN the pins, and work that traces to nothing is refused at the gate. The fallback-RPC list is the test case: it traces to P-9, it is pinned and per-point recorded — the shape of legitimate hardening scope. An improvement that cannot name its issue is a feature, and features are fenced.",
    A3_registryIsCurated: "'The registry is curated by the same agent whose blind spots produced the misses — P-1 proves the audits miss things, and the registry is built from the audits.' Lands — and P-1 itself is the answer's proof. The registry is seeded from the audits AND grown by three mechanical discovery passes (DD-94) that do not depend on audit memory: the cross-read sweep (which found P-1), the grep sweep, the empty-state walkthrough. Registry + discovery is the V43 pattern: the list is a convenience; the sweep is the guarantee. And the registry may grow mid-sprint and never silently shrink.",
    A4_agentValidatesOwnDoor: "'The workflow transcripts are AGENT-tier by the quarantine's own rules — the agent will validate the door by walking through it itself and call the tool user-tested.' Lands, and the quarantine contains the answer. The transcripts prove the MACHINERY (the door opens, refuses, errors honestly); they are labeled AGENT throughout; realLineageCount stays 0; and the terminal state is READY-UNVERIFIED-BY-A-SECOND-HUMAN (RP-6). An agent can prove a door opens. It cannot prove a stranger finds the handle — and the log says which one it proved.",
    A5_crossCheckSchemaChange: "'Rendering psr(N_eff) beside psr(naive) in the cross-check changes the header schema — the continuity gate will fire on its own fix.' Correct, and it is the system working. The new field enters the countable/exempt classification EXPLICITLY (an exempt DERIVED leaf with its inputs named — crossCheck.* is already MARKER_EXEMPT), the change traces to P-2, and the continuity gate's raw-leaf diff sees a CLASSIFIED new leaf — not a phantom. The fix for a disclosure gap must itself pass the disclosure machinery.",
    A6_readmeIsAdvice: "'The README is an advice surface — a document explaining a yield-strategy falsifier to a stranger will drift into explaining yield strategies.' Lands — X-ADVICE reaches the docs. The README describes the TOOL, never a strategy: what it judges, what it refuses, what its tiers mean, why it mostly says INSUFFICIENT (the honest-limits section comes FIRST). No embedded numbers a producer doesn't emit (docs reference live outputs). The README passes the ONE GUARD like any render surface, and the mutation catalogue gains doc-shaped baits ('for best yields, consider…' seeded → must FAIL).",
  },

  // ── PART F — THE POST-IMPLEMENTATION RED TEAM — blocking re-pins ──
  postImplementationRePins_partF: {
    RP1_dispositionSkew: "F-1 CRITICAL — the registry's dispositions will skew toward ACCEPT-WITH-REASON under time pressure. RP-1 (blocking): ACCEPT-WITH-REASON is legal ONLY for entries whose fix is (a) a pen-stroke (P-18), (b) constitutionally fenced, or (c) provably out of the agent's reach — and the reason names WHICH. Every other entry's disposition is FIX, and a FIX without its wall-or-transcript proof REFUSES (S209). The gate renders the disposition census FIXED n · ACCEPTED m (each with its clause) · PEN'S k; an ACCEPTED entry citing none of the three clauses is a seeded negative that must FAIL.",
    RP2_killAtEverySeam: "F-2 HIGH — a single kill-test is an anecdote. RP-2 (blocking): the kill-test runs at N pinned injection points (before-open, after-open-before-write, after-write-before-fsync, after-fsync-before-index — enumerated from the chosen mechanism's actual step sequence), each transcripted, and verify-chain must recover from every one. The injection points are derived from the implementation's own steps, not chosen by convenience. One kill is an anecdote; a kill at every seam is a proof shape.",
    RP3_cleanMachineProvenance: "F-3 HIGH — the clean-machine test will quietly become 'a fresh directory on the same machine.' RP-3 (blocking): the clean-machine transcript MUST record the environment's provenance — a fresh clone + an explicitly enumerated cache state (no cloned repo, no Bun cache, no uv cache, no PATH remnants — each shown absent/present before the run). A transcript that does not show the absence checks REFUSES. A warm cache is DISCLOSED, never hidden. The test is the stranger's first minute, and the stranger has no warm cache.",
    RP4_binaryNormalization: "F-4 MEDIUM-HIGH — binary parity's byte-equal will fail spuriously on timestamps and paths, and the tempting fix is to weaken the comparison until it always passes (X-REACH(a)). RP-4 (blocking): the smoke contract pins the normalization explicitly (the timestamp fields named, the path prefixes named — nothing else). A comparison that normalizes an un-pinned field FAILS. One deliberately-divergent negative must still be CAUGHT through the normalization. Normalize exactly what is named, catch everything else.",
    RP5_docsRot: "F-5 MEDIUM — the README will be honest on day one and stale by V50 (docs rot is the one debt this sprint CREATES). RP-5 (blocking): the README's factual claims are generated or checked — the numbers it references are commands to live outputs (never embedded values); its structural claims (deps, screens, laws, tier ladder) are asserted by a wall that greps the README against the producers (S207 docs-match-producers). A README claim the wall cannot tie to a producer is rewritten as a command or removed. The docs join the derivation discipline or they join the debt.",
    RP6_terminalStateEnum: "F-6 MEDIUM — READY-UNVERIFIED-BY-A-SECOND-HUMAN will be read as modesty when it is the sprint's sharpest claim, and the qualifier is one refactor from deletion. RP-6: the state is a pinned enum with exactly three values and a wall — NOT-READY → READY-UNVERIFIED-BY-A-SECOND-HUMAN → VERIFIED-BY-A-SECOND-HUMAN — and the third is settable ONLY by a recorded HUMAN-tier event (a real second human's session in the moat), never by the agent, never by a flag.",
    F7_cannotAnswer: "MEDIUM — realLineageCount:0. The tool will be crash-safe, dedupe-safe, honestly UNREACHABLE, transcripted end-to-end, frozen, documented, and named READY — and still unused. A hardening sprint can pave every meter of the stranger's path and cannot make a stranger — or its own Operator — take the first step. The six keystrokes render at the gate, each one keystroke away. The door has a handle, a signpost, a paved path, and no footprints.",
  },

  // ── THE DEVIATIONS reserved/recorded this sprint (D92–D96). Only D92–D96 are new /^D\\d+$/ keys (State.deviations folds them;
  // Continuity.countNamedNewDeviations counts them → added 5 → deviations.count 16→21). Operator-signed=false on ALL — the agent
  // NEVER signs the gate (LN5). ──
  deviations: {
    D92: "RESERVED — THE OPEN-ISSUES REGISTRY + THREE DISCOVERY SWEEPS: every audit finding enumerated and dispositioned, grown by the cross-read/grep/empty-state passes; the gate refuses the log while any entry lacks its proof (S209). A method, recorded. Operator-signed=false.",
    D93: "RESERVED — THE RPC FAILURE POLICY: bounded retries → honest UNREACHABLE{endpoint, attempts}; the ordered pinned understudy list with the serving provider recorded per-observation; a silent swap FAILS (S201). Operator-signed=false.",
    D94: "RESERVED — CRASH-SAFETY + IDEMPOTENCY: atomic O_APPEND+fsync; verify-chain (quarantine, never delete); a REAL kill-test at every seam; content-hash dedupe + a loud conflict HALT (S200). Operator-signed=false.",
    D95: "RESERVED — THE SIDECAR FREEZE: uv.lock committed, uv sync --frozen on the clone, the frozen seven byte-attested post-install (S205). Operator-signed=false.",
    D96: "RESERVED — THE SECOND-HUMAN DOCS: a limits-first README, a docs-match-producers wall, the clean-machine test with absence checks shown (S207). Operator-signed=false.",
    mr13: "CLOSED (P-6) — MR13 (discharge MR9) is UNDISCHARGEABLE-BY-AGENT (it turns on the Operator opening the tool; realLineageCount 0). CONVERTED to the standing gate line (IN2 · realLineageCount) and removed from the MR ledger with its reason. The ledger stops carrying a ghost.",
    mr20: "carried (S174) — the machine-readable deviationStates must enumerate EVERY pinned deviation: D51/D33/D63/D27 AND D80–D91 AND this sprint's D92–D96, each state from the ONE producer (S198). A pinned deviation absent from deviationStates FAILS (S174).",
    operatorGatedNote:
      "D23–D96 present, D27 STILL FIRST (the TWENTIETH sprint) — the Stamp STRICT (the generosity retired in V44). THE FIRST gate section is THE PEN'S SIX KEYSTROKES, each now one keystroke: (1) D33 — implementation SOUND · application SIGNABLE · RECOMMENDED · operatorSigned:false; (2) D67 — ⟨N⟩ STILL EMPTY, the archive deep enough to feed it; (3) D91 — the LN5-amendment question, RESERVED; (4) D49 — the install path, validated on a clean machine, unsigned; (5) IN2 — the first real manifest, the door transcripted to its brink; (6) the first HUMAN capture — the verb proven, dedupe-safe, crash-safe. Then the registry (every P-entry with its proof + the disposition census FIXED/ACCEPTED/PEN'S), guardEfficacy aggregate + per-surface, the terminal state READY-UNVERIFIED-BY-A-SECOND-HUMAN, and LAWS:17·minted:0(ten sprints)·deps:2·screens:3·familyN:1·realLineageCount:0·published:false·reachableHumans:1(BY DESIGN). Presented whole. No keystroke made (LN5). D33 or D46 implemented while unsigned is the gravest Halt.",
  },

  // ── PART CLEAN — the pure functions, each with a seeded negative and a mint-time origin ──
  partClean: {
    rule: "pure functions, each with a seeded negative and a mint-time origin enforced AT SHIP; deps 2, screens 3, familyN === 1, no daemon, no law, operatorSigned never moved by the agent. No new capability. Every artifact passes the identity-hardened, continuity-total, ONE-STATE, TRACE Ship Gate or the build log is not written.",
    producers: {
      "Registry.issues": "() → P[] — the pinned inventory; the gate enumerates; an entry without its proof REFUSES (S209).",
      "Registry.discover": "() → {crossRead, grep, emptyState} — the three sweeps (DD-94); DISCOVERED entries appended, never silently shrunk.",
      "State.deviationClaims": "(artifact) → [(id, state)] — every generated block's claims extracted and matched to the ONE producer (S198). A seeded two-state artifact REFUSES.",
      "Unjudgeable.explain": "(fact) → {why, whatWouldMakeItJudgeable} — no bare UNJUDGEABLE renders (S199); machine-derived, copy pinned.",
      "Chain.append": "(obs) → CHAINED | DEDUPED{existing} | CONFLICT-HALT — idempotent; a conflict is loud (S200).",
      "Chain.verifyAndRecover": "() → OK | TORN{quarantined} — never deletes (S200).",
      "Rpc.call": "(req) → value | UNREACHABLE{endpoint, attempts} — provider recorded per point; no silent swap (S201).",
      "CrossCheck.both": "() → {naive, nEff, scope} — psr(naive) AND psr(N_eff), riderEnforced scoped (S202).",
      "Workflow.transcript": "(name) → committed artifact incl. failure paths (S203).",
      "Guard.aggregate": "() → {overall, perSurface[], uncaught[]} — the mutation catalogue across every surface (S204).",
      "Sidecar.frozen": "() → uv.lock attested (S205).",
      "Binary.parity": "() → byte-equal smoke outputs after pinned normalization (S206).",
    },
  },

  // ── THE RED TEAM — walls S198–S209 (S1–S197 carried, re-run against the SHIPPED artifacts at ship time) ──
  walls: {
    carried: "S1–S197 first-class, re-run (two identical battery runs) — every one runs against the SHIPPED artifact at ship time (the identity-hardened, continuity-total, LN5-mechanized Ship Gate, V40+V42+V43+V44).",
    built: ["S198", "S199", "S200", "S201", "S202", "S203", "S204", "S205", "S206", "S207", "S208", "S209"],
    S198: "every generated block's deviation-state claims equal the ONE producer's; a seeded two-state artifact REFUSES on the emit path. (W-HD01, P-1)",
    S199: "no bare UNJUDGEABLE; each carries its why and its path to judgeable; the frozen limits render at the point of use. (W-HD05, P-12/P-17)",
    S200: "the kill-tests: a torn append at every injection point is detected, quarantined (never deleted), recovered, resumed; a duplicate observation dedupes with disclosure; a same-block conflict HALTs loudly; two concurrent verbs cannot corrupt a chain. (W-HD02, P-10/P-11/S208)",
    S201: "a dead endpoint renders UNREACHABLE{endpoint, attempts}; the serving provider is recorded per-point; a silent swap FAILS; the geckoterminal no-timeout gap closed. (W-HD03, P-9)",
    S202: "the cross-check shows both psr statistics; riderEnforced is scoped inline; the rebased tag inline; the Stamp-scope pinned; MR13 CLOSED. (W-HD04, P-2/P-3/P-5/P-6)",
    S203: "every workflow has its committed transcript including failure paths; authoring transcripts are AGENT-labeled. (W-HD06, P-13)",
    S204: "the aggregate guard number with per-surface breakdown and named holes; the Socket protocol re-verified LIVE. (W-HD08, P-7/P-8)",
    S205: "the sidecar installs frozen on the clone; the seven attest byte-identical. (W-HD07, P-14)",
    S206: "the binary's smoke outputs are byte-equal after the pinned normalization; a seeded divergence is CAUGHT. (W-HD09, P-15)",
    S207: "the README leads with limits, embeds no unproduced number, matches its producers, and passes the guard; the clean-machine test shows its absence checks. (W-HD10, P-16)",
    S208: "two simultaneous verb invocations cannot corrupt a chain (folded into S200's atomicity). (P-10)",
    S209: "every unit of work traces to a registry entry; untraced work REFUSES; the disposition census renders (FIXED/ACCEPTED{clause}/PEN'S); an ACCEPTED entry citing no clause FAILS (RP-1). (W-HD00, the spine)",
  },

  // ── THE CONVERGENCE CRITERIA ──
  convergence: {
    rule: "two clean runs · identical expect() · the Ship Gate held (identity + continuity + LN5 + S198 one-state + S209 trace) · clone RAN (with the frozen sidecar attested) · the binary at parity · every workflow transcripted · every P-entry proven or honestly dispositioned · bundle 9c1e7bd8 byte-identical (no verdict moved — hardening moves no verdict) · familyN === 1 · frozen 0 drift · deps 2 · screens 3 · the terminal state named honestly (READY-UNVERIFIED-BY-A-SECOND-HUMAN) · operatorSigned unmoved by the agent on every deviation.",
    halts: "an untraced unit of work · a registry entry without its proof · an ACCEPTED disposition citing no clause · a two-state deviation anywhere · a bare UNJUDGEABLE · a deleted torn segment · a forked or doubled chain · a silent RPC swap · a normalization not in the pins · an unlabeled agent transcript · a doc claim with no producer · the words 'user-tested' · any pen-stroke made by the agent (LN5 — the gravest).",
  },

  // ── THE PREVIOUS MARKER SNAPSHOT (the F-1/RP-1 diff runs against this) ──
  prevMarker: PREV_MARKER,

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    newProductCapability: 0,
    newProductCapabilityNote: "0 new scored capability — this sprint HARDENS, VALIDATES, DISPOSITIONS, and DOCUMENTS what exists; it builds no new capability (the fence's first line, S209). Crash-safety, RPC honesty, dedupe, the empty-state why, the docs — each traces to a registry entry (a named failure mode), not to a new feature. Reported honestly.",
    lawsThisSprint: "ZERO — application, not legislation (a TENTH sprint running; production IS the constitution applied without mercy)",
    laws: 17,
    exitKinds: 7,
    familyN: 1,
    reachableHumans: 1,
    published: false,
    frozenSevenNote:
      "the 6 .py + loop.ts + verdict-path 7 + frozen-core 2 byte-untouched (uv.lock freezes the sidecar's ENVIRONMENT — the wheels — while the frozen seven are the LAW, byte-attested post-install; a wheel that differs while the seven attest identical is RECORDED); the scorecard differential + evidence bundle 9c1e7bd8 byte-identical at every gate (crash-safety/RPC/dedupe/docs — none touches the scorecard verdict path or the frozen-attest differential); no daemon; no new mass-path dependency (uv is the sidecar installer, not a mass-path dep).",
    evidenceBundleShaPrefix: "9c1e7bd8",
    evidenceBundleNote: "9c1e7bd8 stays byte-identical — hardening moves no verdict. A moved bundle this sprint is a Halt.",
    killCriterion: "8b4e094b",
    ownCaptures: 0,
    ownCapturesNote: "ownCaptures (HUMAN) 0 today — the Operator has never run the verb; the own-leg counts REAL★ + REAL-DERIVED with the mix + ratio labeled, but the HUMAN own-count stays 0 (RP-6: VERIFIED settable only by a HUMAN-tier event).",
    terminalState: "READY-UNVERIFIED-BY-A-SECOND-HUMAN",
    d67NEmpty: "D67's ⟨N⟩ is STILL EMPTY — awaiting the pen; the door is paved and the archive deep enough to feed it.",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "hardening-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── HARDENING — the sprint contracts pinned (V45) ─────────────────")
console.log(`  carried from Reckoning  : ${CARRIED_FROM.slice(0, 16)}…  (READ FROM DISK — the true V44 head)`)
console.log(`  walls                   : S198–S209 (S1–S197 carried, run at ship time)`)
console.log(`  registry                : ${REGISTRY.entries.length} seeded P-entries (grown by 3 discovery sweeps, never silently shrunk)`)
console.log(`  shed order              : 1–5 NEVER shed · 6 may reduce to the limits-first README`)
console.log(`  the one-state wall (P-1): deviationStates THE single source; a two-state block REFUSES (S198)`)
console.log(`  the kill-test (P-10)    : a REAL kill -9 at every seam of the append path (RP-2)`)
console.log(`  the terminal state      : ${TERMINAL_STATE.thisSprint} (the pinned enum; VERIFIED settable only by a HUMAN-tier event)`)
console.log(`  new capability          : ${OUT.carried.newProductCapability} (this sprint builds none — hardens what exists, S209)`)
console.log(`  deviations named        : D92–D96 (added 5 → deviations.count 16→21)`)
console.log(`  HARDENING PINS_SHA      : ${pinsSha}`)
console.log("written: data/honesty/hardening-pins.json")
