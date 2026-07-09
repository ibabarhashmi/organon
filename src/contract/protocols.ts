export type ProtocolEntry = {
  name: string
  category: string
  interfaces: string[]
  selectors: Record<string, string>
  behavior: string
  failure_modes: string[]
  guarantees: string[]
}

export const KNOWN_PROTOCOLS: ProtocolEntry[] = [
  {
    name: "Chainlink Price Feed",
    category: "oracle",
    interfaces: ["AggregatorV3Interface", "AggregatorInterface", "AggregatorV2V3Interface"],
    selectors: {
      "0xfeaf968c": "latestRoundData()",
      "0x50d25bcd": "latestAnswer()",
      "0x668a0f02": "latestRound()",
      "0x9a6fc8f5": "getRoundData(uint80)",
      "0x313ce567": "decimals()",
      "0x7284e416": "description()",
    },
    behavior:
      "Returns median price from N oracle nodes. latestRoundData() returns (roundId, answer, startedAt, updatedAt, answeredInRound). Decimals vary by pair (8 for USD, 18 for ETH).",
    failure_modes: [
      "Returns stale data if L2 sequencer is down — updatedAt can be arbitrarily old",
      "Returns 0 for deprecated feeds",
      "answeredInRound < roundId indicates stale round",
      "No revert on stale data — returns last known values silently",
      "Heartbeat varies per feed (1h, 24h) — must check per deployment",
      "Multi-hop derived feeds compound staleness risk",
    ],
    guarantees: [
      "View function — no state changes or reentrancy",
      "Answer is median of N independent node reports",
      "Feed metadata (decimals, description) is immutable after deployment",
    ],
  },
  {
    name: "Chainlink L2 Sequencer Uptime Feed",
    category: "oracle",
    interfaces: ["AggregatorV3Interface"],
    selectors: { "0xfeaf968c": "latestRoundData()" },
    behavior:
      "Returns sequencer status: answer=0 means up, answer=1 means down. updatedAt is the timestamp of the last status change.",
    failure_modes: [
      "If not checked, oracle prices on L2 can be consumed during sequencer outage",
      "Grace period after sequencer restart must be enforced to avoid stale-price exploitation",
    ],
    guarantees: ["View function — no side effects"],
  },
  {
    name: "Uniswap V2 Pair",
    category: "dex",
    interfaces: ["IUniswapV2Pair"],
    selectors: {
      "0x0902f1ac": "getReserves()",
      "0x022c0d9f": "swap(uint256,uint256,address,bytes)",
      "0x6a627842": "mint(address)",
      "0xbc25cf77": "burn(address)",
      "0xd21220a7": "token1()",
      "0x0dfe1681": "token0()",
      "0x89afcb44": "burn(address)",
    },
    behavior:
      "Constant-product AMM. getReserves() returns (reserve0, reserve1, blockTimestampLast). swap() transfers tokens with x*y=k invariant.",
    failure_modes: [
      "getReserves() is spot price — manipulable in same block via flash swaps",
      "First depositor can inflate share price via donation attack",
      "Callback in swap(data) enables flash swaps — reentrancy surface",
      "Price calculated from reserves is trivially manipulable with flash loans",
    ],
    guarantees: [
      "k (product of reserves) never decreases within a swap",
      "Reserves are updated at end of swap atomically",
    ],
  },
  {
    name: "Uniswap V2 Router",
    category: "dex",
    interfaces: ["IUniswapV2Router01", "IUniswapV2Router02"],
    selectors: {
      "0x38ed1739": "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
      "0xd06ca61f": "getAmountsOut(uint256,address[])",
      "0x1f00ca74": "getAmountsIn(uint256,address[])",
      "0xe8e33700": "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
    },
    behavior: "Routing layer for Uniswap V2 — handles multi-hop swaps, deadline enforcement, and slippage checks.",
    failure_modes: [
      "getAmountsOut/getAmountsIn use spot reserves — sandwich-attackable",
      "Expired deadline param can be set to type(uint256).max, disabling protection",
      "amountOutMin=0 disables slippage protection entirely",
    ],
    guarantees: ["Reverts if deadline has passed", "Reverts if output amount < amountOutMin"],
  },
  {
    name: "Uniswap V3 Pool",
    category: "dex",
    interfaces: ["IUniswapV3Pool", "IUniswapV3PoolState"],
    selectors: {
      "0x3850c7bd": "slot0()",
      "0x128acb08": "swap(address,bool,int256,uint160,bytes)",
      "0x490e6cbc": "flash(address,uint256,uint256,bytes)",
      "0x1a686502": "liquidity()",
      "0x252c09d7": "observations(uint256)",
      "0x883bdbfd": "observe(uint32[])",
    },
    behavior:
      "Concentrated-liquidity AMM. slot0() returns (sqrtPriceX96, tick, observationIndex, ...). observe() returns time-weighted ticks for TWAP computation.",
    failure_modes: [
      "slot0().sqrtPriceX96 is SPOT price — manipulable in same block",
      "TWAP from observe() can lag during high volatility",
      "flash() callback is reentrancy surface — uniswapV3FlashCallback",
      "swap() callback is reentrancy surface — uniswapV3SwapCallback",
      "Tick manipulation via large flash-swap + small liquidity",
    ],
    guarantees: [
      "TWAP via observe() is manipulation-resistant over multiple blocks",
      "Flash loan must repay in same transaction or revert",
    ],
  },
  {
    name: "Aave V2 Lending Pool",
    category: "lending",
    interfaces: ["ILendingPool", "ILendingPoolV2"],
    selectors: {
      "0xe8eda9df": "deposit(address,uint256,address,uint16)",
      "0x69328dec": "withdraw(address,uint256,address)",
      "0xa415bcad": "borrow(address,uint256,uint256,uint16,address)",
      "0x573ade81": "repay(address,uint256,uint256,address)",
      "0xab9c4b5d": "flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)",
      "0x35ea6a75": "getReserveData(address)",
    },
    behavior:
      "Pooled lending. Users deposit collateral, borrow against it. Flash loans available with 0.09% fee. Interest rates are variable or stable.",
    failure_modes: [
      "Flash loan callback (executeOperation) is reentrancy surface",
      "getReserveData uses stored rates that may be stale within a block",
      "Liquidation thresholds can change via governance — trust assumption on Aave governance",
      "aToken rebasing can cause accounting issues in wrappers",
    ],
    guarantees: [
      "Flash loan reverts if not repaid + fee in same tx",
      "Health factor < 1 triggers liquidation eligibility",
    ],
  },
  {
    name: "Aave V3 Pool",
    category: "lending",
    interfaces: ["IPool", "IPoolV3"],
    selectors: {
      "0x617ba037": "supply(address,uint256,address,uint16)",
      "0x69328dec": "withdraw(address,uint256,address)",
      "0xa415bcad": "borrow(address,uint256,uint256,uint16,address)",
      "0x573ade81": "repay(address,uint256,uint256,address)",
      "0x42b0b77c": "flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)",
      "0x35ea6a75": "getReserveData(address)",
    },
    behavior: "Aave V3 pooled lending with efficiency mode, isolation mode, and cross-chain portals.",
    failure_modes: [
      "Flash loan callback (executeOperation) is reentrancy surface",
      "E-mode can increase LTV beyond normal — risk amplification",
      "Supply/borrow caps can be changed by governance",
      "Oracle price feeds are Chainlink-dependent — inherits Chainlink failure modes",
    ],
    guarantees: [
      "Flash loan reverts if not repaid + fee in same tx",
      "Isolation mode caps single-asset exposure",
    ],
  },
  {
    name: "Compound V2 cToken",
    category: "lending",
    interfaces: ["CToken", "CErc20", "CEther"],
    selectors: {
      "0xa0712d68": "mint(uint256)",
      "0xdb006a75": "redeem(uint256)",
      "0x852a12e3": "redeemUnderlying(uint256)",
      "0xc5ebeaec": "borrow(uint256)",
      "0x0e752702": "repayBorrow(uint256)",
      "0xbd6d894d": "exchangeRateCurrent()",
      "0x182df0f5": "exchangeRateStored()",
    },
    behavior: "Tokenized lending positions. Exchange rate increases over time as interest accrues. mint/redeem convert between cToken and underlying.",
    failure_modes: [
      "exchangeRateStored() can be stale — use exchangeRateCurrent() for accurate rate",
      "First depositor can inflate exchange rate (donation attack on empty market)",
      "mint() return value indicates error — does NOT revert on failure (returns error code)",
      "ERC-777 underlying enables reentrancy through tokensReceived hook",
    ],
    guarantees: ["Exchange rate is monotonically non-decreasing under normal operation"],
  },
  {
    name: "Compound V3 Comet",
    category: "lending",
    interfaces: ["IComet", "CometMainInterface"],
    selectors: {
      "0xf2b9fdb8": "supply(address,uint256)",
      "0xf3fef3a3": "withdraw(address,uint256)",
      "0x414b3812": "getPrice(address)",
      "0xc55dae63": "baseToken()",
    },
    behavior: "Single-borrowable-asset lending market. Suppliers earn interest on base asset, borrowers provide collateral.",
    failure_modes: [
      "getPrice() depends on Chainlink feeds — inherits staleness risks",
      "Collateral assets can be seized in liquidation without user consent",
    ],
    guarantees: ["Collateral and borrowing are isolated per Comet deployment"],
  },
  {
    name: "OpenZeppelin ERC20",
    category: "token",
    interfaces: ["IERC20", "IERC20Metadata", "ERC20"],
    selectors: {
      "0xa9059cbb": "transfer(address,uint256)",
      "0x23b872dd": "transferFrom(address,address,uint256)",
      "0x095ea7b3": "approve(address,uint256)",
      "0x70a08231": "balanceOf(address)",
      "0x18160ddd": "totalSupply()",
      "0xdd62ed3e": "allowance(address,address)",
    },
    behavior: "Standard fungible token. transfer/transferFrom move tokens, approve sets allowance.",
    failure_modes: [
      "Some tokens return false instead of reverting (non-standard — use SafeERC20)",
      "Some tokens have fee-on-transfer — amount received != amount sent",
      "Some tokens rebase — balanceOf changes without transfer",
      "Some tokens have blocklists — transfer can revert for blocked addresses",
      "approve() race condition if allowance already > 0",
      "Some tokens have max uint256 approval behavior variations",
      "Tokens with > 18 decimals or < 6 decimals can cause precision issues",
    ],
    guarantees: [
      "Standard ERC20: transfer/transferFrom revert on insufficient balance",
      "Allowance accounting is exact for standard implementations",
    ],
  },
  {
    name: "ERC-777 Token",
    category: "token",
    interfaces: ["IERC777", "IERC777Recipient", "IERC777Sender"],
    selectors: {
      "0x9bd9bbc6": "send(address,uint256,bytes)",
      "0xfe9d9303": "burn(uint256,bytes)",
      "0x959b8c3f": "registerRecipient(address)",
    },
    behavior: "Backward-compatible token standard with send/receive hooks via ERC-1820 registry.",
    failure_modes: [
      "tokensReceived hook on recipient is reentrancy surface on every transfer",
      "tokensToSend hook on sender fires before balance update",
      "ERC-1820 registry lookup adds gas overhead and external dependency",
    ],
    guarantees: ["Hooks fire atomically within send/transfer"],
  },
  {
    name: "ERC-721 NFT",
    category: "token",
    interfaces: ["IERC721", "IERC721Receiver"],
    selectors: {
      "0x42842e0e": "safeTransferFrom(address,address,uint256)",
      "0x23b872dd": "transferFrom(address,address,uint256)",
      "0x095ea7b3": "approve(address,uint256)",
      "0xa22cb465": "setApprovalForAll(address,bool)",
      "0x6352211e": "ownerOf(uint256)",
    },
    behavior: "Non-fungible token standard. safeTransferFrom calls onERC721Received on recipient.",
    failure_modes: [
      "safeTransferFrom callback (onERC721Received) is reentrancy surface",
      "transferFrom does NOT call onERC721Received — can send to contracts that can't handle NFTs",
      "Approval can be set to address(0) to clear — check approval state carefully",
    ],
    guarantees: ["Each token has exactly one owner", "ownerOf reverts for nonexistent tokens"],
  },
  {
    name: "ERC-1155 Multi-Token",
    category: "token",
    interfaces: ["IERC1155", "IERC1155Receiver"],
    selectors: {
      "0xf242432a": "safeTransferFrom(address,address,uint256,uint256,bytes)",
      "0x2eb2c2d6": "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
      "0x00fdd58e": "balanceOf(address,uint256)",
    },
    behavior: "Multi-token standard supporting both fungible and non-fungible tokens in one contract.",
    failure_modes: [
      "onERC1155Received callback is reentrancy surface on every safeTransfer",
      "onERC1155BatchReceived callback is reentrancy surface on batch transfers",
      "Batch operations can have different-length arrays — must validate",
    ],
    guarantees: ["Safe transfer reverts if recipient rejects (returns wrong selector)"],
  },
  {
    name: "ERC-4626 Tokenized Vault",
    category: "token",
    interfaces: ["IERC4626", "ERC4626"],
    selectors: {
      "0x6e553f65": "deposit(uint256,address)",
      "0xb460af94": "withdraw(uint256,address,address)",
      "0xba087652": "redeem(uint256,address,address)",
      "0xef8b30f7": "previewDeposit(uint256)",
      "0xb3d7f6b9": "previewMint(uint256)",
      "0x0a28a477": "previewRedeem(uint256)",
      "0x4cdad506": "previewWithdraw(uint256)",
      "0x07a2d13a": "convertToShares(uint256)",
      "0xb4b5ea57": "convertToAssets(uint256)",
      "0x01e1d114": "totalAssets()",
    },
    behavior: "Standardized yield-bearing vault. Deposit assets, receive shares. Share price = totalAssets / totalSupply.",
    failure_modes: [
      "First-depositor inflation attack: attacker deposits 1 wei, donates large amount, inflates share price",
      "Rounding direction in preview functions can be exploited (deposit rounds down shares, withdraw rounds up assets)",
      "totalAssets() can be manipulated if it reads spot balances",
      "Vault share price can be manipulated via direct token transfer (donation)",
    ],
    guarantees: [
      "deposit/mint/withdraw/redeem follow standard accounting",
      "preview functions give exact output for the given input at current state",
    ],
  },
  {
    name: "Curve StableSwap Pool",
    category: "dex",
    interfaces: ["ICurvePool", "IStableSwap"],
    selectors: {
      "0x3df02124": "exchange(int128,int128,uint256,uint256)",
      "0xa6417ed6": "exchange_underlying(int128,int128,uint256,uint256)",
      "0xbb7b8b80": "get_virtual_price()",
      "0x5e0d443f": "get_dy(int128,int128,uint256)",
    },
    behavior: "StableSwap AMM optimized for pegged assets. get_virtual_price() returns LP token price in underlying.",
    failure_modes: [
      "get_virtual_price() can be manipulated via reentrancy during remove_liquidity (read-only reentrancy)",
      "Imbalanced pools can cause large slippage on exchange",
      "Admin fee extraction can affect virtual price calculation",
    ],
    guarantees: ["Virtual price is monotonically non-decreasing under normal operation (no withdrawals)"],
  },
  {
    name: "Balancer V2 Vault",
    category: "dex",
    interfaces: ["IVault", "IBalancerVault"],
    selectors: {
      "0x52bbbe29": "swap(SingleSwap,FundManagement,uint256,uint256)",
      "0xe6c46092": "flashLoan(IFlashLoanRecipient,address[],uint256[],bytes)",
      "0xf94d4668": "getPoolTokens(bytes32)",
      "0x5c38449e": "getPool(bytes32)",
    },
    behavior:
      "Centralized vault holding all pool tokens. Swaps, joins, exits go through the vault. Flash loans are free (no fee).",
    failure_modes: [
      "Flash loans are FREE — lower barrier for flash-loan attacks",
      "receiveFlashLoan callback is reentrancy surface",
      "getPoolTokens() returns spot balances — manipulable in same block",
      "Pool tokens are held in single vault — vault compromise affects all pools",
    ],
    guarantees: [
      "Flash loan must repay exact amounts in same transaction",
      "Internal balances are isolated per user",
    ],
  },
  {
    name: "Lido stETH",
    category: "liquid-staking",
    interfaces: ["IStETH", "ILido", "IWstETH"],
    selectors: {
      "0xa1903eab": "submit(address)",
      "0xea598cb0": "wrap(uint256)",
      "0xde0e9a3e": "unwrap(uint256)",
      "0x37cfdaca": "stEthPerToken()",
      "0x035faf82": "getSharesByPooledEth(uint256)",
      "0x7a28fb88": "getPooledEthByShares(uint256)",
    },
    behavior:
      "Liquid staking token. stETH rebases daily. wstETH is non-rebasing wrapper. Share price increases as staking rewards accrue.",
    failure_modes: [
      "stETH is rebasing — balanceOf changes without transfer, breaks caching",
      "1 stETH != 1 ETH — depegging during market stress",
      "share/token conversion introduces rounding (1-2 wei rounding errors)",
      "Transfer of stETH can result in 1 wei less than expected due to shares rounding",
    ],
    guarantees: [
      "wstETH is non-rebasing — safe for DeFi integrations",
      "stEthPerToken() is monotonically non-decreasing under normal operation",
    ],
  },
  {
    name: "Seaport (OpenSea)",
    category: "marketplace",
    interfaces: ["ZoneInterface", "SeaportInterface", "ConsiderationInterface", "ContractOffererInterface"],
    selectors: {
      "0xfb0f3ee1": "fulfillBasicOrder(BasicOrderParameters)",
      "0xb3a34c4c": "fulfillOrder(Order,bytes32)",
      "0xe7acab24": "fulfillAdvancedOrder(AdvancedOrder,CriteriaResolver[],bytes32,address)",
      "0x87201b41": "matchOrders(Order[],Fulfillment[])",
      "0xf2d12b12": "matchAdvancedOrders(AdvancedOrder[],CriteriaResolver[],Fulfillment[],address)",
      "0x17b1f942": "validateOrder(ZoneParameters)",
    },
    behavior:
      "NFT marketplace protocol. Orders contain offers (what the offerer provides) and considerations (what the offerer expects). " +
      "Zones are callback contracts that validate orders. Conduits handle token transfers. " +
      "Fulfillment pipeline: conduit transfers tokens → zone validateOrder() is called → settlement completes.",
    failure_modes: [
      "TIPPING: Fulfillers can append extra ERC20 'tips' to the consideration array. ZoneParameters.consideration includes tipped items indistinguishably from original items. Zones that iterate all consideration items will process malicious tips.",
      "CALLBACK ORDERING: Conduit transfers tokens via safeTransferFrom (triggering onERC721Received/onERC1155Received on recipient) BEFORE calling the Zone's validateOrder(). State registered in validateOrder() is unavailable during the safeTransferFrom callback window.",
      "SELF-MATCHING: When offer and consideration share the same address, Seaport skips the execution (to == from). This produces zero totalExecutions, bypassing any invariant check that iterates over executions.",
      "PARTIAL FILLS: Advanced orders can be partially filled. Multiple fills with the same parameters may produce identical order hashes if the hash function lacks a nonce/fill-counter.",
      "SIGNATURE REUSE: If the Zone's signature validation does not bind to a specific fulfillment context, signatures from one order can be reused across different fulfillments.",
    ],
    guarantees: [
      "Orders cannot be fulfilled after expiration",
      "Zone's validateOrder() is called for restricted orders",
      "Conduit permissions are managed by the conduit controller",
    ],
  },
  {
    name: "Gnosis Safe",
    category: "multisig",
    interfaces: ["ISafe", "IGnosisSafe", "IGuard", "IFallbackHandler"],
    selectors: {
      "0xe19a9dd9": "setGuard(address)",
      "0xf08a0323": "setFallbackHandler(address)",
      "0x610b5925": "enableModule(address)",
      "0xe009cfde": "disableModule(address,address)",
      "0xe318b52b": "swapOwner(address,address,address)",
      "0xf8dc5dd9": "removeOwner(address,address,uint256)",
      "0x0d582f13": "addOwnerWithThreshold(address,uint256)",
      "0x6a761202": "execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)",
    },
    behavior:
      "Multi-signature wallet. Transactions require threshold signatures. Guard contracts can block transactions. " +
      "Fallback handler receives all calls with unrecognized function selectors via delegatecall. " +
      "Modules can execute transactions without owner signatures.",
    failure_modes: [
      "FALLBACK HANDLER BYPASS: setFallbackHandler() changes the fallback handler. If a Guard blocks setGuard/enableModule/disableModule but NOT setFallbackHandler, an attacker can set the fallback handler to a token contract address. Calling the Safe with transferFrom calldata forwards to the fallback handler (token contract), which sees msg.sender == safe and executes the transfer.",
      "MODULE BYPASS: Enabled modules can execute arbitrary transactions on behalf of the Safe without owner signatures. If a module is compromised or the enable path is unprotected, all Safe assets are at risk.",
      "GUARD ENUMERATION: Guard.checkTransaction must block ALL self-management functions: setGuard, setFallbackHandler, enableModule, disableModule, setModuleGuard, execDelegateCall. Missing any one allows bypass.",
      "CALLDATA OFFSET PARSING: Guard implementations that parse raw calldata must handle Solidity ABI encoding offsets correctly. For functions like disableModule(address,address), the relevant parameter may be at offset 0x44 (second param), not 0x24 (first param).",
    ],
    guarantees: [
      "Transactions require threshold owner signatures (unless executed by a module)",
      "Guard.checkTransaction and checkAfterExecution are called for every execTransaction",
      "Modules execute with the Safe's permissions and context",
    ],
  },
  {
    name: "MakerDAO DSS (DAI)",
    category: "stablecoin",
    interfaces: ["IDai", "IDaiJoin", "IVat"],
    selectors: {
      "0x9dc29fac": "burn(address,uint256)",
      "0x40c10f19": "mint(address,uint256)",
      "0x3644e515": "DOMAIN_SEPARATOR()",
      "0xbb35783b": "move(address,address,uint256)",
    },
    behavior: "Multi-collateral stablecoin system. Vat is the core accounting engine. DaiJoin bridges internal DAI to ERC20.",
    failure_modes: [
      "DAI permit uses non-standard signature format (allowed bool instead of value)",
      "Vat accounting uses ray (1e27) precision — conversion errors possible",
      "Emergency shutdown (End) can freeze the system",
    ],
    guarantees: ["DAI is always backed by collateral in the Vat (under normal governance)"],
  },
]

export const CALLBACK_SIGNATURES: Record<string, string> = {
  onERC721Received: "ERC-721 safeTransfer callback — reentrancy surface",
  onERC1155Received: "ERC-1155 safeTransfer callback — reentrancy surface",
  onERC1155BatchReceived: "ERC-1155 batch safeTransfer callback — reentrancy surface",
  tokensReceived: "ERC-777 receive hook — reentrancy surface on every transfer",
  tokensToSend: "ERC-777 send hook — fires before balance update",
  uniswapV3SwapCallback: "Uniswap V3 swap callback — must validate msg.sender is pool",
  uniswapV3FlashCallback: "Uniswap V3 flash loan callback — must repay + fee",
  uniswapV3MintCallback: "Uniswap V3 mint callback — must pay tokens owed",
  uniswapV2Call: "Uniswap V2 flash swap callback — reentrancy surface",
  pancakeCall: "PancakeSwap flash swap callback",
  pancakeV3SwapCallback: "PancakeSwap V3 swap callback",
  pancakeV3FlashCallback: "PancakeSwap V3 flash callback",
  BiswapCall: "Biswap flash swap callback",
  hook: "Generic hook function — potential callback surface",
  executeOperation: "Aave flash loan callback — must repay + fee, validate initiator",
  receiveFlashLoan: "Balancer flash loan callback — must repay exact amounts",
  onFlashLoan: "ERC-3156 flash loan callback — must return keccak256('ERC3156FlashBorrower.onFlashLoan')",
  fallback: "Fallback function — receives arbitrary calls, potential reentrancy",
  receive: "Receive function — triggered on plain ETH transfer",
  onTokenTransfer: "Chainlink LINK token transfer callback",
  onTokenBridged: "Bridge token receive callback",
  afterAgreementCreated: "Superfluid stream callback",
  afterAgreementUpdated: "Superfluid stream update callback",
  afterAgreementTerminated: "Superfluid stream termination callback",
  crossDomainMessageHandler: "L2 bridge message handler — validate sender is bridge",
  onMessageReceived: "Cross-chain message receive callback",
  fulfillRandomWords: "Chainlink VRF v2 callback — validate caller is coordinator",
  rawFulfillRandomWords: "Chainlink VRF v2 raw callback",
  fulfillRandomness: "Chainlink VRF v1 callback",
  oracleCallback: "Generic oracle callback — validate caller",
  checkUpkeep: "Chainlink Keeper check function",
  performUpkeep: "Chainlink Keeper execution function — validate caller is registry",
  ccipReceive: "Chainlink CCIP cross-chain message callback",
  _ccipReceive: "Chainlink CCIP internal receive handler",
  xReceive: "Connext cross-chain message callback",
  sgReceive: "Stargate/LayerZero cross-chain callback",
  lzReceive: "LayerZero cross-chain message callback",
  _nonblockingLzReceive: "LayerZero non-blocking receive handler",
  anyExecute: "Multichain (AnyCall) cross-chain callback",
  onSettlement: "Settlement protocol callback",
  liquidatePosition: "Liquidation callback — validate caller authorization",
  validateOrder: "Seaport Zone callback — called AFTER conduit transfers tokens. State registered here is unavailable during prior safeTransferFrom callbacks. Check for tipped items in ZoneParameters.consideration.",
  ratifyOrder: "Seaport ContractOfferer callback — called after order fulfillment",
  generateOrder: "Seaport ContractOfferer callback — generates dynamic orders",
  checkTransaction: "Gnosis Safe Guard — called before execTransaction. Must block all self-management functions (setGuard, setFallbackHandler, enableModule, etc.)",
  checkAfterExecution: "Gnosis Safe Guard — called after execTransaction for post-execution validation",
}

export const ORACLE_READ_PATTERNS: Record<string, string> = {
  latestRoundData: "Chainlink aggregator — check staleness (updatedAt), zero price, answeredInRound >= roundId",
  latestAnswer: "Chainlink deprecated — no staleness metadata, use latestRoundData instead",
  latestTimestamp: "Chainlink deprecated — use latestRoundData().updatedAt",
  latestRound: "Chainlink round ID — does not include price, combine with getRoundData",
  getRoundData: "Chainlink historical round — same staleness checks as latestRoundData",
  getPrice: "Generic price oracle — check for zero, staleness, manipulation",
  getAssetPrice: "Aave-style oracle — wraps Chainlink, check source staleness",
  slot0: "Uniswap V3 pool — returns SPOT sqrtPriceX96, trivially manipulable in same block. Use observe() TWAP instead.",
  observe: "Uniswap V3 TWAP — resistant to single-block manipulation but can lag",
  getReserves: "Uniswap V2 — SPOT reserves, trivially manipulable with flash loans",
  getAmountsOut: "Uniswap V2 router — uses spot reserves, sandwich-attackable",
  getAmountsIn: "Uniswap V2 router — uses spot reserves, sandwich-attackable",
  get_virtual_price: "Curve — can be manipulated via read-only reentrancy during remove_liquidity",
  get_dy: "Curve — spot calculation, can change within same block",
  consult: "TWAP oracle — check observation window length, can lag during volatility",
  peek: "MakerDAO-style oracle — returns (value, valid) tuple, must check valid flag",
  read: "MakerDAO-style oracle — reverts if invalid, but check for zero value",
  latestPrice: "Generic price feed — check return value and staleness",
  getLatestPrice: "Generic price feed — check return value and staleness",
  fetchPrice: "Generic price feed — check return value and staleness",
  getExchangeRate: "Exchange rate oracle — check for manipulation and staleness",
  exchangeRate: "Exchange rate query — may be manipulable if spot-based",
  getUnderlyingPrice: "Compound-style oracle — check for zero and staleness",
  stEthPerToken: "Lido — wstETH/stETH rate, generally safe (monotonically increasing)",
  getPooledEthByShares: "Lido — share to ETH conversion, 1-2 wei rounding possible",
  getSharesByPooledEth: "Lido — ETH to share conversion, 1-2 wei rounding possible",
  totalAssets: "ERC-4626 vault — check if manipulable via direct token transfer (donation)",
  convertToShares: "ERC-4626 vault — depends on totalAssets, check manipulation resistance",
  convertToAssets: "ERC-4626 vault — depends on totalAssets, check manipulation resistance",
}

export function matchProtocol(interfaceName: string): ProtocolEntry | undefined {
  return KNOWN_PROTOCOLS.find((p) => p.interfaces.some((i) => interfaceName.includes(i) || i.includes(interfaceName)))
}

export function matchProtocolBySelector(selector: string): ProtocolEntry | undefined {
  return KNOWN_PROTOCOLS.find((p) => selector in p.selectors)
}

export function isCallbackHook(functionName: string): string | undefined {
  return CALLBACK_SIGNATURES[functionName]
}

export function isOracleRead(methodName: string): string | undefined {
  return ORACLE_READ_PATTERNS[methodName]
}
