/**
 * ORGΛNON — the deterministic contract-analysis engine (Contract-Truth Phase 2, D9), extracted copy-into-tree from the
 * Sentinel `src/solidity` IR + its LLM-free tools, OWNED in-tree (nothing imports `@solidity-sentinel/*` or OpenCode).
 *
 * Public surface:
 *   · the ContractIR types (from `./ir`)
 *   · `analyzeProject(projectRoot)` — build the ProjectIR from a Foundry build (the OPTIONAL toolchain seam)
 *   · `findContract` / `findContractsByPath` / `discoverExternalCalls` — IR query helpers
 *   · `contractFacts(ir)` — the deterministic six-category structural fact extractor (feeds the contract-risk sub-axis)
 *
 * There is NO model here (X-DETERM). The facts are compiler-output + ORGΛNON's own pure rules; the tiering is `subaxis.ts`.
 */
export type {
  ProjectIR,
  ContractIR,
  FunctionIR,
  ModifierIR,
  StateVarIR,
  StorageSlotIR,
  ProxyIR,
  CallIR,
  CallKind,
  AuthIR,
  ValueIR,
  OperationIR,
  Location,
  ProjectInfo,
  ExternalCallRegistry,
} from "./ir"
export { analyzeProject, findContract, findContractsByPath, discoverExternalCalls } from "./analyze"
export { contractFacts, contractFactsForContract } from "./facts"
export type { StructuralFacts, ContractFinding, FlagCategory } from "./facts"
// the deterministic sub-axis rule (Phase 3) + the capture-time / render-time seam
export { contractSubAxis, CONTRACT_SCOPE } from "./subaxis"
export type { ContractSubAxis, ContractTier, BuildProvenance } from "./subaxis"
export { resolveContractSubAxis, loadRegistry, _resetRegistryCache, contractCoverage } from "./registry"
export type { ContractCapture, ContractRegistry } from "./registry"
export { captureContractAnalysis } from "./capture"
// the verified-build pipeline (Build-Provenance): Operator-gated ingestion + deterministic build-capture
export { ContractIngest } from "./ingest"
export { BuildCapture } from "./buildcapture"
