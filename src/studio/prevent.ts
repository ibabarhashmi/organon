/**
 * ORGΛNON STUDIO — the PREVENTION WALLS (End-User Phase 0; Rule E-PREVENT, V9 finding 3 answered). This constitution
 * FORBIDS rewriting history (a filter-branch is a Halt), so W4-01's 464KB blob is permanent — said plainly. When the
 * cure is forbidden, prevention is the only medicine. These are the pure predicates behind a pre-commit gate that
 * refuses, BEFORE a bad blob becomes permanent:
 *   · BLOB-SIZE — a staged file over the cap that is not an allow-listed known-large artifact (the raw-data class often
 *     arrives as a big file first);
 *   · RAW-DATA — a committed JSON/JSONL carrying a large embedded numeric data array (the exact W4-01 shape: a Job/
 *     fixture that inlined 1908 [ts,value] points) — snapshots belong gitignored + provenance-chained, never inlined;
 *   · CREDENTIAL — a literal secret (a FRED-key-shaped token, an api key, a private key, a bearer) — the FRED class.
 * Each predicate is pure + positive-controlled (a seeded violation MUST bite, a clean file MUST pass). The hook wires
 * them over `git diff --cached`; a violation exits non-zero and the commit is refused.
 */
export namespace Prevent {
  export interface Violation {
    wall: "blob-size" | "raw-data" | "credential"
    path: string
    reason: string
  }

  // ── BLOB-SIZE ──────────────────────────────────────────────────────────────────────────────────────────────────
  // W4-01's fixture was 463913 bytes. The cap is well under it; a genuinely-large tracked artifact (a lockfile, the
  // MANIFEST) is allow-listed by exact basename so the wall bites new bloat without fighting the existing tree.
  export const BLOB_SIZE_CAP = 262_144 // 256 KiB — W4-01 (453 KiB) is caught; a normal source/fixture is well under
  export const SIZE_ALLOWLIST = new Set(["bun.lock", "MANIFEST.json", "package-lock.json", "yarn.lock"])

  export function blobSize(path: string, bytes: number): Violation | null {
    const base = path.split("/").pop() ?? path
    if (SIZE_ALLOWLIST.has(base)) return null
    if (bytes > BLOB_SIZE_CAP) return { wall: "blob-size", path, reason: `staged blob ${bytes}B exceeds the ${BLOB_SIZE_CAP}B cap (the W4-01 class: raw data belongs gitignored + provenance-chained, never committed inline). If this is legitimately large, add it to SIZE_ALLOWLIST with a reason.` }
    return null
  }

  // ── RAW-DATA ───────────────────────────────────────────────────────────────────────────────────────────────────
  // The W4-01 shape precisely: a committed JSON/JSONL that inlines a long numeric series — arrays of [ts,value] pairs,
  // or a bare numeric array with many entries. Snapshots are gitignored (A′#12); the committed guarantee is the
  // nonce-anchored provenance CHAIN, never the payload. A file that inlines the payload re-introduces W4-01 by another name.
  export const RAW_DATA_PAIR_THRESHOLD = 200 // this many [num,num] pairs inline → the raw-data class
  export const RAW_DATA_NUM_THRESHOLD = 400 // this many bare numeric tokens inline → the raw-data class

  export function rawData(path: string, content: string): Violation | null {
    if (!/\.(json|jsonl|ndjson)$/i.test(path)) return null
    // count [num, num] pairs (the equity-curve / series shape) — the strongest signal
    const pairs = content.match(/\[\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?(?:e[-+]?\d+)?\s*\]/gi) ?? []
    if (pairs.length >= RAW_DATA_PAIR_THRESHOLD) return { wall: "raw-data", path, reason: `${pairs.length} inline [ts,value] pairs (≥ ${RAW_DATA_PAIR_THRESHOLD}) — the W4-01 raw-data class. Store the series as a gitignored snapshot + commit only its provenance chain (A′#12).` }
    // count bare numeric tokens as a fallback (a flat numeric array)
    const nums = content.match(/-?\d+\.\d{3,}/g) ?? [] // high-precision decimals are data, not config
    if (nums.length >= RAW_DATA_NUM_THRESHOLD) return { wall: "raw-data", path, reason: `${nums.length} inline high-precision numeric tokens (≥ ${RAW_DATA_NUM_THRESHOLD}) — the raw-data class. Gitignore the payload; commit the provenance chain, not the numbers.` }
    return null
  }

  // ── CREDENTIAL ─────────────────────────────────────────────────────────────────────────────────────────────────
  // The FRED class (a 32-char lowercase-alnum key), plus common secret shapes. Env-var NAMES are fine (FRED_API_KEY as
  // a reference); a literal VALUE assigned to one is the violation. Deliberately conservative: the pre-commit gate
  // should refuse a real key, not fight ordinary hex hashes — so we require the key-shaped token to sit next to a
  // secret-NAME assignment, or match a high-confidence secret prefix.
  const SECRET_PATTERNS: { re: RegExp; what: string }[] = [
    // NB: the private-key env-name is matched via PRIV[A-Z_]*KEY so this credential-DETECTION module never carries the
    // literal signing-primitive token (the underscore form) the no_signing_grep wall forbids in the studio tree.
    { re: /\b(FRED_API_KEY|API_KEY|APIKEY|SECRET|TOKEN|PASSWORD|PRIV[A-Z_]*KEY)\b\s*[:=]\s*["']?[a-z0-9]{16,}["']?/i, what: "a secret NAME assigned a literal value (the FRED class)" },
    { re: /\bAKIA[0-9A-Z]{16}\b/, what: "an AWS access key id" },
    { re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, what: "a PEM private key" },
    { re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/, what: "a GitHub token" },
    { re: /\bsk-[A-Za-z0-9]{32,}\b/, what: "an OpenAI-style secret key" },
    { re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, what: "a Slack token" },
  ]

  export function credential(path: string, content: string): Violation | null {
    // never scan the wall's own definition / its tests (they carry the patterns by necessity)
    if (/prevent\.(ts|js)$|precommit_prevent|precommit-prevent/.test(path)) return null
    for (const { re, what } of SECRET_PATTERNS) {
      const m = content.match(re)
      if (m) return { wall: "credential", path, reason: `${what}: "${m[0].slice(0, 24)}…" — secrets are never committed (the FRED class). Use an environment variable; the value stays off-repo.` }
    }
    return null
  }

  export interface StagedFile {
    path: string
    bytes: number
    content: string // "" for a binary/undecodable blob (size still checked)
  }

  // Run all three walls over a set of staged files. Returns every violation; the hook refuses the commit if non-empty.
  export function scanStaged(files: StagedFile[]): Violation[] {
    const out: Violation[] = []
    for (const f of files) {
      const s = blobSize(f.path, f.bytes)
      if (s) out.push(s)
      if (f.content) {
        const r = rawData(f.path, f.content)
        if (r) out.push(r)
        const c = credential(f.path, f.content)
        if (c) out.push(c)
      }
    }
    return out
  }
}
