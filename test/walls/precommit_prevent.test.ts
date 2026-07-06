/**
 * WALL — the PREVENTION walls bite (End-User Phase 0; Rule E-PREVENT, V9 finding 3). History cannot be un-committed, so
 * the medicine is a pre-commit gate that refuses BEFORE a bad blob becomes permanent. Each wall is positive-controlled:
 * a seeded violation (an oversized blob, an inline raw-data array of the W4-01 shape, a literal FRED-class key) MUST be
 * caught; a clean file MUST pass (no over-flagging). The scanner + hook are proven fail-closed on these seeds.
 */
import { test, expect } from "bun:test"
import { Prevent } from "../../src/studio/prevent"

test("BLOB-SIZE wall: an oversized staged blob is CAUGHT; a normal file and an allow-listed large file pass", () => {
  expect(Prevent.blobSize("data/studio/huge-fixture.json", 463_913)).not.toBeNull() // the W4-01 size → caught
  expect(Prevent.blobSize("data/studio/huge-fixture.json", 463_913)!.wall).toBe("blob-size")
  expect(Prevent.blobSize("src/studio/prevent.ts", 5_000)).toBeNull() // a normal source file passes
  expect(Prevent.blobSize("bun.lock", 315_000)).toBeNull() // an allow-listed genuinely-large artifact passes
})

test("RAW-DATA wall: an inline [ts,value] series (the W4-01 shape) is CAUGHT; config-shaped JSON passes", () => {
  // 250 [ts,value] pairs inline — the exact class W4-01 introduced (a committed fixture that embedded the raw series)
  const pairs = Array.from({ length: 250 }, (_, i) => `[${1_700_000_000_000 + i * 86_400_000}, ${(0.03 + i * 1e-5).toFixed(8)}]`).join(",")
  const v = Prevent.rawData("data/studio/embedded.json", `{"equity_curve":[${pairs}]}`)
  expect(v).not.toBeNull()
  expect(v!.wall).toBe("raw-data")
  // a normal config/provenance JSON (a handful of numbers, hashes) passes — the committed guarantee is the chain, not the payload
  const clean = `{"protocol":"provenance","chainPos":3,"contentSha":"abc123","count":5,"asOf":"2026-07-05"}`
  expect(Prevent.rawData("data/studio/provenance.jsonl", clean)).toBeNull()
  // a non-data file (source) is never raw-data-flagged regardless of content
  expect(Prevent.rawData("src/x.ts", `const a=[${pairs}]`)).toBeNull()
})

test("CREDENTIAL wall: a literal FRED-class key is CAUGHT; an env-var reference passes", () => {
  const v = Prevent.credential("script/leak.ts", `const key = "FRED_API_KEY=abcdef0123456789abcdef0123456789"`)
  expect(v).not.toBeNull()
  expect(v!.wall).toBe("credential")
  // a reference to the env var by NAME (no literal value) is legitimate and passes
  expect(Prevent.credential("script/ok.ts", `const k = process.env.FRED_API_KEY // set it in your env`)).toBeNull()
  // a PEM private key is caught
  expect(Prevent.credential("x.pem", "-----BEGIN PRIVATE KEY-----\nMIIE...")).not.toBeNull()
  // the wall never scans its own definition (the patterns live there by necessity)
  expect(Prevent.credential("src/studio/prevent.ts", "AKIA0123456789ABCDEF")).toBeNull()
})

test("scanStaged: a clean set yields ZERO violations; a mixed set yields exactly the seeded ones", () => {
  const clean: Prevent.StagedFile[] = [
    { path: "src/studio/catalog.ts", bytes: 4200, content: "export namespace Catalog {}" },
    { path: "data/studio/provenance.jsonl", bytes: 800, content: `{"chainPos":1,"contentSha":"deadbeef"}` },
  ]
  expect(Prevent.scanStaged(clean).length).toBe(0)
  const dirty: Prevent.StagedFile[] = [
    ...clean,
    { path: "data/studio/big.json", bytes: 500_000, content: "" }, // oversized (binary/undecodable → size only)
    { path: "script/secret.ts", bytes: 100, content: `API_KEY = "0123456789abcdef0123"` }, // credential
  ]
  const v = Prevent.scanStaged(dirty)
  expect(v.length).toBe(2)
  expect(v.map((x) => x.wall).sort()).toEqual(["blob-size", "credential"])
})
