/**
 * ORGΛNON — the `telemetry` CLI (Probe Phase 2; X-TELEMETRY). The tester's full sight + control over their OWN local
 * data. Off by default; this verb never enables capture (that is ORGANON_TELEMETRY=1 + --accept). Usage:
 *   ./organon.sh telemetry --status | --disclosure | --accept | --show | --export | --purge | --share
 */
import { Telemetry } from "../src/telemetry/telemetry"

const arg = process.argv[2] ?? "--status"

switch (arg) {
  case "--disclosure":
    console.log(Telemetry.DISCLOSURE)
    break
  case "--accept":
    Telemetry.accept()
    console.log("disclosure accepted (local marker written). Telemetry captures ONLY when ORGANON_TELEMETRY=1 is also set.")
    break
  case "--status":
    console.log(`telemetry: ${Telemetry.isEnabled() ? "ON (opted in + disclosure accepted)" : "OFF"}`)
    console.log(`  ORGANON_TELEMETRY=${process.env.ORGANON_TELEMETRY ?? "(unset)"} · disclosure accepted: ${Telemetry.consentAccepted()}`)
    console.log(`  local events: ${Telemetry.show().length} · share: ${process.env.ORGANON_TELEMETRY_SHARE === "1" ? "consented" : "OFF (needs ORGANON_TELEMETRY_SHARE=1)"}`)
    break
  case "--show":
    console.log(JSON.stringify(Telemetry.show(), null, 2))
    break
  case "--export":
    console.log(JSON.stringify(Telemetry.exportEvents(), null, 2))
    break
  case "--purge":
    Telemetry.purge()
    console.log("local telemetry purged.")
    break
  case "--share": {
    const r = Telemetry.share()
    if (!r.shared) console.log(`not shared — ${r.reason}`)
    else console.log(`the scrubbed payload (${r.payload?.length ?? 0} events) — transmitting is your explicit act:\n${JSON.stringify(r.payload, null, 2)}`)
    break
  }
  default:
    console.log("usage: telemetry --status | --disclosure | --accept | --show | --export | --purge | --share")
}
