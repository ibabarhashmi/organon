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
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"

export namespace Published {
  // SUBSTANCE V38 (S119 / DD-35 / H-8): a PUBLIC forge URL a stranger could clone from WITHOUT authenticating — https://host/…
  // or git@host:… where host is a real domain (has a dot, not localhost). A local filesystem path is NOT public. And — the
  // narrowing — an EMBEDDED CREDENTIAL (a password/token in the userinfo: https://user:pass@host, https://ghp_TOKEN@host,
  // oauth2:x-access-token@host) is an AUTHENTICATED remote, not stranger-reachable: it is REJECTED. github.com is a public
  // HOST but a PRIVATE repo there is not publicly REACHABLE; a token-authed remote is exactly that private case, and it fed
  // D50(iii)→canFire. The SSH form `git@host:path` (the universal `git` user, key-auth, no secret in the URL) stays a public
  // host — the release-artifact requirement in derive() is what a private SSH repo cannot fake.
  export function isPublicRemoteUrl(url: string): boolean {
    const u = url.trim()
    if (!u) return false
    // local filesystem paths / file protocol — never public
    if (u.startsWith("/") || u.startsWith(".") || u.startsWith("~") || /^file:\/\//i.test(u) || /^[a-zA-Z]:[\\/]/.test(u)) return false
    // an https/http/git URL carrying userinfo with a CREDENTIAL (a colon → user:pass, or a known token shape) is an
    // authenticated remote — a stranger cannot use it. The bare SSH `git@host` (userinfo == "git", no colon/token) is exempt.
    const urlUserinfo = u.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^@/]+)@/)?.[1] ?? null
    if (urlUserinfo && (urlUserinfo.includes(":") || /(ghp_|github_pat_|gho_|oauth2|x-access-token|[A-Za-z0-9_-]{20,})/.test(urlUserinfo))) return false
    // scp-like (git@github.com:owner/repo.git) or URL forms with a dotted host that is not localhost
    const scp = u.match(/^[^@]+@([^:]+):/) // git@HOST:path
    const host = scp ? scp[1] : (u.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(?:[^@/]+@)?([^/:]+)/)?.[1] ?? "")
    if (!host) return false
    if (/^(localhost|127\.0\.0\.1|::1|0\.0\.0\.0)$/i.test(host)) return false
    return host.includes(".") // a real domain (github.com, gitlab.com, …)
  }

  // SUBSTANCE V38 (S119 / DD-35): the RELEASE-ARTIFACT proxy — the strong half of "a STRANGER can get this." Publication as a
  // release means an UNAUTHENTICATED request can retrieve a checksummed artifact: the committed release-manifest names a public
  // artifact URL (isPublicRemoteUrl-clean) AND a sha256. A PRIVATE repo — even over SSH, which the URL check cannot see — has
  // no such artifact, so it cannot satisfy this. Absent → false (the safe direction; no artifact exists yet, so published
  // stays false, which is correct — a human's push).
  export function hasUnauthenticatedPublicArtifact(): { ok: boolean; detail: string } {
    try {
      const m = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "release-manifest.json"), "utf8"))
      const url = typeof m.publicArtifactUrl === "string" ? m.publicArtifactUrl : ""
      const sha = typeof m?.built?.sha256 === "string" ? m.built.sha256 : (typeof m.publicArtifactSha256 === "string" ? m.publicArtifactSha256 : "")
      if (url && isPublicRemoteUrl(url) && /^[0-9a-f]{64}$/i.test(sha)) return { ok: true, detail: `an unauthenticated public artifact is recorded: ${url} (sha ${sha.slice(0, 12)}…)` }
      return { ok: false, detail: "no unauthenticated public release artifact recorded in release-manifest.json (publicArtifactUrl + sha256) — a private repo cannot fake one; UNPUBLISHED (the safe direction)" }
    } catch {
      return { ok: false, detail: "no release-manifest.json — no unauthenticated public artifact; UNPUBLISHED (the safe direction)" }
    }
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
    if (publicRemotes.length === 0)
      return { published: false, detail: `DERIVED — HEAD is contained by remote ref(s) ${refs.join(", ")}, but NONE has a credential-free public-host URL (a local-clone origin, an authenticated/token remote, or an unpushed public remote), so a stranger CANNOT get it: UNPUBLISHED (S109 fix: G-4's clone-true defect closed)` }
    // SUBSTANCE V38 (S119 / DD-35 / H-8): a public remote contains HEAD, but publication as a RELEASE additionally requires an
    // UNAUTHENTICATED public artifact (a private repo — even over SSH — cannot fake one). Both must hold.
    const art = hasUnauthenticatedPublicArtifact()
    return art.ok
      ? { published: true, detail: `HEAD is reachable from a credential-free PUBLIC remote: ${publicRemotes.join(", ")}, AND ${art.detail} (DERIVED — S119/DD-35: an unauthenticated stranger can retrieve it)` }
      : { published: false, detail: `DERIVED — HEAD is reachable from a PUBLIC remote (${publicRemotes.join(", ")}), but ${art.detail}. A public HOST is not publicly REACHABLE without a downloadable artifact — UNPUBLISHED (S119/DD-35: H-8's private-repo hole closed)` }
  }
}
