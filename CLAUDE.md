# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

> **Estado vivo y próximos pasos: lee `HANDOFF.md` primero.**

## 1. What this project does

Portfolio site of Ivan Lorenzana (Atelier Belli). **Two themed sub-sites** share
one Next.js app:

- **Homepage** at `/[locale]` — editorial redesign, `.ab-root` scope, light/dark
  theme toggle, custom vitrine/selected-work/workbench sections, case modal.
- **Support pages** at `/[locale]/fingo/support` and `/[locale]/savely/support` —
  reusable `SupportShell` keyed by `data-app`, `.sup-root` scope, per-app skin
  (terracotta / green). Both consume `useTranslations("support.fingo")` /
  `useTranslations("support.savely")` and build a `SupportContent` adapter via
  `useMemo` (PRs #23 + #25). The previous `CONTENT[locale]` dictionary is gone.
- **Utility sub-pages**: `/[locale]/privacy`, `/[locale]/privacy/choices`,
  `/[locale]/terms` — small inline `.ab-root` shells with the same editorial
  aesthetic as the homepage. Bilingual EN/ES bodies via
  `useTranslations('legal')`. The shared chrome + `.ab-prose` ruleset live
  in `app/globals.css`. (Previously used a legacy `SimplePageLayout` with
  gray/gradient aesthetic — removed in PR #12.)
- **404 page** at `/[locale]/not-found` — Server Component using
  `getTranslations("notFound")`, with a tiny client island
  (`_not-found-controls.tsx`) for theme + locale toggles. Backed by a
  catch-all route (`app/[locale]/[...rest]/page.tsx`) that calls
  `notFound()` for unmatched URLs (PR #18). `.ab-nf-*` chrome scoped under
  `.ab-root`.

Fully bilingual EN/ES. Static site (no database, no auth, no server actions).

### Case studies (Selected Work)

Six cases as of 2026-06-09: `fingo`, `savely`, `mezcal` (originals) + `blip`,
`briefmark`, `pass` (added in the projects-reorg session). All case data lives
in `app/[locale]/page.tsx` — there are NO per-case route files. To add a case:

1. Extend the `CaseKey` union.
2. Add an entry to the `CASES` record (inside `useMemo`) — num, kicker, title,
   `t.rich` desc, meta rows, actions.
3. Add an entry to `indexInfo` in the Selected Work list (name/tag/stack/mshow).
4. Add a branch to `CasePreview` at the bottom of the file.
5. Add `cases.<key>` to **both** `messages/en.json` and `messages/es.json`
   (titleIt, descRich with `<it>` tags, metaStatus, actionPrimary, tag,
   metaPlatform when not iOS).
6. Add the new key to `CASE_KEYS` (the deep-link allowlist, right below the
   `CaseKey` union in `page.tsx`), and bump the six-case count assertion in
   `tests/e2e/smoke.spec.ts` (the comment on Test 5).

**Previews:** project screenshots live in `public/cases/` (fingo/savely
predate the folder and keep their root-level `public/*-hero.*` files).
fingo/savely use the `ab-phone-img` phone frame; blip and mezcal render real
captures inside `ab-browser-frame` via the `.ab-browser-shot` img class
(16:10, explicit width/height). briefmark/pass are still styled
*placeholders* reusing `ab-browser-frame` + `ab-mez-site` — swap for real
images when available (briefmark is iOS → phone frame; pass → Apple Wallet
screenshot). The modal wrapper adds `web-preview` for every browser-frame
preview via an `includes([...])` check — keep that list in sync. **All
preview imgs must carry explicit `width`/`height`** — without them the
transparent-frame slots collapse to zero height until the lazy image paints
(this bit Savely once; fixed in `5f8e600`).

**Vitrine (hero showcase):** still the original three pieces — Fingo and
Savely phones plus Destilería Lorenzana as a responsive-showcase combo
(`.ab-vit-web-combo`): a 400×260 browser window with the desktop capture and
a mini phone overlapping its corner with the mobile capture
(`public/cases/mezcal-{hero,mobile}.webp`). Tilt/hover transforms live on
the combo wrapper, not the browser. The old hand-drawn mock's CSS
(`.ab-vit-browser .scr`, `.ab-vit-bottle`, …) is orphaned — cleanup PR
pending.

**Pending:** `github.com/Ivan-LB/loyalty-cards` is private, so the `pass`
action ships disabled ("Code coming soon"); if the repo goes public, restore
the GitHub link in the `CASES` record + both dictionaries.

## 2. Commands

```bash
pnpm dev      # Next dev server on :3000
pnpm build    # Production build
pnpm start    # Serve the production build
pnpm lint     # next lint (configured via .eslintrc.json — runs clean as of PR #22)
pnpm typecheck   # tsc --noEmit (full type check, no emit)
pnpm verify:i18n # structural parity check — messages/en.json vs messages/es.json
pnpm verify      # typecheck + lint + verify:i18n in sequence
pnpm test:e2e    # Playwright smoke suite (6 tests); boots its own dev server on :3100
```

**Never run `pnpm build` while a dev server is up** — both share `.next`
and the build clobbers the dev server's vendor chunks ("Cannot find module
'./vendor-chunks/...'"). Check `lsof -ti :3000 -sTCP:LISTEN` first; recovery
is kill dev → `rm -rf .next` → restart. See gotcha
`next-build-clobbers-dev-cache`.

**`pnpm verify` is the one-command health check.** Run it before opening a PR.
`pnpm test:e2e` boots its own dev server on `:3100` (via Playwright `webServer`)
so it is safe to run while a normal dev server is on `:3000`. The i18n parity
check (`verify:i18n`) catches missing keys in either locale dictionary before
they can crash the Spanish site at runtime.

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

**Build output is mostly SSG with one dynamic route.** `generateStaticParams()`
pre-renders every named route for both locales. The single exception is the
catch-all `app/[locale]/[...rest]/page.tsx`, which Next reports as
`ƒ (Dynamic)` — its only job is to call `notFound()` so Next renders
`app/[locale]/not-found.tsx` for unmatched URLs (PR #18; see gotcha
`not-found-catch-all-required` for why this shape is required).

**Not-found shape**: `app/[locale]/not-found.tsx` is a Server Component
that reads `getTranslations("notFound")`, then renders the `.ab-nf-*` editorial
404. Its theme + locale toggles live in `app/[locale]/_not-found-controls.tsx`
(a Client island) and a small inline script bootstraps `data-theme` from
`localStorage`/`prefers-color-scheme` before paint. PR #17 shipped this as a
single Client Component and broke on production; PR #18 split it into the
current Server + island shape.

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
setup was Amplify-smoked successfully on Next 15.2.4 + React 19 in PR #9, and
the catch-all + Server `not-found.tsx` shape was Amplify-verified in PR #18.
See gotcha `amplify-client-component-quirk`.

`next.config.mjs` also sets `typescript.ignoreBuildErrors: true` and
`eslint.ignoreDuringBuilds: true`. The build will not fail on type or lint
violations — fix them anyway. (Standalone `pnpm lint` IS now a real check; the
build-gate flag stays separate.)

## 4. Design system

The load-bearing rule: **two scoped roots, tokens do not cross.**
See gotcha `root-token-scoping`.

- **`.ab-root`** — homepage, legal trio, AND the 404. Attribute
  `data-theme="light"` or `"dark"` drives cream/turquoise (light) vs.
  ink/turquoise (dark). Tokens prefixed `--ab-*` (`--ab-bg`, `--ab-fg`,
  `--ab-muted`, `--accent-color`, `--accent-soft`, `--accent-deep`, etc.)
  live under `.ab-root` only.
- **`.sup-root`** — support pages. Attribute `data-app="fingo" | "savely"`
  swaps the skin. Tokens prefixed `--sup-*` live under `.sup-root` only.
  (A `lorenzana` theme existed but was unused by any route; removed in
  PR #8. Re-add later if a Destilería support page is built.)
- **Legal-page chrome (`.ab-legal-*`) + `.ab-prose` + 404 chrome
  (`.ab-nf-*`)** — all scoped under `.ab-root` in `app/globals.css`.
  Token-only (`--ab-*` and global HSL); no `--sup-*` references.
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

**Migration status: COMPLETE.** Every locale-scoped page uses the canonical
pattern — homepage, locale layout, legal trio, 404, AND both support pages.
The migration shipped across PRs #9 (homepage + layout), #12 (legal pages),
#18 (404 split), #23 (Fingo support), and #25 (Savely support). Zero
`isSpanish` or `Record<Lang, ...>` references remain in the source tree.
**Never reintroduce that pattern.**

`useParams().locale` is still used for routing concerns — href construction
like `/${locale}/privacy`, the `switchLocale()` helper, language-code chip
labels (`"EN"`/`"ES"`). That is correct; routing is not a translation
concern.

`messages/*.json` top-level namespaces in use: `notFound`, `layout`,
`legal`, `home`, `support` (with `support.fingo.*` and `support.savely.*`).
Adding new copy = pick the right namespace, add the key to BOTH dictionaries
(EN value matches user-facing English; ES matches Spanish), then consume via
`useTranslations(namespace)`.

**`t(key)` vs `t.raw(key)` — the HTML rule (gotcha
`next-intl-html-via-t-raw`)**: next-intl's ICU formatter treats `<em>`,
`<a>`, etc. inside a translation value as **tag placeholders**, not literal
HTML. Calling `t("hero.titleHtml")` on a value like
`"How can we <em>help?</em>"` throws `FORMATTING_ERROR` at render. Two
options:

- For values consumed via `dangerouslySetInnerHTML` (support pages, where
  the HTML round-trips through JSON), use `t.raw(key)` and name the key
  with an `Html` suffix (`heroTitleHtml`, `*.valueHtml`, `aHtml`). PRs
  #23 + #25 established this convention across the support namespace.
- For values rendered into JSX with embedded React (homepage hero, etc.),
  use ICU placeholder tags in the dictionary value
  (`"Designed in <it>Tijuana</it> by Belli"`) and render via
  `t.rich(key, { it: (chunks) => <em>{chunks}</em> })`.

Arrays in the dictionary (e.g. `support.fingo.faq.items`,
`support.fingo.status.rows`) are also read via `t.raw(key)` and iterated by
the consumer — `t()` would try to interpolate them.

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
   required to keep all named routes statically prerendered. This combination
   was reintroduced in PR #9 (after a previous Amplify regression on Next 14
   in commit `5719a20` had stripped it) and Amplify-smoked successfully on
   Next 15.2.4 + React 19. **If you change anything in this region, smoke-
   test on an Amplify deploy preview before merging to main.** See gotcha
   `amplify-client-component-quirk`.
3. **The `ƒ (Dynamic)` catch-all route** —
   `app/[locale]/[...rest]/page.tsx` is the project's only dynamic route.
   It exists solely to call `notFound()` for unmatched URLs so Next renders
   the editorial `not-found.tsx` chrome instead of the framework default.
   PR #18 shipped this (replacing PR #17's broken Client-only 404) and it
   was Amplify-verified on the user's deploy. The build output is otherwise
   fully static. See gotcha `not-found-catch-all-required`.
4. **No env-var usage in any Client Component**. Only `NEXT_PUBLIC_*` vars
   reach the browser, and no such vars exist today. See gotcha
   `client-component-env-vars`.

(The previously load-bearing `serverExternalPackages: ['next-intl']` entry
was removed in PR #9 — it was redundant with `createNextIntlPlugin` and
prevented `useTranslations()` from resolving the `react-server` export at
SSG time. Build is green and Amplify deploy verified without it.)

## 7. Dead dependencies

**Status as of 2026-06-10**: clean — runtime deps are down to exactly
`next`, `next-intl`, `react`, `react-dom`. Four waves of removal landed:

- **PR #6** — orphaned by the 2026-04 editorial redesign:
  `three`, `@react-three/fiber`, `@react-three/drei` (old `HeroBackground`),
  `framer-motion` (old page animations, replaced by CSS +
  `IntersectionObserver`), `react-parallax-tilt` (old `Tilt` app cards),
  `@types/three` (devDep).
- **PR #11** — orphaned when the shadcn scaffold was deleted in PR #7:
  `next-themes`, `sonner`. Both were only consumed by
  `components/ui/sonner.tsx`.
- **PR #20** — orphaned when the legacy 404 was redesigned in PR #18:
  `lucide-react`. The new `.ab-nf-*` design uses pure typography and an
  inline arrow glyph; no icon library remains.
- **Plan 001 (2026-06-10)** — shadcn residue left over from PR #7's scaffold
  deletion: 27 `@radix-ui/*` packages (`react-accordion`, `react-alert-dialog`,
  `react-aspect-ratio`, `react-avatar`, `react-checkbox`, `react-collapsible`,
  `react-context-menu`, `react-dialog`, `react-dropdown-menu`,
  `react-hover-card`, `react-label`, `react-menubar`, `react-navigation-menu`,
  `react-popover`, `react-progress`, `react-radio-group`, `react-scroll-area`,
  `react-select`, `react-separator`, `react-slider`, `react-slot`,
  `react-switch`, `react-tabs`, `react-toast`, `react-toggle`,
  `react-toggle-group`, `react-tooltip`) plus 15 companions
  (`@hookform/resolvers`, `class-variance-authority`, `clsx`, `cmdk`,
  `date-fns`, `embla-carousel-react`, `input-otp`, `react-day-picker`,
  `react-hook-form`, `react-resizable-panels`, `recharts`, `tailwind-merge`,
  `tailwindcss-animate`, `vaul`, `zod`). `tailwind.config.ts` also lost
  the `chart`/`sidebar` color groups, the `accordion-down`/`accordion-up`
  keyframes + animations (which referenced `--radix-accordion-content-height`),
  and the `tailwindcss-animate` plugin. Runtime deps are now exactly
  `next`, `next-intl`, `react`, `react-dom`.

The first three followed gotcha `dead-deps-removal-dedicated-pr` — each was
its own PR, never bundled with feature work. Wave four rode inside PR #27 by
the owner's explicit call (plan-001 execution). **The dedicated-PR pattern
remains the default for any future dep removal.**

## 8. Directory structure

```
app/
  globals.css                     # All styling. Layers: tailwind, global HSL,
                                  #   legacy helpers, .ab-root (incl.
                                  #   .ab-legal-* + .ab-prose + .ab-nf-*),
                                  #   .sup-root (data-app="fingo"|"savely")
  [locale]/
    layout.tsx                    # Server Component. NextIntlClientProvider +
                                  #   unstable_setRequestLocale. next/font Inter.
                                  #   Metadata. Skip-link via getTranslations.
    page.tsx                      # Homepage (Client). useTranslations('home').
    not-found.tsx                 # 404. Server Component.
                                  #   getTranslations('notFound') + inline
                                  #   theme-init script.
    _not-found-controls.tsx       # Client island for the 404's theme + locale
                                  #   toggles (used by not-found.tsx).
    [...rest]/page.tsx            # Catch-all. Calls notFound() for unmatched
                                  #   URLs so the editorial 404 fires.
                                  #   The only ƒ (Dynamic) route in the build.
    privacy/ · terms/ · privacy/choices/
                                  # Inline .ab-root shells, useTranslations('legal').
                                  # Bilingual EN/ES.
    fingo/support/                # SupportShell, data-app="fingo".
                                  # useTranslations('support.fingo') + useMemo
                                  # adapter producing SupportContent.
    savely/support/               # SupportShell, data-app="savely".
                                  # useTranslations('support.savely') + useMemo
                                  # adapter producing SupportContent.
components/
  support-shell.tsx               # Reusable support shell. data-app union is
                                  #   "fingo" | "savely" only. Receives a
                                  #   SupportContent prop built by each page.
messages/
  en.json · es.json               # next-intl dictionaries.
                                  # Top-level: notFound, layout, legal, home,
                                  #   support (with support.fingo + support.savely).
public/                           # All static assets, logos, hero images
  cases/                          # Project preview screenshots (blip-hero,
                                  #   mezcal-hero, mezcal-mobile .webp);
                                  #   briefmark/pass images land here too
i18n.ts                           # next-intl config (createNextIntlPlugin)
middleware.ts                     # next-intl middleware (locale routing)
.eslintrc.json                    # extends next/core-web-vitals (PR #22)
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
| `infra-deploy-specialist` | `next.config.mjs`, package.json scripts, deps, `.eslintrc.json`, Amplify config |
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
