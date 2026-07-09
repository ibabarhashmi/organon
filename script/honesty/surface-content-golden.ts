/**
 * ORGΛNON — THE SURFACE SPRINT, the S36 content-identity GOLDEN (X-SURFACE e). The visible TEXT CONTENT (every number,
 * label, tier, verdict, provenance mark, the ANALYSIS label, the residual) of each screen, tag-and-style stripped. The
 * surface restyle may change layout/type/color/space/motion — the CSS, the class attributes, the inline styles — but
 * NEVER the text; surface_content_identity asserts the post-restyle signatures still match the golden captured BEFORE the
 * restyle (byte-identical content, per screen). The render helpers + contentSig are EXPORTED (pure, no side effects on
 * import) so the test reuses them; the golden is WRITTEN only when this script is run directly (guarded) — it must NOT be
 * regenerated after the restyle (that would defeat the wall).
 *
 * Run ONCE, BEFORE the restyle: bun run script/honesty/surface-content-golden.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { DefiLlama } from "../../src/dataplane/providers/defillama"
import { VoiceContract } from "../../src/ask/contract"

export const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

// the CONTENT SIGNATURE — drop the <style> block, strip every tag, normalize whitespace → the pure visible text.
// Style/class/inline-style/layout changes vanish; any number/label/verdict/tier/mark change survives (S36).
export function contentSig(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// render every screen the surface restyle touches, from FIXED deterministic inputs (SAMPLE data + a fixed clock).
export function renderAllScreens(): Record<string, string> {
  const NOW = Date.parse("2026-07-09T00:00:00Z")
  const screens: Record<string, string> = {}
  screens["shelf-sample"] = Reality.renderShelf(Reality.shelfSample(), true)
  screens["shelf-filter-solid"] = Reality.renderShelf(Reality.shelfSample(), true, { verdict: "SOLID" })
  const rc = Reality.realityCheck(`defillama:pool:${DefiLlama.SAMPLE_POOLS[0].pool}`, NOW)
  if (rc) screens["reality-sample"] = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, "defillama:pool:x")
  screens["ask-empty"] = Reality.renderAsk({ register: "simple", raw: false, aiStatus: { keyed: false, provider: null } })
  screens["ask-pro-blocks"] = Reality.renderAsk({
    query: "is aave-v3 USDC safe?", register: "pro", raw: false, intentKind: "STRATEGY_LOOKUP", tool: "poolFacts", reality: "SAMPLE",
    aiStatus: { keyed: false, provider: null },
    blocks: [
      { tier: "FACT", text: "aave-v3 USDC — durable base yield, steady deposits, peg holding." },
      { tier: "REASONING", text: "The economics look durable; the catch is smart-contract and depeg tail risk.", label: VoiceContract.ANALYSIS_LABEL },
      { tier: "BOUNDARY", text: "This is not financial advice." },
    ],
    residual: VoiceContract.RESIDUAL_DISCLOSURE,
  })
  return screens
}

// WRITE the golden — only when run directly (never on import; never re-run after the restyle)
if (import.meta.main) {
  const golden: Record<string, { sha: string; len: number }> = {}
  for (const [k, html] of Object.entries(renderAllScreens())) { const sig = contentSig(html); golden[k] = { sha: sha256(sig), len: sig.length } }
  const out = { protocol: "surface-content-golden", note: "the S36 content-identity golden — the PRE-restyle visible text signature (tag+style stripped) of each screen; the restyle must reproduce these exactly (surface_content_identity). Content byte-identical; only presentation changes.", at: "2026-07-09", golden }
  writeFileSync(path.join(PKG_ROOT, "data", "honesty", "surface-content-golden.json"), JSON.stringify(out, null, 2) + "\n")
  console.log("── SURFACE — content-identity golden (PRE-restyle) ───────────")
  for (const [k, v] of Object.entries(golden)) console.log(`  ${k.padEnd(22)} sha ${v.sha.slice(0, 16)}… (${v.len} chars)`)
  console.log("written: data/honesty/surface-content-golden.json")
}
