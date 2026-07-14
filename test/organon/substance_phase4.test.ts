/**
 * ORGΛNON — THE SUBSTANCE SPRINT (V38), Phase 4 wall: S127 — THE RELEASE IS BYTE-REPRODUCIBLE OR ITS NON-REPRODUCIBILITY IS
 * NAMED. Sheds last of the sheddable.
 *
 * V35 and V37 both said the release was "UNVERIFIED" and moved on — an unverified reproducibility claim is exactly the pin
 * X-HONEST forbids. This VERIFIES it: `bun build --compile` twice to the canonical outfile → SHA-256 compared. Empirically
 * byte-identical (the only variation the toolchain carries is the embedded --outfile path, a build input, held constant), so
 * the release IS reproducible. If a future toolchain breaks it, the manifest NAMES the non-reproducibility, never a silent
 * UNVERIFIED. The manifest also carries the negotiated protocol range (S120); D50(iii) published computes false (a human's push).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Release } from "../../src/organon/release"
import { Socket } from "../../src/socket/server"

const manifest = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "release-manifest.json"), "utf8"))

test("S127 (W-SU10) — reproducibility is VERIFIED by a two-build SHA-256 comparison, not a blanket UNVERIFIED", () => {
  expect(manifest.reproducible).toBeTruthy() // the two-build result is recorded (not a bare 'unverified: true')
  expect(manifest.reproducible.verified).toBe(true) // byte-identical across two builds
  expect(manifest.reproducible.sha1).toBe(manifest.reproducible.sha2) // the proof: two shas, equal
  expect(manifest.reproducible.sha1).toMatch(/^[0-9a-f]{64}$/)
  // the blanket 'reproducibilityUnverified: true' is gone — it is now COMPUTED (false when verified)
  expect(manifest.reproducibilityUnverified).toBe(false)
})

test("S127 — a NON-reproducible result would be NAMED (not silently UNVERIFIED): the note carries the verdict either way", () => {
  expect(manifest.reproducible.note).toMatch(/VERIFIED byte-reproducible|NON-REPRODUCIBLE and NAMED/)
  // the wall can fail: were verified false, reproducibilityUnverified would be true and the note would NAME it (X-HONEST)
  expect(typeof manifest.reproducible.verified).toBe("boolean")
})

test("S127/S120 — the negotiated protocol range travels with the release manifest (the current MCP revision, live-verified)", () => {
  expect(manifest.protocolRange).toBeTruthy()
  expect(manifest.protocolRange.current).toBe(Socket.PROTOCOL_VERSION) // 2025-11-25 (live-verified)
  expect(manifest.protocolRange.supported).toEqual([...Socket.SUPPORTED_VERSIONS])
  expect(manifest.protocolRange.verified).toBe(true)
})

test("S127 — D50 computes: (ii) install documented true, (iii) published FALSE (a human's push), canFire false", () => {
  const d = Release.d50()
  expect(d.ii_installDocumented.value).toBe(true)
  expect(typeof manifest.installLine).toBe("string")
  expect(manifest.installLine.length).toBeGreaterThan(0)
  expect(d.iii_published.value).toBe(false) // still unpublished — the door is built, locked from outside
  expect(d.canFire).toBe(false)
})
