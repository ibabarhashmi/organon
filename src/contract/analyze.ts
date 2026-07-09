// SEVERED (Contract-Truth Phase 2, D9): the Sentinel/OpenCode `@/project/instance` coupling (a session-scoped cache + a
// default directory) is replaced with a plain module-level cache + a REQUIRED project-path parameter — no platform state.
import { loadBuild } from "./build"
import type {
  ArithmeticOpIR,
  AstNode,
  AuthIR,
  BuildInfo,
  CallIR,
  CallKind,
  Controllability,
  ContractIR,
  ExternalCallIR,
  ExternalCallRegistry,
  ExternalCallSignal,
  FunctionIR,
  Location,
  ModifierIR,
  OperationIR,
  ProjectIR,
  ProxyIR,
  SourceInfo,
  StateVarIR,
  StorageSlotIR,
  TaintEntry,
  TaintIR,
  ValueIR,
} from "./ir"
import { isCallbackHook, isOracleRead } from "./protocols"
import { detectProject, fingerprint } from "./project"

function object(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function num(value: unknown) {
  return typeof value === "number" ? value : undefined
}

function parseSrc(src?: string) {
  if (!src) return
  const [start, length] = src.split(":")
  const offset = Number(start)
  if (Number.isNaN(offset)) return
  return {
    offset,
    length: Number(length),
  }
}

function lineOffsets(content: string) {
  const result = [0]
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "\n") result.push(i + 1)
  }
  return result
}

function lineNumber(lines: number[], offset?: number) {
  if (offset === undefined) return
  let low = 0
  let high = lines.length - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (lines[mid]! <= offset) {
      if (mid === lines.length - 1 || lines[mid + 1]! > offset) return mid + 1
      low = mid + 1
      continue
    }
    high = mid - 1
  }
}

function location(source: SourceInfo, node?: AstNode): Location {
  const parsed = parseSrc(node?.src)
  const lines = lineOffsets(source.content)
  return {
    file: source.path,
    full: source.full,
    line: lineNumber(lines, parsed?.offset),
    column: parsed?.offset === undefined ? undefined : parsed.offset - (lines[(lineNumber(lines, parsed.offset) ?? 1) - 1] ?? 0) + 1,
    offset: parsed?.offset,
  }
}

function walk(node: unknown, fn: (node: AstNode) => void | boolean) {
  if (!node || typeof node !== "object") return
  const current = node as AstNode
  if (typeof current.nodeType !== "string") return
  if (fn(current) === false) return
  Object.values(current).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, fn))
      return
    }
    walk(value, fn)
  })
}

function contractNodes(source: SourceInfo) {
  const result = [] as AstNode[]
  walk(source.ast, (node) => {
    if (node.nodeType === "ContractDefinition") result.push(node)
  })
  return result
}

function functionNodes(node?: AstNode) {
  return array(object(node).nodes).filter((item) => object(item).nodeType === "FunctionDefinition") as AstNode[]
}

function modifierNodes(node?: AstNode) {
  return array(object(node).nodes).filter((item) => object(item).nodeType === "ModifierDefinition") as AstNode[]
}

function stateNodes(node?: AstNode) {
  return array(object(node).nodes).filter(
    (item) => object(item).nodeType === "VariableDeclaration" && object(item).stateVariable === true,
  ) as AstNode[]
}

function eventNames(node?: AstNode) {
  return array(object(node).nodes)
    .filter((item) => object(item).nodeType === "EventDefinition")
    .map((item) => text(object(item).name))
    .filter(Boolean) as string[]
}

function errorNames(node?: AstNode) {
  return array(object(node).nodes)
    .filter((item) => object(item).nodeType === "ErrorDefinition")
    .map((item) => text(object(item).name))
    .filter(Boolean) as string[]
}

function typeName(node?: AstNode): string {
  const typeString = text(object(object(node).typeDescriptions).typeString)
  if (typeString) return typeString
  const name = text(object(node).name)
  if (name) return name
  const path = text(object(node).namePath)
  if (path) return path
  const base = object(node).baseType
  const inner = object(node).valueType
  if (object(node).nodeType === "ArrayTypeName") return `${typeName(base as AstNode)}[]`
  if (object(node).nodeType === "Mapping") {
    return `mapping(${typeName(object(node).keyType as AstNode)} => ${typeName(inner as AstNode)})`
  }
  return ""
}

function paramTypes(node?: AstNode) {
  return array(object(node).parameters)
    .map((item) => typeName(item as AstNode))
    .filter(Boolean)
}

function returns(node?: AstNode) {
  return array(object(node).parameters)
    .map((item) => typeName(item as AstNode))
    .filter(Boolean)
}

function modifierName(node?: AstNode) {
  const name = text(object(node).modifierName && object(object(node).modifierName).name)
  if (name) return name
  const path = text(object(object(node).modifierName).namePath)
  if (path) return path.split(".").pop()!
  return text(object(node).name) ?? ""
}

function baseName(node?: AstNode) {
  const path = text(object(object(node).baseName).namePath)
  if (path) return path.split(".").pop()!
  return text(object(object(node).baseName).name) ?? ""
}

function authWords(node?: unknown) {
  const result = [] as string[]
  walk(node, (item) => {
    const name = text(item.name)
    if (name) result.push(name)
    const member = text(object(item).memberName)
    if (member) result.push(member)
  })
  return result
}

function isAuth(node?: unknown) {
  const joined = authWords(node).join(" ").toLowerCase()
  return ["msgsender", "sender", "tx", "owner", "admin", "role", "auth", "permit"].some((part) =>
    joined.includes(part),
  )
}

function contractType(node?: AstNode) {
  const kind = text(object(node).contractKind) ?? "contract"
  if (object(node).abstract === true && kind === "contract") return "abstract"
  if (kind === "interface" || kind === "library") return kind
  return "contract"
}

function contractFromType(node?: unknown) {
  const typeString = text(object(object(node).typeDescriptions).typeString) ?? ""
  const match = typeString.match(/contract\s+([A-Za-z0-9_]+)/)
  if (match) return match[1]
  const interfaceMatch = typeString.match(/type\(contract\s+([A-Za-z0-9_]+)\)/)
  return interfaceMatch?.[1]
}

function targetName(node?: unknown): string | undefined {
  const item = object(node)
  if (item.nodeType === "Identifier") return text(item.name)
  if (item.nodeType === "MemberAccess") return targetName(item.expression)
  if (item.nodeType === "FunctionCall") return targetName(item.expression)
  if (item.nodeType === "FunctionCallOptions") return targetName(item.expression)
  return undefined
}

function stateRefs(node: unknown, ids: Set<number>) {
  const result = [] as number[]
  walk(node, (item) => {
    const ref = num(object(item).referencedDeclaration)
    if (ref !== undefined && ids.has(ref)) result.push(ref)
  })
  return [...new Set(result)]
}

function makeValue(
  values: Array<{ offset: number; item: ValueIR }>,
  source: SourceInfo,
  node: AstNode,
  item: Omit<ValueIR, "line">,
) {
  values.push({
    offset: parseSrc(node.src)?.offset ?? Number.MAX_SAFE_INTEGER,
    item: {
      ...item,
      line: location(source, node).line,
    },
  })
}

function makeCall(
  calls: Array<{ offset: number; item: CallIR }>,
  source: SourceInfo,
  node: AstNode,
  item: Omit<CallIR, "line">,
) {
  calls.push({
    offset: parseSrc(node.src)?.offset ?? Number.MAX_SAFE_INTEGER,
    item: {
      ...item,
      call_args: truncateArgs(item.call_args, EXPR_MAX),
      line: location(source, node).line,
    },
  })
}

function makeAuth(
  auth: Array<{ offset: number; item: AuthIR }>,
  source: SourceInfo,
  node: AstNode,
  item: Omit<AuthIR, "line">,
) {
  auth.push({
    offset: parseSrc(node.src)?.offset ?? Number.MAX_SAFE_INTEGER,
    item: {
      ...item,
      line: location(source, node).line,
    },
  })
}

function truncate(value: string | undefined, max: number) {
  if (!value || value.length <= max) return value
  return value.slice(0, max) + "..."
}

function truncateArgs(args: string[] | undefined, max: number) {
  if (!args) return args
  let total = 0
  return args.map((arg) => {
    total += arg.length
    return total <= max ? arg : truncate(arg, Math.max(20, max - total + arg.length)) ?? arg
  })
}

const EXPR_MAX = 200

function makeOp(
  ops: Array<{ offset: number; item: OperationIR }>,
  source: SourceInfo,
  node: AstNode,
  item: Omit<OperationIR, "line">,
) {
  ops.push({
    offset: parseSrc(node.src)?.offset ?? Number.MAX_SAFE_INTEGER,
    item: {
      ...item,
      value_expr: truncate(item.value_expr, EXPR_MAX),
      call_args: truncateArgs(item.call_args, EXPR_MAX),
      line: location(source, node).line,
    },
  })
}

function methodSelector(methods: Record<string, string>, signature: string, name: string) {
  if (methods[signature]) return methods[signature]
  const match = Object.entries(methods).find(([key]) => key.startsWith(`${name}(`))
  return match?.[1]
}

function valueAction(method: string) {
  if (method === "transfer" || method === "safeTransfer") {
    return {
      asset: "erc20",
      action: "transfer",
    } satisfies Pick<ValueIR, "asset" | "action">
  }
  if (method === "transferFrom" || method === "safeTransferFrom") {
    return {
      asset: "erc20",
      action: "transfer_from",
    } satisfies Pick<ValueIR, "asset" | "action">
  }
  if (method === "approve" || method === "safeApprove" || method === "forceApprove") {
    return {
      asset: "erc20",
      action: "approve",
    } satisfies Pick<ValueIR, "asset" | "action">
  }
  if (method === "mint" || method === "safeMint") {
    return {
      asset: "erc20",
      action: "mint",
    } satisfies Pick<ValueIR, "asset" | "action">
  }
  if (method === "burn" || method === "safeBurn") {
    return {
      asset: "erc20",
      action: "burn",
    } satisfies Pick<ValueIR, "asset" | "action">
  }
}

function show(node?: unknown): string {
  const item = object(node)
  const type = text(item.nodeType) ?? ""
  if (type === "Identifier") return text(item.name) ?? ""
  if (type === "Literal") return text(item.value) ?? text(item.hexValue) ?? ""
  if (type === "ElementaryTypeNameExpression") return typeName(item.typeName as AstNode)
  if (type === "MemberAccess") {
    const base = show(item.expression)
    const member = text(item.memberName) ?? ""
    if (!base) return member
    if (!member) return base
    return `${base}.${member}`
  }
  if (type === "IndexAccess") {
    const base = show(item.baseExpression)
    const index = show(item.indexExpression)
    if (!base) return ""
    if (!index) return `${base}[]`
    return `${base}[${index}]`
  }
  if (type === "TupleExpression") {
    const components = array(item.components)
      .map((value) => show(value))
      .filter(Boolean)
    if (components.length === 1) return `(${components[0]})`
    return components.join(", ")
  }
  if (type === "BinaryOperation") {
    const left = show(item.leftExpression)
    const right = show(item.rightExpression)
    const op = text(item.operator) ?? ""
    return [left, op, right].filter(Boolean).join(" ").trim()
  }
  if (type === "UnaryOperation") {
    const op = text(item.operator) ?? ""
    const expr = show(item.subExpression)
    return `${op}${expr}`.trim()
  }
  if (type === "Conditional") {
    const cond = show(item.condition)
    const thenExpr = show(item.trueExpression)
    const elseExpr = show(item.falseExpression)
    if (!cond) return ""
    return `${cond} ? ${thenExpr} : ${elseExpr}`
  }
  if (type === "FunctionCall") {
    const expr = show(item.expression)
    const args = array(item.arguments)
      .map((value) => show(value))
      .filter(Boolean)
      .join(", ")
    if (!expr) return ""
    return `${expr}(${args})`
  }
  if (type === "FunctionCallOptions") {
    return show(item.expression)
  }
  if (type === "NewExpression") {
    const typeName = text(object(item.typeName).name) ?? text(object(item.typeName).namePath) ?? ""
    return typeName ? `new ${typeName}` : ""
  }
  if (type === "IdentifierPath") return text(item.namePath) ?? text(item.name) ?? ""
  return ""
}

function showYul(node?: unknown): string {
  const item = object(node)
  const type = text(item.nodeType) ?? ""
  if (type === "YulIdentifier") return text(item.name) ?? ""
  if (type === "YulLiteral") return text(item.value) ?? text(item.hexValue) ?? ""
  if (type === "YulTypedName") return text(item.name) ?? ""
  if (type === "YulFunctionCall") {
    const name = text(object(item.functionName).name) ?? ""
    const args = array(item.arguments)
      .map((value) => showYul(value))
      .filter(Boolean)
      .join(", ")
    return `${name}(${args})`
  }
  return ""
}

const ARITH_OPERATORS = new Set(["+", "-", "*", "/", "%", "**"])
const SHIFT_OPERATORS = new Set(["<<", ">>"])

const MULDIV_METHODS: Record<string, ArithmeticOpIR["rounding"]> = {
  mulDiv: undefined,
  mulDivDown: "down",
  mulDivUp: "up",
  fullMulDiv: undefined,
  fullMulDivUp: "up",
  muldiv: undefined,
  divUp: "up",
  ceilDiv: "up",
}

function precisionHint(value: string): number | undefined {
  const match = value.match(/^1(0+)$/)
  if (match) return match[1]!.length
  const expMatch = value.match(/^1e(\d+)$/)
  if (expMatch) return Number(expMatch[1])
  try {
    const n = BigInt(value)
    if (n > 0n && (n & (n - 1n)) === 0n) {
      let bits = 0
      let v = n
      while (v > 1n) { v >>= 1n; bits++ }
      return bits
    }
  } catch {}
  return undefined
}

function collectLiterals(node: unknown): string[] {
  const result = [] as string[]
  walk(node, (item) => {
    if (item.nodeType === "Literal" && text(item.value)) result.push(text(item.value)!)
  })
  return result
}

function collectStateNames(node: unknown, ids: Map<number, string>): string[] {
  const result = [] as string[]
  walk(node, (item) => {
    if (item.nodeType === "Identifier") {
      const ref = num(object(item).referencedDeclaration)
      if (ref !== undefined && ids.has(ref)) result.push(ids.get(ref)!)
    }
  })
  return [...new Set(result)]
}

function makeArith(
  arith: Array<{ offset: number; item: ArithmeticOpIR }>,
  source: SourceInfo,
  node: AstNode,
  item: Omit<ArithmeticOpIR, "line">,
) {
  arith.push({
    offset: parseSrc(node.src)?.offset ?? Number.MAX_SAFE_INTEGER,
    item: {
      ...item,
      expression: truncate(item.expression, EXPR_MAX) ?? "",
      left: truncate(item.left, EXPR_MAX) ?? item.left,
      right: truncate(item.right, EXPR_MAX) ?? item.right,
      line: location(source, node).line,
    },
  })
}

function collect(node: AstNode | undefined, input: {
  source: SourceInfo
  contract: string
  projectContracts: Set<string>
  internal: Set<string>
  states: Map<number, string>
}) {
  const ops = [] as Array<{ offset: number; item: OperationIR }>
  const auth = [] as Array<{ offset: number; item: AuthIR }>
  const calls = [] as Array<{ offset: number; item: CallIR }>
  const values = [] as Array<{ offset: number; item: ValueIR }>
  const arith = [] as Array<{ offset: number; item: ArithmeticOpIR }>
  let placeholder: number | undefined
  const branchStack = [] as string[]
  let loopDepth = 0

  const addArith = (node: AstNode, data: Omit<ArithmeticOpIR, "line">) => {
    makeArith(arith, input.source, node, {
      ...data,
      branch: branchStack.length ? truncate(branchStack.join(" && "), EXPR_MAX) : undefined,
      in_loop: loopDepth > 0 || undefined,
    })
  }

  const addOp = (node: AstNode, data: Omit<OperationIR, "line">) => {
    makeOp(ops, input.source, node, {
      ...data,
      branch: branchStack.length ? truncate(branchStack.join(" && "), EXPR_MAX) : undefined,
      in_loop: loopDepth > 0 || undefined,
    })
  }

  const addAsmOp = (asmNode: AstNode, data: Omit<OperationIR, "line">) => {
    addOp(asmNode, { ...data, assembly: true })
  }

  const visitYul = (node: unknown, asmNode: AstNode, externalRefs: Map<string, number>) => {
    const item = object(node)
    const type = text(item.nodeType) ?? ""

    if (type === "YulBlock") {
      array(item.statements).forEach((stmt) => visitYul(stmt, asmNode, externalRefs))
      return
    }

    if (type === "YulExpressionStatement") {
      visitYul(item.expression, asmNode, externalRefs)
      return
    }

    if (type === "YulVariableDeclaration") {
      if (item.value) visitYul(item.value, asmNode, externalRefs)
      return
    }

    if (type === "YulAssignment") {
      if (item.value) visitYul(item.value, asmNode, externalRefs)
      return
    }

    if (type === "YulIf") {
      const cond = showYul(item.condition)
      branchStack.push(cond || "asm:if")
      visitYul(item.body, asmNode, externalRefs)
      branchStack.pop()
      return
    }

    if (type === "YulForLoop") {
      visitYul(item.pre, asmNode, externalRefs)
      loopDepth++
      visitYul(item.body, asmNode, externalRefs)
      visitYul(item.post, asmNode, externalRefs)
      loopDepth--
      return
    }

    if (type === "YulSwitch") {
      array(item.cases).forEach((c) => {
        const caseNode = object(c)
        const cond = caseNode.value ? showYul(caseNode.value) : "default"
        branchStack.push(cond)
        visitYul(caseNode.body, asmNode, externalRefs)
        branchStack.pop()
      })
      return
    }

    if (type === "YulFunctionDefinition") {
      visitYul(item.body, asmNode, externalRefs)
      return
    }

    if (type !== "YulFunctionCall") return

    const fnName = text(object(item.functionName).name) ?? ""
    const args = array(item.arguments)

    const resolveSlot = (slotArg: unknown): string | undefined => {
      const argNode = object(slotArg)
      if (argNode.nodeType === "YulIdentifier") {
        const name = text(argNode.name) ?? ""
        const declId = externalRefs.get(name)
        if (declId !== undefined && input.states.has(declId)) return input.states.get(declId)
      }
      return undefined
    }

    if (fnName === "sload") {
      const resolved = resolveSlot(args[0])
      addAsmOp(asmNode, {
        kind: "read",
        name: resolved ?? `assembly:sload(${showYul(args[0]) || "?"})`,
      })
      return
    }

    if (fnName === "sstore") {
      const resolved = resolveSlot(args[0])
      const valueExpr = showYul(args[1])
      addAsmOp(asmNode, {
        kind: "write",
        name: resolved ?? `assembly:sstore(${showYul(args[0]) || "?"})`,
        value_expr: valueExpr || undefined,
      })
      return
    }

    if (fnName === "call") {
      const target = showYul(args[1])
      const valueExpr = showYul(args[2])
      makeCall(calls, input.source, asmNode, {
        method: "call",
        kind: "low-level",
        target,
        value: true,
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      addAsmOp(asmNode, {
        kind: "call",
        name: "call",
        target,
        call_kind: "low-level",
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      makeValue(values, input.source, asmNode, { asset: "eth", action: "send", target })
      addAsmOp(asmNode, {
        kind: "value",
        name: "call",
        asset: "eth",
        action: "send",
        target,
        value_expr: valueExpr || undefined,
      })
      return
    }

    if (fnName === "staticcall") {
      const target = showYul(args[1])
      makeCall(calls, input.source, asmNode, {
        method: "staticcall",
        kind: "staticcall",
        target,
        value: false,
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      addAsmOp(asmNode, {
        kind: "call",
        name: "staticcall",
        target,
        call_kind: "staticcall",
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      return
    }

    if (fnName === "delegatecall") {
      const target = showYul(args[1])
      makeCall(calls, input.source, asmNode, {
        method: "delegatecall",
        kind: "delegatecall",
        target,
        value: false,
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      addAsmOp(asmNode, {
        kind: "call",
        name: "delegatecall",
        target,
        call_kind: "delegatecall",
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      return
    }

    if (fnName === "create") {
      const valueExpr = showYul(args[0])
      makeCall(calls, input.source, asmNode, {
        method: "create",
        kind: "low-level",
        value: true,
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      addAsmOp(asmNode, {
        kind: "call",
        name: "assembly:create",
        call_kind: "low-level",
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      makeValue(values, input.source, asmNode, { asset: "eth", action: "send" })
      addAsmOp(asmNode, {
        kind: "value",
        name: "assembly:create",
        asset: "eth",
        action: "send",
        value_expr: valueExpr || undefined,
      })
      return
    }

    if (fnName === "create2") {
      const valueExpr = showYul(args[0])
      makeCall(calls, input.source, asmNode, {
        method: "create2",
        kind: "low-level",
        value: true,
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      addAsmOp(asmNode, {
        kind: "call",
        name: "assembly:create2",
        call_kind: "low-level",
        call_args: args.map((a) => showYul(a)).filter(Boolean),
      })
      makeValue(values, input.source, asmNode, { asset: "eth", action: "send" })
      addAsmOp(asmNode, {
        kind: "value",
        name: "assembly:create2",
        asset: "eth",
        action: "send",
        value_expr: valueExpr || undefined,
      })
      return
    }

    if (fnName === "selfdestruct") {
      const target = showYul(args[0])
      makeCall(calls, input.source, asmNode, {
        method: "selfdestruct",
        kind: "low-level",
        target,
        value: true,
      })
      addAsmOp(asmNode, {
        kind: "call",
        name: "assembly:selfdestruct",
        target,
        call_kind: "low-level",
      })
      makeValue(values, input.source, asmNode, { asset: "eth", action: "send", target })
      addAsmOp(asmNode, {
        kind: "value",
        name: "assembly:selfdestruct",
        asset: "eth",
        action: "send",
        target,
      })
      return
    }

    if (/^log[0-4]$/.test(fnName)) {
      addAsmOp(asmNode, { kind: "emit", name: "assembly:log" })
      return
    }

    // For all other Yul builtins (mload, mstore, add, shr, etc.), recurse into arguments
    args.forEach((arg) => visitYul(arg, asmNode, externalRefs))
  }

  const visit = (item: AstNode) => {
    if (item.nodeType === "PlaceholderStatement") {
      placeholder = parseSrc(item.src)?.offset
      return
    }

    if (item.nodeType === "IfStatement") {
      walk(item.condition, visit)
      const cond = show(item.condition)
      branchStack.push(cond || "if")
      walk(object(item).trueBody, visit)
      branchStack.pop()
      if (object(item).falseBody) {
        branchStack.push(cond ? `!(${cond})` : "else")
        walk(object(item).falseBody, visit)
        branchStack.pop()
      }
      return false
    }

    if (item.nodeType === "ForStatement") {
      walk(object(item).initializationExpression, visit)
      walk(object(item).condition, visit)
      loopDepth++
      walk(object(item).body, visit)
      walk(object(item).loopExpression, visit)
      loopDepth--
      return false
    }

    if (item.nodeType === "WhileStatement" || item.nodeType === "DoWhileStatement") {
      walk(object(item).condition, visit)
      loopDepth++
      walk(object(item).body, visit)
      loopDepth--
      return false
    }

    if (item.nodeType === "EmitStatement") {
      const eventCall = object(object(item).eventCall)
      const name = text(object(eventCall.expression).name) ?? show(eventCall.expression) ?? "event"
      addOp(item, { kind: "emit", name })
      return false
    }

    if (item.nodeType === "Identifier") {
      const ref = num(object(item).referencedDeclaration)
      if (ref === undefined || !input.states.has(ref)) return
      addOp(item, {
        kind: "read",
        name: input.states.get(ref)!,
      })
      return
    }

    if (item.nodeType === "MemberAccess") {
      const expr = object(item.expression)
      if (expr.nodeType === "Identifier" && text(expr.name) === "msg" && text(item.memberName) === "value") {
        makeValue(values, input.source, item, {
          asset: "eth",
          action: "receive",
        })
        addOp(item, {
          kind: "value",
          name: "msg.value",
          asset: "eth",
          action: "receive",
        })
      }
      return
    }

    if (item.nodeType === "BinaryOperation") {
      const operator = text(object(item).operator) ?? ""
      if (ARITH_OPERATORS.has(operator) || SHIFT_OPERATORS.has(operator)) {
        const leftExpr = show(object(item).leftExpression)
        const rightExpr = show(object(item).rightExpression)
        const literals = [
          ...collectLiterals(object(item).leftExpression),
          ...collectLiterals(object(item).rightExpression),
        ]
        const stateNames = collectStateNames(item, input.states)
        const consts = literals.filter(Boolean)
        const hints = consts.map(precisionHint).filter((h): h is number => h !== undefined)
        addArith(item, {
          kind: SHIFT_OPERATORS.has(operator) ? "shift" : "binary",
          operator,
          expression: show(item),
          left: leftExpr,
          right: rightExpr,
          state_refs: stateNames.length ? stateNames : undefined,
          constants: consts.length ? consts : undefined,
          precision_hint: hints.length === 1 ? hints[0] : undefined,
        })
      }
    }

    if (item.nodeType === "Assignment") {
      const operator = text(object(item).operator) ?? "="
      const rhs = show(object(item).rightHandSide)
      const lhs = show(object(item).leftHandSide)
      stateRefs(object(item).leftHandSide, new Set(input.states.keys())).forEach((id) => {
        const name = input.states.get(id)
        if (!name) return
        const baseOp = operator.slice(0, -1)
        const expanded = operator === "=" ? rhs : (lhs && rhs ? `${lhs} ${baseOp} ${rhs}` : rhs)
        addOp(item, {
          kind: "write",
          name,
          value_expr: expanded || undefined,
        })
      })
      walk(object(item).rightHandSide, visit)
      return false
    }

    if (item.nodeType === "UnaryOperation") {
      const op = text(object(item).operator) ?? ""
      if (!["++", "--", "delete"].includes(op)) return
      const expr = op === "delete" ? "delete" : `${show(object(item).subExpression)} ${op === "++" ? "+ 1" : "- 1"}`
      stateRefs(object(item).subExpression, new Set(input.states.keys())).forEach((id) => {
        const name = input.states.get(id)
        if (!name) return
        addOp(item, {
          kind: "write",
          name,
          value_expr: expr || undefined,
        })
      })
      if (op === "++" || op === "--") {
        const stateNames = collectStateNames(object(item).subExpression, input.states)
        addArith(item, {
          kind: "unary_arith",
          operator: op,
          expression: show(item),
          left: show(object(item).subExpression),
          state_refs: stateNames.length ? stateNames : undefined,
        })
      }
      if (op !== "delete") walk(object(item).subExpression, visit)
      return false
    }

    if (item.nodeType === "InlineAssembly") {
      const externalRefs = new Map<string, number>()
      array(object(item).externalReferences).forEach((ref) => {
        const entry = object(ref)
        const keys = Object.keys(entry)
        keys.forEach((key) => {
          const decl = object(entry[key])
          const declId = num(decl.declaration)
          if (declId !== undefined) externalRefs.set(key, declId)
        })
      })
      if (item.AST) visitYul(item.AST, item, externalRefs)
      return false
    }

    if (item.nodeType !== "FunctionCall") return

    const expr = object(item.expression)
    const args = array(item.arguments)
    const argStrings = args.map((arg) => show(arg)).filter(Boolean)
    const names = authWords(item)

    if (expr.nodeType === "ElementaryTypeNameExpression") {
      const toType = typeName(object(expr).typeName as AstNode)
      if (toType && argStrings.length === 1) {
        const fromTypeStr = text(object(object(args[0]).typeDescriptions).typeString) ?? ""
        if (fromTypeStr && /^u?int\d*$/.test(toType) && /^u?int\d*$/.test(fromTypeStr)) {
          addArith(item, {
            kind: "cast",
            expression: show(item),
            left: argStrings[0],
            from_type: fromTypeStr,
            to_type: toType,
          })
        }
      }
    }

    if (expr.nodeType === "Identifier") {
      const name = text(expr.name) ?? ""
      if (name === "require" || name === "assert") {
        addOp(item, {
          kind: "check",
          name,
          value_expr: argStrings[0] || undefined,
        })
        if (isAuth(args[0])) {
          const label = show(args[0])
          makeAuth(auth, input.source, item, {
            kind: "check",
            label: label || name,
          })
        }
        return
      }
      if (name === "addmod" || name === "mulmod") {
        addArith(item, {
          kind: "binary",
          operator: name === "addmod" ? "+%" : "*%",
          expression: show(item),
          args: argStrings.slice(0, 3),
          state_refs: collectStateNames(item, input.states).length ? collectStateNames(item, input.states) : undefined,
        })
      }
      if (name in MULDIV_METHODS && argStrings.length >= 3) {
        addArith(item, {
          kind: "muldiv",
          expression: show(item),
          args: argStrings.slice(0, 3),
          rounding: MULDIV_METHODS[name],
          state_refs: collectStateNames(item, input.states).length ? collectStateNames(item, input.states) : undefined,
          constants: collectLiterals(item).length ? collectLiterals(item) : undefined,
          precision_hint: (() => {
            const hints = collectLiterals(item).map(precisionHint).filter((h): h is number => h !== undefined)
            return hints.length === 1 ? hints[0] : undefined
          })(),
        })
      }
      if (input.internal.has(name)) {
        makeCall(calls, input.source, item, {
          method: name,
          kind: "internal",
          target: input.contract,
          target_contract: input.contract,
          value: false,
          call_args: argStrings.length ? argStrings : undefined,
        })
        addOp(item, {
          kind: "call",
          name,
          target: input.contract,
          target_contract: input.contract,
          call_kind: "internal",
          call_args: argStrings.length ? argStrings : undefined,
        })
      }
      return
    }

    const callExpr = expr.nodeType === "FunctionCallOptions" ? object(expr.expression) : expr
    if (callExpr.nodeType !== "MemberAccess") return

    const method = text(callExpr.memberName) ?? ""

    if (method in MULDIV_METHODS) {
      const muldivArgs = method === "divUp" || method === "ceilDiv"
        ? [show(callExpr.expression), ...argStrings.slice(0, 1)]
        : argStrings.slice(0, 3)
      if (muldivArgs.length >= 2) {
        addArith(item, {
          kind: "muldiv",
          expression: show(item),
          args: muldivArgs,
          rounding: MULDIV_METHODS[method],
          state_refs: collectStateNames(item, input.states).length ? collectStateNames(item, input.states) : undefined,
          constants: collectLiterals(item).length ? collectLiterals(item) : undefined,
          precision_hint: (() => {
            const hints = collectLiterals(item).map(precisionHint).filter((h): h is number => h !== undefined)
            return hints.length === 1 ? hints[0] : undefined
          })(),
        })
      }
    }

    const target = targetName(callExpr.expression)
    const target_contract = contractFromType(callExpr.expression)
    const lowLevel =
      method === "delegatecall"
        ? "delegatecall"
        : method === "staticcall"
          ? "staticcall"
          : method === "call"
            ? "low-level"
            : method === "transfer" || method === "send"
              ? "eth-transfer"
              : undefined
    const kind = (lowLevel ?? (target_contract || input.projectContracts.has(target ?? "") ? "external" : undefined)) as
      | CallKind
      | undefined
    const hasValue =
      expr.nodeType === "FunctionCallOptions" &&
      array(expr.names).some((name) => text(name) === "value")

    if (kind) {
      makeCall(calls, input.source, item, {
        method,
        kind,
        target,
        target_contract: target_contract ?? (target && input.projectContracts.has(target) ? target : undefined),
        value: hasValue || method === "transfer" || method === "send",
        call_args: argStrings.length ? argStrings : undefined,
      })
      addOp(item, {
        kind: "call",
        name: method,
        target,
        target_contract: target_contract ?? (target && input.projectContracts.has(target) ? target : undefined),
        call_kind: kind,
        call_args: argStrings.length ? argStrings : undefined,
      })
    }

    if (hasValue || method === "transfer" || method === "send") {
      makeValue(values, input.source, item, {
        asset: "eth",
        action: "send",
        target,
      })
      addOp(item, {
        kind: "value",
        name: method || "eth",
        asset: "eth",
        action: "send",
        target,
      })
    }

    const asset = valueAction(method)
    if (asset) {
      makeValue(values, input.source, item, {
        asset: asset.asset,
        action: asset.action,
        target,
      })
      addOp(item, {
        kind: "value",
        name: method,
        asset: asset.asset,
        action: asset.action,
        target,
      })
    }

    if (isAuth(item) && names.some((name) => /owner|admin|role|auth/i.test(name))) {
      makeAuth(auth, input.source, item, {
        kind: "check",
        label: show(item) || method || names.join("."),
      })
    }
  }

  walk(node, visit)

  const result = ops.sort((a, b) => a.offset - b.offset).map((item) => item.item)
  const seenReads = new Set<string>()
  const seenWrites = new Set<string>()
  result.forEach((item) => {
    if (item.kind === "read") seenReads.add(item.name)
    if (item.kind === "write") seenWrites.add(item.name)
  })
  return {
    operations: result,
    auth: auth.sort((a, b) => a.offset - b.offset).map((item) => item.item),
    calls: calls.sort((a, b) => a.offset - b.offset).map((item) => item.item),
    values: values.sort((a, b) => a.offset - b.offset).map((item) => item.item),
    arithmetic: arith.sort((a, b) => a.offset - b.offset).map((item) => item.item),
    reads: [...seenReads],
    writes: [...seenWrites],
    placeholder,
  }
}

function paramNames(node: AstNode) {
  return array(object(object(node).parameters).parameters)
    .map((item) => text(object(item).name) ?? "")
    .filter(Boolean)
}

function paramDecls(node: AstNode) {
  return array(object(object(node).parameters).parameters)
    .map((item) => ({
      id: num(object(item).id),
      name: text(object(item).name) ?? "",
      index: 0,
    }))
    .filter((item) => item.id !== undefined)
    .map((item, idx) => ({ ...item, index: idx }))
}

function collectTaints(
  expr: unknown,
  paramIds: Map<number, { name: string; index: number }>,
  stateIds: Set<number>,
  localTaints: Map<number, TaintEntry[]>,
): TaintEntry[] {
  const result = [] as TaintEntry[]
  walk(expr, (node) => {
    if (node.nodeType === "Identifier") {
      const ref = num(object(node).referencedDeclaration)
      if (ref === undefined) return
      const param = paramIds.get(ref)
      if (param) {
        result.push({ kind: "parameter", name: param.name, param_index: param.index })
        return
      }
      if (stateIds.has(ref)) {
        result.push({ kind: "storage", name: text(node.name) ?? "state" })
        return
      }
      const local = localTaints.get(ref)
      if (local) result.push(...local)
      return
    }
    if (node.nodeType === "MemberAccess") {
      const inner = object(node.expression)
      if (inner.nodeType === "Identifier") {
        const base = text(inner.name)
        const member = text(object(node).memberName)
        if (base === "msg" && member === "sender") {
          result.push({ kind: "msg.sender", name: "msg.sender" })
          return false
        }
        if (base === "msg" && member === "value") {
          result.push({ kind: "msg.value", name: "msg.value" })
          return false
        }
        if (base === "msg" && member === "data") {
          result.push({ kind: "calldata", name: "msg.data" })
          return false
        }
        if (base === "tx" && member === "origin") {
          result.push({ kind: "tx.origin", name: "tx.origin" })
          return false
        }
        if (base === "block") {
          result.push({ kind: "block", name: `block.${member}` })
          return false
        }
      }
    }
    if (node.nodeType === "FunctionCall") {
      const callExpr = object(node.expression)
      if (callExpr.nodeType === "MemberAccess") {
        const method = text(callExpr.memberName) ?? ""
        const target = object(callExpr.expression)
        if (target.nodeType === "Identifier" && text(target.name) === "abi" && /^decode/.test(method)) {
          result.push({ kind: "calldata", name: `abi.${method}` })
          return false
        }
      }
      const calledExpr = callExpr.nodeType === "FunctionCallOptions" ? object(callExpr.expression) : callExpr
      if (calledExpr.nodeType === "MemberAccess") {
        const method = text(calledExpr.memberName) ?? ""
        if (["call", "staticcall", "delegatecall"].includes(method)) {
          result.push({ kind: "returndata", name: `${show(calledExpr.expression)}.${method}` })
          return false
        }
      }
    }
  })
  return dedup(result)
}

function dedup(entries: TaintEntry[]) {
  const seen = new Set<string>()
  return entries.filter((entry) => {
    const key = `${entry.kind}:${entry.name}:${entry.param_index ?? ""}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function taintAnalysis(
  fnNode: AstNode,
  operations: OperationIR[],
  stateIds: Set<number>,
  hasAuth: boolean,
) {
  const params = paramDecls(fnNode)
  const paramIds = new Map(params.map((p) => [p.id!, { name: p.name, index: p.index }]))
  const localTaints = new Map<number, TaintEntry[]>()

  // Map from identifier display name → taint entries (for string-based matching)
  const nameTaints = new Map<string, TaintEntry[]>()

  // Seed: parameter names
  params.forEach((p) => {
    if (p.name) nameTaints.set(p.name, [{ kind: "parameter", name: p.name, param_index: p.index }])
  })

  // Walk body to propagate taints through local variable assignments
  // and collect all identifier names that reference tainted declarations
  const body = object(fnNode).body
  walk(body, (node) => {
    // Track every Identifier that references a tainted declaration
    if (node.nodeType === "Identifier") {
      const ref = num(object(node).referencedDeclaration)
      const displayName = text(node.name)
      if (ref === undefined || !displayName) return
      const param = paramIds.get(ref)
      if (param) {
        nameTaints.set(displayName, [{ kind: "parameter", name: param.name, param_index: param.index }])
        return
      }
      const local = localTaints.get(ref)
      if (local) nameTaints.set(displayName, local)
      return
    }

    // VariableDeclarationStatement: let x = expr
    if (node.nodeType === "VariableDeclarationStatement") {
      const decls = array(object(node).declarations)
      const init = object(node).initialValue
      if (!init) return
      const taints = collectTaints(init, paramIds, stateIds, localTaints)
      if (!taints.length) return
      decls.forEach((decl) => {
        const id = num(object(decl).id)
        const declName = text(object(decl).name)
        if (id !== undefined) localTaints.set(id, taints)
        if (declName) nameTaints.set(declName, taints)
      })
      return
    }
    // Assignment: x = expr
    if (node.nodeType === "Assignment") {
      const lhs = object(object(node).leftHandSide)
      const rhs = object(node).rightHandSide
      const taints = collectTaints(rhs, paramIds, stateIds, localTaints)
      if (!taints.length) return
      if (lhs.nodeType === "Identifier") {
        const ref = num(lhs.referencedDeclaration)
        const lhsName = text(lhs.name)
        if (ref !== undefined && !paramIds.has(ref) && !stateIds.has(ref)) {
          localTaints.set(ref, taints)
        }
        if (lhsName) nameTaints.set(lhsName, taints)
      }
      return
    }
  })

  // Build the string-matcher function using all collected name→taint mappings
  const matchExpr = (expr: string) => {
    const result = [] as TaintEntry[]
    nameTaints.forEach((taints, name) => {
      if (exprContainsName(expr, name)) result.push(...taints)
    })
    if (exprContainsName(expr, "msg.sender")) result.push({ kind: "msg.sender", name: "msg.sender" })
    if (exprContainsName(expr, "msg.value")) result.push({ kind: "msg.value", name: "msg.value" })
    if (exprContainsName(expr, "msg.data")) result.push({ kind: "calldata", name: "msg.data" })
    if (exprContainsName(expr, "tx.origin")) result.push({ kind: "tx.origin", name: "tx.origin" })
    if (/\bblock\.\w+/.test(expr)) result.push({ kind: "block", name: "block.*" })
    return dedup(result)
  }

  // Check each operation
  const taints = [] as TaintIR[]
  operations.forEach((op, idx) => {
    if (op.cross_contract) return

    if (op.kind === "write" && op.value_expr) {
      const sources = matchExpr(op.value_expr)
      if (sources.length) {
        taints.push({ op_index: idx, field: "value_expr", sources, guarded: hasAuth })
      }
    }

    if (op.kind === "call" && op.target) {
      const sources = matchExpr(op.target)
      if (sources.length) {
        taints.push({ op_index: idx, field: "target", sources, guarded: hasAuth })
      }
    }

    if (op.kind === "call" && op.call_args?.length) {
      op.call_args.forEach((arg, argIdx) => {
        const sources = matchExpr(arg)
        if (sources.length) {
          taints.push({ op_index: idx, field: "call_arg", field_index: argIdx, sources, guarded: hasAuth })
        }
      })
    }

    if (op.kind === "value" && op.target) {
      const sources = matchExpr(op.target)
      if (sources.length) {
        taints.push({ op_index: idx, field: "target", sources, guarded: hasAuth })
      }
    }

    if (op.kind === "value" && op.value_expr) {
      const sources = matchExpr(op.value_expr)
      if (sources.length) {
        taints.push({ op_index: idx, field: "value_expr", sources, guarded: hasAuth })
      }
    }
  })

  return taints
}

function exprContainsName(expr: string, name: string) {
  if (!name || !expr) return false
  const idx = expr.indexOf(name)
  if (idx < 0) return false
  const before = idx > 0 ? expr[idx - 1] : " "
  const after = idx + name.length < expr.length ? expr[idx + name.length] : " "
  const wordChar = /[a-zA-Z0-9_]/
  if (before && wordChar.test(before)) return false
  if (after && wordChar.test(after)) return false
  return true
}

function slotBytes(bytes?: string) {
  const value = Number(bytes ?? 0)
  return Number.isNaN(value) ? undefined : value
}

function stateVar(source: SourceInfo, node: AstNode): StateVarIR {
  return {
    id: num(node.id) ?? -1,
    name: text(node.name) ?? "",
    type: typeName(object(node).typeName as AstNode),
    visibility: text(object(node).visibility) ?? "internal",
    constant: object(node).constant === true,
    immutable: object(node).mutability === "immutable",
    location: location(source, node),
  }
}

function functionKind(node: AstNode): FunctionIR["kind"] {
  const kind = text(object(node).kind) ?? "function"
  if (kind === "constructor" || kind === "fallback" || kind === "receive") return kind
  return "function"
}

function proxyHints(input: {
  contract: string
  bases: string[]
  functions: string[]
  storage: StorageSlotIR[]
  fallback_delegatecall: boolean
}) {
  const result = [] as ProxyIR[]
  const bases = [input.contract, ...input.bases].join(" ")
  if (/UUPS|ERC1967/i.test(bases)) {
    result.push({
      kind: "uups",
      note: "UUPS/1967 inheritance detected",
    })
  }
  if (/TransparentUpgradeableProxy|ProxyAdmin/i.test(bases)) {
    result.push({
      kind: "transparent",
      note: "transparent proxy inheritance detected",
    })
  }
  if (/Beacon/i.test(bases)) {
    result.push({
      kind: "beacon",
      note: "beacon upgrade pattern detected",
    })
  }
  if (/Upgradeable|Initializable/i.test(bases) && !result.some((item) => item.kind === "upgradeable")) {
    result.push({
      kind: "upgradeable",
      note: "upgradeable inheritance detected",
    })
  }
  if (input.fallback_delegatecall) {
    result.push({
      kind: "delegate-proxy",
      note: "fallback delegatecall detected",
    })
  }
  if (input.storage.some((slot) => /__gap|gap/.test(slot.label))) {
    result.push({
      kind: "upgradeable",
      note: "storage gap present",
    })
  }
  if (input.functions.some((name) => /upgradeTo|upgradeToAndCall/i.test(name))) {
    result.push({
      kind: "upgradeable",
      note: "upgrade entrypoint detected",
    })
  }
  return result
}

function fallbackDelegatecall(functions: FunctionIR[]) {
  return functions.some(
    (fn) =>
      fn.kind === "fallback" && fn.calls.some((call) => call.kind === "delegatecall"),
  )
}

function unique<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const value = key(item)
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

function resolveContract(build: BuildInfo, contract: BuildInfo["contracts"][number]) {
  const source = build.sources[contract.source]
  if (!source) return
  return contractNodes(source).find((node) => text(node.name) === contract.name)
}

// a plain module-level fingerprint cache (was Instance.state — a session-scoped cache); analysis is capture-time + rare,
// so a per-process memo is enough and carries no platform state.
const cache: { key: string; value: Promise<ProjectIR> | undefined } = { key: "", value: undefined }

export async function analyzeProject(directory: string): Promise<ProjectIR> {
  const project = await detectProject(directory)
  const key = await fingerprint(project)
  const state = cache
  if (state.key === key && state.value) return state.value

  state.key = key
  state.value = (async () => {
    const build = await loadBuild(project)
    const resolved = build.contracts
      .map((contract) => {
        const node = resolveContract(build, contract)
        if (!node) return
        const source = build.sources[contract.source]
        if (!source) return
        return {
          build: contract,
          node,
          source,
          states: stateNodes(node),
          functions: functionNodes(node),
          modifiers: modifierNodes(node),
          events: eventNames(node),
          errors: errorNames(node),
        }
      })
      .filter(Boolean) as Array<{
      build: BuildInfo["contracts"][number]
      node: AstNode
      source: SourceInfo
      states: AstNode[]
      functions: AstNode[]
      modifiers: AstNode[]
      events: string[]
      errors: string[]
    }>

    const nodeNames = new Map<number, string>()
    resolved.forEach((item) => {
      const id = num(item.node.id)
      if (id !== undefined) nodeNames.set(id, item.build.name)
    })

    const functionNames = new Map<string, Set<string>>()
    resolved.forEach((item) => {
      functionNames.set(
        item.build.name,
        new Set(
          item.functions
            .map((fn) => text(fn.name) || (text(object(fn).kind) === "constructor" ? "constructor" : ""))
            .filter(Boolean) as string[],
        ),
      )
    })

    const contractStates = new Map<string, StateVarIR[]>()
    const stateIds = new Map<number, string>()
    resolved.forEach((item) => {
      const states = item.states.map((node) => stateVar(item.source, node))
      contractStates.set(item.build.name, states)
      states.forEach((state) => {
        stateIds.set(state.id, state.name)
      })
    })

    const contracts = resolved.map((item) => {
      const bases = array(object(item.node).baseContracts).map((base) => baseName(base as AstNode)).filter(Boolean) as string[]
      const linearized_bases = array(object(item.node).linearizedBaseContracts)
        .map((id) => nodeNames.get(Number(id)))
        .filter(Boolean) as string[]
      const chain = linearized_bases.length ? linearized_bases : [item.build.name, ...bases]
      const inheritedStates = new Map<number, string>()
      chain.forEach((name) => {
        contractStates.get(name)?.forEach((state) => inheritedStates.set(state.id, state.name))
      })
      const internal = new Set<string>()
      chain.forEach((name) => {
        functionNames.get(name)?.forEach((fn) => internal.add(fn))
      })
      const projectContracts = new Set(resolved.map((entry) => entry.build.name))

      const modifiers = item.modifiers.map((node) => {
        const name = text(node.name) ?? ""
        const data = collect(node, {
          source: item.source,
          contract: item.build.name,
          projectContracts,
          internal,
          states: inheritedStates,
        })
        const split = data.placeholder === undefined ? undefined : lineNumber(lineOffsets(item.source.content), data.placeholder)
        const before = split === undefined ? data.operations : data.operations.filter((op) => (op.line ?? Number.MAX_SAFE_INTEGER) <= split)
        const after = split === undefined ? [] : data.operations.filter((op) => (op.line ?? 0) > split)
        return {
          id: `${item.build.name}.${name}`,
          name,
          location: location(item.source, node),
          operations: data.operations,
          checks: [
            ...data.auth,
            ...(/only|owner|admin|role|auth/i.test(name)
              ? [
                  {
                    kind: "modifier" as const,
                    label: name,
                    line: location(item.source, node).line,
                  },
                ]
              : []),
          ],
          before,
          after,
        } satisfies ModifierIR
      })

      const functions = item.functions.map((node) => {
        const kind = functionKind(node)
        const name = kind === "function" ? text(node.name) ?? "" : kind
        const parameters = paramTypes(object(node).parameters as AstNode)
        const signature = kind === "function" ? `${name}(${parameters.join(",")})` : name
        const data = collect(object(node).body as AstNode | undefined, {
          source: item.source,
          contract: item.build.name,
          projectContracts,
          internal,
          states: inheritedStates,
        })
        const modifierNames = array(object(node).modifiers)
          .map((entry) => modifierName(entry as AstNode))
          .filter(Boolean) as string[]
        const modifierChecks = modifierNames
          .map((name) => modifiers.find((item) => item.name === name))
          .filter(Boolean) as ModifierIR[]
        const expanded = modifierChecks.flatMap((item) => item.before).concat(data.operations, modifierChecks.flatMap((item) => item.after))
        const reads = new Set(data.reads)
        const writes = new Set(data.writes)
        expanded.forEach((item) => {
          if (item.kind === "read") reads.add(item.name)
          if (item.kind === "write") writes.add(item.name)
        })
        const auth = [
          ...modifierChecks.flatMap((item) => item.checks),
          ...data.auth,
        ]
        if (modifierNames.some((name) => /only|owner|admin|role|auth/i.test(name))) {
          modifierNames
            .filter((name) => /only|owner|admin|role|auth/i.test(name))
            .forEach((name) =>
              auth.push({
                kind: "modifier",
                label: name,
                line: location(item.source, node).line,
              }),
            )
        }

        const taints = taintAnalysis(node, expanded, new Set(inheritedStates.keys()), auth.length > 0)

        return {
          id: `${item.build.name}.${signature}`,
          name,
          kind,
          signature,
          selector: methodSelector(item.build.method_ids, signature, name),
          visibility: (text(object(node).visibility) ?? "internal") as FunctionIR["visibility"],
          mutability: (text(object(node).stateMutability) ?? "nonpayable") as FunctionIR["mutability"],
          payable: text(object(node).stateMutability) === "payable",
          modifiers: modifierNames,
          parameters,
          parameter_names: paramNames(node),
          returns: returns(object(node).returnParameters as AstNode),
          reads: [...reads],
          writes: [...writes],
          calls: data.calls,
          auth,
          values: data.values,
          operations: expanded,
          taints,
          arithmetic: data.arithmetic,
          location: location(item.source, node),
        } satisfies FunctionIR
      })

      const storage = item.build.storage.storage.map((slot) => {
        const meta = item.build.storage.types[slot.type]
        return {
          label: slot.label,
          slot: slot.slot,
          offset: slot.offset,
          type: meta?.label ?? slot.type,
          bytes: slotBytes(meta?.numberOfBytes),
          encoding: meta?.encoding,
          contract: slot.contract,
        } satisfies StorageSlotIR
      })

      const fallback_delegatecall = fallbackDelegatecall(functions)
      const proxies = proxyHints({
        contract: item.build.name,
        bases,
        functions: functions.map((fn) => fn.name),
        storage,
        fallback_delegatecall,
      })

      return {
        id: item.build.id,
        node_id: num(item.node.id) ?? -1,
        name: item.build.name,
        kind: contractType(item.node),
        source: item.build.source,
        full: item.build.full,
        bases,
        linearized_bases: chain,
        functions,
        modifiers,
        state: contractStates.get(item.build.name) ?? [],
        storage,
        events: item.events,
        errors: item.errors,
        proxies,
        initializers: functions
          .map((fn) => fn.name)
          .filter((name) => /initialize|reinitialize/i.test(name)),
        fallback_delegatecall,
        location: location(item.source, item.node),
      } satisfies ContractIR
    })

    const lookup = new Map(contracts.map((contract) => [contract.name, contract]))
    const fns = new Map(
      contracts.flatMap((contract) =>
        contract.functions.map((fn) => [`${contract.name}:${fn.name}`, fn] as const),
      ),
    )
    const cache = new Map<string, FunctionIR>()

    const resolve = (contract: ContractIR, method: string) =>
      [contract.name, ...contract.linearized_bases]
        .filter((name, idx, list) => list.indexOf(name) === idx)
        .map((name) => fns.get(`${name}:${method}`))
        .find(Boolean)

    const resolveExternal = (targetContract: string | undefined, method: string) => {
      if (!targetContract) return
      const target = lookup.get(targetContract)
      if (!target) return
      return target.functions.find((fn) => fn.name === method)
    }

    const tagCrossContract = (ops: OperationIR[], contract: string, fn: string, kind: CallKind): OperationIR[] =>
      ops.map((op) => ({
        ...op,
        cross_contract: op.cross_contract ?? { contract, function: fn, kind },
      }))

    const CROSS_CONTRACT_DEPTH = 3

    const expand = (contract: ContractIR, fn: FunctionIR, seen = new Set<string>(), crossDepth = 0): FunctionIR => {
      const key = `${contract.name}:${fn.id}`
      if (cache.has(key)) return cache.get(key)!
      if (seen.has(key)) return fn

      const next = new Set(seen).add(key)
      const ops = [] as OperationIR[]
      const nested = fn.calls
        .filter((call) => call.kind === "internal")
        .map((call) => ({
          call,
          fn: resolve(contract, call.method),
        }))

      fn.operations.forEach((op) => {
        ops.push(op)
        if (op.kind !== "call") return

        if (op.call_kind === "internal") {
          const inner = resolve(contract, op.name)
          if (!inner) return
          ops.push(...expand(contract, inner, next, crossDepth).operations)
          return
        }

        if (crossDepth >= CROSS_CONTRACT_DEPTH) return
        if (op.call_kind === "low-level" || op.call_kind === "eth-transfer") return
        const externalFn = resolveExternal(op.target_contract, op.name)
        if (!externalFn) return
        const externalContract = lookup.get(op.target_contract!)!
        const expanded = expand(externalContract, externalFn, next, crossDepth + 1)
        ops.push(...tagCrossContract(expanded.operations, op.target_contract!, op.name, op.call_kind!))
      })

      const summaries = nested
        .map((item) => item.fn && expand(contract, item.fn, next, crossDepth))
        .filter(Boolean) as FunctionIR[]
      const result = {
        ...fn,
        operations: ops,
        reads: [...new Set(ops.filter((item) => item.kind === "read").map((item) => item.name))],
        writes: [...new Set(ops.filter((item) => item.kind === "write").map((item) => item.name))],
        calls: unique(
          [fn.calls, ...summaries.map((item) => item.calls)].flat(),
          (item) => [item.kind, item.method, item.target_contract ?? item.target ?? "", item.line ?? "", item.value ? 1 : 0].join(":"),
        ),
        auth: unique(
          [fn.auth, ...summaries.map((item) => item.auth)].flat(),
          (item) => [item.kind, item.label].join(":"),
        ),
        values: unique(
          [fn.values, ...summaries.map((item) => item.values)].flat(),
          (item) => [item.asset, item.action, item.target ?? "", item.line ?? ""].join(":"),
        ),
      } satisfies FunctionIR
      cache.set(key, result)
      return result
    }

    const expanded = contracts.map((contract) => {
      const functions = contract.functions.map((fn) => expand(contract, fn))
      return {
        ...contract,
        functions,
        fallback_delegatecall: fallbackDelegatecall(functions),
      } satisfies ContractIR
    })

    return {
      project,
      sources: build.sources,
      contracts: expanded,
    } satisfies ProjectIR
  })()

  return state.value
}

export function findContractsByPath(ir: ProjectIR, file: string) {
  const full = file.replaceAll("\\", "/")
  return ir.contracts.filter((contract) => contract.full.replaceAll("\\", "/") === full || contract.source === full)
}

export function findContract(ir: ProjectIR, input: { name?: string; file?: string }) {
  if (input.file) {
    const matches = findContractsByPath(ir, input.file)
    if (!input.name) return matches[0]
    return matches.find((contract) => contract.name === input.name)
  }
  if (!input.name) return
  return ir.contracts.find((contract) => contract.name === input.name)
}

function classifyCallSignal(call: CallIR, fn: FunctionIR): ExternalCallSignal {
  if (call.kind === "low-level" || call.kind === "delegatecall" || call.kind === "staticcall") return "low_level_call"
  if (isOracleRead(call.method)) return "oracle_read"
  return "interface_call"
}

function determineControllability(call: CallIR, fn: FunctionIR, contract: ContractIR): Controllability {
  const target = call.target
  if (!target) return "user_controlled"

  if (/^0x[0-9a-fA-F]{40}$/.test(target)) return "hardcoded"

  const isParam = fn.parameter_names.some((p) => target.includes(p))
  if (isParam) return "user_controlled"

  const stateVar = contract.state.find((s) => target.includes(s.name))
  if (stateVar) {
    if (stateVar.immutable || stateVar.constant) return "hardcoded"
    const setters = contract.functions.filter(
      (f) => f.writes.includes(stateVar.name) && f.name !== "constructor" && f.kind !== "constructor",
    )
    const allGated = setters.every((f) => f.auth.length > 0)
    if (allGated && setters.length > 0) return "owner_controlled"
    if (setters.length === 0) return "hardcoded"
    return "user_controlled"
  }

  if (fn.auth.length > 0) return "owner_controlled"
  return "user_controlled"
}

function isReturnChecked(call: CallIR, fn: FunctionIR): boolean {
  const callIdx = fn.operations.findIndex(
    (op) => op.kind === "call" && op.name === call.method && op.line === call.line,
  )
  if (callIdx < 0) return false
  return fn.operations.slice(callIdx + 1, callIdx + 4).some((op) => op.kind === "check")
}

export function discoverExternalCalls(ir: ProjectIR): ExternalCallRegistry {
  const calls: ExternalCallIR[] = []
  const contractNames = new Set(ir.contracts.map((c) => c.name))
  const hooks: string[] = []

  ir.contracts.forEach((contract) => {
    if (contract.kind === "interface" || contract.kind === "library") return

    contract.functions.forEach((fn) => {
      const hookDesc = isCallbackHook(fn.name)
      if (hookDesc) {
        hooks.push(`${contract.name}.${fn.name}: ${hookDesc}`)
        calls.push({
          signal: "callback_hook",
          callee_expr: `${contract.name}.${fn.name}`,
          controllability: "user_controlled",
          source_function: fn.name,
          source_contract: contract.name,
          line: fn.location.line,
          file: contract.source,
          return_checked: false,
          call_kind: "external",
        })
      }

      fn.calls.forEach((call) => {
        if (call.kind === "internal") return
        const targetDef = call.target_contract ? ir.contracts.find((c) => c.name === call.target_contract) : undefined
        if (targetDef && targetDef.kind === "contract") return

        const signal = classifyCallSignal(call, fn)
        const controllability = determineControllability(call, fn, contract)
        const checked = isReturnChecked(call, fn)
        const callee = call.target ? `${call.target}.${call.method}` : call.method

        calls.push({
          signal,
          selector: call.method === call.method ? undefined : call.method,
          callee_expr: callee,
          callee_var: call.target,
          controllability,
          interface_type: call.target_contract,
          source_function: fn.name,
          source_contract: contract.name,
          line: call.line,
          file: contract.source,
          return_checked: checked,
          call_kind: call.kind,
          call_args: call.call_args,
        })
      })
    })
  })

  const externalContracts = [...new Set(calls.map((c) => c.callee_var ?? c.interface_type).filter(Boolean))] as string[]

  return {
    calls,
    contracts: externalContracts,
    callback_hooks: hooks,
  }
}
