/**
 * ORGΛNON DATA-PLANE — the SEAM / LEAK guard (Data-Plane Phase 1; Rule D-SEAM, A′#3). The transplant's closure check,
 * made permanent: the data plane is standalone-native BY CONSTRUCTION, not aspiration. Any import from a data-plane
 * module that reaches into OpenCode / engine-infra / a sibling `@solidity-sentinel/*` package / a SQLite-or-ORM binding
 * / an out-of-repo path is a LEAK — the tangle sneaking back in with the port. The wall scans the real source and
 * reddens if one appears; a seeded leak is caught (its positive control). This is what lets Organon live at its own
 * address without dragging the editor's guts along.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"

export namespace Seams {
  // module specifiers that must NEVER appear in a data-plane import — the OpenCode/engine-infra/sibling/ORM surface
  export const FORBIDDEN: Array<{ pattern: RegExp; reason: string }> = [
    { pattern: /@solidity-sentinel\//, reason: "sibling monorepo package (the tangle)" },
    { pattern: /(^|["'/])opencode(\/|["'])/i, reason: "OpenCode editor infra" },
    { pattern: /bun:sqlite/, reason: "SQLite binding — the standalone is flat-JSON/JSONL, no DB (D-SEAM)" },
    { pattern: /\bdrizzle(-orm)?\b/, reason: "Drizzle ORM — the OpenCode 12-table schema surface" },
    { pattern: /\/storage\/db(["']|$)/, reason: "the OpenCode storage/db module" },
    { pattern: /\.sql(["']|$)/, reason: "a .sql schema module (engine-infra)" },
    { pattern: /(^|\/)(marketdata|universe|risk)\//, reason: "the monorepo engine-infra dirs (not transplanted; the store is standalone-native)" },
    { pattern: /\.\.\/\.\.\/\.\.\//, reason: "an import escaping the package root (out-of-repo reach)" },
  ]

  export interface Leak { file: string; line: number; specifier: string; reason: string }

  function listTs(dir: string): string[] {
    const out: string[] = []
    if (!existsSafe(dir)) return out
    for (const name of readdirSync(dir)) {
      const abs = path.join(dir, name)
      if (statSync(abs).isDirectory()) out.push(...listTs(abs))
      else if (name.endsWith(".ts")) out.push(abs)
    }
    return out
  }
  function existsSafe(p: string): boolean {
    try { statSync(p); return true } catch { return false }
  }

  // extract the module specifier of every `import ... from "X"` / `require("X")` / dynamic import("X")
  const IMPORT_RE = /(?:import\s[^"']*?from\s*|import\s*|require\s*\(\s*|import\s*\(\s*)["']([^"']+)["']/g
  export function scanSource(src: string): Array<{ line: number; specifier: string }> {
    const out: Array<{ line: number; specifier: string }> = []
    const lines = src.split("\n")
    for (let i = 0; i < lines.length; i++) {
      let m: RegExpExecArray | null
      IMPORT_RE.lastIndex = 0
      while ((m = IMPORT_RE.exec(lines[i]))) out.push({ line: i + 1, specifier: m[1] })
    }
    return out
  }

  export function scanFile(abs: string, relTo: string = PKG_ROOT): Leak[] {
    const rel = path.relative(relTo, abs)
    const leaks: Leak[] = []
    for (const { line, specifier } of scanSource(readFileSync(abs, "utf8"))) {
      for (const f of FORBIDDEN) if (f.pattern.test(specifier)) leaks.push({ file: rel, line, specifier, reason: f.reason })
    }
    return leaks
  }

  // scan the whole data-plane source tree (src/dataplane) — the governed surface
  export function scanDataplane(): { files: string[]; leaks: Leak[] } {
    const files = listTs(path.join(PKG_ROOT, "src", "dataplane"))
    const leaks = files.flatMap((f) => scanFile(f))
    return { files: files.map((f) => path.relative(PKG_ROOT, f)), leaks }
  }
}
