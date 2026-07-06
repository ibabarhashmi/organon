/**
 * WALL — NO-SIGNING (S-NO-SIGN). Nothing in the STUDIO tree constructs, signs, or submits an on-chain transaction.
 * This wall greps the NEW product code (src/studio, src/ledger) for transaction-signing primitives and asserts NONE.
 * POSITIVE CONTROL: the same pattern is proven able to fire — it matches a seeded string containing a signing call —
 * so a green result means "absent", never "the grep is broken".
 */
import { describe, test, expect } from "bun:test"
import path from "node:path"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { PKG_ROOT } from "../../src/organon/frozen"

const SIGNING = /\b(signTransaction|sendTransaction|sendRawTransaction|eth_sendTransaction|signMessage|_signTypedData|privateKey|PRIVATE_KEY|secp256k1|wallet\.sign)\b/

// SCOPE MANIFEST (audit D5 — widened from V3's src/studio+src/ledger to the FULL STUDIO-reachable surface): every
// module this sprint added or that the STUDIO surfaces reach at runtime. The frozen core + attest are NOT in scope
// here because they are covered by their own batteries and the byte-identity wall; nothing STUDIO-authored signs.
const STUDIO_TREE = [
  path.join(PKG_ROOT, "src", "studio"), // bridge, surfaces, report, agents, checkpoint
  path.join(PKG_ROOT, "src", "ledger"), // the trial ledger
  path.join(PKG_ROOT, "script", "studio-demo.ts"), // the demo
  path.join(PKG_ROOT, "script", "verify-v3.ts"), // the reckoning protocol
]

describe("WALL no_signing_grep — the STUDIO tree constructs/signs/submits no transaction (S-NO-SIGN)", () => {
  test("grep finds ZERO signing primitives across src/studio + src/ledger", () => {
    const r = Bun.spawnSync(["grep", "-rInE", SIGNING.source, ...STUDIO_TREE])
    const hits = r.stdout.toString().trim()
    // grep exits 1 (no match) → empty stdout is the pass; any hit is a signing primitive that must not exist
    expect(hits).toBe("")
  })

  test("POSITIVE CONTROL — the regex matches a seeded signing call and spares a legitimate one", () => {
    expect(SIGNING.test("const tx = await wallet.signTransaction(payload)")).toBe(true)
    expect(SIGNING.test("import { secp256k1 } from 'noble'")).toBe(true)
    expect(SIGNING.test("const v = await Studio.submit(store, input)")).toBe(false) // a legitimate line does not trip it
  })

  test("POSITIVE CONTROL — the SHELL grep itself fires on a planted signing file (the grep mechanism is not a no-op)", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "no-signing-"))
    writeFileSync(path.join(dir, "evil.ts"), "export const go = async () => wallet.signTransaction({})\n")
    const r = Bun.spawnSync(["grep", "-rInE", SIGNING.source, dir])
    expect(r.stdout.toString()).toContain("signTransaction") // if this ever came back empty, the tree grep would be blind
  })
})
