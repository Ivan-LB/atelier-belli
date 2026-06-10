# Plan 002: Upgrade Next.js 15.2.4 → ≥15.5.16 (critical CVE)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ace23a0..HEAD -- package.json next.config.mjs app/[locale]/layout.tsx middleware.ts i18n.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — this repo has a documented history of Amplify breaking on
  changes around the next-intl/layout region; an Amplify deploy-preview smoke
  is mandatory before this reaches `main`.
- **Depends on**: plans/001-remove-dead-dependencies.md (keeps the lockfile
  diff reviewable; not technically blocking)
- **Category**: security / migration
- **Planned at**: commit `ace23a0`, 2026-06-10

## Why this matters

`pnpm audit --prod` at planning time reports **1 critical — "Next.js is
vulnerable to RCE in React flight protocol" — plus ~10 high advisories against
`next` 15.2.4** (DoS via Server Components, SSRF, middleware/proxy bypass in
App Router; advisory example GHSA-vfv6-92ff-j949, patched in ≥15.5.16). The
site is statically generated, which blunts several server-side vectors, but it
**does run `next-intl` middleware in production on Amplify** (`middleware.ts`),
so the middleware-bypass class is live surface. Upgrading within v15 to the
patched line clears the entire `next` advisory set.

## Current state

- `package.json` — `"next": "15.2.4"` (exact pin, no caret) in dependencies;
  `"eslint-config-next": "^15.2.4"` in devDependencies.
- `next.config.mjs` (19 lines, read it whole) — wraps config with
  `createNextIntlPlugin('./i18n.ts')`; sets `eslint.ignoreDuringBuilds`,
  `typescript.ignoreBuildErrors`, `images.unoptimized: true` (load-bearing for
  Amplify — do not touch), `trailingSlash: true`.
- `app/[locale]/layout.tsx:43` — calls `unstable_setRequestLocale(locale)`
  from `next-intl/server` and wraps children in `<NextIntlClientProvider>`.
  **This region is the documented Amplify-sensitive zone** (gotcha
  `amplify-client-component-quirk`; CLAUDE.md §6).
- `middleware.ts` — `createMiddleware({locales: ["en","es"], defaultLocale: "en"})`,
  matcher `["/", "/(es|en)/:path*"]`.
- `next-intl` is `3.19.1` and **stays at 3.19.1** — upgrading it is explicitly
  out of scope (it renames `unstable_setRequestLocale` in newer lines and has
  its own migration surface).
- Build baseline (verified at planning time): `pnpm build` exits 0; route table
  shows every named route as `○`/`●` and exactly one `ƒ (Dynamic)`:
  `/[locale]/[...rest]`.

## Commands you will need

| Purpose   | Command                     | Expected on success |
|-----------|-----------------------------|---------------------|
| Upgrade   | `pnpm add next@^15.5.16`    | exit 0              |
| Align lint preset | `pnpm add -D eslint-config-next@^15.5.16` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit`    | exit 0              |
| Lint      | `pnpm lint`                 | exit 0              |
| Build     | `pnpm build`                | exit 0, same route shape |
| Audit     | `pnpm audit --prod`         | zero advisories against `next` |

⚠️ **Before `pnpm build`**: run `lsof -ti :3000 -sTCP:LISTEN`. If something is
listening, a dev server is running — building would corrupt it (gotcha
`next-build-clobbers-dev-cache`). Coordinate, or restart the dev server with
`rm -rf .next` afterwards.

## Scope

**In scope**:
- `package.json`, `pnpm-lock.yaml` (via pnpm only)
- `plans/README.md` (status row)
- CLAUDE.md §6 — only if a version-specific note must change (record the new
  Amplify-verified version once the deploy preview passes)

**Out of scope** (do NOT touch):
- `next-intl` version — stays 3.19.1.
- `react` / `react-dom` — stay ^19 as-is unless `pnpm install` hard-fails on
  peer deps (that's a STOP condition, not a license to bump).
- `next.config.mjs` — no flag changes; `images.unoptimized` and the next-intl
  plugin wrapper are load-bearing.
- `app/[locale]/layout.tsx`, `middleware.ts`, `i18n.ts` — no code changes. If
  the upgrade *forces* changes here, STOP (see below).

## Git workflow

- Branch **from `develop`**: `chore/upgrade-next-15-5`
- Commit: `chore: upgrade next to 15.5.x for security advisories`
- **No `Co-Authored-By` or AI signatures.** Stage explicit files only.
- PR to `develop`; human merges. **The release PR `develop` → `main` must not
  merge until someone has eyeballed the Amplify deploy preview** (see Step 5).

## Steps

### Step 1: Upgrade

```bash
pnpm add next@^15.5.16
pnpm add -D eslint-config-next@^15.5.16
```

**Verify**: `node -e "console.log(require('next/package.json').version)"` → `15.5.16` or higher 15.5.x

### Step 2: Static checks

```bash
pnpm exec tsc --noEmit   # exit 0
pnpm lint                # exit 0
```

**Verify**: both exit 0. If `pnpm lint` newly fails on rules introduced by the
bumped `eslint-config-next`, fix ONLY the flagged lines in the files it names —
mechanical fixes (e.g. a renamed rule's suggestion), nothing architectural.

### Step 3: Build and compare route shape

```bash
pnpm build   # (dev-server check first — see warning)
```

**Verify**: exit 0 AND the printed route table contains `ƒ /[locale]/[...rest]`
and NO other `ƒ` routes. If a previously-static route turned dynamic, that is a
STOP condition (it means static prerendering of the i18n tree regressed).

### Step 4: Local runtime smoke

```bash
pnpm dev > /tmp/next-upgrade-dev.log 2>&1 &
sleep 8
curl -sL -o /dev/null -w "/en %{http_code}\n"  http://localhost:3000/en
curl -sL -o /dev/null -w "/es %{http_code}\n"  http://localhost:3000/es
curl -sL -o /dev/null -w "/   %{http_code}\n"  -H "Accept-Language: es" http://localhost:3000/
curl -s   -o /dev/null -w "404 %{http_code}\n" http://localhost:3000/en/nope/
curl -sL -o /dev/null -w "sup %{http_code}\n"  http://localhost:3000/es/savely/support/
kill %1
```

**Verify**: `/en` 200, `/es` 200, `/` 200 (after redirect — middleware alive),
`404` route returns 404, support page 200. Check `/tmp/next-upgrade-dev.log`
for `FORMATTING_ERROR` or `MISSING_MESSAGE` — none expected.
(If :3000 was occupied, Next picks another port — read the log and adjust URLs.)

### Step 5: Amplify deploy-preview smoke (human-in-the-loop)

After the PR to `develop` is open, request in the PR body that the operator
check the Amplify preview (or a branch deploy) for: homepage EN+ES rendering,
one support page, the 404, and the locale-redirect from `/`. Record the result
in the PR. **This gate is mandatory** — PR #9 and #17/#18 in this repo's
history are both "worked locally, broke on Amplify" incidents in exactly this
region.

## Test plan

If plan 003 has landed: `pnpm verify && pnpm test:e2e` → all pass, no new
skips. If not, the Step 4 curl battery + Step 5 preview is the test plan;
say so in the PR body.

## Done criteria

- [ ] `next` resolves to ≥15.5.16 (`node -e "console.log(require('next/package.json').version)"`)
- [ ] `pnpm audit --prod 2>&1 | grep -c "│ next"` → 0 advisories naming `next`
- [ ] `pnpm exec tsc --noEmit` exits 0; `pnpm lint` exits 0
- [ ] `pnpm build` exits 0 with exactly one `ƒ` route (`/[locale]/[...rest]`)
- [ ] Step 4 curl battery passes
- [ ] PR body contains the audit before/after counts and the Amplify-preview checklist
- [ ] `git status` shows only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm install`/`pnpm add` hard-fails on a peer-dependency conflict between
  `next@15.5.x` and `next-intl@3.19.1` or `react@19` — do not bump the peers.
- `pnpm build` errors mention `next-intl`, `react-server`, `createNextIntlPlugin`,
  or `unstable_setRequestLocale` — this is the known Amplify-sensitive region;
  any fix there needs the operator's sign-off, not improvisation.
- The route table gains or loses `ƒ` routes relative to baseline.
- Type errors in `.next/types` or app code that require changing files in the
  out-of-scope list.

## Maintenance notes

- Once Amplify-verified, update the sentence in CLAUDE.md §6 that says the
  setup "was Amplify-smoked successfully on Next 15.2.4" to name the new version.
- Reviewer: the lockfile diff should touch only `next`, `eslint-config-next`
  and their transitive closure — anything else is scope creep.
- Deferred deliberately: `next-intl` 3.x → 4.x migration (renames the
  request-locale API; separate plan if ever needed); minimatch/lodash/glob
  advisories that ride in via dev tooling (re-audit after plans 001+002 land —
  most disappear with the dead deps).
