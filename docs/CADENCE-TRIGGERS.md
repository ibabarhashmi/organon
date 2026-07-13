# ORGΛNON — Cadence triggers (the clock is YOURS)

**The Cadence sprint (V32) ships no daemon, no scheduler, no service.** A purely local, honesty-first tool cannot re-judge
your strategy unless *something* runs it — and the honest place for that clock is **your machine, under your control**, never
a process ORGΛNON hides in the background. So the monitor is a one-shot CLI verb you (or your own OS timer) invoke:

```
./organon.sh monitor                 # cycle every held, non-closed manifest once, then exit
bun run script/monitor-manifests.ts --since 2026-07-13T00:00:00Z   # skip those already cycled since then
```

It is **idempotent**: a cycle with no fresh confirmed capture renders no reading and records no trial, and `--since` skips a
manifest already cycled inside its own window — so re-running it costs nothing and never invents a reading. Run it **after your
capture step** (`bun run script/capture-defillama.ts`, etc.); the monitor reads what the capture confirmed.

If you want it to run on a schedule, **you install the timer, on your own machine, writing to your own local store.** Pick one:

## macOS — `launchd`
Save as `~/Library/LaunchAgents/com.you.organon-monitor.plist` and `launchctl load` it:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
  <key>Label</key><string>com.you.organon-monitor</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string><string>-lc</string>
    <string>cd /path/to/organon && ./organon.sh monitor</string>
  </array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
</dict></plist>
```

## Linux — `systemd` user timer
`~/.config/systemd/user/organon-monitor.service`:
```ini
[Unit]
Description=ORGΛNON monitor (reads, never acts)
[Service]
Type=oneshot
WorkingDirectory=/path/to/organon
ExecStart=/bin/sh -lc './organon.sh monitor'
```
`~/.config/systemd/user/organon-monitor.timer`:
```ini
[Unit]
Description=Run ORGΛNON monitor daily
[Timer]
OnCalendar=*-*-* 09:00:00
Persistent=true
[Install]
WantedBy=timers.target
```
Then: `systemctl --user enable --now organon-monitor.timer`

## Any Unix — `cron`
`crontab -e`, then add (daily at 09:00, after your capture):
```
0 9 * * * cd /path/to/organon && ./organon.sh monitor >> ~/organon-monitor.log 2>&1
```

---

**What this is not.** ORGΛNON never runs cycles for you on our disk, never holds your manifests server-side, and never enters
a monitoring relationship with an identifiable client — that fact-pattern starts to look like an ongoing advisory service, which
the declarative posture (X-ADVICE, X-MANIFEST) exists to avoid. The clock is yours. A hosted cadence tier is **presented at the
Operator gate as a decision, not built** (see the countersign package).
