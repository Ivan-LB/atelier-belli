# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

> **Estado vivo y próximos pasos: lee `HANDOFF.md` primero.**

## 1. What this project does

Portfolio site of Ivan Lorenzana (Atelier Belli). **Two themed sub-sites** share
one Next.js app:

- **Homepage** at `/[locale]` — editorial redesign, `.ab-root` scope, light/dark
  theme toggle, showcase reel, selected-work index, workbench, and the case sheet.
  The homepage's parts live in `app/[locale]/_home/` (`cases.tsx` data,
  `showcase.tsx`, `case-sheet.tsx`, `case-media.tsx`); `page.tsx` composes them.
- **Support pages** at `/[locale]/fingo/support`, `/[locale]/savely/support`,
  `/[locale]/fave/support` (plan 007, PR #57) and `/[locale]/alisio/support`
  (2026-09-28, written from the Alisio repo; its skin is the app's own
  phosphor-on-black tokens) —
  reusable `SupportShell` keyed by `data-app`, `.sup-root` scope, per-app skin.
  Each consumes `useTranslations("support.<app>")` and builds a
  `SupportContent` adapter via `useMemo` (PRs #23 + #25). The previous
  `CONTENT[locale]` dictionary is gone. The shell's footer links **that app's
  own** privacy page, via the optional `privacyHref` on `SupportContent`
  (plan 011): each of the three pages passes `/<app>/privacy`, and the prop
  falls back to the shared `/privacy` for any future support page whose app has
  no policy of its own. It linked the shared `/privacy` until plan 011, which
  sent a Fingo user reading Fingo support to a page about the website.
- **Legal surfaces**: `/[locale]/privacy`, `/[locale]/privacy/choices`,
  `/[locale]/terms`, plus one privacy page per shipped app —
  `/[locale]/alisio/privacy`, `/fave/privacy`, `/fingo/privacy`,
  `/savely/privacy`. All are small inline `.ab-root` shells with the same
  editorial aesthetic as the homepage. Bilingual EN/ES bodies via
  `useTranslations('legal')`. The shared chrome + `.ab-prose` ruleset live
  in `app/globals.css`. (Previously used a legacy `SimplePageLayout` with
  gray/gradient aesthetic — removed in PR #12.)

  **Per-app privacy is the architecture** (owner decision, plan 009, PR #59).
  The shared `/privacy` covers the WEBSITE only: the `NEXT_LOCALE` cookie,
  the `ab_theme` localStorage entry, and the hosting + Google Fonts requests
  that genuinely leave the browser. Anything an app does belongs on that
  app's page, written from that app's repo and never from memory or from a
  plan's summary of it. Before this, one shared policy declared shipping
  addresses, credit card numbers and continuous geolocation for apps whose
  App Store listings say "No se recopilan datos".

  The shared page also carries a **"Privacy for our apps" section linking all
  four**. Do not remove it: App Store Connect still points the Alisio and
  Fingo listings at `/privacy`, so that section is the only route from those
  listings to the policy that describes them (`plans/README.md` human
  checklist #1 closes the window).

  A new legal page is 5 touches: `page.tsx` (clone `fave/privacy`
  structurally), a thin server `layout.tsx` beside it (clone any sibling; see
  the per-route metadata rule in §3), one path in `app/sitemap.ts`, and a
  `legal.<app>Privacy` namespace with BOTH a `title` and a `metaDescription`
  in BOTH dictionaries. `<ThemeInit />` must be the first child of
  `.ab-root` and `<main>` must carry `id="main-content"` (see the skip-link
  invariant in §3); `tests/e2e/legal.spec.ts` asserts both on every legal
  route, and `tests/e2e/seo.spec.ts` asserts the title and description, so a
  new page belongs in both specs' route lists.
- **404 page** at `/[locale]/not-found` — Server Component using
  `getTranslations("notFound")`, with a tiny client island
  (`_not-found-controls.tsx`) for theme + locale toggles. Backed by a
  catch-all route (`app/[locale]/[...rest]/page.tsx`) that calls
  `notFound()` for unmatched URLs (PR #18). `.ab-nf-*` chrome scoped under
  `.ab-root`.

Fully bilingual EN/ES. Static site (no database, no auth, no server actions).

### Jugo downloads (`public/jugo/`)

Static files for Jugo, the macOS battery app (repo `~/Projects/Swift/batteryAnimations`):
the notarized `Jugo-<version>.dmg` and Sparkle's `appcast.xml`. **The URL
`https://atelierbelli.com/jugo/appcast.xml` is compiled into every installed copy of the
app** (`SUFeedURL`), so never move or rename this folder; installed apps would silently stop
getting updates. Both files come out of that repo's `scripts/release.sh`; copy them here
unchanged (the appcast is signed). They bypass the locale middleware because the matcher
skips paths with a file extension. Keep older DMGs when adding a new one.

### Jugo landing (`/jugo`)

`app/[locale]/jugo/page.tsx` is a product page, not a legal one: it borrows the
legal chrome (`.ab-legal-nav`, `.ab-legal-foot`) and `.ab-root` themes, and adds a
local `.ab-jugo` scope in `globals.css` for the app's own voice (island black,
charging green `--jg-*`, never read outside that scope). Its hero is
`components/jugo-island.tsx`, a web port of the app's Dynamic-Island alert:
width and height open on two separate springs sampled as CSS `linear()` from
SwiftUI's `spring(duration:bounce:)`, so it moves like the real app. It only
animates while on screen and holds one alert open under reduced motion. The
case preview reuses `public/cases/jugo-island.webp` in a `.ab-mac-frame` bezel
(landscape, so `jugo` is in the `web-preview` list). Captures are renders of the
app's own SwiftUI views with real readings from a Mac, not mockups.

### Case studies (Selected Work)

**Which repo backs which case.** Derived from the action URLs in `page.tsx` and
each repo's `origin`, not from folder names — several do not match (`stampi` →
`loyalty-cards`, `mezcal` → `destileria-lorenzana`). Useful whenever a case
needs a re-capture, since that means booting the real product.

| case | repo(s) under `~/Projects` | remote |
|---|---|---|
| `alisio` | `Swift/Alisio` | `Ivan-LB/alisio` |
| `fave` | `Swift/Fave` | `Ivan-LB/fave` (private) |
| `stampi` | `Backend/pass` | `Ivan-LB/loyalty-cards` (private) |
| `fingo` | `Swift/Fingo` | `Ivan-LB/Fingo` |
| `vitapath` | `vitapath/{backend-spring, web-hospital, ios-patient, ios-paramedic}` | `Vitapath_Backend`, `Vitapath_Web`, `Vitapath`, `Vitapath_Paramedic` — **four independent repos**, default branch `v2.1` |
| `arrhythmia` | `Python/Arrhythmia-Detector` + `Python/arrhythmia-detector-web` | `arrhythmia-detector-backend` (public), `arrhythmia-detector-web` |
| `mezcal` | `React/destileria-lorenzana` | `Ivan-LB/destileria-lorenzana` |
| `briefmark` | `Swift/Briefmark` + `Backend/briefmark-backend` | `Briefmark`, `Briefmark-backend` |
| `savely` | `Swift/Savely` | `Ivan-LB/Savely` |
| `jugo` | `Swift/batteryAnimations` | none yet (local repo) |

One trap in that table. **`destileria-lorenzana`
has divergent history on purpose-ish** — `develop` is 7 commits ahead of `main`
and `main` 1 ahead of `develop`, because the redesign's individual PRs were
squashed into a single `Redesing (#13)` on main. The *content* of the two
branches is byte-identical (verified 2026-08-03); do not "fix" the divergence
by force-pushing either side.

Ten cases as of 2026-09-28, in this display order: `stampi`, `alisio`, `savely`,
`jugo`, `fave`, `fingo`, `vitapath`, `arrhythmia`, `mezcal`, `briefmark`.
**BLIP was retired** that day at Iván's request; `?case=blip` now opens nothing.
**Stampi is the case formerly keyed `pass`** (renamed 2026-09-28 and moved to 01 by
Iván's call, the day its public site went live). Its primary action is the site,
`stampi.atelierbelli.com`. Old `?case=pass` links resolve through
`LEGACY_CASE_KEYS` and rewrite the param. Copy is written from
`Backend/pass/PORTFOLIO.md`: never claim clients, revenue or usage, and never call
it an app (the wallet pass is the client). Fave and Savely are live on the App
Store; their primary actions are store links. Jugo's primary action is the
internal `/jugo` landing. The `mezcal` case displays as **Destilería Lorenzana**,
the real brand, since its live URL names it anyway.

**Order is defined once by `CASE_KEYS`** in `app/[locale]/_home/cases.tsx`, and
`num` is derived from the position, so it can no longer drift. All case data is
in that file's `DEFS` record (name, year, literal platform, stack, index chips,
actions, flagship flag, media) plus `cases.<key>.*` in both dictionaries. To add
or reorder a case:

1. Extend `CaseKey` and add a `DEFS` entry.
2. Add `cases.<key>` to **both** `messages/en.json` and `messages/es.json`
   (titleIt, tag, descRich with `<it>` tags, metaStatus, mshowStatus,
   kickerPlatform, kickerDomain, action labels, metaPlatform when `platform` is
   null; story + highlights when flagship).
3. Insert the key into `CASE_KEYS` (it is BOTH the render order AND the
   deep-link allowlist). Bump the ten-case count **and** the first-case
   (`stampi`) deep-link check in `tests/e2e/smoke.spec.ts`.
4. Give it a film in `FILMS`, or a still in `CasePreview` (`case-media.tsx`).
   A shipped product also goes in `REEL_KEYS` with a 12s cut in `public/cases/reel/`.

**Case copy is written from the repos, client first** (Iván's call,
2026-09-28). Each `descRich` opens with what the product does and for whom, in
plain words; the engineering sits in story and highlights for the hiring manager.
The facts behind every sentence were checked against each repo that day. Things
that are **false** and must not come back: Stripe, a storefront or checkout on the
mezcal site (it sells nothing); "private beta" for Vitapath (nothing is hosted);
"spinning arrows" in Fingo; Briefmark share-sheet input or search (you paste a
link, and there is no search); the old 98% for Arrhythmia except as the leaky
number it was. Vitapath and Briefmark carry **no action** rather than a disabled
one: an honest link does not exist yet.

**Previews.** A case with a film shows the film as the sheet's hero. The two
without one show a still in `CasePreview`: `mezcal` (a real capture in
`ab-browser-frame`) and `briefmark` (its onboarding screen in
`.ab-phone-img.briefmark`). The per-case preview captures and device combos the
old two-column modal used are gone with it. **All imgs must carry explicit
`width`/`height`.**

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

**arrhythmia**'s primary action links to the **public** backend repo
`github.com/Ivan-LB/arrhythmia-detector-backend` (verified 200 unauth; the web
repo is public too).

**Case taxonomy (plan 011, 2026-08-20). One rule per axis, all ten cases.**
Before this the modals drifted: the kicker's middle slot was a domain on five
cases and a technology on four, five different labels meant "not out yet", and
the index chips used a different vocabulary than the Stack row they claim to
summarize. The rules now are:

| Axis | Rule |
|---|---|
| Kicker | `Platform · Domain · Year`, from `cases.<key>.kickerPlatform` + `kickerDomain`, localized in both dictionaries |
| Mobile index line | `Platform · Domain · Status →`, same two keys plus `cases.<key>.mshowStatus` |
| Platform meta | `iOS N+`, the real deployment target read from that app's `project.pbxproj`. Backend frameworks belong in Stack, never here |
| Stack row | 3 to 4 core frameworks. `Node.js` is canonical, never `Node`; never bare `Swift` beside `SwiftUI` |
| Index chips | a **strict subset** of that case's Stack row |
| Actions | only real links. A case with nothing honest to link carries no action at all; disabled placeholder pills were retired 2026-09-28 |
| Preview frames | every plain phone is `--w: 280px`; a URL bar is the real domain when the site is live, otherwise a lowercase product slug, and is never localized |

**The kicker and the index line are built from the same `facet` value** (`useCases`)
so they cannot diverge again: the modal appends the year, the index appends the
status. Do not re-author either as a literal string. A static check of these
invariants (clock count, orphan chips, phone widths) lives in plan 011's tail.

**Two depth tiers, and only two.** **Flagship** carries `story` + `highlights`
(plus `media` where captures exist); **compact** carries none. There is no
gallery-only or story-without-highlights tier: `story` and `highlights` ship
together or not at all.

- flagship: `stampi`, `alisio`, `savely`, `vitapath`, `arrhythmia`
- compact: `fave`, `fingo`, `mezcal`, `briefmark`, `jugo`
- `stampi` is flagship **without** `media`; its launch film carries the visuals.

**Launch films (`film`, 2026-09-28).** Eight cases carry a 16:9 launch film with
sound (`FILMS` in `cases.tsx`; files in `public/cases/film/`, Jugo reuses
`public/cases/video/jugo-launch.mp4`). It is the **sheet's hero**. Separate from
`media` on purpose: those are silent looping demo clips, these never play unasked.
`<CaseFilm>` is a poster plus one play button, `preload="none"`, native controls
once started, and it calls `play()` **inside the click handler** because Safari
refuses an unmuted `play()` outside a user gesture; do not move that call into an
effect. No duration labels anywhere (Iván: every case has one, so it says
nothing). Sources were encoded `libx264 -crf 27 -preset slow`, AAC 112k,
`+faststart`, 1080p.

- `fave` and `fingo` are the strongest candidates for promotion next; both ship
  a support page and a privacy page already, so only the copy is missing.

**Savely's narrative is written from the app repo, not from memory.** Its
`/savely/privacy` page publishes the same facts in a quieter register, so any
highlight that contradicts that page means one of the two is wrong. In
particular the payday auto-move **schedules nothing**: enabling it on a goal
only makes that goal eligible, logging income may offer one move, and the
deposit is written only when the user taps YES. The app asks for **two**
permissions (camera and notifications), receipts arrive through an
out-of-process `PhotosPicker` that never grants photo-library access, and the
only export is a current-week PDF. The app is localized to es-419 and only
partly, so never invent Spanish for an in-app label: `Auto-move on payday` has
an empty localizations entry in `Localizable.xcstrings` and renders in English
on a Spanish device.

**Case-study depth (`story` / `highlights` / `media`)** — added 2026-07-30. A
`CaseData` entry may carry three optional fields that render as full-width bands
**inside the sheet's scroll area**, below the hero and the pitch. The pitch
stays the 30-second glance; the bands are the 5-minute read (PRODUCT.md
principle 2). The five flagship cases listed above carry them; the other five
degrade gracefully to the compact modal, so narrative can be added later
without touching code.

- `story`: exactly three `[label, body]` beats built by the `storyOf(key)` helper
  inside the `CASES` `useMemo`, reading `cases.storyLabels.*` (shared) plus
  `cases.<key>.story.{problem,approach,result}`. Rendered with **serif-italic
  run-in lead-ins** (`.ab-case-beats h4`), deliberately NOT another tracked-caps
  eyebrow — the sheet already spends that idiom once in `.ab-sheet-bar .eye`.
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

**Gotcha (fixed, do not regress):** `.ab-case-media img/video` cap at
`max-width: 100%` and `.ab-case-media > figure` carries `min-width: 0`. Without
them the intrinsic width of the media (a 1740px composite, a 1200px capture) sets
the sheet's width and the whole sheet scrolls sideways on a phone.

**Demo media capture recipes** (all assets are real captures, never mockups):
- Web surfaces: Playwright `recordVideo` against the running app, then ffmpeg
  (`setpts` to speed up, `libx264 -crf 30`). Console/ML clips are 1120×700.
- iOS/watchOS: `xcrun simctl io <udid> recordVideo` (headless; the GUI window is
  only needed to drive taps). In Xcode 27 the Simulator app is **Device Hub** —
  request computer-use access to "Device Hub", not "Simulator". Tap keys with
  small waits: rapid consecutive taps coalesce, and `type` triggers the iOS
  accent popup. `xcrun simctl privacy <udid> grant <service> <bundle>` skips the
  permission dialogs.
- `alisio-system.mp4` (740×740) is two **simultaneous** simctl recordings
  (iPhone + paired Watch, started together so they stay in sync) composited
  side by side with ffmpeg `overlay` + `drawbox` borders. It shows one live
  session: started on the phone, measured on the Watch, mirrored back, with the
  in-zone/out-of-zone badge flipping. That is the case's whole thesis.
- `vitapath-system.mp4` (1740×760) is the same trick across a **browser and a
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

**Case sheet invariants.** The case opens as a bottom sheet
(`_home/case-sheet.tsx`, `.ab-case-modal` + `.ab-sheet-*`): it rises on a drawer
curve (`cubic-bezier(0.32, 0.72, 0, 1)`, 560ms in, 380ms out) and its top bar can be
dragged down to dismiss: 1:1 while held, rubber-banded upward, dismissed on
distance (140px) or velocity (0.55 px/ms). The drag writes `transform` directly,
never a CSS variable, and clearing it hands the motion back to the transition from
where the finger left. The a11y invariants from 2026-08-02 carry over and stay
covered by e2e tests:

- It **traps focus** and sets `inert` on `main#main-content` + `header.ab-nav`
  while open. Without the `inert` half, `aria-modal="true"` is a lie.
- Closed, it carries **`visibility: hidden`** (delayed so the exit plays), or its
  close button stays in the tab order on every homepage load.
- Rows carry **`data-case`**, and a `?case=` deep link seeds the return focus from
  it, so closing lands on the matching row.
- `renderedKey` lags `openKey` so the sheet keeps painting the last case through
  its exit; because the body stays mounted, closing pauses every `<video>` inside.
- Never ship an `<a href="#">` dimmed with `pointer-events: none` as a "disabled"
  action: it stops the mouse and nothing else.

**Showcase reel (2026-09-28, replaced the three-piece vitrine).** Six shipped
products (`REEL_KEYS`: stampi, alisio, savely, fave, fingo, jugo), each a silent
12s cut of its own launch film in `public/cases/reel/` (1280x720, CRF 29, no
audio, 170 to 320 KB). One plays at a time; on `ended` the track advances.
The track is **native scroll with snap points**, so a swipe has the platform's own
momentum and can be caught mid-flight; an IntersectionObserver rooted on the
track decides which slide is centred. Dots are the same state as a remote: the
active one opens into a pill whose fill is a `scaleX` written from the clip's own
clock each frame (the width transition on the dots is deliberate: the neighbours
must slide aside). A peeking neighbour comes to the centre on click; only the
centred piece opens its case. Only the centred clip loads, everything pauses off
screen or in a hidden tab, and reduced motion starts paused on posters with the
same toggle. The Vitapath and Arrhythmia captures the old vitrine used are
deleted; neither is a shipped product.

**Pending:** `github.com/Ivan-LB/loyalty-cards` is private, so the Stampi case
links only its public site; if the repo goes public, add a GitHub ghost action.

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

**The locale is NOT in the URL** (changed 2026-08-02, at the owner's request).
`middleware.ts` sets `localePrefix: "never"`, so one set of URLs serves both
languages and next-intl rewrites internally onto the `app/[locale]/*` tree:

- `/`, `/privacy/`, `/terms/`, `/fingo/support/` … — the only public URLs
- Which language they serve is decided by the **`NEXT_LOCALE` cookie**, falling
  back to `Accept-Language`, falling back to `defaultLocale: "en"`
- Legacy `/en/...` and `/es/...` still **redirect** to the unprefixed route, so
  inbound links keep working (covered by an e2e test)
- `matcher` must be broad (`/((?!api|_next/static|_next/image|.*\.[\w]+$).*)`).
  The old `/(es|en)/:path*` matcher would never fire again.
- The `[locale]` folder stays on disk and `useParams().locale` keeps working —
  the segment is filled by the rewrite, it is just never visible.

**The language toggle writes the cookie and calls `router.refresh()`** — there is
no longer a URL to navigate to. `LOCALE_COOKIE` is exported from `i18n.ts`; the
old app-specific `preferred-language` cookie is gone. Both the homepage and the
404 island (`_not-found-controls.tsx`) use this path.

**Known, accepted trade-off:** Spanish no longer has a URL of its own, so it
cannot be indexed separately, and a shared link does not carry the language.
The `hreflang`/`languages` alternates were removed rather than left pointing at
routes that now 404. This was raised explicitly and chosen anyway — do not
"fix" it back without asking. (`localePrefix: "as-needed"` is the middle ground
if that ever gets revisited.)

Related fix in the same change: `generateMetadata` in the locale layout used to
set `canonical: /${locale}/`, which every nested route **inherited** — so
`/privacy`, `/terms` and both support pages each declared the homepage as their
canonical, i.e. told crawlers they were duplicates of it. The layout now sets no
`canonical` at all; add one per-route if a specific page ever needs it.

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

**Skip-link invariant (PR #58).** `app/[locale]/layout.tsx` renders
`<a href="#main-content">` as the first Tab stop of **every** page, so every
`<main>` in the tree must carry `id="main-content"`. Four pages shipped without
it (`/privacy`, `/terms`, `/privacy/choices` and the 404) and the site's first
keyboard affordance silently did nothing on all four until plan 008 fixed it.
A new route inherits the skip-link whether or not it wants to, so adding the id
is not optional. The homepage additionally relies on that exact selector: the
case modal sets `inert` on `main#main-content` while open, and
`tests/e2e/smoke.spec.ts` asserts it.

**Per-route metadata (plan 010, PR #60).** Every page under `app/[locale]` is
`"use client"` on line 1, and a client component cannot export
`generateMetadata` — so for a long time all eleven routes shared the root
layout's title and description, including the pages App Review opens. Each
sub-route segment now has a **thin server `layout.tsx`** whose only job is to
call `routeMetadata()` from `app/[locale]/_route-metadata.ts` and return
`children`. Ten of them exist; a new route without one silently inherits the
homepage's title.

Two things in that helper are load-bearing:

- **The locale is passed to `getTranslations({ locale, … })` explicitly**
  rather than read from next-intl's request store. That is what keeps the
  segments prerenderable — the build table must stay ● SSG everywhere except
  the catch-all, and a per-segment layout that flips a route to `ƒ` is a
  regression, not a detail.
- **Titles are emitted as `title.absolute`, not as bare strings.** Next
  resolves a bare-string title against the nearest ancestor template and then
  stops passing that template down, so the moment `/privacy` gained a title of
  its own, `/privacy/choices` silently rendered without the site name. Building
  the full title from `TITLE_TEMPLATE` in the helper makes every route correct
  on its own and immune to the next nested route.

`openGraph` is restated in full in the helper because Next **replaces** a
parent's `openGraph` wholesale as soon as a child defines one; trimming it to
just title/description would drop `og:image` from every sub-route. Still no
`alternates` anywhere: see the note in `layout.tsx`.

**The monogram lives in `components/brand-logo.tsx`.** It used to be inlined
twice, in the homepage header and in the 404, and the two drifted: the 404's
copy had **two of the four paths** and had the ink and accent roles swapped, so
that page rendered a broken hexagon with the turquoise on the wrong facet. Both
import `<BrandLogo>` now, and the colour roles are keyed to `.ab-logo` rather
than to one mount, so they cannot diverge again. `public/AtelierBelli.svg` is a
third copy by necessity (a favicon cannot import a component): **change the
geometry in one and change it in the other.** `components/theme-icons.tsx` is
the same arrangement for the sun/moon pair.

**Icons — all four now carry the SAME, CURRENT mark.** They did not before:
`public/AtelierBelli.png` held the **previous** logo (a blue/purple gradient
anvil) while `public/AtelierBelli.svg` held the current hexagonal monogram, so
the `shortcut` icon shipped a retired brand. The monogram is the live mark —
its path data is byte-identical to the inline `BRAND_LOGO` the header renders
(`page.tsx:86`).

| file | role | form |
|---|---|---|
| `public/AtelierBelli.svg` | `icons.icon`, the primary favicon | cream tile (`#faf8f3`, rx 112), fixed ink |
| `app/favicon.ico` | `/favicon.ico`, legacy + agents | real 3-entry .ico (16/32/48), cream ground |
| `public/AtelierBelli.png` | `icons.shortcut` | 192×192, cream ground |
| `public/apple-touch-icon.png` | iOS home screen | 180×180, **opaque** (iOS composites black behind alpha) |

The SVG carries an embedded `<style>` with the same `.ab-dark` / `.ab-accent`
role names as `BRAND_LOGO`, on an **opaque cream tile**. It used to be
transparent with a `prefers-color-scheme: dark` rule flipping the ink to cream,
but that query reports the OS setting, not the tab strip: a dark OS with a light
tab strip rendered a cream mark on a light tab with only the turquoise visible
(reported 2026-09-28). **Do not reintroduce a colour-scheme query in a favicon.**
All four icons now share the cream ground.

To regenerate: `rsvg-convert -w 1024 public/AtelierBelli.svg` for the master,
then `magick` to resize, centre on `#faf8f3` and `-alpha remove`; build the .ico
from 16/32/48 PNGs. **`sips` cannot produce a real .ico** — do not ship a
renamed PNG. `out/` holds stale 2025 exports of the OLD logo; ignore it.

**Hybrid font loading** (intentional — see gotcha `google-fonts-hybrid-loading`,
but note the split changed 2026-08-02):

- `next/font/google` in `app/[locale]/layout.tsx` loads **Inter** as
  `--font-inter` **and Fraunces** as `--font-fraunces` (axes `SOFT` + `opsz`,
  normal + italic), both applied via `<html className={...}>`.
- `@import` at the top of `app/globals.css` ships only **Inter, EB Garamond,
  Instrument Serif, IBM Plex Mono** for CSS-level `font-family` references.

**Do not move Fraunces back into the `@import`.** It sets every display heading,
so it is the LCP element, and the `@import` reaches it through three dependent
hops — HTML → `layout.css` → `fonts.googleapis.com` → `fonts.gstatic.com` — with
no `preconnect` on either cross-origin host. Measured on a 150 ms-RTT link the
woff2 was not even *requested* until 1410 ms. It was also the site's CLS: the
swap from the fallback re-wrapped the headings. `next/font` self-hosts it under
`/_next/static/media` (same origin as the document, so all three hops go away)
and emits a metric-matched `"Fraunces Fallback"` face, which is what removes the
reflow. `--ab-serif` therefore reads `var(--font-fraunces)`, **not** a literal
`"Fraunces"` — a literal would silently fall through to Cormorant/Georgia.
Verified in dev: 0 cross-origin Fraunces requests, 0 `googleapis` CSS requests.
**Amplify-smoke this region before merging** (same rule as the i18n provider).

**Deploy**: AWS Amplify. No `amplify.yml` in the repo — build config is in the
Amplify console. **CI does exist**: `.github/workflows/build-check.yml` runs
`pnpm install --frozen-lockfile` + `pnpm verify` + `pnpm build` on every push and
PR to `main`/`develop`. It is a deliberate mirror of the Amplify build — pnpm is
installed as `latest` and the store is **not** cached, both so a pnpm/format
change or an unapproved dependency build script fails the PR instead of failing
silently on Amplify. It is stricter than Amplify, because the production build
has `ignoreBuildErrors`/`ignoreDuringBuilds` on and `pnpm verify` does not.
(This file previously claimed there was no CI; that was false — do not act on
that assumption.)
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

**The nav below 820px (plan 012).** `.ab-nav-inner` is `display: flex;
flex-wrap: wrap` there, not grid, so the control cluster drops to its own line
at the width where it genuinely stops fitting beside the brand rather than at a
number someone guessed: `Contacto` is 10px wider than `Contact`, and each locale
breaks where it actually breaks. Measured to the pixel: EN is two rows at
<= 412px and one row from **413px**, ES two rows at <= 422px and one from
**423px**. Four things in that region are load-bearing:

- **The hidden element is `<nav>`, not `.ab-nav-links`.** The wrapper stays a
  layout item with its `<ul>` hidden, so it used to consume the second of the
  two grid columns and strand `.ab-nav-end` on an implicit second row at *every*
  width <= 820px, tablets included. That was never intentional: the block has
  declared `1fr auto` since `fe3a590`.
- **`.ab-nav-inner` must keep its padding in LONGHAND.** The element is also
  `.ab-wrap`, and a `padding: 14px 0` shorthand resets `.ab-wrap`'s inline
  padding to zero. It did, for a long time: the brand sat at x=0 while every
  section below it started at `--ab-pad` (20px on a phone, 51px at 1280px) and
  the theme toggle touched the right edge.
- **`.ab-brand-tag` hides at 900px, not 820px.** Once the nav carries that inline
  padding the brand's 203px no longer fits its `1fr` column between 821 and
  ~860px, and it wraps to two lines inside a sticky header. Dropping "Est. 2023"
  is the design's own first concession; the breakpoint just follows the geometry.
- **A bare class on a `<button>` under `.ab-root` loses `font`, `color` and
  `border`.** `.ab-root button` (`globals.css:208`) resets all three at
  specificity (0,1,1), which outranks any single class (0,1,0). It had silently
  defeated **four** separate components: `.ab-chip` (the language pill),
  `.ab-nf-ctrl` (the 404 controls), `.ab-theme-toggle` (the sun/moon, on both
  pages) and `.ab-case-close` (the modal close). All four declared a 1px border
  and none of them drew one. **Prefix the selector with `.ab-root`** so it
  reaches (0,2,0), which is what the last three now do; the language pill
  escapes it instead by putting the chrome on a `<div>` wrapper. Any new
  button-borne class needs the same care.

`.ab-chip-contact` is the only action in that cluster, so it takes
`.ab-btn-mail`'s full-strength `--ab-fg` border rather than a fill or an accent,
which is how the rest of the site marks a primary action. Its label is
`t("nav.contact")`, the same key the desktop link uses, so the two cannot drift.
There is deliberately **no hamburger menu** (owner's call).

**The language control is a segmented pill, and four things about it are
deliberate.** It was one `<button>` rendering the active language first, so
switching moved the half you had just clicked, and pressing the language you
were already in switched you away from it.

- **Fixed `en`-then-`es` order**, never by which is active. The active segment
  carries `aria-current="true"`; `goToLocale(target)` takes an explicit target,
  so pressing the current one is a real no-op.
- **Both segments stay `<button>`s** through the switch. Making the active one a
  `<span>` is tidier in the a11y tree but the element then disappears under the
  user on switch, and keyboard focus goes with it.
- **`role="group"` + `locale.groupAria` names the control; the buttons are named
  by their visible "EN"/"ES"** and carry `lang` so each is announced in its own
  voice. The old `aria-label="Cambiar a Español"` over a button reading "ES" put
  the accessible name out of step with the visible one (WCAG 2.5.3).
- **The pill is `inline-grid` with `1fr auto 1fr`.** "EN" and "ES" differ by
  1.1px and flex has no free space to even them out, which is what lets
  `.ab-lang-ind` be a plain 50% translate instead of a measured offset.

**The one authored moment in the nav is that indicator travelling**, and it is
sequenced against the router on purpose. `switchLocale` writes the cookie and
calls `router.refresh()`, which **replaces this whole subtree** (measured: the
pill node identity changes). A refresh landing mid-slide leaves the ground
teleporting the rest of the way, so the click sets an optimistic `pendingLocale`
(the indicator moves on the click, not on the response) and the refresh is
deferred by `LOCALE_SLIDE_MS` (300ms, just over the 280ms transition). Under
`prefers-reduced-motion` the delay is 0 and the transition is `none`: the state
still changes, it just does not travel. Verified 34 sampled positions settling
at 289ms, versus 9 positions truncated at 105ms before the deferral.

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
`legal`, `home`, `support` (with `support.fingo.*` and `support.savely.*`),
and `jugo` (the `/jugo` landing).
Adding new copy = pick the right namespace, add the key to BOTH dictionaries
(EN value matches user-facing English; ES matches Spanish), then consume via
`useTranslations(namespace)`.

**No em dashes in `messages/*.json`.** Plan 011 swept the last 25 EN and 24 ES
strings out and both files are now at zero; a `grep -c '—' messages/*.json`
that returns anything but 0 is a regression. Replace the dash with the
punctuation that carries its job (a colon for an appositive, parentheses for an
aside, a period for two sentences), never with a hyphen. Two structural dashes
are **not** copy and stay: the case title pattern `pre: "Alisio — "` in
`page.tsx`, and `TITLE_TEMPLATE` in `_route-metadata.ts`, which
`tests/e2e/seo.spec.ts:95` pins.

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
    _route-metadata.ts            # routeMetadata() helper: builds each
                                  #   sub-route's generateMetadata (title,
                                  #   description, openGraph). See §3.
    privacy/ · terms/ · privacy/choices/
                                  # Inline .ab-root shells, useTranslations('legal').
                                  # Bilingual EN/ES. /privacy is website-only
                                  # and links the four app policies.
    alisio/privacy/ · fave/privacy/ · fingo/privacy/ · savely/privacy/
                                  # One privacy page per shipped app, same
                                  # shell. legal.<app>Privacy namespaces.
    <every sub-route>/layout.tsx  # Thin SERVER layout per segment (10 of
                                  #   them). generateMetadata only; returns
                                  #   children. NO "use client". See §3.
    fingo/support/                # SupportShell, data-app="fingo".
                                  # useTranslations('support.fingo') + useMemo
                                  # adapter producing SupportContent.
    savely/support/ · fave/support/
                                  # Same shell, data-app="savely" | "fave".
components/
  brand-logo.tsx                  # The monogram, shared by the header and the
                                  #   404. Colour roles via .ab-logo .ab-dark /
                                  #   .ab-accent. Was inlined twice and drifted.
  theme-icons.tsx                 # The sun/moon pair, shared by the header's
                                  #   .ab-theme-toggle and the 404's.
  support-shell.tsx               # Reusable support shell, keyed by data-app.
                                  #   Receives a SupportContent prop built by
                                  #   each page.
  theme-init.tsx                  # Inline script + effect that mirrors the
                                  #   homepage's ab_theme choice onto whatever
                                  #   root it renders inside. FIRST child of
                                  #   every .ab-root / .sup-root (plan 007).
messages/
  en.json · es.json               # next-intl dictionaries.
                                  # Top-level: notFound, layout, legal, home,
                                  #   support (with support.fingo + support.savely).
app/favicon.ico                   # Real 3-entry .ico (16/32/48). Next
                                  #   serves it at /favicon.ico.
public/                           # All static assets, logos, hero images
  apple-touch-icon.png            # 180×180, opaque, from the SVG mark
  cases/                          # film/ (launch films), reel/ (12s showcase
                                  #   cuts), video/ + gallery/ (case media),
                                  #   and the mezcal/briefmark stills
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
