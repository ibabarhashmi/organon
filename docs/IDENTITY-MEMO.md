# IDENTITY MEMO — which "Organon" is this, and how may it be published?

_Warranty sprint (v8), Phase 2 · Rule F-IDENTITY (advertised scope == actual scope) · reviewed park-legitimacy-style._

## The problem (the transplant's second discovery)

Three identities answer to "Organon":

1. **The full monorepo** (`/Users/babar/Projects/organon/packages/solidity-sentinel`) — the whole system: verdict core **plus** the real-data marketdata/risk/universe PIT backtest engine, plus the RWA-verdict generator, plus the FRED-gated pinned data snapshot.
2. **The monorepo's public repo** (`github.com/ibabarhashmi/organon.git`) — advertises the full engine (README + product logo). Scope = the monorepo's.
3. **This slim standalone** (`github.com/ibabarhashmi/organon-terminal.git`, branch `v0`) — the verdict-issuing **brain**, transplanted byte-first. The engine **body** stayed behind (P1-1). It **cannot** re-execute real data (own-data RWA caps at `V0/CANNOT-VERIFY-DATA`), and it **cannot** regenerate the pinned RWA verdict (the generator + data live in the monorepo).

The V7 capability floor "passed" partly because engine capabilities were never *in* it — a silent scope shrink. F-IDENTITY forbids that going forward: whatever we publish, **advertised scope must equal actual scope.**

## The three options, costed

| Option | What it means | Cost / risk | Verdict |
|---|---|---|---|
| **(a) data-plane-first** | Port the marketdata/risk/universe engine + a PIT adapter into the standalone *before* publishing, so "standalone" carries the full engine | Architectural — the engine imports the OpenCode storage/schema tangle + sibling workspace packages + needs FRED-gated data; a clean port is its **own sprint** (P1-1). Blocks publication for a long time; drags the editor's guts into a "standalone" repo. | **Rejected** as the publication path (A′#10). It is the right *eventual* work, owned by the data-plane sprint — not a gate on saying what this repo already honestly is. |
| **(b) publish-slim-honest** | Publish the standalone as exactly what it is — the slim verdict brain — under an honest README + a rendered **capability matrix** naming every absence; the engine is advertised **absent-by-park**, not implied present | Low. Requires the matrix rendered + true (done this phase) and the publication gate wired (done). The actual push still waits on the Operator (consent) — nothing is published by this decision. | **CHOSEN.** Advertised == actual, immediately and truthfully. Scope is the moat: a small honest repo beats a big dishonest one. |
| **(c) hold** | Publish nothing until the data-plane is ported (option a completed) | Indefinite hold; the honest slim product — which is genuinely useful and genuinely honest — sits unpublished for no integrity reason. | **Rejected.** There is no honesty reason to hold once advertised == actual; holding would be caution theater. |

## Decision

**(b) publish-slim-honest.** Implemented this phase: the **capability matrix** is rendered in the `README.md` (between the `CAPABILITY-MATRIX` markers) and on the **Trust Panel** (screen 7), listing what this repository can do and what it deliberately cannot, each absence linked to its four-field park; `Matrix.verifyAgainstReality()` is green and the doc-lies walk theme checks it every rotation. The **publication gate** (`src/studio/publication.ts`) refuses any publish until (1) the matrix is rendered + true (the identity gate — the memo's winner "implemented") **and** (2) the Operator consents (the consent gate, L-2P). 

**What this decision does NOT do:** it does not publish anything. Publication remains **Operator-gated** (consent) on top of **identity-gated** (this matrix). The agent cannot self-consent. Naming/rebranding beyond the honest README is parked for the publication sprint (A′#11) — the standalone's public name (`organon-terminal`) already reads as distinct from the monorepo.

## Owner lane

- **Publication** — identity gate: **DONE** (matrix rendered + true, gate wired). Consent gate: **PENDING the Operator.**
- **The data-plane port** (option a, eventual) — owned by the data-plane follow-up sprint (P1-1), with its own fresh-clone battery + a re-execution wall.

---

## ADDENDUM — Data-Plane sprint (v9): the scope GREW, so "slim" is retired where it stopped being true (F-IDENTITY, growth direction)

_Appended (not edited) — the memo above stood at V8; this addendum records the truth as it changed. F-IDENTITY holds in the growth direction too: advertised == actual must be re-established every time the actual grows._

**What changed.** The V8 decision was **publish-slim-honest** because the engine body had stayed behind. The Data-Plane sprint brought **part of the body home** — the credential-free **lending** domain, standalone-native and **oracle-proven**:

- a standalone-native **PIT store** that captures real DefiLlama lending data (hash-chained, nonce-anchored; cannot fabricate or retro-capture);
- the **lending backtest engine** re-homed behind the existing seams, proven **byte-identical to the frozen monorepo oracle** on a hash-pinned shared fixture (the differential — the judge that cannot flatter the port);
- a **REAL-PIT** live path: a real captured lending spec → the ported engine → an adjudication whose returns are REAL-PIT with **traceable snapshot provenance**, the verdict the core's, relayed verbatim (a real NO-GO is the product working).

**So "slim" is now only partly true, and the matrix says exactly which part.** The capability matrix (re-rendered from code, byte-match re-locked) grew from **11 PRESENT / 4 ABSENT** to **14 PRESENT / 3 ABSENT**. The three remaining absences are named per-domain: the **RWA** engine + verdict regeneration (BLOCKED-on-credential — FRED unset, the two-way door open), and the **funding / fee-yield** engine paths (P1-1, their unblocks named). The matrix tells the per-domain truth — lending PRESENT, the rest ABSENT-by-park.

**The decision is unchanged in kind, updated in scope.** Still **publish-slim-honest** — but "slim" now means *"the verdict brain plus the oracle-proven lending data-plane; RWA/funding/fee-yield engines absent-by-park; RWA BLOCKED-on-credential."* 

**Publication re-ratification (the Operator's, F-IDENTITY growth direction).** The consent the Operator gives is consent to the **NEW** matrix, not the old one. The publication gate re-reads the matrix live, so it is already armed against the grown truth (identity gate SATISFIED on the new matrix, byte-match re-locked; consent gate PENDING). **Any prior consent to the V8 slim matrix does not carry** — the Operator re-ratifies against this addendum's matrix.

## Owner lane (updated)

- **Publication** — identity gate: **DONE on the NEW matrix** (14 PRESENT / 3 ABSENT, byte-match re-locked). Consent gate: **PENDING the Operator — re-ratification against the new matrix (not the V8 one).**
- **The remaining data-plane port** (RWA/funding/fee-yield engines) — owned by the data-plane follow-up sprint (P1-1, partially closed), each per-domain against the oracle.

---

## ADDENDUM — End-User sprint (v10, 2026-07-05): the identity grew again, and the door opened

The truth grew a fourth time; the identity is re-told exactly as fast (F-IDENTITY, growth direction). Since the V9 addendum:

- **The transform's asterisk is retired at the letter.** V9's "oracle-judged" was true of the engine, not the transform. V10 ran the ORIGINAL monorepo transform in a sandbox against the standalone rewrite on identical pinned snapshots → **MATCH**. "Oracle-judged" is now true of the port (`transform-differential-proven`).
- **Funding is DELIVERED** via credential-free freepit T1 (Binance immutable dumps, checksum-verified), differential-proven against the monorepo's exact transform + the byte-identical sidecar (`funding-port-differential`). **Fee-yield BLOCKED-with-evidence** (the Py3.11/pandas env runs the panel end-to-end; the capture pipeline is un-transplanted — data, not env). **RWA still BLOCKED-on-credential; the pin unchanged.**
- **The door opened.** The **Goal Console** (screen 8, amended once and closed again) + **the joined loop**: a plain-English goal → the free-model agent path → a REAL-PIT verdict with provenance → the report — the marquee, recorded end-to-end, the verdict relayed verbatim, the model unable to bless (`goal-console-8th-screen`, `joined-loop-realpit`).

**The matrix now: 18 PRESENT / 3 ABSENT** (was 14/3 at V9 end). **Publication re-ratification is against THIS matrix** — any prior consent (V8 or V9) does NOT carry. The publication gate re-reads the matrix live (identity gate SATISFIED on the new matrix, byte-match re-locked; consent gate PENDING the Operator). The remaining absences (RWA + fee-yield engines) are parked (P1-1/P0-1), each with a named unblock. **Zero powered verdicts — now refusable through a text box by anyone.**
