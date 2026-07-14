/**
 * ORGΛNON — THE SUBSTANCE SPRINT (V38), Phase 3: Prose.check — PROSE MAY NAME A PRODUCER; IT MAY NEVER RESTATE A VALUE
 * (S126, MR16, H-9).
 *
 * X-DERIVE(b) says every claim has a producer. A NUMBER IN PROSE is a claim, and it has no producer. V37's phase prose
 * contained two numbers that contradicted the generated header (a "1625 + 42 = 1667" that did not match the computed 1668;
 * a FILE-count Δ reported as a test Δ). This is not a new law — it is X-DERIVE(b) under-applied to the build log's own prose.
 *
 * THE RULE, STATED POSITIVELY (attack #7): a claim line MAY NAME a producer (the value is then the producer's, computed,
 * single-sourced); it may NEVER RESTATE a producer's numeric value inline. The only bare numbers a claim line may carry are
 * STRUCTURAL — not producer-claims: dates (YYYY-MM-DD), wall ids (S116), sprint tags (V38), deviation/decision ids (D53,
 * DD-33, RP-1, A7), short hashes, the pinned law count, ordinary method numbers (0.02, 0.5, 180, 200, 8, 16). The wall greps
 * the generated build log's claim lines for a digit-run that DUPLICATES a producer's current value without naming a producer;
 * a match FAILS. Spelled-out numbers are covered by the same rule (the value is the claim, spelled or not).
 */
export namespace Prose {
  // structural tokens that are NOT producer-claims — a bare number in one of these shapes is allowed inline.
  const STRUCTURAL: RegExp[] = [
    /\b\d{4}-\d{2}-\d{2}\b/g, // an ISO date
    /\bS\d{1,3}\b/g, // a wall id (S116)
    /\bV\d{1,2}\b/g, // a sprint tag (V38)
    /\bD\d{1,3}\b/g, // a deviation id (D53)
    /\bDD-?\d{1,2}\b/g, // a delegated decision (DD-33)
    /\bRP-?\d\b/g, // a re-pin (RP-1)
    /\bA\d{1,2}\b/g, // an attack id (A7)
    /\b[0-9a-f]{7,}\b/g, // a short hash / sha prefix
    /\bG-?\d\b/g, // a V37 gate id (G-1)
  ]
  // a line NAMES a producer when it references the producer vocabulary — the value is then single-sourced (computed), not restated.
  const NAMES_PRODUCER = /\bproducer\b|Claim\.|\bgenerated\b|\bcomputed\b|Rollup|the marker|\bderived\b/i

  // does a claim line RESTATE a producer's value? Strip the structural tokens, then look for a producer number as a
  // standalone token. If the line names a producer, it is exempt (the value is the producer's). Returns the offending value.
  export function restatesValue(line: string, producerNumbers: number[]): { restated: boolean; value: number | null } {
    if (NAMES_PRODUCER.test(line)) return { restated: false, value: null }
    let stripped = line
    for (const re of STRUCTURAL) stripped = stripped.replace(re, " ")
    for (const n of producerNumbers) {
      // a standalone occurrence of the value (not part of a longer number, allowing thousands separators/commas removed)
      const flat = stripped.replace(/,/g, "")
      if (new RegExp(`(?<![\\d.])${n}(?![\\d.])`).test(flat)) return { restated: true, value: n }
    }
    return { restated: false, value: null }
  }

  // check a whole build-log body: every claim line either names a producer or restates no producer value. Returns violations.
  export function check(text: string, producerNumbers: number[]): { ok: boolean; violations: { line: string; value: number }[] } {
    const violations: { line: string; value: number }[] = []
    for (const raw of text.split("\n")) {
      const line = raw.trim()
      if (!line) continue
      const r = restatesValue(line, producerNumbers)
      if (r.restated && r.value !== null) violations.push({ line, value: r.value })
    }
    return { ok: violations.length === 0, violations }
  }
}
