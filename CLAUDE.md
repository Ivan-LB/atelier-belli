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
  `/[locale]/terms` — small inline `.ab-root` shells with the same editorial
  aesthetic as the homepage. Bilingual EN/ES bodies via
  `useTranslations('legal')`. The shared chrome + `.ab-prose` ruleset live
  in `app/globals.css`. (Previously used a legacy `SimplePageLayout` with
  gray/gradient aesthetic — removed in PR #12.)

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
`next.config.mjs` sets `images.unoptimized: true` (load-bearing for Amplify
image delivery, see gotcha `amplify-images-unoptimized`) and wraps the export
with `createNextIntlPlugin('./i18n.ts')` so next-intl's RSC integration
resolves correctly during SSG.

`app/[locale]/layout.tsx` wraps `{children}` in `NextIntlClientProvider`
(messages from `getMessages()`) and calls `unstable_setRequestLocale(locale)`
before any translation read so all routes stay statically prerendered. This
setup was Amplify-smoked successfully on Next 15.2.4 + React 19 in PR #9.
See gotcha `amplify-client-component-quirk`.

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
- **`.sup-root`** — support pages. Attribute `data-app="fingo" | "savely"`
  swaps the skin. Tokens prefixed `--sup-*` live under `.sup-root` only.
  (A `lorenzana` theme existed but was unused by any route; removed in
  PR #8. Re-add later if a Destilería support page is built.)
- **Legal-page chrome (`.ab-legal-*`) + `.ab-prose`** — scoped under
  `.ab-root` in `app/globals.css`. Used by `/privacy`, `/privacy/choices`,
  `/terms`. Token-only (`--ab-*` and global HSL); no `--sup-*` references.
- **Global HSL tokens** (`--background`, `--foreground`, `--border`, etc.)
  live in `:root` and `.dark` in `app/globals.css`. Consumed by Tailwind's
  extended color palette. Independent from the two scoped roots above.
  (Originally the shadcn/ui surface; the scaffold itself was removed in
  PR #7 and the tokens stay because Tailwind's theme extension still
  references them.)

**Typography stacks**:

| Scope      | Fonts |
|------------|-------|
| `.ab-root` | Fraunces (variable, `opsz`+`SOFT`) for display serifs; Inter for UI |
| `.sup-root`| EB Garamond / Instrument Serif for display; IBM Plex Mono for meta; Inter for body |
| Global     | `--font-inter` from `next/font` on `<html>`, default sans fallback |

**No component library today**: the shadcn scaffold (`components/ui/`,
50 files), `hooks/`, and `lib/utils.ts` (with `cn()`) were all removed in
PR #7 — none were imported by runtime code. If you genuinely need a
primitive, either hand-roll it (matching the editorial aesthetic) or
re-introduce shadcn via `pnpm dlx shadcn@latest add <component>` as a
deliberate, explicit decision. Recreate `cn()` as a tiny helper if needed.

## 5. i18n

**Canonical pattern**: `useTranslations()` in Client Components,
`getTranslations()` in Server Components. Keys in `messages/en.json` and
`messages/es.json`. See gotcha `i18n-pattern-canonical`.

**Current reality**: every locale-scoped page uses the canonical pattern.
The legacy `const isSpanish = locale === 'es'` ternary was fully removed
in PRs #9 (homepage + locale layout) and #12 (legal pages). Zero
`isSpanish` references remain in the source tree. **Never reintroduce
that pattern.**

`useParams().locale` is still used for routing concerns — href construction
like `/${locale}/privacy`, the `switchLocale()` helper, language-code chip
labels (`"EN"`/`"ES"`). That is correct; routing is not a translation
concern.

`messages/*.json` top-level namespaces in use: `notFound`, `layout`,
`legal`, `home`. Adding new copy = pick the right namespace, add the key
to BOTH dictionaries (EN value matches user-facing English; ES matches
Spanish), then consume via `useTranslations(namespace)`.

For rich strings with embedded JSX (e.g. `<em>` accents), use ICU placeholder
tags in the dictionary value (`"Designed in <it>Tijuana</it> by Belli"`) and
render via `t.rich(key, { it: (chunks) => <em>{chunks}</em> })`.

`app/[locale]/layout.tsx` wires the provider + `setRequestLocale`. See
section 6 (Amplify quirks) and gotcha `amplify-client-component-quirk` for
why both are required.

## 6. Amplify quirks

No `amplify.yml` in repo. Build config is in the Amplify console. Things that
are load-bearing:

1. **`images.unoptimized: true`** in `next.config.mjs` — Amplify's image proxy
   does not match Next/Image's sharp defaults. Removing this setting breaks
   image delivery. See gotcha `amplify-images-unoptimized`.
2. **i18n provider + `unstable_setRequestLocale`** —
   `app/[locale]/layout.tsx` wraps `{children}` in
   `<NextIntlClientProvider messages={messages}>` (messages from
   `getMessages()`) and calls `unstable_setRequestLocale(locale)` before any
   `getTranslations`/`getMessages` read. The provider is required for
   Client Component `useTranslations()` to work; `setRequestLocale` is
   required to keep all routes statically prerendered. This combination
   was reintroduced in PR #9 (after a previous Amplify regression on Next 14
   in commit `5719a20` had stripped it) and Amplify-smoked successfully on
   Next 15.2.4 + React 19. **If you change anything in this region, smoke-
   test on an Amplify deploy preview before merging to main.** See gotcha
   `amplify-client-component-quirk`.
3. **No env-var usage in any Client Component**. Only `NEXT_PUBLIC_*` vars
   reach the browser, and no such vars exist today. See gotcha
   `client-component-env-vars`.

(The previously load-bearing `serverExternalPackages: ['next-intl']` entry
was removed in PR #9 — it was redundant with `createNextIntlPlugin` and
prevented `useTranslations()` from resolving the `react-server` export at
SSG time. Build is green and Amplify deploy verified without it.)

## 7. Dead dependencies

**Status as of 2026-04-25**: clean. Two waves of removal landed:

- **PR #6** — orphaned by the 2026-04 editorial redesign:
  `three`, `@react-three/fiber`, `@react-three/drei` (old `HeroBackground`),
  `framer-motion` (old page animations, replaced by CSS +
  `IntersectionObserver`), `react-parallax-tilt` (old `Tilt` app cards),
  `@types/three` (devDep).
- **PR #11** — orphaned when the shadcn scaffold was deleted in PR #7:
  `next-themes`, `sonner`. Both were only consumed by
  `components/ui/sonner.tsx`.

Both followed gotcha `dead-deps-removal-dedicated-pr` — each was its own
PR, never bundled with feature work. **Going forward, any future dep
removal must follow the same pattern.**

## 8. Directory structure

```
app/
  globals.css                     # All styling. Layers: tailwind, global HSL,
                                  #   legacy helpers (.text-gradient, etc.),
                                  #   .ab-root (incl. .ab-legal-* + .ab-prose),
                                  #   .sup-root (data-app="fingo"|"savely")
  [locale]/
    layout.tsx                    # Server Component. NextIntlClientProvider +
                                  #   unstable_setRequestLocale. next/font Inter.
                                  #   Metadata. Skip-link via getTranslations.
    page.tsx                      # Homepage (Client). useTranslations('home').
    not-found.tsx                 # 404. Client. useTranslations('notFound').
                                  #   Still uses .text-gradient (legacy purple/orange).
    privacy/ · terms/ · privacy/choices/
                                  # Inline .ab-root shells, useTranslations('legal').
                                  # Bilingual EN/ES.
    fingo/support/                # SupportShell, data-app="fingo"
    savely/support/               # SupportShell, data-app="savely"
components/
  support-shell.tsx               # Reusable support shell. data-app union is
                                  #   "fingo" | "savely" only.
messages/
  en.json · es.json               # next-intl dictionaries.
                                  # Top-level: notFound, layout, legal, home.
public/                           # All static assets, logos, hero images
i18n.ts                           # next-intl config (createNextIntlPlugin)
middleware.ts                     # next-intl middleware (locale routing)
next.config.mjs · tailwind.config.ts · tsconfig.json
.claude/                          # Claude Code harness (see section 10)
```

(No `components/ui/`, no `hooks/`, no `lib/` today — all removed in PR #7
along with the shadcn scaffold.)

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
| `frontend-ui-specialist` | `app/**/*.tsx`, `components/**/*.tsx`, `globals.css`, Tailwind, design tokens |
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
