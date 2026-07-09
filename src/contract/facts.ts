/**
 * ORGΛNON — the deterministic contract-risk FACT extractor (Contract-Truth Phase 2/3, X-CONTRACT b).
 *
 * Pure `(ContractIR) → structural facts`. NO model, NO network, NO random — a fixed IR yields byte-identical facts. Each
 * function here ports the pure analysis logic of ONE extracted Sentinel tool (the `Tool.define` wrapper, the zod schema, the
 * `../lang` multi-language fallback, and the human-string formatting are DROPPED — copy the analysis, not the cruft). The
 * facts are STRUCTURAL and SPECIFIC ("an unprotected admin function", "a delegatecall edge") — this file NEVER emits a
 * "safe"/"audited"/"unsafe" judgment; the tiering (over these facts) is ORGΛNON's own deterministic rule in `subaxis.ts`.
 *
 * The six flag categories (pinned in contract-pins.json) each map to the tool whose logic produces them:
 *   unprotected-state-changing ← auth-surface · dangerous-edges ← call-graph · upgrade-proxy-hazard ← upgrade-check
 *   storage-clash ← storage-layout · reentrancy-value-flow ← value-flow + state-flow · oracle-dependency ← protocols.isOracleRead
 * (contract-info · inheritance-resolver · dimensional-analysis · mutation-map are NOT ported — their outputs are not in the
 *  sub-axis fact list; porting them would be speculative surface PART CLEAN forbids. See D9 + contract-pins.json.)
 */
import type { ContractIR, ProjectIR } from "./ir"
import { isOracleRead } from "./protocols"

export type FlagCategory =
  | "unprotected-state-changing"
  | "dangerous-edges"
  | "upgrade-proxy-hazard"
  | "storage-clash"
  | "reentrancy-value-flow"
  | "oracle-dependency"

export interface ContractFinding {
  category: FlagCategory
  detail: string // the SPECIFIC structural fact, named — never "unsafe"/"safe"
  contract: string
  fn?: string
  line?: number
}

export interface StructuralFacts {
  contracts: string[] // the contract names analyzed (kind !== "interface")
  functionsAnalyzed: number
  findings: ContractFinding[] // every flagged structural surface, in deterministic order
  flaggedCategories: FlagCategory[] // the distinct categories that fired (sorted, deterministic)
}

const uniq = (xs: string[]) => [...new Set(xs)]
const authLabels = (fn: ContractIR["functions"][number]) => uniq(fn.auth.map((a) => a.label))
const initLike = (name: string) => /(?:^|_)(?:re)?initialize/i.test(name) || /__.*_init(?:_unchained)?$/i.test(name)

// ── auth-surface: public/external state-changing functions with no authorization gate ──
function authSurface(c: ContractIR): ContractFinding[] {
  const out: ContractFinding[] = []
  for (const fn of c.functions) {
    if (fn.visibility !== "public" && fn.visibility !== "external") continue
    const stateful = fn.writes.length > 0 || fn.values.length > 0
    const labels = authLabels(fn)
    const line = fn.location.line
    if (stateful && labels.length === 0 && !fn.modifiers.some((m) => /only|owner|role|admin|auth/i.test(m)))
      out.push({ category: "unprotected-state-changing", detail: `${fn.signature} mutates state without an authorization gate`, contract: c.name, fn: fn.name, line })
    if (/upgradeTo|set[A-Z]|sweep|withdraw|mint|burn|pause|unpause/i.test(fn.name) && labels.length === 0)
      out.push({ category: "unprotected-state-changing", detail: `${fn.signature} is a sensitive function with no explicit auth signal`, contract: c.name, fn: fn.name, line })
    if (/initialize|reinitialize/i.test(fn.name) && !labels.some((l) => /initializer/i.test(l)))
      out.push({ category: "unprotected-state-changing", detail: `${fn.signature} is an initializer-like function without an initializer signal`, contract: c.name, fn: fn.name, line })
  }
  return out
}

// ── call-graph (soliditySurface): dangerous outbound edges — delegatecall / low-level / eth-transfer + fallback delegatecall ──
function dangerousEdges(c: ContractIR): ContractFinding[] {
  const out: ContractFinding[] = []
  for (const fn of c.functions) {
    for (const call of fn.calls) {
      if (call.kind === "delegatecall")
        out.push({ category: "dangerous-edges", detail: `${call.method} — delegatecall (into attacker-controlled code if the target is mutable)`, contract: c.name, fn: fn.name, line: call.line })
      else if (call.kind === "low-level")
        out.push({ category: "dangerous-edges", detail: `${call.method} — low-level external call (full callback surface)`, contract: c.name, fn: fn.name, line: call.line })
      else if (call.kind === "eth-transfer")
        out.push({ category: "dangerous-edges", detail: `${call.method} — ETH transfer / external control handoff`, contract: c.name, fn: fn.name, line: call.line })
    }
  }
  if (c.fallback_delegatecall)
    out.push({ category: "dangerous-edges", detail: "fallback delegatecall present — the implementation target executes in this contract's storage context", contract: c.name })
  return out
}

// ── upgrade-check: proxy/upgrade hazards (initializer safety · self-lock · upgrade-entry auth · fallback delegatecall) ──
function upgradeProxyHazard(c: ContractIR): ContractFinding[] {
  if (c.proxies.length === 0 && c.initializers.length === 0) return [] // no upgrade/proxy surface
  const out: ContractFinding[] = []
  const constructors = c.functions.filter((fn) => fn.kind === "constructor")
  const init = c.functions.filter((fn) => initLike(fn.name))
  const entry = c.functions.filter((fn) => /upgradeTo|upgradeToAndCall|setImplementation|setBeacon/i.test(fn.name))
  const selfLocked = constructors.some((fn) => fn.calls.some((call) => call.method === "_disableInitializers"))
  const externalInit = init.filter((fn) => fn.visibility === "public" || fn.visibility === "external")
  const internalInit = init.filter((fn) => fn.visibility === "internal" || fn.visibility === "private")
  for (const fn of init) {
    const checks = [...fn.modifiers, ...authLabels(fn)]
    if (!checks.some((item) => /initializer|onlyInitializing/i.test(item)))
      out.push({ category: "upgrade-proxy-hazard", detail: `${fn.signature} is initializer-like without an initializer/onlyInitializing signal`, contract: c.name, fn: fn.name, line: fn.location.line })
  }
  if (!selfLocked && c.proxies.length)
    out.push({ category: "upgrade-proxy-hazard", detail: "upgradeable contract does not self-lock the implementation via constructor/_disableInitializers", contract: c.name })
  if (internalInit.length && !externalInit.length)
    out.push({ category: "upgrade-proxy-hazard", detail: "initializer routines are internal-only — verify a public initializer exists in the deployment entrypoint", contract: c.name })
  for (const fn of entry) {
    if (authLabels(fn).length === 0 && !fn.modifiers.some((m) => /only/i.test(m)))
      out.push({ category: "upgrade-proxy-hazard", detail: `${fn.signature} looks like an upgrade entrypoint without an auth signal`, contract: c.name, fn: fn.name, line: fn.location.line })
  }
  if (c.fallback_delegatecall)
    out.push({ category: "upgrade-proxy-hazard", detail: "fallback delegatecall present — verify the implementation target control and initialization state", contract: c.name })
  return out
}

// ── storage-layout: an upgradeable contract without a storage gap (a future-upgrade slot-collision surface) ──
function storageClash(c: ContractIR): ContractFinding[] {
  if (c.proxies.length && !c.storage.some((slot) => /__gap|gap/.test(slot.label)))
    return [{ category: "storage-clash", detail: "upgradeable contract without a storage gap — a future upgrade can collide with existing slots", contract: c.name }]
  return []
}

// ── value-flow + state-flow: reentrancy windows, CEI violations, callback surfaces, ETH handoffs, cross-tx value deps ──
function reentrancyValueFlow(c: ContractIR): ContractFinding[] {
  const out: ContractFinding[] = []
  for (const fn of c.functions) {
    const callerOps = fn.operations.filter((op) => !op.cross_contract)
    const firstCall = callerOps.findIndex((op) => op.kind === "call" && op.call_kind !== "internal")
    const writeAfterCall = firstCall >= 0 && callerOps.slice(firstCall + 1).some((op) => op.kind === "write")
    const callBeforeWrite =
      firstCall >= 0 && callerOps.slice(0, firstCall).every((op) => op.kind !== "write") && callerOps.slice(firstCall + 1).some((op) => op.kind === "write")
    if (writeAfterCall)
      out.push({ category: "reentrancy-value-flow", detail: `${fn.signature}: state mutates after an external call (a reentrancy window — effects-after-interaction)`, contract: c.name, fn: fn.name, line: fn.location.line })
    else if (callBeforeWrite)
      out.push({ category: "reentrancy-value-flow", detail: `${fn.signature}: external control transfers before a state write (checks-effects-interactions ordering)`, contract: c.name, fn: fn.name, line: fn.location.line })
    // callback surface (state set here is unavailable during the external protocol's earlier phases)
    const isCallback =
      ["Callback", "Received", "FlashLoan"].some((s) => fn.name.includes(s)) ||
      ["on", "receive", "validate", "check"].some((p) => fn.name.startsWith(p) && fn.name.length > p.length && fn.name[p.length] === fn.name[p.length].toUpperCase())
    if (isCallback)
      out.push({ category: "reentrancy-value-flow", detail: `${fn.signature}: callback function — state registered here is unavailable during the external protocol's earlier execution phases`, contract: c.name, fn: fn.name, line: fn.location.line })
    // ETH transfer through an external control handoff
    if (fn.values.some((v) => v.asset === "eth" && v.action === "send") && fn.operations.some((op) => op.kind === "call" && op.call_kind !== "internal"))
      out.push({ category: "reentrancy-value-flow", detail: `${fn.signature}: transfers ETH through an external control handoff`, contract: c.name, fn: fn.name, line: fn.location.line })
    // cross-tx dependency: a value transfer amount depending on storage other functions can write
    const valueTransfers = fn.operations.filter((op) => op.kind === "value")
    const storageReads = fn.operations.filter((op) => op.kind === "read")
    if (valueTransfers.length && storageReads.length) {
      const multiWriter = uniq(storageReads.map((op) => op.name)).filter((v) => c.functions.some((o) => o.name !== fn.name && o.writes.includes(v)))
      if (multiWriter.length)
        out.push({ category: "reentrancy-value-flow", detail: `${fn.signature}: cross-tx dependency — the transfer amount may depend on storage variables writable by other functions (${multiWriter.join(", ")})`, contract: c.name, fn: fn.name, line: fn.location.line })
    }
  }
  return out
}

// ── protocols.isOracleRead: external oracle/price reads (a staleness/manipulation dependency surface) ──
function oracleDependency(c: ContractIR): ContractFinding[] {
  const out: ContractFinding[] = []
  for (const fn of c.functions) {
    for (const call of fn.calls) {
      const note = isOracleRead(call.method)
      if (note) out.push({ category: "oracle-dependency", detail: `${call.method} — ${note}`, contract: c.name, fn: fn.name, line: call.line })
    }
  }
  return out
}

const ANALYZERS = [authSurface, dangerousEdges, upgradeProxyHazard, storageClash, reentrancyValueFlow, oracleDependency]

/**
 * Aggregate the structural facts over a whole project IR (every contract that is not a pure interface). Deterministic:
 * contracts in IR order, functions in declaration order, categories in the fixed ANALYZERS order → byte-identical output.
 */
export function contractFacts(ir: ProjectIR): StructuralFacts {
  const analyzed = ir.contracts.filter((c) => c.kind !== "interface")
  const findings: ContractFinding[] = []
  let functionsAnalyzed = 0
  for (const c of analyzed) {
    functionsAnalyzed += c.functions.length
    for (const analyze of ANALYZERS) findings.push(...analyze(c))
  }
  const flaggedCategories = [...new Set(findings.map((f) => f.category))].sort()
  return { contracts: analyzed.map((c) => c.name), functionsAnalyzed, findings, flaggedCategories }
}

/** Run the fact extractor over a single ContractIR (used by the positive-controlled fixture tests). */
export function contractFactsForContract(c: ContractIR): ContractFinding[] {
  return ANALYZERS.flatMap((analyze) => analyze(c))
}
