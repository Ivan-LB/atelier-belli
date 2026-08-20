# Plan 012: Mobile contact affordance + asset and docs polish

> **Executor instructions**: steps in order, verify everything, honor STOPs,
> update your README row. Repo rules: branch from `develop`, PR to `develop`,
> **no AI signatures**, explicit staging, pnpm only, no `pnpm build` with a
> live :3000 dev server.

> **Drift check (run first)**:
> `git diff --stat 07a1f02..origin/develop -- app/globals.css "app/[locale]/page.tsx" public/cases/ CLAUDE.md`
> Plan 011 is expected to have landed (serialize on page.tsx). Re-grep anchors.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW-MED (one media-query region + one image re-encode + doc edits)
- **Depends on**: 011 (soft, page.tsx serialization).
- **Category**: responsive / assets / docs-truth
- **Planned at**: commit `07a1f02`, 2026-08-19

## Why this matters

1. **≤820px has no navigation and no above-fold contact.** `globals.css:1319`
   hides the nav links on small screens with NO replacement — no hamburger, no
   CTA. A recruiter on a phone has to find the footer by faith. Measured: no
   horizontal overflow at 320/375 (do not regress that).
   **Decided intervention: a compact Contact chip in `.ab-nav-end`** (nav
   region `app/[locale]/page.tsx:669-688`) shown ≤820px, anchoring to
   `#contact`. Deliberately NOT a hamburger menu system — smallest honest fix.
2. **blip-hero.webp ships 1600px wide for a 433 CSS px slot** — the heaviest
   image on the site (158KB) at ~3.7× its rendered size.
3. **CLAUDE.md media dimensions drifted from the files** (re-capture recipes
   are canonical there): `:108` alisio-watch is really 249×317, `:189`
   alisio-system 740×740, `:194` vitapath-system 1740×760, `:618` references
   mezcal-mobile.webp which no longer exists.

## Current state — verify it yourself

```bash
sed -n '1318,1330p' app/globals.css
# Expected: the ≤820px block hiding nav links
python3 -c "from PIL import Image; im=Image.open('public/cases/blip-hero.webp'); print(im.size)"
# Expected: (1600, 1000)
grep -n "mezcal-mobile" CLAUDE.md
# Expected: 1 hit (~:618) referencing a deleted file
```

## Skills

`/impeccable` for the chip: design it inside the existing editorial system
(tracked-caps? pill? — it must read as part of `.ab-nav`, not a bolt-on),
verify at 375 AND 320 wide next to the theme + language controls, both themes.
NO em-dashes in any new string; es-MX label real (dictionary key under
`home.nav.*` or wherever the nav labels live — follow the existing pattern).

## Scope

**In scope:** `app/globals.css` (≤820px nav region only);
`app/[locale]/page.tsx` (nav region :669-688 + blip img width/height at
:1472); `messages/*` (one nav label key if needed, en+es);
`public/cases/blip-hero.webp` (re-encode); `CLAUDE.md` (dimension corrections
only); `tests/e2e/` (one mobile-viewport test); `plans/README.md`.

**Out of scope:** a hamburger/menu system (explicitly rejected), any other
image, any other CLAUDE.md content, vitrine CSS (its ≤820px carousel rules are
load-bearing and documented — read the vitrine section of CLAUDE.md before
touching anything nearby).

## Steps

### Step 1: contact chip
Add the chip to `.ab-nav-end`, visible only ≤820px, `href="#contact"`.
**Verify**: at 375×812 and 320×568 in dev: chip visible, tappable, no
horizontal overflow (`document.documentElement.scrollWidth === innerWidth`),
theme/language controls not crowded.

### Step 2: blip-hero re-encode
Re-export at ~900-1000px wide (re-encoding the existing webp is acceptable),
update `width`/`height` attrs at `page.tsx:1472` to match the new intrinsic
size (keep 16:10). Eyeball the modal at desktop width for artifacting.
**Verify**: `python3 -c "...print(im.size)"` ≤ 1000 wide; file size well under
158KB; modal looks clean.

### Step 3: CLAUDE.md dimension truth
Fix `:108`, `:189`, `:194`; drop the mezcal-mobile.webp reference at `:618`.
**Verify**: `grep -n "mezcal-mobile" CLAUDE.md` = 0; the three dimension lines
match `sips`/`ffprobe` output of the real files.

### Step 4: e2e
One mobile test (viewport 375×812): a visible contact affordance exists in the
nav and `#contact` exists. Protect the "Toggle theme" aria pin
(`smoke.spec.ts:129`).
**Verify**: `pnpm test:e2e` fully green.

## Test plan
`pnpm verify` → `pnpm test:e2e` → manual 320/375/820 sweep, both themes, plus
the /impeccable pass.

## Done criteria
- [ ] Contact reachable above the fold ≤820px, no overflow regression
- [ ] blip-hero ≤1000px wide, JSX dims match
- [ ] CLAUDE.md dimensions truthful
- [ ] verify + e2e green; git status only in-scope; README row updated

## STOP conditions
- The chip cannot fit at 320px without crowding (report with screenshot; do
  not improvise a menu).
- Re-encoded blip-hero shows visible artifacting (report, keep the original).
- Anything in the vitrine ≤820px region would need touching.

---

## Landed from 007 that changes this plan (2026-08-20)

**Both `page.tsx` line anchors this plan cites are stale.** The file grew
1590 → 1608 lines since `07a1f02`:

| this plan says | measured 2026-08-20 |
|---|---|
| nav region `page.tsx:669-688` | `<header className="ab-nav">` now at `:674` |
| blip img `page.tsx:1472` | now `:1490` |

Re-grep for `ab-nav-inner` and `blip-hero.webp` rather than trusting either.

**No scope collision otherwise.** 007 touched `app/globals.css` only inside the
`.sup-*` region (support pages); this plan's ≤820px work is in the `.ab-nav`
region and the two do not overlap. The support pages have their own
`@media (max-width: 560px)` block, which is not the nav breakpoint.

**Related, if you are polishing assets:** `public/apps/*.webp` is new (three
256×256 app icons extracted from the iOS catalogs). They are already
`cwebp -q 92`, 2.4–4.6 KB each, and carry explicit `width`/`height` in
`components/support-shell.tsx`, so they need no re-encode.

---

## Landed from 009 that changes this plan (2026-08-20)

**Good news first: 009 touched neither `app/[locale]/page.tsx` nor
`app/globals.css`.** The corrected anchors in the 007 section above are still
exact as of 2026-08-20, re-measured: `<header className="ab-nav">` at `:674`,
the blip `<img>` at `:1490`, file at 1608 lines.

**Your CLAUDE.md anchors have moved again**, though: 009 added ~43 lines to §1
and §8, taking the file from 683 to 726 lines. Measured positions for the three
dimension corrections and the dead-file reference this plan asks you to fix:

| this plan says | measured 2026-08-20 |
|---|---|
| `:108` alisio-watch dimensions | `:134` |
| `:189` alisio-system.mp4 | `:215` |
| `:194` vitapath-system.mp4 | `:220` |
| `:618` mezcal-mobile.webp reference | `:661` |

Re-grep for the filenames rather than trusting any of these; the file is likely
to move again before you run (010 and 011 both edit it).

**One addition to your Step 3 scope, if you want it:** the same §8 tree block
that carries the stale `mezcal-mobile.webp` line now also lists the four
per-app privacy routes and `components/theme-init.tsx`. Nothing there is
wrong, but it is the block you will be editing, so read the whole entry rather
than patching one line blind.

---

## Landed from 010 that changes this plan (2026-08-20)

**010 touched neither `app/[locale]/page.tsx` nor `app/globals.css`**, so every
anchor in the two sections above survives, re-measured today:
`<header className="ab-nav">` at `:674`, the blip `<img>` at `:1490`,
`page.tsx` at 1608 lines, and the three `@media (max-width: 820px)` blocks in
`globals.css` at `:701`, `:766` and `:1318` (the nav one is `:1318`).

**`CLAUDE.md` moved again**, though: 726 → 791 lines. Fresh positions for the
four fixes your Step 3 asks for:

| this plan says | after 009 | measured now |
|---|---|---|
| `:108` alisio-watch dimensions | `:134` | **`:137`** |
| `:189` alisio-system.mp4 | `:215` | **`:218`** |
| `:194` vitapath-system.mp4 | `:220` | **`:223`** |
| `:618` mezcal-mobile.webp reference | `:661` | **`:726`** |

Re-grep the filenames anyway; 011 also edits this file and runs before you.

**The §8 tree block you are editing grew again.** Beyond the four per-app
privacy routes and `components/theme-init.tsx` that 009 added, it now lists
`_route-metadata.ts`, the ten per-segment `layout.tsx` files, `app/favicon.ico`
and `public/apple-touch-icon.png`. Read the whole entry before patching the
stale `mezcal-mobile.webp` line inside it.

### The asset landscape you are polishing changed

There are now **three** icon locations, not two:

- `public/apps/*.webp` — the three 256×256 support-page mastheads (007)
- `public/AtelierBelli.{svg,png}` + `public/apple-touch-icon.png` — site icons
- `app/favicon.ico` — a real 3-entry .ico served at `/favicon.ico`

None needs re-encoding. `public/AtelierBelli.png` was **regenerated** in 010 and
dropped 16.1 KB → 7.3 KB in the process: it had been the *previous* brand mark
(a gradient anvil) while the SVG carried the current monogram, so the site was
shipping a retired logo as its `shortcut` icon. All four now show one mark. The
SVG is theme-aware via an embedded `prefers-color-scheme` rule; if you ever
regenerate the rasters, `rsvg-convert` renders it pixel-identically to the old
flat version in light mode, so the pipeline in CLAUDE.md still holds.

**`out/` is a stale, gitignored 2025 export directory** holding ~1.2 MB of the
OLD logo (`out/favicon.png` is 954 KB alone) plus a duplicate of the CV PDF.
Nothing references it. It is not in your scope and it is not committed, so it
costs the site nothing, but if you are doing an asset sweep it is the obvious
thing to mention to the owner alongside the orphaned CV PDF already on the
human checklist.

### One genuine asset finding 010 turned up but did not fix

**`public/og.png` (1200×630, 50 KB) is off-message.** It is purely typographic,
carries no logo mark, and its baked-in copy reads *"iOS apps & web around"* /
*"Full-stack development by Ivan Lorenzana"* — the positioning the homepage
description used to carry. 010 rewrote that description to lead with the
current flagships (Alisio, Vitapath, the arrhythmia detector), so the share
card and the snippet beside it now say different things. Every route's
`og:image` points at this one file.

Re-cutting it is an asset job with a copy dependency, which is why 010 left it
alone: it is out of that plan's scope and the wording should follow whatever
011 settles on for the case taxonomy. If the owner wants it, this plan is the
natural home — otherwise flag it forward rather than letting it disappear.

### e2e

The suite is **81 tests across four spec files** (was 61 across three);
`tests/e2e/seo.spec.ts` is new. It asserts `<head>` and the sitemap only, so
your Step 4 mobile-viewport test cannot collide with it. Note for whatever you
add: metadata selectors must **not** be scoped to `head` — the dev server
streams meta tags into the body and React hoists them at hydration, so a
`head meta[...]` locator races the hydration boundary and times out on a
cold-compiled route. `seo.spec.ts` carries that comment at its `metaContent`
helper.
