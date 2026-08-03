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

Nine cases as of 2026-07-24, in this display order: `alisio`, `pass`, `fingo`,
`vitapath`, `arrhythmia`, `mezcal`, `briefmark`, `savely`, `blip`. **Order is
defined once by the `CASE_KEYS` array** (top of `page.tsx`) — the Selected Work
list maps over it, and each `CASES` entry's `num` must match its position
(01–09). All case data lives in `app/[locale]/page.tsx` — there are NO per-case
route files. To add (or reorder) a case:

1. Extend the `CaseKey` union.
2. Add an entry to the `CASES` record (inside `useMemo`) — num, kicker, title,
   `t.rich` desc, meta rows, actions.
3. Add an entry to `indexInfo` in the Selected Work list (name/tag/stack/mshow).
4. Add a branch to `CasePreview` at the bottom of the file.
5. Add `cases.<key>` to **both** `messages/en.json` and `messages/es.json`
   (titleIt, descRich with `<it>` tags, metaStatus, actionPrimary, tag,
   metaPlatform when not iOS).
6. Insert the key into `CASE_KEYS` at the desired display position (it is BOTH
   the render order AND the deep-link allowlist), then fix every `num` so it
   matches its position. Bump the nine-case count assertion **and** the
   first-case (`alisio`) deep-link check in `tests/e2e/smoke.spec.ts`
   (Tests 5 and 7).

**Previews:** project screenshots live in `public/cases/` (fingo/savely
predate the folder and keep their root-level `public/*-hero.*` files).
fingo/savely use the `ab-phone-img` phone frame; blip and mezcal render real
captures inside `ab-browser-frame` via the `.ab-browser-shot` img class
(16:10, explicit width/height). **briefmark** now uses a real capture of its
onboarding screen (`public/cases/briefmark-hero.webp`, 600×1304) in the
`.ab-phone-img.briefmark` phone frame — it replaced the fake `ab-mez-site`
HTML mock, which read as a broken image; that mock's CSS was deleted with it.
**pass** has no UI at all, so it renders the `.ab-arch` architecture SVG. The modal wrapper adds `web-preview` for every browser-frame
preview via an `includes([...])` check — keep that list in sync (alisio is a
device combo, NOT web, so it stays OUT of that list). **All
preview imgs must carry explicit `width`/`height`** — without them the
transparent-frame slots collapse to zero height until the lazy image paints
(this bit Savely once; fixed in `5f8e600`).

**alisio** is the first iOS + Apple Watch case and uses a bespoke
`.ab-alisio-combo` preview: an `.ab-phone-img.alisio` phone (Live-session
screen) with an `.ab-alisio-watch` rounded-square watch (Goal-reached screen)
overlapping the bottom-left corner. Both `public/cases/alisio-hero.webp`
(953×2109) and `public/cases/alisio-watch.webp` (249×293) were cropped from
the App Store **marketing** frames in
`~/Projects/Swift/Alisio/marketing/appstore-screenshots/` (headline + device
bezel stripped so the raw screen sits in the CSS frame). Shipped 2026-07-23:
the primary action links to `apps.apple.com/mx/app/alisio/id6793006694`
(`kind: "primary"`, external) and `metaStatus` reads "Live on the App Store".

Its **watch gallery** (`public/cases/gallery/alisio-w1..w4.webp`, 416×496) is
four raw watchOS captures taken with `xcrun simctl io <watch-udid> screenshot`
during one real session, and they read as a sequence: pick a zone with the
crown → out of zone (amber) → back in zone (green) → goal completed with the
ring closed. They replaced four **App Store marketing frames** (headline over a
saturated colour block, crop marks) that looked like ads dropped into a case
study while every other gallery held product captures. To reproduce: boot the
paired iPhone 17 Pro Max + Apple Watch Series 11 (46mm), launch the watch app
**first** so `WCSession` reports the app installed (otherwise the phone's
"Start on Apple Watch" CTA stays disabled), start the session from the phone,
and screenshot the watch on a timer — the mock heart rate drifts in and out of
Zone 2 on its own. For a goal-completed frame, step the phone's "Time in zone"
down to **5 min** with the −5 stepper; in-zone time accrues at roughly half of
wall clock, so it closes in ~11 minutes. The watch's End button is **below the
fold** — drag up on the live screen to reveal it. There is no goal-celebration
screen on the watch (the ring simply completes) and no session summary either;
the summary lives on the phone. A `Alisio Watch Complication` target does exist,
but the simulator's default face has no complication slots, so the gallery does
not show one — do not re-add that claim to `watchCaption`.

**arrhythmia** (web · ML, num `05`) uses a REAL screenshot
(`public/cases/arrhythmia-hero.webp`, 900×562, 16:10, cropped from that repo's
`docs/screenshots/02-trace-overview.png`) in the `ab-browser-frame has-shot`
treatment; its primary action links to the **public** backend repo
`github.com/Ivan-LB/arrhythmia-detector-backend` (verified 200 unauth).
**vitapath** (iOS + Web + Spring, num `04`, private repos, MVP) uses a REAL
screenshot of the hospital console's **live dispatch map** (Baja California with
paramedic markers) — `public/cases/vitapath-hero.webp`, 1200×750, 16:10 — in
`ab-browser-frame has-shot`. Captured with Playwright by logging into the
`web-hospital` Vite dev server (:5173) against the full local stack (Spring Boot
on :8080 + PostGIS/MinIO via `backend-spring` → `docker compose up`; seeded admin
`hospital@example.com`). To re-capture: bring that stack up, then rerun the
login+screenshot Playwright script against `/mapa`. Its action is a disabled
"Private beta". Both vitapath and arrhythmia are in the `web-preview` list.

**Case-study depth (`story` / `highlights` / `media`)** — added 2026-07-30. A
`CaseData` entry may carry three optional fields that render as full-width bands
**inside the modal's existing scroll area**, below the two-column fold. The fold
stays the 30-second glance; the bands are the 5-minute read (PRODUCT.md
principle 2). Only the four flagship cases (`alisio`, `pass`, `vitapath`,
`arrhythmia`) carry them; the other five degrade gracefully to the compact
modal, so narrative can be added later without touching code.

- `story`: exactly three `[label, body]` beats built by the `storyOf(key)` helper
  inside the `CASES` `useMemo`, reading `cases.storyLabels.*` (shared) plus
  `cases.<key>.story.{problem,approach,result}`. Rendered with **serif-italic
  run-in lead-ins** (`.ab-case-beats h4`), deliberately NOT another tracked-caps
  eyebrow — the modal already spends that idiom once in `.ab-case-head .eye`.
- `highlights`: `t.raw("cases.<key>.highlights")` string array; a typographic
  list with accent dashes, two roomy columns via
  `minmax(min(100%, 400px), 1fr)`. Not a card grid.
- `media`: an **array** of blocks, each `{kind: "video"}` or `{kind: "gallery"}`.
  Videos use `preload="none"` + an IntersectionObserver so nothing is fetched
  until the band scrolls into view and only the visible clip plays;
  `prefers-reduced-motion` swaps autoplay for a poster plus real controls.
  `frame` picks the chrome: `browser` (browser frame), `phone`
  (`.ab-phone-img`), or `bare` (no chrome, natural aspect — for multi-surface
  composites, rendered with the `wide` figure).

**Gotcha (fixed, do not regress):** `.ab-case-body > * { min-width: 0 }` is
load-bearing. Without it the intrinsic width of the media (a 1400px composite, a
1200px capture) sets the grid track's min-content and the whole modal scrolls
sideways on mobile with text clipped. `.ab-case-media img/video` also cap at
`max-width: 100%`.

**Demo media capture recipes** (all assets are real captures, never mockups):
- Web surfaces: Playwright `recordVideo` against the running app, then ffmpeg
  (`setpts` to speed up, `libx264 -crf 30`). Console/ML clips are 1120×700.
- iOS/watchOS: `xcrun simctl io <udid> recordVideo` (headless; the GUI window is
  only needed to drive taps). In Xcode 27 the Simulator app is **Device Hub** —
  request computer-use access to "Device Hub", not "Simulator". Tap keys with
  small waits: rapid consecutive taps coalesce, and `type` triggers the iOS
  accent popup. `xcrun simctl privacy <udid> grant <service> <bundle>` skips the
  permission dialogs.
- `alisio-system.mp4` (1400×760) is two **simultaneous** simctl recordings
  (iPhone + paired Watch, started together so they stay in sync) composited
  side by side with ffmpeg `overlay` + `drawbox` borders. It shows one live
  session: started on the phone, measured on the Watch, mirrored back, with the
  in-zone/out-of-zone badge flipping. That is the case's whole thesis.
- `vitapath-system.mp4` (1600×760) is the same trick across a **browser and a
  phone**: a Playwright `recordVideo` of the console started alongside a simctl
  recording of the paramedic app, then the SOS fired by API ~10s in so both
  surfaces capture the same emergency. Cut to the synchronised window and
  composited console-left / phone-right. It shows the console holding the
  emergency as "esperando paramédico" while the offer lands on the phone, the
  accept, and both flipping to en route with the real OSRM road route.
  The paramedic app's own **"Simulate movement"** debug chip drives the pin
  along the route and trips the arrival geofence, which unlocks Transport /
  Complete and reveals the patient PHI — good footage, no real device needed.
- Vitapath's patient-app stills came from a real API-driven emergency (SOS →
  accept), captured with `simctl io screenshot` after relaunching the app so it
  reopened on the live-tracking screen.
- Login walls: both Vitapath apps gate everything behind auth, and each has a
  **debug autofill icon** in the nav bar that fills the current onboarding step
  (6 steps for the patient profile). Accounts and the full runbook live in
  `~/Projects/vitapath/DEMO.md`.

**Vitrine composition below 820px (do not revert to centring).** The carousel
row is sized by its tallest slide, and the slides cannot be equalised: the
Alisio card is a portrait phone (aspect 0.4601, so height = width × 2.1733)
while the other two are landscape browser frames (400:260). Even with the phone
at its legibility floor (~150px wide) and a combo at the widest the
`min(88%, 330px)` slot allows, the heights still differ ~1.5×. That slack is
structural. `.ab-phones` therefore uses **`align-items: end`** and
`.ab-phone-slot` **`justify-content: flex-end`**, so all three captions land on
one baseline and the whole slack sits as one band above the short cards. It
previously used `center`, which halved the slack: that stranded the combo cards
mid-row and put their captions **116px** off the phone's, so a swipe made the
caption jump. The old comment justified centring with "you only ever see one
card at a time" — measured and false: a neighbour always peeks and at 820px two
full cards show. Do **not** reinstate the desktop's `min-height: 640px` here; it
would add ~140px of dead space to every slide, and `align-items: end` already
buys the shared baseline. Do **not** shrink `.ab-phone-img.alisio` to close the
gap either — Alisio is the emphasized slot (`1.15fr`, `.center`, `scale(1.06)`,
`z-index: 2`, its own 272px vitrine override), so shrinking it trades the
hierarchy for whitespace. Verified capSpread 0 at 320/375/414/500/640/723/820 in
both locales and both themes, with ≥821px bit-identical to before.

**Vitrine (hero showcase):** three pieces, all 2026 as of 2026-07-30 —
**Vitapath** (`.ab-vit-web-combo tilt-l`: console capture in the browser frame
plus the patient app's live-tracking screen as the mini phone, so the hero shows
the multi-surface nature at a glance), **Alisio** (center, emphasized slot) and
**Arrhythmia Detector** (`.ab-vit-web-combo tilt-r`, browser only). This
replaced Fingo (2024) and Destilería (2025) — the trio now leads with the
strongest recent work. Alisio renders a **raw device capture** of the Train
screen in the rounded `.ab-phone-img.alisio` card, via
`public/cases/alisio-vitrine.webp` (600×1304). It used to be the full App Store
marketing frame `iphone_01_train.png`, but that poster carried crop marks, an
"ALISIO" slug, a sliced tab bar and — inside the screenshot itself — a
**disabled** "Start on Apple Watch" CTA under an amber "Install Alisio on your
Apple Watch to start" warning: the hero of the vitrine advertised a broken
state. The replacement is `xcrun simctl io … screenshot` of the real app with
the Watch app installed (CTA green, no warning), resized 1320×2868 → 600×1304.
That resize is exact — the App Store 6.9" poster has the same aspect as the
device screen — so **no CSS or `page.tsx` change was needed**, and the vitrine
is now three real product captures instead of two captures plus one ad.
Sized to 272px through
`.ab-vitrine .ab-phone-img.alisio` so the modal's 244px is untouched.
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
