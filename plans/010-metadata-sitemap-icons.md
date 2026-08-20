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
