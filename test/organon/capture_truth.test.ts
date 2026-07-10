/**
 * ORGΛNON — THE MOAT SPRINT, Phase 2 wall (CAPTURE-TRUTH; RE1/D26, S55). The viem+whatsabi capture-time prototype is
 * measured, not adopted on taste. This wall reads the committed measurement (capture-truth.json) and enforces the
 * determinism contract on the TREE:
 *   · S55 determinism — the full resolution ran twice at the same pinned block, batching OFF vs ON, byte-identical.
 *   · block-pinning — an explicit pinned block recorded; exact version pins (viem@2.55.0, whatsabi@0.26.0).
 *   · the ALLOWLIST + grep wall — viem/whatsabi are imported by EXACTLY ONE module (script/capture/proxy-truth.ts); a
 *     viem import in ANY mass-render-path or verdict-path module fails here (the mass path stays hono+zod).
 *   · no signing import — the capture module imports no wallet/account/signing symbol.
 *   · adopt-or-record evidence-match — ADOPT requires ≥1 demonstrated correctness gap; RECORD requires 0 (a mismatch fails).
 * The prototype is NOT run here (it needs the network + node); this wall verifies the recorded artifact + the tree.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const CT = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "capture-truth.json"), "utf8"))

// recursively collect .ts files under a dir
function walk(dir: string): string[] {
  const out: string[] = []
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e)
    if (e === "node_modules" || e === ".git") continue
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p))
    else if (e.endsWith(".ts") || e.endsWith(".mts")) out.push(p)
  }
  return out
}

test("S55 (determinism) — captures are byte-identical with batching OFF vs ON at the pinned block (the prohibition is proven safe, not asserted)", () => {
  expect(CT.determinismS55.batchingByteIdentical).toBe(true)
  expect(CT.determinismS55.shaBatchOff).toBe(CT.determinismS55.shaBatchOn)
  expect(CT.determinismS55.shaBatchOff).toMatch(/^[0-9a-f]{64}$/)
  // every read block-pinned + exact version pins
  expect(String(CT.pinnedBlock)).toMatch(/^\d+$/)
  expect(CT.versions.viem).toBe("2.55.0")
  expect(CT.versions.whatsabi).toMatch(/0\.26\.0/)
})

test("S55 (allowlist + grep wall) — viem/whatsabi are imported by EXACTLY ONE capture-time module; NO mass/verdict-path import (the mass path stays hono+zod)", () => {
  const importsViem = (f: string) => /from ["']viem|from ["']@shazow\/whatsabi|require\(["']viem/.test(readFileSync(f, "utf8"))
  const files = [...walk(path.join(PKG_ROOT, "src")), ...walk(path.join(PKG_ROOT, "script"))]
  const importers = files.filter(importsViem).map((f) => path.relative(PKG_ROOT, f)).sort()
  expect(importers, "viem/whatsabi may be imported ONLY by the allowlisted capture module").toEqual(["script/capture/proxy-truth.ts"])
  // the committed manifest still says hono+zod (viem/whatsabi did NOT land — D26 unsigned)
  const pkg = JSON.parse(readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"))
  expect(Object.keys(pkg.dependencies).sort()).toEqual(["hono", "zod"])
  expect(pkg.dependencies.viem).toBeUndefined()
})

test("S55 (no signing import) — the capture module imports no wallet/account/signing symbol (the crypto stack stays unexercised)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "script", "capture", "proxy-truth.ts"), "utf8")
  // the import lines only (not the prose comment that NAMES the banned symbols to explain the ban)
  const importLines = src.split("\n").filter((l) => /^\s*import\s/.test(l)).join("\n")
  expect(importLines).not.toMatch(/privateKeyToAccount|WalletClient|createWalletClient|sendTransaction|signMessage|signTypedData|mnemonicToAccount/)
  expect(importLines).toMatch(/createPublicClient/) // reads only
  expect(CT.noSigningImport.attestation).toMatch(/unexercised|no signing/i)
})

test("S55 (adopt-or-record evidence-match) — ADOPT requires ≥1 demonstrated correctness gap; RECORD requires 0 (elegance is not evidence)", () => {
  const gaps = CT.demonstratedGaps.length
  if (CT.decision === "ADOPT-RECOMMENDED") {
    expect(gaps, "an ADOPT must rest on ≥1 demonstrated correctness gap").toBeGreaterThanOrEqual(1)
    // each recorded gap is a subject the naive path missed (naiveImpl NONE) that whatsabi/loupe resolved-or-detected
    for (const g of CT.demonstratedGaps) {
      const s = CT.subjects.find((x: { key: string }) => x.key === g.key)
      expect(s.correctnessGap).toBe(true)
      expect(s.naiveImpl, `${g.key}: the naive path must have MISSED it`).toBeNull()
    }
  } else {
    expect(CT.decision).toBe("RECORD-INSUFFICIENT-EVIDENCE")
    expect(gaps, "a RECORD must have zero demonstrated gaps").toBe(0)
  }
})

test("D26 — the adoption is CAPTURE-TIME ONLY + the Bun-incompat cost is recorded (not hidden); the recommendation is Operator-gated", () => {
  expect(CT.adoptionCaveats.captureTimeOnly).toMatch(/allowlist|capture-time/i)
  expect(CT.adoptionCaveats.bunIncompatible).toMatch(/Bun|@noble\/hashes|node/i)
  expect(CT.adoptionCaveats.d26Unsigned).toMatch(/Operator-signed|do NOT land/i)
  // aave (standard 1967) is a MATCH — the naive path is sufficient there (no over-claim that viem beats it everywhere)
  const aave = CT.subjects.find((s: { key: string }) => s.key === "aave-v3-pool")
  expect(aave.correctnessGap).toBe(false)
  expect(aave.verdict).toMatch(/MATCH/)
})
