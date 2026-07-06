/**
 * ORGΛNON — the CAPABILITY MATRIX (Warranty Phase 2; Rule F-IDENTITY). Advertised scope MUST equal actual scope. Three
 * identities answer to "Organon" — the full monorepo, the public repo that advertises the full engine, and THIS slim
 * standalone that cannot re-execute real data. This matrix says, on one surface (README + Trust Panel), exactly what
 * this repository CAN do and what it deliberately CANNOT — every absence linked to its four-field park. The doc-lies
 * walk theme checks the matrix against reality every rotation; a PRESENT row whose proving capability is gone, or an
 * ABSENT row whose thing is actually present, is an S2 mismatch.
 */
import { existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Inventory } from "./inventory"

export namespace Matrix {
  // PRESENT product capabilities — each mapped to a proven inventory capability (so a matrix claim is never free-floating:
  // if its proving capability leaves the floor, verifyAgainstReality catches the overclaim). Curated product-level view.
  export interface Present { capability: string; provedBy: string } // provedBy = an Inventory.CAPABILITIES id
  export const PRESENT: Present[] = [
    { capability: "Register a strategy proposal as a trial in an append-only, hash-chained ledger", provedBy: "ledger-core-hashchain" },
    { capability: "Adjudicate a submitted spec (caller-supplied returns) to an honest verdict — never a GO unless earned", provedBy: "tier-caps-earned" },
    { capability: "Family-size deflation of the DSR bar — iterating makes acceptance HARDER (anti-PBO)", provedBy: "family-deflation-anti-pbo" },
    { capability: "The frozen verdict core (6 .py + loop.ts), byte-identical to its monorepo origin", provedBy: "frozen-core-byte-identity" },
    { capability: "Serve the verdict byte-identically across direct call, HTTP, and MCP (thin transport)", provedBy: "determinism-at-surfaces" },
    { capability: "A durable ledger that survives process death (write-then-invoke, restart remembers)", provedBy: "durable-write-then-invoke" },
    { capability: "Served submissions persist and survive a restart (first contact preservable)", provedBy: "served-persistence-survival" },
    { capability: "Forward clocks that RESTART never reconstruct; a discontinuity is rendered, never smoothed", provedBy: "clocks-restart-not-reconstruct" },
    { capability: "Refuse a malformed/hostile spec BEFORE registration (rejection boundary, ledger count unchanged)", provedBy: "rejection-boundary-refusal" },
    { capability: "No signing/settlement primitive anywhere; nothing signs, nothing paid, nothing closed", provedBy: "no-signing-surface" },
    { capability: "Zero powered verdicts — a fixture-only battery; no live/paid inference in the verdict path", provedBy: "ci-fixture-only" },
    // ── Data-Plane sprint (v9): the identity GREW — "slim" retired where the body came home (F-IDENTITY, growth direction) ──
    { capability: "Capture real credential-free market data (DefiLlama lending) into a standalone-native PIT store, hash-chained + nonce-anchored (cannot fabricate or retro-capture)", provedBy: "pit-store-no-fabrication" },
    { capability: "Run the real-data LENDING backtest, byte-equivalent to the frozen monorepo oracle (differential-proven, direction-blind)", provedBy: "engine-port-differential" },
    { capability: "Produce REAL-PIT returns with traceable snapshot provenance (not ILLUSTRATIVE) — a REAL-PIT NO-GO on real data is the product working", provedBy: "real-returns-realpit" },
    // ── End-User sprint (v10): the transform's asterisk retired + the funding domain delivered ──
    { capability: "The rewritten TS transform proven byte-identical to its ORIGINAL monorepo transform in a sandbox (the D-DIFF asterisk retired at the letter — 'oracle-judged' true of the port)", provedBy: "transform-differential-proven" },
    { capability: "Run the real-data FUNDING backtest via credential-free freepit T1 (Binance immutable dumps, checksum-verified), byte-equivalent to the frozen monorepo transform + sidecar (differential-proven)", provedBy: "funding-port-differential" },
    { capability: "The GOAL CONSOLE — one interactive screen where a non-expert types a plain-English goal and receives an honest verdict card + plain-language report (display-only, write-then-invoke, honest failure states)", provedBy: "goal-console-8th-screen" },
    { capability: "The JOINED LOOP — a plain-English goal → the free-model agent path → a REAL-PIT verdict with traceable provenance → the report, the verdict relayed verbatim (the model cannot bless; a NO-GO on real data is the product working)", provedBy: "joined-loop-realpit" },
    // ── Spine sprint (v11): research ratified as values; refusals legible + dated; overfitting measured twice; complexity priced; the first cross-venue domain ──
    { capability: "Research enters ONLY by ratification with pre-registered flip-criteria — an adoption-as-prose, a park without its designed experiment, or an unratified build artifact is refused (research-worship made structurally impossible)", provedBy: "research-ratification-law" },
    { capability: "Refusals that EXPLAIN themselves (the Fundamental-Law breadth panel — why not yet) and DATE themselves (a derived, hedged ETA range — when, honestly), advisory beside the verdict, deriving nothing, moving no verdict", provedBy: "breadth-panel-hedged-eta" },
    { capability: "Overfitting measured a SECOND independent way — CPCV (PBO + OOS-Sharpe) advisory beside the frozen gates, golden-proven both directions, disagreements rendered as information, promotion parked (an advisory that cannot become a lever)", provedBy: "cpcv-advisory-panel" },
    { capability: "Complexity that pays its own bill — the EXPERIMENTAL VoC proposer charged its effective degrees of freedom behind a noise wall with a live kill-switch, every exploration charged, the proposer touching specs never verdicts", provedBy: "voc-proposer-dof-priced" },
    { capability: "The first CROSS-VENUE domain at its true tier — the CeFi-DeFi funding basis tiered at MIN(legs) (Binance T1 vs Hyperliquid T2-forward), fixture-proven, retro-history refused, DELIVERED under the ATTEMPT law", provedBy: "funding-basis-min-tier" },
    // ── Reachability sprint (v12): existence defined as reachability; the third door; the debts filed; the experiments answered ──
    { capability: "REACHABILITY AS LAW — every user-facing capability is proven reachable by a console-path traversal (fresh serve → real interaction → rendered result → a failure state); a census with a seeded catch; the gatekeeper refuses module-only evidence on a user-facing criterion (U-SURFACE)", provedBy: "reachability-surface-law" },
    { capability: "The GUIDED BUILDER — a third door: compose the spec yourself, field by field, over the existing primitives, with conservative honest defaults and declared lineage — born reachable (its gate passes only on a user's traversal)", provedBy: "guided-builder-reachable" },
    { capability: "The park protocol's full circle — two long-parked questions ANSWERED under criteria hash-checked unchanged, outcomes derived not asserted, each disposing its park (the ensemble legitimate-with-adjustment; the shared-ledger incoherent, parked)", provedBy: "experiments-answered" },
    { capability: "Walls at their own written depth — the noise battery swept across penalties, venues at a formalized capture floor, and fresh-clone proofs pristine forever (no inherited environmental luck)", provedBy: "capture-floor-pristine" },
    { capability: "Summary numbers machine-derived from their artifacts (a hand-typed figure that disagrees is caught) + a ratification table that receives its own changes of mind (append-only supersessions)", provedBy: "summary-differential" },
    // ── Ensemble sprint (v13): the reachability law completed on both halves; the builder made whole to three domains ──
    { capability: "The reachability law COMPLETE on both halves — a pinned user-facing lexicon auto-flags user-facing criteria (the executor's discretion made auditable, never silent), the census runs at every checkpoint over the capability diff (a built-but-unreached capability is caught the checkpoint it appears — the W7-01 class extinct by construction) + a one-time FULL re-census over the whole matrix and every screen", provedBy: "reachability-law-complete" },
    { capability: "Compose a FUNDING strategy yourself in the Guided Builder (venue · interval · side) over the delivered funding primitives — conservative honest defaults, an invalid interval refused before registration, the verdict the frozen core's — born reachable (its gate passes only on a user's console-path traversal)", provedBy: "builder-funding-domain" },
    { capability: "Compose a cross-venue BASIS strategy in the Guided Builder with the weakest-leg tier MIN(legs) and EXPERIMENTAL shown INLINE before you compose (a basis is only as strong as its weakest leg — you see that up front), a mismatched-venue pair refused — the scope law's cure, cleaner than the narrowing it cured", provedBy: "builder-basis-domain" },
    { capability: "Pool a portfolio of adjudicated strategies (screen 10) where the pool is a registered trial charged the UNION's correlation-adjusted K_eff — not the raw count: it ratchets on every member swap, recomputes K_eff as time accrues, carries a mandatory stress caveat, dies by kill-switch if pooled noise ever survives it, refuses recursion, and renders 'adds nothing' when its members are near-duplicates — the only way to look diversified is to be diversified", provedBy: "pool-composer-union-charge" },
    { capability: "Read the DEFLATION BASIS on every verdict, leaderboard row, and pool report — the n it was deflated against, the scoping, and a neutral comparability note — so even a weakly-tested bar is legible down to the n it was tested against (display-only; it states, it never judges)", provedBy: "deflation-basis-legible" },
    { capability: "The whole system walked as a stranger would meet it, through all doors incl. the pool composer — the walk that shipped pooling aimed its own laundering theme at the pool hardest and converged (CONVERGED-7) only when its worst enemy found nothing twice; the one finding it did surface (the swap ratchet not reachable through the door) was root-caused, fixed, and re-tested", provedBy: "walk-v8-catalog-converged" },
    // ── EXPLANATION (v14) — the pick priced, parity real, every refusal bilingual, one command to the door ──
    { capability: "Every verdict, failure, and kill-switch explains itself in BOTH languages — plain and quantitative — from one machine-derived fact table the two renderings cannot disagree about, with an AI paraphrase allowed only as far as a groundedness verifier can follow (it may phrase, never reason; reject wholesale on any unmatched number or claim)", provedBy: "why-panel-dual-register" },
    { capability: "One honest command from a cold clone to the web door — ./organon.sh checks prerequisites (never installs), verifies, and opens the door ONLY when the house is provably in order (else it says exactly which requirement is unmet — no dead button, no launch over red)", provedBy: "runner-one-command" },
    { capability: "The pool's member SELECTION is priced — choosing K strategies of M candidates is search, and the ledger now counts it (a selection surcharge derived by pre-registered experiment, not by vibe); a pool can no longer look strong by cherry-picking its members", provedBy: "selection-door-priced" },
    { capability: "The Guided Builder's FUNDING door adjudicates REAL captured T1 funding data (Binance freepit) with traceable provenance — REAL-PIT where the data exists, ILLUSTRATIVE where it genuinely does not, never a mislabeled REAL-PIT and never a quietly-upgraded tier", provedBy: "funding-realpit-parity" },
    { capability: "The identity truth is printed where users read the bar: author identity is self-declared and not verified (the family-ratchet is per declared author, the rate limiter per connection) — the exposure stated plainly, never reassured away", provedBy: "identity-provenance-note" },
    { capability: "The whole system walked as a stranger would meet it, BOOTSTRAPPED THROUGH THE RUNNER, across every door — and a novice, given only the plain WHY of a refusal, can say back in one correct sentence why it failed (CONVERGED-8, the WHY panel reachable through every served door)", provedBy: "walk-v9-catalog-converged" },
  ]

  export interface Row { capability: string; status: "PRESENT" | "ABSENT"; detail: string; link: string }
  export function rows(): Row[] {
    const out: Row[] = PRESENT.map((p) => ({ capability: p.capability, status: "PRESENT" as const, detail: `proven: ${p.provedBy}`, link: p.provedBy }))
    for (const a of Inventory.ABSENCES) out.push({ capability: a.description.split(" — ")[0], status: "ABSENT", detail: a.description, link: `park ${a.park} · ${a.ownerSprint}` })
    return out
  }

  // matrix-vs-reality (the doc-lies check): every PRESENT row's proving capability must still be on the floor with its
  // test present; every ABSENT row's absence must be genuinely absent + parked. Returns the mismatches (S2 candidates).
  export function verifyAgainstReality(): { ok: boolean; mismatches: string[] } {
    const mismatches: string[] = []
    const capIds = new Set(Inventory.CAPABILITIES.map((c) => c.id))
    for (const p of PRESENT) {
      if (!capIds.has(p.provedBy)) { mismatches.push(`PRESENT overclaim: "${p.capability}" claims proof by "${p.provedBy}" — not on the floor`); continue }
      const cap = Inventory.CAPABILITIES.find((c) => c.id === p.provedBy)!
      for (const t of cap.provingTests) if (!existsSync(path.join(PKG_ROOT, t))) mismatches.push(`PRESENT overclaim: "${p.provedBy}" proving test ${t} is MISSING`)
    }
    // absences must be genuinely absent + parked (reuse the inventory's own park check + a filesystem spot-check)
    const abs = Inventory.verifyAbsences()
    for (const o of abs.open) mismatches.push(`ABSENT unparked: ${o.absence} — ${o.reason}`)
    // spot-check the two structural absences are really absent on disk (advertised-absent == actually-absent)
    if (existsSync(path.join(PKG_ROOT, "src", "marketdata"))) mismatches.push(`ABSENT contradiction: src/marketdata EXISTS but "engine-backtest" is advertised absent`)
    if (existsSync(path.join(PKG_ROOT, "data", "snapshot"))) mismatches.push(`ABSENT contradiction: data/snapshot EXISTS but the RWA data-plane is advertised absent`)
    return { ok: mismatches.length === 0, mismatches }
  }

  // Markdown table for the README (between the CAPABILITY-MATRIX markers). Advertised == actual.
  export function renderMarkdown(): string {
    const lines: string[] = []
    lines.push("| Capability | Status | Detail |")
    lines.push("|---|---|---|")
    for (const r of rows()) lines.push(`| ${r.capability} | ${r.status === "PRESENT" ? "✅ PRESENT" : "❌ ABSENT"} | ${r.status === "ABSENT" ? `${r.detail} (${r.link})` : "proven-by-battery"} |`)
    return lines.join("\n")
  }

  // Compact form for the Trust Panel (screen 7).
  export function renderPanel(): string {
    const present = PRESENT.length
    const absent = Inventory.ABSENCES.map((a) => `${a.id}→${a.park}`)
    return [`  capability matrix: ${present} advertised PRESENT · ${absent.length} deliberate ABSENT`, `    absent: ${absent.join(", ")}`].join("\n")
  }
}
