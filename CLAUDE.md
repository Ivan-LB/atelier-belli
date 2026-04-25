# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## 1. What this project does

Portfolio site of Ivan Lorenzana (Atelier Belli). **Two themed sub-sites** share
one Next.js app:

- **Homepage** at `/[locale]` — editorial redesign, `.ab-root` scope, light/dark
  theme toggle, custom vitrine/selected-work/workbench sections, case modal.
- **Support pages** at `/[locale]/fingo/support` and `/[locale]/savely/support` —
  reusable `SupportShell` keyed by `data-app`, `.sup-root` scope, per-app skin
  (terracotta / green / gold).
- **Utility sub-pages**: `/[locale]/privacy`, `/[locale]/privacy/choices`,
  `/[locale]/terms` — use the legacy `SimplePageLayout` with the gray/gradient
  aesthetic. Visually inconsistent with the homepage, intentional (separate
  scope; redesign is opportunistic).

Fully bilingual EN/ES. Static site (no database, no auth, no server actions).

## 2. Commands

```bash
pnpm dev      # Next dev server on :3000
pnpm build    # Production build
pnpm start    # Serve the production build
pnpm lint     # next lint
```

**There is no `typecheck` or `test` script.** To typecheck run
`pnpm exec tsc --noEmit`. See gotcha `pnpm-is-package-manager`.

Package manager: **pnpm** (lockfile: `pnpm-lock.yaml`). Never suggest
`npm install` or `yarn add`.

## 3. Architecture

**Next.js 15 App Router** under `app/[locale]/`. Only locale-scoped routes
exist — there is no root `app/layout.tsx`, only `app/[locale]/layout.tsx`.
`generateStaticParams()` pre-renders both locales at build time.

Routing (via `middleware.ts` using `next-intl/middleware`):

- `/` → redirects to `/en` or `/es` (cookie or `Accept-Language` fallback)
- `/en/...` and `/es/...` render the locale tree
- `defaultLocale: "en"`, `matcher: ["/", "/(es|en)/:path*"]`

**Hybrid font loading** (intentional — see gotcha `google-fonts-hybrid-loading`):

- `@import` at the top of `app/globals.css` ships Fraunces, Inter, EB Garamond,
  Instrument Serif, IBM Plex Mono for CSS-level `font-family` references.
- `next/font/google` in `app/[locale]/layout.tsx` **also** loads Inter as
  `--font-inter`, applied via `<html className={inter.variable}>`, to benefit
  from Next's font subsetting and preload for body copy.

**Deploy**: AWS Amplify. No `amplify.yml` in the repo — build config is in the
Amplify console. No `.github/workflows/` — there is no CI beyond Amplify.
`next.config.mjs` sets `images.unoptimized: true` and
`serverExternalPackages: ['next-intl']` — both are load-bearing, see gotchas
`amplify-images-unoptimized` and `amplify-client-component-quirk`.

`next.config.mjs` also sets `typescript.ignoreBuildErrors: true` and
`eslint.ignoreDuringBuilds: true`. The build will not fail on type or lint
violations — fix them anyway.

## 4. Design system

The load-bearing rule: **two scoped roots, tokens do not cross.**
See gotcha `root-token-scoping`.

- **`.ab-root`** — homepage. Attribute `data-theme="light"` or `"dark"` drives
  cream/turquoise (light) vs. ink/turquoise (dark). Tokens prefixed `--ab-*`
  (`--ab-bg`, `--ab-fg`, `--ab-muted`, `--accent-color`, `--accent-soft`,
  `--accent-deep`, etc.) live under `.ab-root` only.
- **`.sup-root`** — support pages. Attribute `data-app="fingo" | "savely" |
  "lorenzana"` swaps the skin. Tokens prefixed `--sup-*` live under `.sup-root`
  only. Three themes are defined; `lorenzana` is unused by any route today
  (kept for a future Destilería support page).
- **Global HSL tokens** (`--background`, `--foreground`, `--border`, etc.)
  live in `:root` and `.dark` in `app/globals.css`. These are the shadcn/ui
  surface, consumed by Tailwind's extended color palette. Independent from
  the two scoped roots above.

**Typography stacks**:

| Scope      | Fonts |
|------------|-------|
| `.ab-root` | Fraunces (variable, `opsz`+`SOFT`) for display serifs; Inter for UI |
| `.sup-root`| EB Garamond / Instrument Serif for display; IBM Plex Mono for meta; Inter for body |
| Global     | `--font-inter` from `next/font` on `<html>`, default sans fallback |

**shadcn/ui**: 50 components in `components/ui/` (full scaffold, most unused).
Add new ones with `pnpm dlx shadcn@latest add <component>`. `lib/utils.ts`
exports `cn()` (clsx + tailwind-merge).

## 5. i18n

**Canonical direction**: `useTranslations()` from `next-intl`, with keys in
`messages/en.json` and `messages/es.json`. See gotcha `i18n-pattern-canonical`.

**Current reality**: only `app/[locale]/not-found.tsx` uses `useTranslations()`.
Every other page uses an inline flag:

```ts
const params = useParams()
const locale = (params?.locale as string) === "es" ? "es" : "en"
const isSpanish = locale === "es"
```

This is the residue of the historical Amplify migration (see gotcha
`amplify-client-component-quirk`). **New code MUST use `useTranslations()`**.
Migration of existing inline flags is opportunistic, not a blocker on
unrelated work.

## 6. Amplify quirks

No `amplify.yml` in repo. Build config is in the Amplify console. Things that
are load-bearing:

1. **`images.unoptimized: true`** in `next.config.mjs` — Amplify's image proxy
   does not match Next/Image's sharp defaults. Removing this setting breaks
   image delivery. See gotcha `amplify-images-unoptimized`.
2. **`serverExternalPackages: ['next-intl']`** — Next 15 renamed this from
   `experimental.serverComponentsExternalPackages`. Keeps `next-intl` out of
   the server-bundle rewrite, required for the Amplify runtime.
3. **The client-component + i18n trap** — commit `5719a20` ("Fix client
   component issues for Amplify", 2025-08-13) removed
   `NextIntlClientProvider` + `getMessages()` from `app/[locale]/layout.tsx`,
   migrated `useTranslations()` calls to inline `isSpanish`, and switched
   `useParams()` to `usePathname()` for locale extraction. The 2026-04
   redesign reintroduced `useParams()` in the homepage — **works in dev,
   unverified on Amplify**. See gotcha `amplify-client-component-quirk`.
4. **No env-var usage in any Client Component**. Only `NEXT_PUBLIC_*` vars
   reach the browser, and no such vars exist today. See gotcha
   `client-component-env-vars`.

## 7. Dead dependencies

**Status as of 2026-04-24**: clean in the working tree, pending commit.

The 2026-04 editorial redesign orphaned five deps. They were uninstalled in a
single `pnpm remove` call this session but not yet committed:

- `three`, `@react-three/fiber`, `@react-three/drei` — old `HeroBackground`
  (file deleted).
- `framer-motion` — old page animations (replaced by CSS + `IntersectionObserver`).
- `react-parallax-tilt` — old `Tilt` app cards (replaced by the editorial vitrine).
- `@types/three` (devDep).

The removal is **its own dedicated PR** — never a drive-by in unrelated work.
See gotcha `dead-deps-removal-dedicated-pr` for the verification checklist.

`next-themes` stays — it's a peer of `components/ui/sonner.tsx` (scaffold,
unused at runtime but tsc references it).

## 8. Directory structure

```
app/
  globals.css                     # All styling. Layers: tailwind, global HSL,
                                  #   legacy helpers, .ab-root, .sup-root
  [locale]/
    layout.tsx                    # Only layout. next/font Inter. Metadata.
    page.tsx                      # Homepage (editorial redesign, ~930 lines).
    not-found.tsx                 # Only file using useTranslations().
    privacy/ · terms/ · privacy/choices/   # SimplePageLayout-based utility pages.
    fingo/support/                # SupportShell, data-app="fingo"
    savely/support/               # SupportShell, data-app="savely"
components/
  simple-page-layout.tsx          # Legacy gray/gradient shell for utility pages
  support-shell.tsx               # New reusable support shell (ab-root cousin)
  ui/                             # shadcn scaffold (50 components, mostly unused)
messages/
  en.json · es.json               # next-intl dictionaries (only notFound used today)
lib/
  utils.ts                        # cn() helper
public/                           # All static assets, logos, hero images
i18n.ts                           # next-intl config
middleware.ts                     # next-intl middleware
next.config.mjs · tailwind.config.ts · tsconfig.json
.claude/                          # Claude Code harness (see section 10)
```

## 9. Git discipline

- **Default branch (GitHub)**: `main`. **Integration branch**: `develop` —
  feature work branches from and PRs to `develop`. `main` advances only via
  release PRs (`develop` → `main`) or hotfix PRs branched directly from
  `main`. Feature branches named `<type>/<short-slug>` (historical
  examples: `major/add-fingo-and-savely-support-pages`, `minor/update-ui`).
- **Deploy**: Amplify auto-deploys on push to `main`. Do not push to
  `main` directly; merge via PR.
- **Never force-push `main`**. Never `git push --no-verify` or
  `git commit --amend` on published commits.
- **Stage explicit files** with `git add <path>`. Avoid `git add -A` /
  `git add .` — they sweep in `.DS_Store`, stray scratch files, and anything
  the editor dropped in the tree.
- **PRs are never auto-merged**. A human clicks merge.
- **Conventional-ish commit messages**. Examples from the log: "Rewrite hero
  description to reflect Tijuana-based atelier", "Fix client component issues
  for Amplify", "Add Savely and Fingo Support page".
- Pre-commit hooks: none configured today. Don't bypass them if added.

## 10. Orchestrator and subagents

Non-trivial requests should run through the orchestrator:

```
/orch <request>
```

This reads `.claude/protocols/orchestrator.md` and executes the 8-step flow
(classify → match gotchas → clarify → judge scope → dispatch → QA →
security → git). The main session never directly edits code during a `/orch`
run; all edits go through specialist agents.

Specialists in `.claude/agents/`:

| Agent | Owns |
|-------|------|
| `frontend-ui-specialist` | `app/**/*.tsx`, `components/**/*.tsx`, `globals.css`, Tailwind, shadcn, tokens |
| `content-i18n-specialist` | EN/ES copy, `messages/*.json`, middleware routing |
| `infra-deploy-specialist` | `next.config.mjs`, package.json scripts, deps, Amplify config |
| `spec-writer` | Feature/refactor planner (read-only on source, writes under `docs/` or `.claude/knowledge/`) |
| `bug-triage` | Reproduces + localizes bugs (read-only) |
| `qa-validator` | Runs `pnpm exec tsc --noEmit` + `pnpm build`; tests only if they exist |
| `security-reviewer` | Diff-based review: client-side secrets, XSS, CSP, middleware, Amplify env leaks |
| `git-workflow-specialist` | Branch, stage, commit, push, open PR — never merges |

Knowledge:

- `.claude/knowledge/common-rules.md` — DoD, git discipline, forbidden actions.
- `.claude/knowledge/gotchas.yaml` — triggered rules. See gotcha IDs cited
  throughout this document.

The per-machine audit log `.claude/orch-log.md` is gitignored; everything else
under `.claude/` is committed.
