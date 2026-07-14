/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 1: Published.derive — FIX THE PREDICATE, NOT THE WALLS (S109 / DD-26).
 *
 * G-4: V36 derived `published` from `git branch -r --contains HEAD`, which is TRUE ON ANY CLONE (every clone has an origin
 * that contains HEAD). V36 saw this on the fresh clone and made the WALLS clone-invariant instead of fixing the predicate —
 * and `published` feeds D50(iii) → canFire, the kill-criterion's ending condition. A predicate that can return true without
 * publication could fire the kill-criterion on a FALSE PREMISE.
 *
 * DD-26 — publication means a STRANGER can get it. The narrowest predicate a LOCAL CLONE cannot satisfy: a remote ref
 * contains HEAD AND that remote's URL is a PUBLIC HOST (github.com / gitlab.com / an https:// or git@ forge), NOT a local
 * filesystem path. A clone made from a local path has an origin URL that is a directory — it fails the public-host test and
 * derives `published: false`, PROVEN on the pristine clone (S109). Dependency-free (git only).
 */
import { spawnSync } from "node:child_process"
import { PKG_ROOT } from "./frozen"

export namespace Published {
  // a PUBLIC forge URL a stranger could clone from — https://host/... or git@host:... where host is a real domain (has a
  // dot and is not localhost). A local filesystem path (/Users/..., ./x, file://, C:\...) is NOT public.
  export function isPublicRemoteUrl(url: string): boolean {
    const u = url.trim()
    if (!u) return false
    // local filesystem paths / file protocol — never public
    if (u.startsWith("/") || u.startsWith(".") || u.startsWith("~") || /^file:\/\//i.test(u) || /^[a-zA-Z]:[\\/]/.test(u)) return false
    // scp-like (git@github.com:owner/repo.git) or URL forms with a dotted host that is not localhost
    const scp = u.match(/^[^@]+@([^:]+):/) // git@HOST:path
    const host = scp ? scp[1] : (u.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(?:[^@/]+@)?([^/:]+)/)?.[1] ?? "")
    if (!host) return false
    if (/^(localhost|127\.0\.0\.1|::1|0\.0\.0\.0)$/i.test(host)) return false
    return host.includes(".") // a real domain (github.com, gitlab.com, …)
  }

  function git(args: string[]): { status: number; out: string } {
    const r = spawnSync("git", args, { cwd: PKG_ROOT, encoding: "utf8" })
    return { status: r.status ?? 1, out: (r.stdout || "").trim() }
  }

  // DERIVE — HEAD is published iff a remote-tracking ref contains it AND that remote's URL is a public host. A local clone's
  // origin (a filesystem path) fails the public-host test → false (the S109 fix). Never a declared constant.
  export function derive(): { published: boolean; detail: string } {
    const contains = git(["branch", "-r", "--contains", "HEAD"])
    if (contains.status !== 0)
      return { published: false, detail: `DERIVED — git could not determine remote reachability, treated as UNPUBLISHED (the safe direction; a false 'published' would fire the kill-criterion on a false premise, G-4)` }
    const refs = contains.out.split("\n").map((s) => s.trim()).filter(Boolean).filter((s) => !s.includes("->"))
    if (refs.length === 0)
      return { published: false, detail: "no remote ref contains HEAD (DERIVED — git branch -r --contains HEAD returned empty); UNPUBLISHED" }
    // the remotes whose refs contain HEAD (the ref's first path segment is the remote name)
    const remotes = [...new Set(refs.map((r) => r.split("/")[0]))]
    const publicRemotes: string[] = []
    for (const remote of remotes) {
      const url = git(["remote", "get-url", remote])
      if (url.status === 0 && isPublicRemoteUrl(url.out)) publicRemotes.push(`${remote} (${url.out})`)
    }
    return publicRemotes.length > 0
      ? { published: true, detail: `HEAD is reachable from a PUBLIC remote: ${publicRemotes.join(", ")} (DERIVED — S109/DD-26: a stranger can clone it)` }
      : { published: false, detail: `DERIVED — HEAD is contained by remote ref(s) ${refs.join(", ")}, but NONE has a public-host URL (a local-clone origin, or an unpushed public remote), so a stranger CANNOT get it: UNPUBLISHED (S109 fix: G-4's clone-true defect closed)` }
  }
}
