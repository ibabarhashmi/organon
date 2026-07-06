/**
 * ORGΛNON STUDIO — the CLAIM-VS-EVIDENCE SCANNER (Transplant Phase 2; Rule C-TENSE, automated). V6's C-TENSE ("every
 * claim at its true tense") was human-enforced; batteries blessed the boundary while W1-04 lived, so prose can be
 * blessed the same way. This scanner FLAGS candidates — present-tense assertions of a PROVEN state (green, passes,
 * byte-identical, survives, TICKING, refuses, converged …) — and pairs each with an evidence marker in its vicinity (a
 * sha, a `path/to/file`, a `test/…` reference, a numeric NNN/0 battery count). An unpaired claim is a CANDIDATE, not a
 * verdict: the human-readable table is still produced and red-teamed under the walk's doc-lies theme (A′#8). The
 * scanner is NOT a rubber stamp — its own misses are S2 findings; its POSITIVE CONTROL (a seeded overclaim it must
 * catch) keeps "clean" a tested claim.
 */
export namespace Tense {
  // present-tense assertions of a proven state — the tokens a claim uses when it says something IS true NOW.
  const CLAIM = /\b(is byte-identical|byte-identical|are byte-identical|passes|passed|green|survives|survived|refuses|refused|converged|ticking|proven|proves|holds|intact|verified|un-?reintroducible|deflates|remembers|reproduces)\b/i
  // evidence markers: CONCRETE references only (a sha-ish hex, a file/test/data path, a `.test.ts` cite, a battery
  // count NNN/0, a MANIFEST cite). Deliberately NOT prose words like "wall"/"evidence" — those let a bare claim mention
  // an evidence-shaped word and self-bless (the positive control caught exactly that during development).
  const EVIDENCE = /([0-9a-f]{8,}|[0-9a-f]{6,}…|\d+\s*(pass|\/\s*0\b)|test\/[\w./-]+|data\/[\w./-]+|\.test\.ts|MANIFEST\.json|script\/[\w./-]+|\$?[0-9a-f]{12}…)/i
  // hedges that make a claim honestly NON-present-tense (pending / would / parked / not yet) — never flagged.
  const HEDGE = /\b(pending|would|parked|not yet|absent|PENDING|TODO|planned|expected|will|blocked|honest blocker|STOP|null)\b/i

  export interface Claim { line: number; text: string; evidenced: boolean; hedged: boolean; flagged: boolean }

  // Scan a document into per-line claims. A line is FLAGGED iff it makes a present-tense proven-state claim AND has no
  // evidence marker AND is not hedged — the candidate a human must reconcile.
  export function scan(text: string): Claim[] {
    const out: Claim[] = []
    const lines = text.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!CLAIM.test(line)) continue
      const evidenced = EVIDENCE.test(line)
      const hedged = HEDGE.test(line)
      out.push({ line: i + 1, text: line.trim().slice(0, 200), evidenced, hedged, flagged: !evidenced && !hedged })
    }
    return out
  }

  export interface Report { doc: string; total: number; evidenced: number; hedged: number; flagged: Claim[] }
  export function report(doc: string, text: string): Report {
    const claims = scan(text)
    return { doc, total: claims.length, evidenced: claims.filter((c) => c.evidenced).length, hedged: claims.filter((c) => c.hedged && !c.evidenced).length, flagged: claims.filter((c) => c.flagged) }
  }

  // the human-readable table (still produced — the scanner assists, it does not replace the reckoning; A′#8).
  export function renderTable(reports: Report[]): string {
    const lines = ["claim-vs-evidence table (C-TENSE, scanner-assisted):", "  doc | claims | evidenced | hedged | FLAGGED (unpaired present-tense)"]
    for (const r of reports) lines.push(`  ${r.doc}: ${r.total} | ${r.evidenced} | ${r.hedged} | ${r.flagged.length}`)
    return lines.join("\n")
  }
}
