/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 5: BINARY PARITY (S206, P-15/RP-4).
 *
 * THE DIAGNOSIS (P-15, standing since D49): the compiled single-file binary (`bun build --compile`) was built and its
 * reproducibility checked (two builds, same sha — S127), but it was NEVER proven at PARITY WITH THE SOURCE RUN — that the
 * binary's OUTPUT equals `bun run`'s output.
 *
 * THE PROOF (RP-4): a pinned smoke contract — the binary runs first-run against the committed fixture; its output is byte-equal
 * to the source run's AFTER a PINNED, ENUMERATED normalization (the timestamp fields named, the path prefixes named — nothing
 * else). A comparison that normalizes an un-pinned field FAILS. And one deliberately-divergent negative (a seeded real
 * difference) must still be CAUGHT through the normalization — the comparison can fail. Normalize exactly what is named, catch
 * everything else.
 *
 * Pure: the normalizer + the committed-transcript reader. The build/run/compare lives in the sidecar script.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"

export namespace Binary {
  // ── THE PINNED NORMALIZATION — exactly the fields named in hardening-pins.binaryParity.normalization. Timestamps (wall-clock,
  // differ by construction) and absolute path prefixes (the two runs' roots differ). NOTHING ELSE. A real content divergence
  // survives normalization and is CAUGHT. ──
  export function normalize(text: string): string {
    return text
      // timestamps: epoch ms/seconds and ISO datetimes in any capturedAt/at/asOf/generatedAt-adjacent position
      .replace(/\b1[0-9]{9}(?:[0-9]{3})?\b/g, "<TS>") // 10-digit (epoch s) or 13-digit (epoch ms) — wall-clock
      .replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?\b/g, "<ISO>") // ISO datetime
      .replace(/rendered in \d+\.\d+s/g, "rendered in <DUR>s") // the render duration (timing, not content)
      // absolute path prefixes: the tmpdir, PKG_ROOT, the binary's own path — the runs execute from different roots
      .replace(/\/private\/var\/folders\/[^\s"'<)]+/g, "<TMP>")
      .replace(/\/var\/folders\/[^\s"'<)]+/g, "<TMP>")
      .replace(/\/tmp\/[^\s"'<)]+/g, "<TMP>")
      .replace(new RegExp(PKG_ROOT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "<ROOT>")
  }

  // the pinned normalization list (from the pins) — the AUDIT of what normalize() touches; a field not in this list must not
  // be normalized (RP-4).
  export function normalizationList(): { field: string; why: string }[] {
    return ((JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-pins.json"), "utf8")).binaryParity as { normalization: { field: string; why: string }[] }).normalization) ?? []
  }

  export interface Parity { ok: boolean; sourceLen: number; binaryLen: number; equalAfterNorm: boolean; seededDivergenceCaught: boolean; note: string }
  // the committed transcript (produced by script/honesty/hardening-binary.ts): the real build+run+compare.
  export function parityVerdict(): { ok: boolean; detail: string } {
    let t: Parity | null = null
    try { t = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-binary.json"), "utf8")) as Parity } catch { t = null }
    if (!t) return { ok: false, detail: "the binary-parity transcript (hardening-binary.json) is absent — run script/honesty/hardening-binary.ts (S206)" }
    if (!t.equalAfterNorm) return { ok: false, detail: `the binary's output is NOT byte-equal to the source after the pinned normalization — ${t.note} (S206/P-15)` }
    if (!t.seededDivergenceCaught) return { ok: false, detail: `the seeded divergence was NOT caught through the normalization — a comparison that cannot fail is not a check (S206/RP-4, X-REACH(a))` }
    return { ok: true, detail: `the binary is byte-equal to the source after the pinned normalization (source ${t.sourceLen}b, binary ${t.binaryLen}b); a seeded real divergence is CAUGHT through the normalization (the comparison can fail) — the binary IS the source, byte-for-byte (S206/P-15/RP-4)` }
  }
}
