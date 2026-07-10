/**
 * ORGΛNON — the `feedback` CLI (Probe Phase 2; X-TELEMETRY, same posture). Structured, in-band, scrubbed, local-first.
 * Usage: ./organon.sh feedback --screen reality --useful 1 --trusted 1 --missing "..."
 *        ./organon.sh feedback --show | --purge | --share
 */
import { Feedback } from "../src/telemetry/feedback"

const argv = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const has = (name: string): boolean => argv.includes(`--${name}`)
const bool = (v: string | undefined): boolean => v === "1" || v === "true" || v === "yes"

if (has("show")) {
  console.log(JSON.stringify(Feedback.show(), null, 2))
} else if (has("purge")) {
  Feedback.purge()
  console.log("local feedback purged.")
} else if (has("share")) {
  const r = Feedback.share()
  console.log(r.shared ? JSON.stringify(r.payload, null, 2) : `not shared — ${r.reason}`)
} else if (flag("screen")) {
  const r = Feedback.submit({
    at: Number(flag("at") ?? Date.now()),
    screen: flag("screen") as never,
    useful: bool(flag("useful")),
    trusted: bool(flag("trusted")),
    missing: flag("missing") ?? "",
  })
  console.log(r.captured ? "thank you — recorded locally (scrubbed). It leaves your machine only if you run: ./organon.sh feedback --share (needs ORGANON_TELEMETRY_SHARE=1)." : `not recorded — ${r.reason}`)
} else {
  console.log('usage: feedback --screen <shelf|reality|ask|stamp|other> --useful 1 --trusted 1 --missing "…"  |  --show | --purge | --share')
}
