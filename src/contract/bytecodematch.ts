/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT (X-GROUNDTRUTH a). THE PINNED BYTECODE-MASK RULE + the compiled-vs-deployed MATCH — a
 * PURE, deterministic predicate, NO network, NO deps (the forge build + the eth_getCode live in script/capture/impl-build.ts;
 * this module is the logic the S61 wall tests hermetically). "Match" is deterministic ONLY under a pinned mask: two byte
 * regions are compiler-nondeterministic / deploy-context and are zeroed on BOTH sides before the compare —
 *   (1) IMMUTABLE-REFERENCES — solc immutable() values patched into the runtime at construction (addresses/amounts known
 *       only at deploy); the compiled artifact's `immutableReferences` map gives the exact byte offsets+lengths.
 *   (2) CBOR METADATA TAIL — the trailing solc metadata (the source-hash + solc version); the last 2 bytes declare the CBOR
 *       length, so the tail is the last (declared + 2) bytes.
 * The mask is DATA (offsets/lengths from the artifact + the CBOR length declaration), NEVER a logic waiver — masking anything
 * beyond these two declared regions is a Halt (S61). A full (unmasked) byte-identity is the STRONGEST match and recorded as
 * such. A MATCH admits the source to the screen; a MISMATCH → the subject stays UNVERIFIED (analyzing source the chain
 * doesn't run is a fabrication with extra steps).
 */
import { createHash } from "node:crypto"

export namespace BytecodeMatch {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  const clean = (h: string): string => (h ?? "").replace(/^0x/i, "").toLowerCase()

  // the compiled artifact's immutableReferences shape: { "<astId>": [{ start, length }] } — start/length in BYTES.
  export interface ImmutableRefs {
    [astId: string]: { start: number; length: number }[]
  }

  // the CBOR metadata tail length in BYTES (the trailing solc metadata + its 2-byte length field), or 0 when absent/degenerate.
  // The last 2 bytes (4 hex chars) declare, big-endian, the CBOR metadata length that precedes them → tail = declared + 2.
  export function cborTailBytes(hex: string): number {
    const h = clean(hex)
    if (h.length < 4) return 0
    const declared = parseInt(h.slice(-4), 16)
    if (!Number.isFinite(declared) || declared <= 0) return 0
    const totalBytes = declared + 2
    return totalBytes * 2 <= h.length ? totalBytes : 0 // never mask past the whole bytecode
  }

  // mask (zero) the immutable-reference regions + the CBOR metadata tail in a runtime bytecode hex. The immutableReferences
  // come from the COMPILED artifact and apply to BOTH sides (same solc → same offsets); each side's own CBOR tail is masked.
  export function maskRuntime(hex: string, imm: ImmutableRefs): { masked: string; cborBytes: number; immRegions: number } {
    const arr = clean(hex).split("")
    let immRegions = 0
    for (const refs of Object.values(imm ?? {}))
      for (const r of refs ?? []) {
        for (let i = r.start * 2; i < (r.start + r.length) * 2 && i < arr.length; i++) if (i >= 0) arr[i] = "0"
        immRegions++
      }
    const cb = cborTailBytes(arr.join(""))
    for (let i = arr.length - cb * 2; i < arr.length; i++) if (i >= 0) arr[i] = "0"
    return { masked: arr.join(""), cborBytes: cb, immRegions }
  }

  export interface MatchResult {
    match: boolean // the masked runtime-logic bytes are identical — the deterministic predicate that admits the source
    unmaskedMatch: boolean // STRONGEST: byte-identical even before masking (no metadata/immutable difference at all)
    sameLength: boolean
    maskedCompiledSha: string
    maskedDeployedSha: string
    cborBytes: number
    immRegions: number
    note: string
  }

  // compare a locally-compiled runtime bytecode to the on-chain deployed bytecode under the pinned mask rule.
  export function bytecodeMatches(compiledHex: string, deployedHex: string, imm: ImmutableRefs): MatchResult {
    const c = clean(compiledHex)
    const d = clean(deployedHex)
    const sameLength = c.length === d.length && c.length > 0
    const unmaskedMatch = sameLength && c === d
    const mc = maskRuntime(c, imm)
    const md = maskRuntime(d, imm)
    const match = sameLength && mc.masked === md.masked
    const note = !sameLength
      ? `length differs (${c.length / 2} vs ${d.length / 2} bytes) — MISMATCH (different code)`
      : unmaskedMatch
        ? "byte-identical — the STRONGEST match (no metadata/immutable difference)"
        : match
          ? "runtime-logic MATCH — immutable-references + CBOR metadata tail masked (metadata/immutables differ, logic identical)"
          : "MISMATCH — the runtime-logic bytes differ after masking; the source does not match the chain (STAYS UNVERIFIED)"
    return { match, unmaskedMatch, sameLength, maskedCompiledSha: sha256(mc.masked), maskedDeployedSha: sha256(md.masked), cborBytes: mc.cborBytes, immRegions: mc.immRegions, note }
  }
}
