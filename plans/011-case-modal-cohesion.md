# Plan 011: Case modal cohesion — one taxonomy, one label family, Savely's narrative

> **Executor instructions**: steps in order, verify everything, honor STOPs,
> update your README row. Repo rules: branch from `develop`, PR to `develop`,
> **no AI signatures**, explicit staging, pnpm only, no `pnpm build` with a
> live :3000 dev server. Every rule in this plan was DECIDED with the owner on
> 2026-08-19 — your job is application, not re-design. If a rule seems wrong
> against the code, STOP and report rather than adapting it.

> **Drift check (run first)**:
> `git diff --stat 07a1f02..origin/develop -- "app/[locale]/page.tsx" messages/ app/globals.css`
> Plans 007 and 009 are expected to have landed (serialize on page.tsx and the
> dictionaries). Re-grep anchors; `pnpm verify:i18n` for the live count.

## Status

- **Priority**: P2 (the owner's original complaint — the modals feel uneven)
- **Effort**: L
- **Risk**: MED — page.tsx is 1500+ lines and every case lives in it; e2e pins
  literal strings and ordering.
- **Depends on**: 007, 009 (soft — serialization only).
- **Category**: cohesion / copy
- **Planned at**: commit `07a1f02`, 2026-08-19

## e2e pins you MUST NOT break (embed these in your head before editing)

- Do NOT reorder `CASE_KEYS` — alisio-first is pinned at
  `tests/e2e/smoke.spec.ts:91-101` and `:171-185`.
- Do NOT change the ten-case count (`:141-151`).
- Do NOT rename BLIP's title `pre` — `:154-168` asserts the literal "BLIP".
- Do NOT touch the "Toggle theme" aria (`:129`).
No new e2e is required; the full existing suite must pass locally.

## The measured drift (all in `app/[locale]/page.tsx` + `messages/*`)

| Axis | Today | Rule (decided) |
|---|---|---|
| Kicker | fingo has 2 segments (:316 "iOS · 2025"); middle slot is a domain on 4 cases, a technology on 4 (fave :266 "iOS · SwiftData"); only vitapath's is localized (:347) | `Platform · Domain · Year`, all 10, ALL localized via dictionary keys (generalize vitapath's pattern) |
| Platform meta | "iOS" (alisio :225) / "iOS 26" (savely :496) / "iOS 26+" (briefmark :472) / "iOS 17+" / "iOS 16+"; vitapath lists Spring as a platform (:354) | `iOS N+` everywhere; alisio gains its version; Spring moves to vitapath's Stack row |
| Stack chips | "Node" (briefmark :473) vs "Node.js" (pass :298); bare "Swift" doubled with SwiftUI only on fingo/briefmark; fave has 5 chips incl. content APIs (:274) | `Node.js` canonical; drop bare `Swift`; 3-4 core frameworks per case |
| Index chips | different vocabulary than modal ("Haptics" :905 vs "Core Haptics" :324; savely "On-device OCR" :911 vs "Vision" :497); mezcal's are categories not tech (:917) | index chips = strict subset of the modal Stack row |
| mshow | 3rd slot is status on 5 cases, tech on 4; vitapath has 4 segments, no status (:948) | `Platform · Domain · Status →` for all 10 |
| Disabled labels | five conventions ("Coming soon" / "Coming to the App Store" / "Code coming soon" / "In development" ×2 / "Private beta"); vitapath's disabled button is the ONLY one without `icon: "clock"` (:359-364) | three allowed families: `Coming soon` (unreleased apps), `Code coming soon` (private code), `Private beta`; clock icon on ALL disabled |
| es-MX | savely names one feature two ways: "auto-move de quincena" (tag :534) vs "de día de pago" (:530/:536); "en la App Store" (savely :531) vs "en App Store" (others); mezcal ES "En vivo" (broadcast connotation) | "quincena" everywhere; "en App Store"; live family: EN "Live on the App Store" / "Live" (web) / "Running in production" (pass), ES "Disponible en App Store" / "En línea" / "En producción" |
| Misc copy | mezcal's italic tail is a hardcoded proper noun, only case without a lowercase descriptor; alisio is "watchOS" in kicker but "Apple Watch" in mshow; blip ES tag keeps English "swarm" | mezcal gets a descriptive `titleIt` in both dictionaries; ONE descriptor per project everywhere (Alisio: watchOS); blip "swarm" → STOP-and-ask (may be deliberate voice) |
| Preview frames | phone widths differ: fingo/savely `--w:"280px"` (:1446/:1454) vs briefmark/fave `--w:"252px"` (:1478/:1486); fake browser-bar URLs follow 4 conventions (:1469/:1557/:1571/:1584) | all plain phones `--w: 280px`; URL-bar = real domain when live, lowercase product slug otherwise, none localized |
| Depth | FOUR tiers: full (alisio/vitapath/arrhythmia), story+highlights no media (pass), gallery-only (savely), nothing (fave/fingo/mezcal/briefmark/blip) | TWO named tiers, documented in CLAUDE.md: **flagship** = story+highlights (+media where it exists) and **compact** = none. Savely is PROMOTED to flagship: write its `story` (problem/approach/result) + `highlights[4]` — this is the copy centerpiece of the plan. Pass stays flagship-without-media (documented). Fingo/fave stay compact for now (documented as candidates). |

## Skills the executor MUST invoke

`/marketing-ideas` + `/marketing-psychology` FIRST — the Savely narrative
(story beats + highlights), the label families, and mezcal's titleIt are pitch
copy: concrete, confident, zero filler. Then `/impeccable` for the visual
normalization pass (check every modal at 1440px and 375px, both themes, after
the width unification). **NO em-dashes in new or rewritten strings** (the
title-pattern "Name — descriptor" em dash is rendered by JSX structure and
stays; do not "fix" untouched strings). es-MX real, not echo.

## Savely story ground truth (write from this + `home.cases.savely.*`)

Local-first savings app: goals with a real pace, income/expense logging,
on-device receipt scanning (Vision OCR, photo never stored), payday auto-move
that turns income into savings in one tap. No accounts, no cloud, no bank
connections; submitted to the App Store 2026-08. The story angle the case
already carries: calm, private, quietly opinionated finance. The repo
(~/Projects/Swift/Savely) is available to verify any fact; DESIGN.md and
PRODUCT.md there carry the voice.

## Scope

**In scope:** `app/[locale]/page.tsx` (CASES record, indexInfo, CasePreview
inline widths, kicker wiring); `messages/en.json` + `es.json` (`home.cases.*`
only: kicker keys ×10, mezcal titleIt, savely story/highlights, label/status
families, es-MX fixes); `app/globals.css` ONLY if a width token needs a rule
moved (prefer the inline `--w` styles in page.tsx); `CLAUDE.md` (document the
two-tier rule + the taxonomy in the case-studies section); `plans/README.md`.

**Out of scope:** CASE_KEYS order, case count, modal CSS structure, preview
images/videos themselves, `legal.*`/`support.*`, e2e spec edits (nothing
should need changing; if a pin breaks, that is a STOP, not a test edit).

## Steps

### Step 1: taxonomy pass (kickers, platform, stack, index chips, mshow)
Apply the table's rules across all 10 cases. Kickers move into dictionaries
(both locales) following vitapath's existing `t("cases.vitapath.kicker")`
pattern. Domain words per case: decide from the case's own copy (alisio
Fitness, savely Fintech, fave Lifestyle, pass Infrastructure, fingo Utility,
vitapath Healthtech, arrhythmia ML, mezcal E-commerce, briefmark AI, blip PWA
— adjust wording with the marketing skills, keep one word).
**Verify**: `grep -c 'kicker' app/[locale]/page.tsx` shows 10 dictionary reads;
`grep -n '"Node"' app/[locale]/page.tsx` = 0; parity green.

### Step 2: action labels + icons
Three families applied; `icon: "clock"` added to vitapath (:359-364). Fave's
label becomes the standard "Coming soon" family (its current label duplicates
its metaStatus verbatim, en.json:603-604).
**Verify**: count of `icon: "clock"` equals count of `"primary disabled"`.

### Step 3: es-MX fixes
quincena ×3, "en App Store", "En línea" for mezcal, blip swarm (STOP-and-ask
first), descriptor unification (watchOS).
**Verify**: `grep -rn "día de pago" messages/es.json` = 0; `grep -rn "en la App Store" messages/es.json` = 0.

### Step 4: Savely flagship promotion
Write `home.cases.savely.story.{problem,approach,result}` + `highlights[4]`
in both locales (marketing skills output, grounded in the ground-truth
section); wire `story`/`highlights` in the savely CASES entry exactly as
alisio does (storyOf helper + t.raw highlights — see alisio at :240-262).
**Verify**: /?case=savely shows the beats + highlights bands in dev, both
locales; parity green.

### Step 5: preview frames + CLAUDE.md
All plain phones to `--w: "280px"`; URL-bar strings per the rule (blip →
its slug or real domain if any; arrhythmia stays repo slug lowercase; vitapath
de-localized to one slug; mezcal keeps the real domain). Document in CLAUDE.md:
the two-tier depth rule, the kicker/platform/chip/mshow/label taxonomy (extend
the existing case-studies section). Run `/impeccable` and walk all 10 modals
at 1440/375, light/dark.
**Verify**: `pnpm test:e2e` 12/12; screenshots of savely + fave + alisio modals
attached to the PR.

## Test plan
`pnpm verify` → `pnpm test:e2e` (all pins intact) → manual: 10 modals × 2
locales × 2 themes; the /impeccable pass.

## Done criteria
- [ ] Every axis in the table reads one rule across all 10 cases
- [ ] Savely is flagship tier with real narrative, both locales
- [ ] CLAUDE.md documents taxonomy + tiers
- [ ] verify + e2e green; git status only in-scope; README row updated

## STOP conditions
- Any rule forces reordering, retitling BLIP, or an 11th case.
- Savely story wants a fact not in ground truth or the repo.
- blip "swarm": ask before replacing.
- Parity failure outside `home.cases.*`.

---

## Landed from 007 that changes this plan (2026-08-20)

007 was scoped to "the fave ghost action only" in `page.tsx` and `home.cases.*`.
It ended up slightly wider, all of it inside your files. Read before drifting.

**`app/[locale]/page.tsx` grew 1590 → 1608 lines since `07a1f02`.** Every line
anchor in this plan is stale by up to +18; re-grep for the symbol instead. The
nav region another plan cites at `:669-688` now starts at `:674`.

**Three changes in your territory:**

1. **`ICONS` has a fourth glyph, `shield`**, and `CaseAction["icon"]` is now
   `"external" | "help" | "clock" | "shield"`. Keep both if you touch the type.
2. **The fave case carries three actions**, not one: the disabled
   "Coming to the App Store" primary, plus ghost Support (`/fave/support`) and
   ghost Privacy (`/fave/privacy`). Both pages exist and ship.
3. **`home.cases.fave` gained `actionGhost` and `actionPrivacy`** in both
   dictionaries. 007's out-of-scope list said `home.cases.*` beyond the ghost
   action belonged to you; `actionPrivacy` crossed that line because the owner
   asked for the button mid-execution. Nothing else in `home.cases.*` moved.

**One exception to this plan's "no e2e edits" rule.** `tests/e2e/support.spec.ts`
now contains `the fave case offers both its support and privacy pages`, which
pins `a[href="/fave/support"]` and `a[href="/fave/privacy"]` inside the open
modal. That pin is about the two routes existing, not about case copy. If your
work legitimately changes the fave actions, updating that one test is correct
and is NOT the STOP condition this plan describes. Any OTHER pin breaking is
still a STOP.

The ghost-action convention is unchanged: a Support or Privacy action appears
only where the page actually exists. Alisio still has neither, by the deferral
recorded in the README.
