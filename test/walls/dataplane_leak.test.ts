/**
 * WALL — the DATA-PLANE LEAK wall (Data-Plane Phase 1; Rule D-SEAM, A′#3). The data plane is standalone-native by
 * construction: any import from src/dataplane reaching OpenCode / engine-infra / a sibling package / a SQLite-or-ORM
 * binding / out-of-repo FAILS the battery. Positive-controlled: a seeded leak (an import of `bun:sqlite`) is caught.
 */
import { test, expect } from "bun:test"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Seams } from "../../src/dataplane/seams"

test("leak wall: src/dataplane imports nothing from OpenCode / engine-infra / a sibling package / SQLite (zero leaks)", () => {
  const { files, leaks } = Seams.scanDataplane()
  if (leaks.length) for (const l of leaks) console.log(`  LEAK ${l.file}:${l.line} → "${l.specifier}" — ${l.reason}`)
  expect(files.length).toBeGreaterThan(0) // the data plane exists
  expect(leaks.length).toBe(0) // and is standalone-native
})

test("leak wall POSITIVE CONTROL: a seeded forbidden import is CAUGHT", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "leak-"))
  const f = path.join(dir, "leaky.ts")
  writeFileSync(f, `import { Database } from "bun:sqlite"\nimport { x } from "@solidity-sentinel/core"\nexport const y = Database\n`)
  try {
    const leaks = Seams.scanFile(f, dir)
    expect(leaks.length).toBeGreaterThanOrEqual(2) // both the SQLite binding and the sibling package are caught
    expect(leaks.some((l) => l.specifier.includes("sqlite"))).toBe(true)
    expect(leaks.some((l) => l.specifier.includes("@solidity-sentinel"))).toBe(true)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("leak wall: a clean relative/builtin import set is NOT flagged (no over-tightening)", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "clean-"))
  const f = path.join(dir, "clean.ts")
  writeFileSync(f, `import { createHash } from "node:crypto"\nimport { DataPlane } from "./store"\nimport { Capture } from "../studio/capture"\nexport const z = 1\n`)
  try {
    expect(Seams.scanFile(f, dir).length).toBe(0)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
