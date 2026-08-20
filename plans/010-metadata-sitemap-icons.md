# Plan 010: Per-route metadata, sitemap rewrite, icons

> **Executor instructions**: steps in order, verify everything, honor STOPs,
> update your README row. Repo rules: branch from `develop`, PR to `develop`,
> **no AI signatures**, explicit staging, pnpm only, never `pnpm build` with a
> live :3000 dev server. **This plan touches the Amplify-sensitive layout head
> region: the release PR requires an Amplify deploy-preview smoke before merge
> (precedent: plan 005; CLAUDE.md §6).**

> **Drift check (run first)**:
> **HARD DEPENDENCY: plans 007 and 009 must have landed** (this plan emits the
> FINAL route list). Confirm: `ls app/[locale]/fave/support app/[locale]/alisio/privacy app/[locale]/fingo/privacy app/[locale]/savely/privacy`
> — all four exist, else STOP.
> `git diff --stat 07a1f02..origin/develop -- app/sitemap.ts "app/[locale]/layout.tsx" app/robots.ts public/` and re-verify anchors.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — layout head region is Amplify-sensitive; per-segment layouts
  must not change the SSG build shape.
- **Depends on**: 007 + 009 (**hard**).
- **Category**: SEO / infrastructure
- **Planned at**: commit `07a1f02`, 2026-08-19

## Why this matters

1. **The sitemap is 100% redirects.** `app/sitemap.ts:17-27` still builds
   `${BASE}/${locale}${path}/` for en+es — fossil from before PR #45 set
   `localePrefix: "never"`. All 14 `<loc>` values 307-redirect, none of the
   real URLs appear, and the file re-embeds the hreflang alternates that #45
   deliberately removed from the layout (see the comment at
   `app/[locale]/layout.tsx:44-51` — that removal is an accepted decision, do
   not resurrect alternates anywhere).
2. **All routes share one `<title>` and description.** The only metadata export
   in the tree is the layout's (`layout.tsx:32-62`). Every legal/support page
   presents as the homepage — including the pages App Review opens. The shared
   description also showcases Fingo/Savely/Mezcal instead of the current
   flagship lineup (Alisio, Vitapath, Arrhythmia).
   **Constraint discovered in planning: all six sub-route pages are
   `"use client"` (line 1 of each page.tsx) — a client component CANNOT export
   `generateMetadata`.** The fix is thin per-segment SERVER `layout.tsx` files.
3. **Icons**: `icons: { icon: "/AtelierBelli.svg", shortcut: "/AtelierBelli.png" }`
   (`layout.tsx:43`) covers browser tabs, but `/favicon.ico` 404s on prod and
   there is no apple-touch-icon (`/apple-touch-icon.png` 404) — iOS
   home-screen saves and .ico-convention agents get nothing.
4. Smaller: `og:url` absent on every route; `theme-color` hardcoded to light
   cream `#FAF8F3` (`layout.tsx:89`) regardless of theme.

## Current state — verify it yourself

```bash
grep -rn "generateMetadata\|export const metadata" app/ | grep -v layout.tsx
# Expected: empty (single metadata source)
head -1 app/[locale]/privacy/page.tsx
# Expected: "use client"
curl -s -o /dev/null -w "%{http_code}\n" https://atelierbelli.com/apple-touch-icon.png https://atelierbelli.com/favicon.ico
# Expected: 404, 404
```

## The final route list (11 URLs, all unprefixed, trailing slash)

`/`, `/privacy/`, `/privacy/choices/`, `/terms/`, `/alisio/privacy/`,
`/fave/privacy/`, `/fave/support/`, `/fingo/privacy/`, `/fingo/support/`,
`/savely/privacy/`, `/savely/support/`

## Skills

`/marketing-psychology` + `/marketing-ideas` for the meta descriptions — a
SERP snippet is sales copy (the homepage description should sell the CURRENT
flagships). NO em-dashes in new strings. Bilingual note: metadata comes from
the request locale; descriptions live in the dictionaries
(`layout.metaTitle`/`metaDescription` pattern) — keep both locales real.

## Scope

**In scope:** `app/sitemap.ts` (full rewrite); `app/[locale]/layout.tsx`
(title template, refreshed description keys, `icons.apple`, `openGraph.url`,
theme-color pair); NEW thin server `layout.tsx` per sub-route segment (6-8
files: privacy/, privacy/choices/ if needed, terms/, fave/privacy/,
fave/support/, fingo/privacy/, fingo/support/, alisio/privacy/,
savely/privacy/, savely/support/ — one per segment that has a page);
`public/apple-touch-icon.png` NEW (180×180); `app/favicon.ico` NEW (Next
serves `app/favicon.ico` at `/favicon.ico`); `messages/*` — `layout.metaTitle`
/ `metaDescription` refresh + per-route title/description keys (reuse existing
namespace titles where they exist, e.g. `legal.privacy.title`);
`tests/e2e/seo.spec.ts` NEW; optional `public/llms.txt`; `plans/README.md` row.

**Out of scope:** hreflang/canonical alternates (REMOVED BY DESIGN — do not
re-add, per layout.tsx:44-51 and HANDOFF), robots.ts (correct as-is), any page
body/copy, the CloudFront cache-key issue (accepted, documented in HANDOFF).

## Steps

### Step 1: sitemap rewrite
Drop the locale loop AND the alternates block; emit the 11 URLs above as
`${BASE}${path}/`.
**Verify**: `curl -s localhost:3000/sitemap.xml | grep -c "<loc>"` = 11 and `grep -c "/en/\|/es/"` = 0.

### Step 2: layout metadata
`title: { default: <metaTitle>, template: "%s — Atelier Belli" }` (the em dash
in the TEMPLATE is structural, allowed); refreshed `layout.metaDescription`
(current lineup) in both locales; `icons.apple: "/apple-touch-icon.png"`;
`openGraph.url` via metadataBase; replace the hardcoded theme-color meta
(`:89`) with a light/dark pair using `media: "(prefers-color-scheme: …)"`.
Note the in-page theme TOGGLE won't update theme-color (media query tracks OS
only) — log that as a maintenance note, do not build a client sync.
**Verify**: `pnpm build` route table shape unchanged (all ● SSG, catch-all only ƒ).

### Step 3: per-segment server layouts
For each sub-route segment, a thin `layout.tsx` (NO "use client") exporting
`generateMetadata` (title + description from existing namespaces via
`getTranslations`) and returning `children`. Share a tiny helper if it stays
readable. Titles: distinct per route (e.g. "Privacy Policy", "Fave Support");
the template appends the site name.
**Verify**: `curl -s localhost:3000/privacy/ | grep -o "<title>[^<]*"` differs
from the homepage title; repeat for all 10 sub-routes; es variants localized.

### Step 4: icons
Export `public/apple-touch-icon.png` (180×180, from `public/AtelierBelli.png`
or the SVG — `sips` can resize PNGs: `sips -z 180 180 in.png --out out.png`;
give it an opaque background, iOS composites black behind transparency).
`app/favicon.ico`: a real .ico. **If no tool on the machine produces a real
multi-size .ico (sips cannot; check `which magick png2ico icotool`), STOP and
ask the owner to supply the file rather than shipping a renamed PNG.**
**Verify**: both URLs 200 on dev; `sips -g pixelWidth public/apple-touch-icon.png` = 180.

### Step 5: e2e
New `tests/e2e/seo.spec.ts`: sitemap has no locale-prefixed URL and exactly the
11 locs; `/privacy/` title ≠ bare "Atelier Belli"; head has apple-touch-icon
link.
**Verify**: `pnpm test:e2e` fully green.

## Test plan
`pnpm verify` → `pnpm build` (check :3000 first!) with route-table diff →
`pnpm test:e2e` → **Amplify deploy preview smoke** (title per route, icons 200)
before merge to main at release time.

## Done criteria
- [ ] Sitemap: 11 canonical URLs, zero redirects, zero alternates
- [ ] Unique title + description per route, both locales
- [ ] apple-touch-icon + favicon.ico live
- [ ] Build shape unchanged (SSG everywhere, one ƒ)
- [ ] verify + e2e green; `git status` clean of out-of-scope files; README row

## STOP conditions
- 007/009 not landed (route list incomplete).
- A per-segment layout flips any route off SSG in the build table.
- No real .ico tool available (ask, don't fake).
- Anything wants to re-add hreflang/canonical — that is an accepted decision,
  stop and re-read layout.tsx:44-51.

## Maintenance notes
- theme-color follows OS, not the in-page toggle: acceptable, documented gap.
- If Search Console is verified later (human checklist), resubmit this sitemap.

---

## Landed from 007 that changes this plan (2026-08-20)

- **`/fave/support` exists**, so your per-segment `layout.tsx` list is now
  correct as written for that route, and your drift check will find it.
- **`app/sitemap.ts` carries `/fave/support`** as a single added path. Your
  wholesale rewrite absorbs it, as 007 anticipated.
- **`public/apps/` is NEW** and holds `savely-icon.webp`, `fingo-icon.webp`,
  `fave-icon.webp` (256×256, extracted from each app's own iOS asset catalog;
  Savely's is recomposed from its Icon Composer stack). These are the support
  pages' mastheads. They are NOT favicons and do not collide with the
  `public/apple-touch-icon.png` / `app/favicon.ico` this plan adds, but they
  are a second icon location worth knowing about before you add a third.
- The support namespace lost `hero.eye`, `sectionLabels`, `status.titleHtml`
  and `status.sub`, and `status.rows` became `facts`. If any metadata key you
  add reuses a `support.*` title, re-read the namespace first.

---

## Landed from 009 that changes this plan (2026-08-20)

**Your hard dependency is satisfied.** `app/[locale]/alisio/privacy`,
`fingo/privacy` and `savely/privacy` all exist, so the drift-check `ls` passes
and the route list below is final. 010 is now unblocked.

**The 11-URL list in this plan is exactly the `paths` array in
`app/sitemap.ts`.** 009 added the three privacy paths in place, so the file now
holds all 11 entries at `:4-16` and the only thing left for you to delete is the
locale loop and the alternates block at `:18-32`. The rewrite is therefore
smaller than planned: keep the array, drop `locales`, emit `${BASE}${path}/`.
Today the file emits **22** `<loc>` values (11 × 2 locales), all redirects; your
Step 1 verification target of 11 and zero `/en/`,`/es/` is unchanged.

**All ten sub-route segments now exist, and every page is still `"use client"`**,
including the three new ones, so the thin-server-layout approach holds without
exception. The full segment list for Step 3:

`privacy/`, `privacy/choices/`, `terms/`, `alisio/privacy/`, `fave/privacy/`,
`fave/support/`, `fingo/privacy/`, `fingo/support/`, `savely/privacy/`,
`savely/support/`

**Titles you can reuse instead of writing new keys.** Each legal namespace
carries a real, bilingual title: `legal.privacy.title`,
`legal.privacyChoices.title`, `legal.terms.title`, and one per app —
`legal.alisioPrivacy.title` ("Alisio Privacy Policy" / "Política de Privacidad
de Alisio"), `legal.favePrivacy.title`, `legal.fingoPrivacy.title`,
`legal.savelyPrivacy.title`. They are already distinct per route, which is what
your Step 3 verification wants. **Descriptions do not exist** and are yours to
write; each app page's `intro` is a good source sentence to compress.

**Two conventions 009 established, worth not breaking:**

- Every `legal.*.lastUpdated` value now carries its own "Last updated: " /
  "Última actualización: " prefix (the four pages used to disagree). If a
  metadata description ever interpolates that key, it already reads as a phrase.
- The shared `/privacy` is **website-only** and its "Privacy for our apps"
  section is load-bearing until App Store Connect is updated (README human
  checklist #1). A metadata description for `/privacy` should describe the
  website's own practices, not "our apps".

**`tests/e2e/legal.spec.ts` is new (26 tests).** It covers routes, locales,
`main#main-content`, `mailto` links and body copy, but asserts **nothing about
`<head>`**, so your `seo.spec.ts` has no overlap and no conflict. Total suite is
61 today; if a per-segment layout accidentally flips a route off SSG, the legal
spec will not catch it and your build-table diff is still the only guard.

**Parity is 406 leaf keys** (was 358). Anything you add lands on top of that.

---

## Execution tail (2026-08-20)

Shipped as PR #60. Branched from `develop@b8812a2` (PR #59 merged 20:22 UTC, so the hard
dependency was real, not assumed). Two commits.

### What shipped

- **`app/sitemap.ts` rewritten.** 22 `<loc>` values, all redirects, became 11
  canonical unprefixed URLs. As 009 predicted, the `paths` array already held
  all eleven, so the change was deleting the locale loop and the alternates
  block. Verified 11 locs / 0 prefixed / 0 alternates in both dev and the
  production build output.
- **Ten thin server `layout.tsx` files** over one shared helper,
  `app/[locale]/_route-metadata.ts`. Every route now has its own title,
  description, `og:title`, `og:description` and `og:url`, in both locales.
- **`app/[locale]/layout.tsx`**: title template, `icons.apple`, `openGraph.url`,
  and a `viewport.themeColor` light/dark pair replacing the hardcoded
  `#FAF8F3` meta and its manual `<head>` block.
- **Icons**: `app/favicon.ico` (real 3-entry .ico, 16/32/48) and
  `public/apple-touch-icon.png` (180×180, opaque). Both had 404'd.
- **13 new dictionary keys per locale**; parity 406 → 419.
- **`tests/e2e/seo.spec.ts`**, +20 tests. Suite 61 → 81, all green.
- **CLAUDE.md** gained the per-route-metadata rule, the icon table, and the
  corrected "a new legal page is 5 touches" recipe.

### Where this departed from the plan

1. **Titles are `title.absolute`, not bare strings.** The plan's Step 3 said to
   emit a bare title and let the root template append the site name. That works
   for nine routes and **silently fails for `/privacy/choices`**: Next resolves
   a bare-string title against the nearest ancestor template and then stops
   passing that template down, so once `/privacy` had a title of its own the
   child rendered "User Privacy Choices" with no site name. Caught by curling
   all eleven routes, not by any test that existed. The helper now builds the
   full title from a shared `TITLE_TEMPLATE`, which is correct by construction
   for any future nested route.
2. **`openGraph` is restated in full in the helper.** Next replaces a parent's
   `openGraph` wholesale when a child defines one, so declaring only
   title/description would have dropped `og:image` from all ten sub-routes.
3. **theme-color moved to a `viewport` export** rather than staying two manual
   `<head>` metas. Framework-blessed, and it removed the explicit `<head>`.
4. **Icons were rendered from `public/AtelierBelli.svg`, not the PNG the plan
   suggested** — see the scope addition below.
5. **e2e selectors are not scoped to `head`.** First run had 10 failures for
   exactly that reason: the dev server streams metadata into the body and React
   hoists it at hydration, so `head meta[...]` races the boundary. Unscoped
   selectors are correct in dev and in prod (where Next emits the tags in
   `<head>` server-side, verified in the prerendered HTML).
6. **Two descriptions were trimmed after a first pass** measured 166–172 chars;
   everything now lands 130–164 with the payload front-loaded.

### Scope added mid-run, at the owner's request

**The favicon was still the previous brand mark.** While generating icons it
turned out `public/AtelierBelli.png` and `public/AtelierBelli.svg` are two
*different* logos: the PNG is a blue/purple gradient anvil, the SVG the current
hexagonal monogram. The layout declared the PNG as `icons.shortcut`, so the
site shipped a retired logo. The monogram is provably current — its path data
is byte-identical to the inline `BRAND_LOGO` the header renders. The owner
confirmed and asked for it in the same run.

Fixed by regenerating the PNG from the vector source (16.1 KB → 7.3 KB) so all
four icon files carry one mark, and by giving the SVG an embedded
`prefers-color-scheme: dark` rule using the same `.ab-dark` / `.ab-accent` role
names as `BRAND_LOGO`. As flat `#151415` on a transparent ground the monogram
all but vanished in a dark browser tab strip. Both schemes verified in-browser;
the light rendering is pixel-identical to before (`magick compare` AE = 0), so
the regeneration pipeline is unchanged.

### Verification

`pnpm verify` green (419 leaf keys). `pnpm test:e2e` **81/81**. Route table
diffed against a real `origin/develop` build: **byte-identical** — every route
still `●` SSG, the catch-all still the only `ƒ`. Static pages 27 → 28, which is
the new `/favicon.ico` route from the file convention, not a route-mode change.
All eleven titles confirmed correct in EN and ES on dev and in the prerendered
production HTML.

One process note: `git checkout develop` gives a **stale** local branch, 7
commits behind `origin/develop` at the time of writing. The first baseline
build was against the wrong tree and was missing the three 009 privacy routes
entirely. Build from `origin/develop` detached instead. The local `develop`
branch was deliberately left untouched.

### Deliberately not done

- **`public/llms.txt`** — listed as optional. Skipped: the site is eleven
  static pages already in the sitemap, and there is no owner decision on file
  about wanting one. Trivial to add later.
- **hreflang / per-route canonicals** — the STOP condition held; nothing wanted
  them back. `seo.spec.ts` now asserts their absence on all eleven routes.
- **The in-page theme toggle does not update `theme-color`.** Documented gap,
  as the plan instructed; no client sync was built.
- **`public/og.png` is off-message.** It is typographic, carries no mark, and
  its baked-in copy is the old positioning ("Full-stack development by Ivan
  Lorenzana") while the homepage description now leads with Alisio, Vitapath
  and the arrhythmia detector. Out of scope here and its wording depends on
  what 011 settles; written into 012's "Landed from 010".
- **`out/`** — a stale, gitignored 2025 export directory holding ~1.2 MB of the
  OLD logo. Nothing references it; mentioned to 012 as a sweep candidate.

### Still owed

**The Amplify deploy-preview smoke before merge to `main`** (layout head is the
Amplify-sensitive region; precedent plan 005 / CLAUDE.md §6). Check on the
preview: a distinct `<title>` per route, `/favicon.ico` and
`/apple-touch-icon.png` both 200, and `/sitemap.xml` serving the 11 unprefixed
URLs. Human checklist #4 also becomes actionable: resubmit this sitemap in
Search Console once verified.
