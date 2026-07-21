# Portfolio Homepage — Impeccable Audit & Improvement Plan

> Generated 2026-07-04 via `/impeccable audit` (5 dimensions) + a "bolder"
> opportunity scan, run as a multi-agent workflow over `app/[locale]/page.tsx`
> and `app/globals.css`. Register = **brand** (see `PRODUCT.md`). Findings are
> file:line-specific; the responsive P0/P1 were **browser-verified live**
> (preview screenshots at 320/375/1024), contrast findings are **computed**
> from the token values. The adversarial verify pass did not complete (credit
> limit mid-run) — findings stand on their own evidence, not a second vote.

## Health Score: 13/20 — Acceptable (significant work needed)

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | Case modal has no focus trap; `--muted-2` "View case" label fails contrast in both themes |
| 2 | Performance | 3/4 | Render-blocking Google Fonts `@import` gates LCP; `next/font` Inter is a 48 KB dead preload |
| 3 | Responsive | 2/4 | **Vitrine slides overlap on every phone (320–454px)** — the hero showcase looks broken |
| 4 | Theming | 3/4 | No pre-paint theme bootstrap → dark-mode flash on the homepage (the 404 already solves this) |
| 5 | Anti-Patterns | 3/4 | Same eyebrow→serif→italic cadence on all 5 sections; 2 fake-browser placeholders leak Spanish on /en |

**Anti-pattern verdict: PASS (mostly clean).** This does NOT look AI-generated.
The committed cream/turquoise + Fraunces identity is executed with real
restraint — zero gradient text, no glassmorphism, no hero-metric block (the
hero ships a print-style colophon instead), the Selected Work index is an
editorial ledger not a card grid, and even the fake-browser traffic-light dots
are desaturated to the palette. The tells that remain are execution drift, not
generative grammar.

## Priority order (P0 → P1), deduplicated

### 🔴 P0 — the hero showcase is broken on phones
**`R1` Vitrine carousel slides overlap on all phones 320–454px.**
`app/globals.css:1293-1303` + slide widths at `:625-651,:677-679,:733-747`.
At 375px the scroll-snap column is 219.8px but Fingo renders 270px, Savely
272px, the Destilería browser combo 300px — pieces paint on top of each other,
captions collide, snap points misalign (screenshot-verified). Root cause: the
mobile shrink `.ab-phone-img { --w: 240px }` at `:677` is dead code (the
`.fingo`/`.savely` rules win on specificity), and fixed px widths exceed 82%
columns below ~455px.
**Fix:** size slides relative to the column — inside the `≤820px` query set
`.ab-phone-img.fingo, .ab-phone-img.savely { --w: min(240px, 100%) }` and
`.ab-vit-web-combo .ab-vit-browser { --w: min(300px, 100%) }` + `max-width:100%`
on the combo; or bump `grid-auto-columns` to `max(82%, 300px)`. Re-verify snap
at 320/375/430. → `/impeccable adapt` or `/impeccable optimize`.

### 🟠 P1 — fix before treating the site as a portfolio piece

**`A1` Case modal has no focus trap and never inerts the background.**
`page.tsx:319-335`. Tab walks out of the open dialog into nav/footer links
behind the backdrop; SR virtual cursor reads the whole background while the
dialog claims `aria-modal`. WCAG 2.4.3. The open/close halves already work
(initial focus, Escape, focus restore) — only the trap/inert layer is missing.
**Fix:** add a Tab-wrap keydown handler + `inert` on the header/main siblings
while open, OR swap the hand-rolled div for native `<dialog>` + `showModal()`
(trap + Escape + inertness for free). → `/impeccable harden`.

**`A2` Closed modal's Close button stays in the tab order inside `aria-hidden`.**
`page.tsx:789-798` + `globals.css:1330-1355`. The always-rendered modal hides
via `opacity:0; pointer-events:none` — the Close button remains tabbable inside
an `aria-hidden` ancestor (axe `aria-hidden-focus`, serious). Every keyboard
pass ends on an invisible ghost button after the footer.
**Fix:** conditionally render the modal only when `openCaseKey` is set, OR add
`visibility:hidden` to `.ab-case-modal:not(.open)`. → `/impeccable harden`.

**`C1` `--muted-2` text fails contrast in BOTH themes** (appears in a11y +
theming). `globals.css:940` (`.ab-index-row .p-plat`), `:369`
(`.ab-chip-lang .off`), `:1061` (`.ab-wb-group .gn`). Light `#a8a19a` on cream
= 2.4:1; dark `#5a554f` on ink = 2.5:1. This is the **"View case" affordance**
on every Selected Work row — the exact label that tells hiring managers the
rows are clickable, near-invisible.
**Fix:** point those three rules at `var(--ab-muted)` (~5.4:1 both themes);
keep `--muted-2` only for decorative separators (the `·` dot). → `/impeccable colorize`.

**`P1a` Render-blocking Google Fonts `@import` gates FCP/LCP.**
`globals.css:1`. The `@import` is serialized behind the app CSS (parse → new
connection to fonts.googleapis.com → download) with no `preconnect` in
`layout.tsx`. The LCP element is the Fraunces hero H1, so this chain directly
delays the one thing a hiring manager sees first (~300–800ms).
**Fix (cheap, no pattern change):** add `<link rel="preconnect">` for
googleapis + gstatic to `layout.tsx` head. **Better:** move the font request to
a `<link rel="stylesheet">` in the head. **Best (smoke-test on Amplify per
`google-fonts-hybrid-loading`):** migrate Fraunces to `next/font/google`. Also
trim the `@import` — it requests Fraunces 300–900 but the page uses ~350–500.
→ `/impeccable optimize`.

**`P1b` `next/font` Inter is loaded but never consumed — 48 KB dead preload.**
`layout.tsx:10-14`. No `fontFamily` mapping to `var(--font-inter)`; nothing
references it; rendered Inter comes from the `@import` copy. Users download
Inter twice, and the unused copy preloads at high priority competing with the
render-critical chain above.
**Fix:** pick one side — (a) wire `fontFamily.sans → var(--font-inter)` in
`tailwind.config.ts` + swap the `"Inter"` refs in `globals.css:64,149`, then
drop Inter from the `@import` (preserves the documented next/font benefit), OR
(b) delete the next/font block. Smoke-test on Amplify. → `/impeccable optimize`.

**`R2` Case modal buries content in a letterbox on mobile; preview overlaps the
title.** `globals.css:1399-1404,1570-1576,1679-1684`; `page.tsx:870/878`
(`--w:280px`). At 375×812 the preview is 523px tall (64% of the modal), the
280px phone mock overflows it and overlaps the title, and description + meta +
App Store CTA sit in a hidden 192px nested scroll region with no scrollbar
affordance. The 30-second work scan fails on phones.
**Fix:** in `≤820px` cap the preview (`max-height:40dvh; overflow:hidden`),
shrink the modal phone to `min(280px, 55vw)`, and make `.ab-case-body` the
single scroll container (remove `overflow-y:auto` from `.ab-case-content` at
this breakpoint). → `/impeccable adapt`.

**`R3` Sticky header doubles to two rows (121px) below 820px.**
`globals.css:1287-1289`; `page.tsx:355-373`. The emptied `<nav>` still occupies
its grid column, pushing the locale chip + theme toggle onto a second row — a
121px bar eats ~15% of an 812px phone viewport on every scroll.
**Fix:** hide the empty nav in the same query (`.ab-nav-inner nav{display:none}`)
so it collapses to a single ~61px row. → `/impeccable adapt`.

**`T1` No pre-paint theme bootstrap → dark-mode flash** (appears in perf +
theming). `page.tsx:80-98`. Theme initializes to `"light"`, SSG ships
`data-theme="light"`, localStorage is read only in a post-hydration effect — so
dark-mode visitors get a cream first paint then an animated 280ms flip to dark.
**The 404 page already solves this** with an inline `THEME_INIT_SCRIPT`
(`not-found.tsx:5`).
**Fix:** extract `THEME_INIT_SCRIPT` to a shared constant, render it as the
first child of `.ab-root` in `page.tsx` (already has `suppressHydrationWarning`),
and gate the `.ab-root` bg/color transition behind a `.theme-ready` class so the
first paint never animates. → `/impeccable optimize`.

## P2 / P3 backlog (fix in a later pass)

- **Modal CTA contrast on hover** (`globals.css:1656-1660`): white on
  `--accent-color` = 2.4:1 dark / 4.0:1 light. Use theme-aware text (`--ab-bg`
  in dark, `--accent-deep` bg in light).
- **`≤820px` no section nav** (`globals.css:1281-1283`): Work + Contact removed
  with no replacement; keep them as compact chips in `.ab-nav-end`.
- **Vitrine combo clipped at 1024px** (`globals.css:700-722`): iPad-landscape
  shows the mobile-capture mini-phone amputated; add a `≤1120px` intermediate.
- **Touch targets < 44px** (theme toggle 34, locale chip 36-tall, modal close
  34): grow hit areas per repo's own 44px rule.
- **`100vh` modal on iOS** (`globals.css:1336`): switch to `dvh` so the close
  button can't sit off-screen behind the URL bar.
- **Anti-pattern — 5/5 sections share the eyebrow→serif→italic cadence**
  (`page.tsx:412,463,544,636,711`): keep the numbered folios (editorial) but
  break the meter on 2 sections (drop the vitrine eyebrow, make the CTA a full
  italic kicker). → `/impeccable typeset`.
- **`briefmark`/`pass` fake-browser placeholders leak hardcoded Spanish on /en**
  (`page.tsx:900-954`) and lack `aria-hidden`: move strings to `messages/*`,
  add `aria-hidden`, or ship the real captures (already planned in CLAUDE.md).
- **theme-color meta hardcoded light** (`layout.tsx:70`); **`--good` has no dark
  override**; **layout-property `padding` animation on index-row hover**
  (`globals.css:864` — move to `transform:translateX`); **role=list without
  listitem children** (`page.tsx:554`); **theme toggle exposes no
  `aria-pressed`**; **2 dead selectors** `.ab-rule` + `.text-balance`.
- **Docs drift:** the vitrine-mock orphans (`.ab-vit-browser .scr`,
  `.ab-vit-bottle`, `.nav-strip`) were **already removed in PR #29** — update
  CLAUDE.md's "cleanup PR pending" note (it's stale).

## 🎇 "Bolder" opportunities (the AUDAZ direction you asked for)

Build on real strengths — the vitrine tilt gesture, the index-row hover
choreography, and the Fraunces `SOFT`/`opsz` axis differential are already
distinctive. All ideas below are reduced-motion-gated and CLS-safe.

| # | Opportunity | Where | Effort | Risk |
|---|---|---|---|---|
| **B1** | **Hero line-mask entrance** — stagger each title line `translateY(100%)→0` (80–120ms), the italic accent lands last with a Fraunces `SOFT 100→30` ink-settle. The biggest type currently arrives with the smallest gesture. | `page.tsx:409-423` | S–M | low |
| **B2** | **Vitrine as a physical shelf** — group focus (`:has(:hover)` dims + shrinks the non-hovered pieces to spotlight one) + rAF pointer-parallax on `--px/--py`. The showcase becomes the thing people describe to others. | `globals.css:561-732` | M | med (rAF-gate the listener) |
| **B3** | **Curtain-raise modal** — stagger the preview/title/desc/meta/actions with transition-delays under `.open` (the modal is already always-in-DOM, so this is the cheapest drama in the codebase). | `globals.css:1330-1355` | S | low |
| **B4** | **Per-section fitted reveals** — keep the single IntersectionObserver but differentiate: index rows stagger + hairline draws in via `scaleX`, workbench pills pop, CTA uses the hero's line-mask. Kills the uniform-fade reflex. | `page.tsx:125-140` | S | low |
| **B5** | **Paper grain** — inline SVG `feTurbulence` data-URI overlay on `.ab-root::after` (opacity 0.025–0.04, `mix-blend:overlay`). Makes the cream feel like paper stock and dark feel like ink on felt. Zero network, CSP-safe. | tokens | S | low |
| **B6** | **CTA grid-break** — let the 176px CTA headline bleed edge-to-edge (it ends the page, so it can't disrupt the 30-second work scan). One deliberate grid violation = editorial POV. | `globals.css:1095` | M | med (guard `overflow-x`, test 320px) |
| **B7** | **View Transitions theme toggle** — circular clip-path reveal from the toggle coords via `document.startViewTransition` (feature-detected; today's crossfade is the fallback). The dual-theme detail people remember. | `page.tsx:114` | S–M | low |

**Suggested sequence:** B3 → B1 → B4 (all Small, high visible payoff) → B5 →
B7, then B2/B6 when you want the signature moments. → `/impeccable animate`
for B1/B3/B4/B7, `/impeccable bolder` for B2/B6, `/impeccable delight` for B5.

## Recommended run order

1. **`R1` (P0)** — fix the mobile vitrine overlap first; it's the only thing
   that reads as *broken*. → `/impeccable adapt`
2. **`C1` + `T1`** — contrast on "View case" + the FOUC bootstrap; both are
   small, both hit the 30-second-scan surface. → `/impeccable colorize`, `optimize`
3. **`A1`/`A2` modal a11y** — → `/impeccable harden`
4. **`P1a`/`P1b` font loading** — → `/impeccable optimize` (Amplify smoke-test)
5. **`R2`/`R3` mobile modal + header** — → `/impeccable adapt`
6. **Bolder pass** B3→B1→B4→B5→B7 — → `/impeccable animate`
7. **`/impeccable polish`** as the final pre-ship pass, then re-run
   `/impeccable audit` to watch 13/20 climb.

You can run these one at a time, all at once, or in any order. Re-run
`/impeccable audit` after fixes to see the score improve.
