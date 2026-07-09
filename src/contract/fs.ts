/**
 * ORGΛNON — the OWNED filesystem/glob/process shim for the extracted contract engine (Contract-Truth Phase 2, D9).
 *
 * This REPLACES the Sentinel/OpenCode `@/util/{filesystem,glob,process}` coupling the copied engine used, with a plain,
 * owned surface over node built-ins + Bun's built-in Glob/spawn. NO new npm dependency (the `glob` package the Sentinel
 * util used is NOT pulled in — Bun.Glob covers the two patterns the engine scans). The engine passes a plain project path;
 * there is no session/platform state. The Foundry toolchain is an OPTIONAL seam: `Process.run` never crashes the process
 * on an absent `forge` (it returns a non-zero code under `nothrow`), so the caller can degrade to UNVERIFIED honestly.
 */
import { existsSync, statSync, type Stats } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"

export namespace Filesystem {
  /** metadata check — undefined when the path does not exist (never throws), matching the engine's expectation */
  export function stat(p: string): Stats | undefined {
    return statSync(p, { throwIfNoEntry: false }) ?? undefined
  }
  export async function readText(p: string): Promise<string> {
    return readFile(p, "utf-8")
  }
  /** walk up from `start`, collecting every `target` found on the way to the filesystem root (or `stop`) */
  export async function findUp(target: string, start: string, stop?: string): Promise<string[]> {
    let current = start
    const result: string[] = []
    while (true) {
      const search = join(current, target)
      if (existsSync(search)) result.push(search)
      if (stop === current) break
      const parent = dirname(current)
      if (parent === current) break
      current = parent
    }
    return result
  }
}

export namespace Glob {
  export interface Options {
    cwd?: string
    absolute?: boolean
    include?: "file" | "all"
    dot?: boolean
    symlink?: boolean
  }
  /** synchronous glob over Bun's built-in Glob (no `glob`/`minimatch` npm dep); a missing cwd yields [] (never throws) */
  export function scanSync(pattern: string, options: Options = {}): string[] {
    if (options.cwd && !existsSync(options.cwd)) return []
    const g = new Bun.Glob(pattern)
    return [
      ...g.scanSync({
        cwd: options.cwd,
        absolute: options.absolute ?? false,
        dot: options.dot ?? false,
        followSymlinks: options.symlink ?? false,
        onlyFiles: options.include !== "all",
      }),
    ]
  }
}

export namespace Process {
  export interface Result {
    code: number
    stdout: Buffer
    stderr: Buffer
  }
  export interface RunOptions {
    cwd?: string
    nothrow?: boolean
  }
  /**
   * run a command, capturing stdout/stderr. Under `nothrow`, an absent binary (e.g. `forge` not installed — the OPTIONAL
   * Foundry seam) returns a non-zero code instead of crashing the process, so the caller degrades to UNVERIFIED honestly.
   */
  export async function run(cmd: string[], opts: RunOptions = {}): Promise<Result> {
    try {
      const proc = Bun.spawn(cmd, { cwd: opts.cwd, stdin: "ignore", stdout: "pipe", stderr: "pipe" })
      const [stdout, stderr] = await Promise.all([
        new Response(proc.stdout).arrayBuffer(),
        new Response(proc.stderr).arrayBuffer(),
      ])
      const code = await proc.exited
      const out = { code, stdout: Buffer.from(stdout), stderr: Buffer.from(stderr) }
      if (out.code === 0 || opts.nothrow) return out
      throw new Error(`Command failed with code ${out.code}: ${cmd.join(" ")}\n${out.stderr.toString().trim()}`)
    } catch (e) {
      if (opts.nothrow) return { code: 127, stdout: Buffer.from(""), stderr: Buffer.from(String((e as Error)?.message ?? e)) }
      throw e
    }
  }
}
