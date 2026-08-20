# Plan 007: Support pages tell the truth + create /fave/support

> **Executor instructions**: work through the steps in order, run every
> verification command, and honor the STOP conditions — stop and report, do not
> improvise. When done, update your row in `plans/README.md` (2026-08-19 wave).
> Repo rules: branch from `develop`, PR to `develop`, **no AI signatures in
> commits or PR bodies**, stage explicit files only, pnpm only, never run
> `pnpm build` while a dev server holds :3000 (`lsof -ti :3000 -sTCP:LISTEN`).

> **Drift check (run first)**:
> `git fetch origin && git log --oneline -1 origin/develop` — this plan was
> written against `develop@07a1f02`. Then
> `git diff --stat 07a1f02..origin/develop -- components/support-shell.tsx "app/[locale]/fingo" "app/[locale]/savely" messages/ app/sitemap.ts app/globals.css`
> If anything in that set changed since, re-verify every file:line anchor below
> before editing; if the support namespaces were already rewritten, STOP.
> Also run `pnpm verify:i18n` and record the live leaf-key count (338 at
> planning time — do NOT hard-pin it anywhere).

## Status

- **Priority**: P1 — Savely is in App Store review NOW and its support page is
  the URL Apple clicks from the listing.
- **Effort**: L
- **Risk**: MED — extends a type union consumed by three pages; e2e additions.
- **Depends on**: nothing. Parallel-safe with plan 008 (zero file overlap).
- **Category**: content-truth / feature (new route)
- **Planned at**: commit `07a1f02`, 2026-08-19

## Why this matters

The 2026-08-19 audit (background, not required reading:
https://claude.ai/code/artifact/fa1072d0-fe19-4932-bbac-54eed8ccd5c4) found:

1. **`/savely/support` describes a fictional banking app.** `messages/en.json`
   support.savely region says "a bank that dropped" (:237), "Questions about
   your account, a bank connection" (:241), "Savely uses read-only bank
   connections via regulated aggregators… All data at rest is encrypted"
   (:275), "EU, UK, and US banks work well" (:290-291), version rows "v1.8" /
   "1.8.0" (:235/:301) and "iOS 16+" (:305). Mirrored in es.json. The REAL
   Savely (verified in ~/Projects/Swift/Savely on 2026-08-19): SwiftData local
   only, NO CloudKit (empty entitlements), NO accounts (auth fully removed,
   `AppViewModel.swift:11-13` says "local-first… there is no account"), NO bank
   connections, NO purchases, on-device receipt OCR (Vision,
   `ReceiptOCR.swift:8-9` "the receipt never leaves the phone"), local
   notifications only, version 1.0, iOS 26 minimum. The same file's own case
   copy (`home.cases.savely.descRich`) already says "No accounts, no cloud, no
   bank connections". App Review reading both is a guideline 2.3 (accurate
   metadata) exposure while the review is live.
2. **Fingo's support claims restorable purchases that do not exist.** The FAQ
   at `messages/en.json:390-391` promises Restore Purchases; the Fingo repo has
   ZERO StoreKit (verified: no import, no product ids, no restore code —
   ~/Projects/Swift/Fingo, grep across all sources). Its listing shows no IAP.
   Also a stale version row (real: 2.2, iOS 26, UserDefaults-only, no network
   at all, no permissions requested).
3. **Dead "Help centre" cards** on both support pages: `href: "#"` at
   `messages/en.json:265` (savely) and `:369` (fingo), mirrored in es.json —
   a card promising "Guides & articles" that goes nowhere.
4. **`/fave/support` does not exist** and App Store Connect requires a Support
   URL at submission. Fave is pre-submission.
5. **support-shell has FOUR locale-prefixed links** riding the legacy 307
   redirect: `components/support-shell.tsx:135` (sup-back) and the footer trio
   at `:282/:286/:288` (`/${locale}`, `/${locale}/privacy`, `/${locale}/terms`).
   Since PR #45 (`localePrefix: "never"`) the canonical URLs are unprefixed.

## Ground truth to write from (verified 2026-08-19, embed nothing else)

- **Savely 1.0, iOS 26, iPhone-only.** Goals with pace, income/expense logging,
  deposits, receipt scanner (camera permission is its ONLY permission: "Savely
  uses the camera to scan receipts…" `project.pbxproj:1021`), payday auto-move,
  local notifications (savings reminders). All data in a private on-device
  SwiftData store. No account, no iCloud, no purchases, no analytics, no
  third-party SDKs, no data leaves the phone. The only network host in code
  (api.openai.com for tips) is unreachable: `FeatureFlags.tipsEnabled = false`.
- **Fingo 2.2, iOS 26.** Group-choice roulettes/pickers. UserDefaults only.
  No network, no permissions, no IAP, no analytics, no accounts.
- **Fave 1.0.0, iOS 17+.** Rankings with stars/emoji/notes/photos. SwiftData
  synced to the USER'S private iCloud (container `iCloud.com.atelierbelli.fave`)
  — the developer cannot read it. Search text goes to TMDB and Open Library to
  fetch titles/artwork; nothing else is transmitted. No account, no purchases,
  no analytics. Photo picking via PhotosPicker (no permission prompt).

## Current state — verify it yourself

```bash
grep -n "bank\|aggregator\|encrypt" messages/en.json | sed -n '1,10p'
# Expected: hits inside the support.savely region (lines ~237-291)
grep -n "Restore Purchases" messages/en.json
# Expected: 1 hit (~:390)
grep -rn '"href": "#"' messages/
# Expected: 4 hits (en+es × savely docs card + fingo docs card)
grep -n '${locale}' components/support-shell.tsx
# Expected: 4 hits (:135, :282, :286, :288)
ls app/[locale]/fave/
# Expected: only privacy/
grep -n 'SupportApp' components/support-shell.tsx | head -2
# Expected: type SupportApp = "fingo" | "savely" at :6
```

## Skills the executor MUST invoke (in this order, before writing copy)

1. `/marketing-ideas` and `/marketing-psychology` — for the hero, FAQ and card
   copy of all three support pages. The support page is a retention/trust
   surface: warm, concrete, zero corporate filler.
2. `/impeccable` — only for Step 4's `.sup-root[data-app="fave"]` skin.

**Copy rules (owner mandate):** NO em-dashes in any new or rewritten string
(existing untouched strings and JSX-structural dashes stay). Spanish is real
es-MX with its own voice, never a machine echo of the English. Every factual
claim must trace to the Ground truth section above; if you need a fact not
listed there, STOP and ask.

## Scope

**In scope (the ONLY files you may modify):**
- `messages/en.json`, `messages/es.json` — `support.savely.*` rewrite,
  `support.fingo.*` corrections, new `support.fave.*`, and (Step 5) two keys
  under `home.cases.fave.*` for the ghost action.
- `components/support-shell.tsx` — union + link de-prefixing only.
- `app/[locale]/fave/support/page.tsx` — NEW.
- `app/globals.css` — new `data-app="fave"` skin block only.
- `app/sitemap.ts` — one added path.
- `app/[locale]/page.tsx` — fave ghost action only.
- `tests/e2e/support.spec.ts` — NEW.
- `plans/README.md` — your status row.

**Out of scope (do NOT touch, even though they look related):** `legal.*`
namespaces (plan 009), contact email values (plan 008 — reuse whatever address
the dictionaries carry when you run), layout metadata (plan 010), any
`home.cases.*` key beyond the fave ghost action (plan 011).

## Steps

### Step 1: rewrite `support.savely` (en + es)
Every key under `support.savely` re-grounded in the real product: hero, contact
cards (replace the `bank` card kind with something real, e.g. a receipts/how-to
card — kinds available in `ContactKind`, support-shell.tsx:8-19), FAQ items
(5, real questions: receipt scanning, where data lives, backup story since
there is no cloud, payday auto-move, notifications), status rows. **Delete the
hardcoded version rows entirely** (they cannot age); keep the `ok`-flagged
"Systems / All good" row.
**Verify**: `grep -in "bank\|aggregator\|encrypt\|1\.8" <support.savely region>` = 0 hits; `pnpm verify:i18n` passes.

### Step 2: correct `support.fingo` (en + es)
Delete the Restore Purchases FAQ pair, replace with a real FAQ (e.g. data
stays on device / no internet needed). Drop version rows. Fix any claim
implying network or purchases.
**Verify**: `grep -rn "Restore Purchases" messages/` = 0.

### Step 3: kill the dead docs cards
Remove the `docs` card from both apps' `contact.cards` (and from
`CONTACT_KINDS` arrays in `app/[locale]/fingo/support/page.tsx:8` and
`app/[locale]/savely/support/page.tsx:8`) OR repoint `href` to `#faq` with an
honest label. Removing is preferred (a card promising guides that do not exist
is the finding).
**Verify**: `grep -rn '"href": "#"' messages/` = 0.

### Step 4: create `/fave/support`
Extend `SupportApp` union (`support-shell.tsx:6`) to include `"fave"`. New
`support.fave.*` namespace (clone the tree shape documented in the namespace —
same keys as fingo/savely; card kinds suggestion: `email`, `feature`, plus two
real ones for Fave: sync/iCloud questions and TMDB artwork). New
`app/[locale]/fave/support/page.tsx` cloning the fingo page shape (CONTACT_KINDS
+ useMemo adapter). New `.sup-root[data-app="fave"]` skin in `globals.css`
after the savely block (~:2590): pick a palette from Fave's own world (paper
cream `#f7f1ea` is Fave's canvas color, used at `.ab-phone-img.fave`,
globals.css:657-659). Add `"/fave/support"` to `app/sitemap.ts` paths.
**Verify**: `pnpm dev` + `curl -s localhost:3000/fave/support/ | grep -c "<h1"` = 1, same with `-H 'Cookie: NEXT_LOCALE=es'`; typecheck clean.

### Step 5: fave ghost action + shell link hygiene
In `app/[locale]/page.tsx`, add a ghost "Support" action to the fave case
mirroring fingo's shape (:336-341) pointing at `/fave/support`; add the two
dictionary keys (`home.cases.fave.actionGhost` en/es). In
`components/support-shell.tsx`, drop the `/${locale}` prefix from the four
links (:135, :282, :286, :288) — plain `/`, `/privacy`, `/terms`.
**Verify**: `grep -n '${locale}' components/support-shell.tsx` = 0.

### Step 6: e2e
New `tests/e2e/support.spec.ts`: (a) `/fave/support/` 200 + h1 in en and es
(cookie `NEXT_LOCALE=es` on `http://localhost:3100` — see cookie URL pattern at
`tests/e2e/smoke.spec.ts:15`), (b) no `a[href="#"]` on any of the three support
pages, (c) savely support body does not contain "bank".
**Verify**: `pnpm test:e2e` — all existing 12 smoke tests PLUS the new file pass.

## Test plan
`pnpm verify` (typecheck + lint + i18n parity) → `pnpm test:e2e` → manual: open
the three support pages in dev, both locales, both themes (fave skin must hold
in dark).

## Done criteria
- [ ] Zero fictional claims on any support page (greps above at 0)
- [ ] `/fave/support` live in both locales with its own skin
- [ ] Four shell links unprefixed
- [ ] `pnpm verify` and `pnpm test:e2e` green
- [ ] `git status` shows only in-scope files
- [ ] `plans/README.md` row updated

## STOP conditions
Stop and report back (do not improvise) if:
- The union extension surfaces typecheck errors outside the in-scope files.
- i18n parity fails naming keys outside `support.*` / `home.cases.fave.*`.
- Any Savely/Fave product claim you want to write is not in Ground truth and
  not verifiable in ~/Projects/Swift/Savely or ~/Projects/Swift/Fave.
- Drift check shows the cited line anchors moved beyond trivial (±5 lines).

## Maintenance notes
- An Alisio support page was considered and DEFERRED (see README) — the ghost
  Support action intentionally appears only where a support page exists.
- Plan 010 rewrites `sitemap.ts` wholesale; your one-line addition is expected
  to be absorbed by it.

---

## Executed 2026-08-19/20 — what shipped, and what exceeded this plan

Branch `feat/support-pages-truth`, PR #57 to `develop`. `pnpm verify` green,
32/32 e2e (12 smoke + 20 in the new `tests/e2e/support.spec.ts`), CI green.

### Done criteria

- [x] Zero fictional claims on any support page — all three greps at 0
- [x] `/fave/support` live in both locales with its own skin
- [x] Four shell links unprefixed (verify with `grep -Fn`, see below)
- [x] `pnpm verify` and `pnpm test:e2e` green
- [x] `plans/README.md` row updated
- [~] `git status` shows only in-scope files — **it does not.** See below.

### Corrections to this plan's own instructions

- **The Step 5 verification command does not work on macOS.**
  `grep -n '${locale}' components/support-shell.tsx` returns 0 hits on BSD
  grep, which parses `{...}` as an invalid interval, not because the links are
  absent. Use `grep -Fn`. The four links were exactly at :135/:282/:286/:288.
- **The Ground truth section was wrong in several places.** It was re-verified
  against the three app repos before any copy was written; the corrections are
  recorded in `plans/README.md` under "Ground-truth corrections found while
  executing 007". Plans 009 and 011 inherit the same claims.
- **`grep -in "bank\|...\|encrypt"` = 0 forced two awkward rewrites.** The
  honest copy wanted "no bank connection of any kind" and "your iPhone's own
  encrypted backup", both true and both caught by the literal grep. They were
  rephrased to satisfy the letter of the check. Dropping "encrypted" turned out
  to be more accurate anyway: a local computer backup is only encrypted if the
  user ticks the box.

### Work beyond this plan's scope (owner-directed, mid-execution)

Each of these was requested by the owner while the plan was running, so they
are authorized, but they are NOT what this plan scoped:

1. **The support surface was redesigned, not just re-skinned.** This plan
   scoped `globals.css` to "new `data-app="fave"` skin block only" and
   `support-shell.tsx` to "union + link de-prefixing only". Owner's call
   ("se ven muy ai slop") replaced the page grammar via `/impeccable`: the
   eyebrows, the 01/02/03 section numbers, the four-identical-cards grid and
   the four-cell metric strip are gone. Contact is now one primary address plus
   a list of routes; the facts became a colophon. 591 lines out, 443 in.
2. **Real app icons.** `public/apps/{savely,fingo,fave}-icon.webp` NEW,
   extracted from each app's iOS asset catalog. The `crest` dictionary key
   (a single letter) is gone.
3. **Dark mode for all three support skins**, plus `components/theme-init.tsx`
   NEW and edits to the four legal pages. Documented in plan 009.
4. **A Privacy ghost action on the fave case** plus `home.cases.fave.actionPrivacy`
   and an `ICONS.shield` glyph. This plan explicitly put `home.cases.*` beyond
   the ghost action in plan 011's territory. Documented in plan 011.

Files touched outside the "In scope" list: `components/theme-init.tsx` (new),
`app/[locale]/privacy/page.tsx`, `app/[locale]/privacy/choices/page.tsx`,
`app/[locale]/terms/page.tsx`, `app/[locale]/fave/privacy/page.tsx`,
`public/apps/*` (new).

### Left undone deliberately

- **`SupportShell` no longer uses its `locale` prop** — de-prefixing the links
  removed the last use. Removing the prop ripples into all three pages, so it
  was left in place. Lint and typecheck are clean either way.
- **No theme toggle on the support or legal pages.** They inherit the
  homepage's choice and fall back to `prefers-color-scheme`. Adding a control
  is an owner call, not a bug.
- **Voice stayed "we".** The literal false claim ("A small team") is gone, but
  switching the pages to first person singular is a brand decision.
