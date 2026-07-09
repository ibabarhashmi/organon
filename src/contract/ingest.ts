/**
 * ORGΛNON — VERIFIED-SOURCE INGESTION (Build-Provenance Phase 2, X-VERIFY a). The Operator-gated, keyless-first resolver
 * that carries a protocol's VERIFIED source into the pipeline — resolve · verify · content-hash · record — with NO build
 * or analysis here (that is Phase 3's buildcapture). Every clause is load-bearing:
 *   · keyless-first — a keyless Sourcify verified-source fetch (FULL match) or an Operator-supplied `contracts/` build dir.
 *   · Operator-gated, never a scrape — a discrete step, not a mass-path fetch; paywalled/unlock sources stay ARMED-never-scraped.
 *   · provenanced — a FULL verified deployed-source match → provenance REAL; a PARTIAL match or absent source → SAMPLE /
 *     `unavailable`, NEVER a fabricated REAL (the REAL/SAMPLE wall's precondition — only a REAL source can ever earn a clean tier).
 *   · content-addressed — the verified source set is sha256'd into a contentHash (the verified-source identity).
 *   · key-safe — an OPTIONAL BYOK explorer key rides ONLY in the fetch transport header; it is NEVER stored in the
 *     VerifiedSource / the record / a log (the key-shape is scrubbed from the recorded source string).
 * The fetch is injectable (`fetchImpl`) so the battery is hermetic (mocked offline); the real fetch is a Phase-4 capture step.
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

export namespace ContractIngest {
  export type Provenance = "REAL" | "SAMPLE"
  export type Kind = "sourcify-full" | "sourcify-partial" | "operator-build" | "unavailable"

  export interface SourceFile {
    path: string
    content: string
  }
  export interface VerifiedSource {
    protocol: string // the shelf protocol / label the source belongs to
    chainId: number | null
    address: string | null // the deployed contract address (a full match ties the source to it)
    kind: Kind
    files: SourceFile[] // the verified source files (empty when unavailable) — materialized to a build dir in Phase 3
    projectRoot: string | null // an Operator-supplied build dir (already on disk); null for a fetched source (materialized at capture)
    compiler: string | null // the solc version from metadata (drives the deterministic build)
    verified: boolean // a FULL verified deployed-source match (Sourcify full_match, or Operator-attested)
    provenance: Provenance // REAL iff verified full match; else SAMPLE (a PARTIAL match or an absent source is never REAL)
    source: string // human provenance, key-scrubbed ("sourcify:full:1:0x…" / "operator-build:…" / "unavailable:…")
    asOf: number
    contentHash: string | null // sha256 of the sorted source set (null when unavailable)
    note: string
  }

  export type FetchImpl = (url: string, headers?: Record<string, string>) => Promise<{ status: number; text: string }>

  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  // scrub anything key-shaped from a string that will be recorded (defence-in-depth — a key must never reach the record)
  const KEY_SHAPE = /\b(gsk_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|[A-Z0-9]{34,}|[A-Za-z0-9]{40,})\b/g
  const scrub = (s: string) => s.replace(KEY_SHAPE, "«redacted»")
  const hashFiles = (files: SourceFile[]) =>
    sha256(JSON.stringify([...files].sort((a, b) => (a.path < b.path ? -1 : 1)).map((f) => [f.path, f.content])))

  /** the unavailable case — no verified source; SAMPLE, never a fabricated REAL. */
  export function unavailable(protocol: string, asOf: number, note: string): VerifiedSource {
    return { protocol, chainId: null, address: null, kind: "unavailable", files: [], projectRoot: null, compiler: null, verified: false, provenance: "SAMPLE", source: `unavailable:${protocol}`, asOf, contentHash: null, note: scrub(note) }
  }

  /**
   * A keyless Sourcify (v2 API) verified-source fetch by chain + address. An EXACT match → REAL (the exact verified
   * deployed source); a non-exact ("match"/partial) → SAMPLE (not the exact deployed source — never earns a clean tier);
   * a non-Solidity language or a 404/error → unavailable. An OPTIONAL BYOK explorer key rides ONLY in the transport header
   * (never stored). NO scrape of paywalled sources — only the keyless Sourcify verified-source registry.
   */
  export async function fromSourcify(opts: {
    protocol: string
    chainId: number
    address: string
    asOf: number
    fetchImpl?: FetchImpl
    explorerKey?: string // OPTIONAL — server-side env-only; used in the header, NEVER recorded
  }): Promise<VerifiedSource> {
    const fetchImpl = opts.fetchImpl ?? defaultFetch
    const url = `https://sourcify.dev/server/v2/contract/${opts.chainId}/${opts.address}?fields=sources,compilation`
    const headers = opts.explorerKey ? { Authorization: `Bearer ${opts.explorerKey}` } : undefined // key ONLY in transit
    let res: { status: number; text: string }
    try {
      res = await fetchImpl(url, headers)
    } catch (e) {
      return unavailable(opts.protocol, opts.asOf, `sourcify fetch failed: ${(e as Error)?.message ?? e}`)
    }
    if (res.status !== 200) return unavailable(opts.protocol, opts.asOf, `sourcify ${res.status} for ${opts.chainId}/${opts.address}`)
    let parsed: {
      match?: string | null
      runtimeMatch?: string | null
      creationMatch?: string | null
      compilation?: { compilerVersion?: string; language?: string; name?: string }
      sources?: Record<string, { content?: string }>
    }
    try {
      parsed = JSON.parse(res.text)
    } catch {
      return unavailable(opts.protocol, opts.asOf, "sourcify returned malformed JSON")
    }
    if (parsed.compilation?.language && parsed.compilation.language !== "Solidity")
      return unavailable(opts.protocol, opts.asOf, `sourcify: non-Solidity language (${parsed.compilation.language}) — the analyzer is Solidity-only`)
    const files: SourceFile[] = Object.entries(parsed.sources ?? {})
      .filter(([, v]) => typeof v?.content === "string")
      .map(([p, v]) => ({ path: p, content: v.content as string }))
    if (!files.some((f) => f.path.endsWith(".sol"))) return unavailable(opts.protocol, opts.asOf, "sourcify returned no Solidity sources")
    // an EXACT match is the exact verified deployed source → REAL; any other match kind is not the exact source → SAMPLE (the wall)
    const exact = [parsed.match, parsed.runtimeMatch, parsed.creationMatch].includes("exact_match")
    const compiler = parsed.compilation?.compilerVersion?.replace(/\+commit.*/, "") ?? extractCompiler(files)
    return {
      protocol: opts.protocol,
      chainId: opts.chainId,
      address: opts.address,
      kind: exact ? "sourcify-full" : "sourcify-partial",
      files,
      projectRoot: null, // a fetched source is materialized into a work dir at capture time (Phase 3)
      compiler,
      verified: exact, // ONLY an EXACT match is a verified deployed-source match
      provenance: exact ? "REAL" : "SAMPLE", // a non-exact match is NOT the exact deployed source → SAMPLE (the wall)
      source: `sourcify:${exact ? "exact" : "partial"}:${opts.chainId}:${opts.address}`, // no key here — key was header-only
      asOf: opts.asOf,
      contentHash: hashFiles(files),
      note: `sourcify ${exact ? "exact_match" : "partial_match"} · ${files.filter((f) => f.path.endsWith(".sol")).length} source file(s)${compiler ? ` · solc ${compiler}` : ""}`,
    }
  }

  /**
   * An Operator-supplied build directory — a local `contracts/` foundry project whose source the Operator attests is the
   * VERIFIED deployed source (`attestVerified: true` → REAL). Reads the `.sol` sources from disk; NO build here.
   */
  export function fromOperatorBuild(opts: { protocol: string; projectRoot: string; chainId?: number; address?: string; asOf: number; attestVerified: boolean }): VerifiedSource {
    const root = opts.projectRoot
    if (!existsSync(path.join(root, "foundry.toml"))) return unavailable(opts.protocol, opts.asOf, `no foundry.toml in ${root}`)
    const files: SourceFile[] = []
    const srcDir = existsSync(path.join(root, "src")) ? path.join(root, "src") : root
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const abs = path.join(dir, name)
        if (statSync(abs).isDirectory()) walk(abs)
        else if (name.endsWith(".sol")) files.push({ path: path.relative(root, abs), content: readFileSync(abs, "utf8") })
      }
    }
    walk(srcDir)
    if (!files.length) return unavailable(opts.protocol, opts.asOf, `no .sol sources under ${root}`)
    return {
      protocol: opts.protocol,
      chainId: opts.chainId ?? null,
      address: opts.address ?? null,
      kind: "operator-build",
      files,
      projectRoot: root, // the Operator-supplied build dir (already on disk — captured without a re-fetch)
      compiler: extractCompiler(files),
      verified: opts.attestVerified, // the Operator attests this IS the verified deployed source
      provenance: opts.attestVerified ? "REAL" : "SAMPLE",
      source: `operator-build:${opts.protocol}${opts.address ? `:${opts.address}` : ""}`,
      asOf: opts.asOf,
      contentHash: hashFiles(files),
      note: `operator-supplied build · ${files.length} source file(s)${opts.attestVerified ? " · attested verified" : " · UNATTESTED (SAMPLE)"}`,
    }
  }

  // the solc version from a metadata.json in the source set (best-effort; null if absent) — drives the deterministic build
  function extractCompiler(files: SourceFile[]): string | null {
    const meta = files.find((f) => f.path.endsWith("metadata.json") || f.path === "metadata.json")
    if (meta) {
      try {
        const v = JSON.parse(meta.content)?.compiler?.version
        if (typeof v === "string") return v.replace(/\+commit.*/, "")
      } catch {
        /* fall through to pragma */
      }
    }
    const sol = files.find((f) => f.path.endsWith(".sol"))
    const m = sol?.content.match(/pragma\s+solidity\s+[\^~>=<\s]*([0-9]+\.[0-9]+\.[0-9]+)/)
    return m ? m[1] : null
  }

  // the default (real) fetch — used only outside the hermetic battery (the tests inject a mock)
  const defaultFetch: FetchImpl = async (url, headers) => {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) })
    return { status: r.status, text: await r.text() }
  }
}
