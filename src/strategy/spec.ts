import z from "zod"

// Organon StrategySpec (blueprint Appendix H / Phase 4): the typed representation of
// an RWA allocation strategy. An RWA strategy is an allocation across yield-bearing
// legs that accrues yield and rebalances on a trigger — NOT a trade-signal sequence
// (B.2). Do not add fields beyond Appendix H.

export const StrategyLeg = z.object({
  id: z.string(),
  weight: z.number().min(0).max(1),
})

export const Rebalance = z.object({
  trigger: z.enum(["monthly", "quarterly", "drift"]),
  driftBps: z.number().optional(),
})

export const Policy = z.enum(["static", "yield-rotation", "constrained-carry", "barbell", "peg-defensive"])

export const Constraints = z.object({
  maxWeightPerLeg: z.number().min(0).max(1).optional(),
  maxWeightPerIssuer: z.number().min(0).max(1).optional(),
  maxWeightPerAssetClass: z.number().min(0).max(1).optional(),
  minLegConfidenceTier: z.enum(["low", "medium", "high"]).optional(),
  pegExitBps: z.number().optional(),
  minLegTvlUsd: z.number().optional(),
})

export const StrategySpec = z.object({
  family: z.literal("rwa-allocation"),
  legs: z.array(StrategyLeg),
  rebalance: Rebalance,
  policy: Policy,
  constraints: Constraints,
})

export type StrategySpec = z.infer<typeof StrategySpec>
export type Policy = z.infer<typeof Policy>
