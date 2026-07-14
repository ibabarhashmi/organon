/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 5: the stdio MCP entrypoint (DD-28).
 *
 * A subprocess of the user's own agent — line-delimited JSON-RPC 2.0 over stdin/stdout. NO port, NO listener, NO network.
 * Class R and nothing else. The Fact Envelope is the only payload. Register in an MCP client as: `organon socket` (stdio).
 *
 * Run: bun run script/socket.ts   (or ./organon.sh socket)
 */
import { Socket } from "../src/socket/server"

await Socket.serve()
