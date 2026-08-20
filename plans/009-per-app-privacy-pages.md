# Plan 009: Per-app privacy pages + honest website /privacy and /terms

> **Executor instructions**: this is the longest single session of the wave —
> budget accordingly. Work the steps in order, run every verification, honor
> STOP conditions. Update your README row when done. Repo rules: branch from
> `develop`, PR to `develop`, **no AI signatures**, explicit staging, pnpm
> only, never `pnpm build` with a live :3000 dev server.

> **Drift check (run first)**:
> `git diff --stat 07a1f02..origin/develop -- messages/ "app/[locale]" app/sitemap.ts`
> Plans 007/008 are expected to have landed (email already canonical, sitemap
> already carrying /fave/support). Re-grep every anchor. `pnpm verify:i18n`
> for the live count. If `legal.privacy` already mentions the NEXT_LOCALE
> cookie, someone executed this plan — STOP.

## Status

- **Priority**: P1
- **Effort**: L (three new pages + two rewrites, bilingual)
- **Risk**: MED — these pages are what App Store Connect points at; wrong
  claims here are worse than missing pages.
- **Depends on**: 008 soft (canonical email), 007 soft (sitemap serialization).
- **Category**: content-truth / feature (new routes)
- **Planned at**: commit `07a1f02`, 2026-08-19

## Why this matters

The shared `/privacy` is e-commerce boilerplate that names the apps: it covers
"Fingo, Savely, and Alisio" (`messages/en.json:33`) and declares collecting
shipping addresses and demographics (:40), credit card number/brand/expiration
and orders (:46-48), continuous geolocation (:57-59), and account creation
(:71 — which even implies guideline 5.1.1(v) account-deletion obligations that
do not apply). The real apps collect NONE of that, and Alisio's and Fingo's
live listings carry "No se recopilan datos" labels — the policy CONTRADICTS
the labels. The only accurate part is the Alisio HealthKit section
(`dataCollected.mobileAppData.healthData`), which satisfies guideline 5.1.3
and must survive. `/terms` is the same template family (registration
representations :191, IP-blocking :204, stale date :177). `/privacy/choices`
promises data-subject rights machinery the site has no data for, and nowhere
on the site is the ONE real practice disclosed: the functional `NEXT_LOCALE`
cookie (set server-side by the middleware AND by the language toggle).

**Owner decision (2026-08-19): per-app pages, following the /fave/privacy
pattern.** Create `/alisio/privacy`, `/fingo/privacy`, `/savely/privacy`; slim
the shared `/privacy` to the WEBSITE only. The App Store Connect privacy-URL
updates (human checklist in README) are time-coupled to this plan's deploy:
until they happen, Alisio/Fingo listings point at the slimmed shared page, so
it MUST keep a visible "Privacy for our apps" section linking the three new
pages.

## Ground truth per app (verified in the repos, 2026-08-19 — write from THIS)

- **Website**: static Next.js, no analytics, no forms, no accounts. One cookie:
  `NEXT_LOCALE` (functional, remembers language; set by the server on first
  visit and by the toggle; 1-year expiry). Theme preference in localStorage.
- **Alisio 1.1 (iOS 17 / watchOS 10)**: reads heart rate + active energy from
  Apple Health during a workout (watch only) and writes the finished workout
  back to Health. Usage strings (es): "Necesitamos tu ritmo cardiaco para
  calcular tus zonas de entrenamiento." / "Guardamos tu entrenamiento en
  Salud." Profile (age, resting HR) in UserDefaults; session history in a
  local JSON file. **Zero network code in the entire app.** No accounts, no
  IAP, no analytics, no third-party SDKs.
- **Fingo 2.2 (iOS 26)**: roulettes/picker settings in UserDefaults. Zero
  network, zero permissions, zero IAP, zero analytics, zero accounts.
- **Savely 1.0 (iOS 26)**: income/expenses/goals/deposits in an on-device
  SwiftData store. Receipt photos read by on-device Apple Vision OCR and never
  stored or uploaded (in-memory only). Camera permission is the only one.
  Local notifications for reminders. No account, no iCloud, no purchases, no
  analytics; no data leaves the phone (the one API host in code is disabled by
  a compile-time flag and unreachable).
- **Fave 1.0.0 (iOS 17+)**: rankings/ratings/notes/photos in SwiftData, synced
  through the USER'S OWN private iCloud (CloudKit container
  `iCloud.com.atelierbelli.fave`) — the developer has no server and cannot
  read the data; photos sync as iCloud assets. Search text typed into the
  movie/TV/book search goes to TMDB and Open Library to fetch titles and
  artwork; nothing else is transmitted, no user identifier attached. No
  account, no IAP, no analytics. `/fave/privacy` ALREADY says this correctly —
  it is the model, not a target of this plan.

## Current state — verify it yourself

```bash
grep -n "credit card\|shipping\|geolocation\|message boards" messages/en.json
# Expected: hits in the legal.privacy region (lines ~40-59)
ls app/[locale]/alisio app/[locale]/fingo/privacy app/[locale]/savely/privacy 2>&1
# Expected: No such file or directory (×3 — fingo/ and savely/ exist but only with support/)
grep -rn "NEXT_LOCALE" messages/
# Expected: 0 — the real cookie is disclosed nowhere
```

## The recipe (proven by commit `6ec196a`, which built /fave/privacy)

Each new page = exactly 4 file touches:
1. `app/[locale]/<app>/privacy/page.tsx` — `"use client"`, `useTranslations("legal")`,
   `.ab-root` shell with `header.ab-legal-nav` → `main id="main-content"
   class="ab-legal-main"` → `article.ab-prose` sections → `footer.ab-legal-foot`.
   Clone `app/[locale]/fave/privacy/page.tsx` structurally (~82 lines).
2. One path line in `app/sitemap.ts`.
3. + 4. A `legal.<app>Privacy.*` namespace in `messages/en.json` and `es.json`
   (fave's is ~16 keys/locale: title, lastUpdated, intro, sections.{...}, contact).
Middleware needs nothing (catch-all matcher).

## Skills the executor MUST invoke

`/marketing-ideas` + `/marketing-psychology` before writing — **with this
override: on privacy/terms pages, accuracy and plain disclosure beat
persuasion.** Use the skills for structure, scannability and warmth, never to
soften or inflate a factual claim. Every claim traces to Ground truth above;
anything else is a STOP. NO em-dashes in new strings. es-MX with its own voice.

## Scope

**In scope:** the three new page.tsx files; `app/sitemap.ts` (+3 paths);
`messages/en.json` + `es.json` — new `legal.alisioPrivacy`,
`legal.fingoPrivacy`, `legal.savelyPrivacy`; rewrite of `legal.privacy`
(website-only + apps pointer section); trim of `legal.privacyChoices` to
reality; trim of `legal.terms` (:191 registration, :204 IP-blocking, refresh
`lastUpdated` :177); `tests/e2e/legal.spec.ts` NEW; `plans/README.md` row.

**Out of scope:** `support.*` (plan 007), email values (landed in 008 — reuse
them), `home.cases.*`, layout metadata (plan 010), the JSX section structure of
`privacy/page.tsx` beyond removing sections that no longer exist in the
dictionary (the sections are hardcoded JSX + JSON pairs — removing a section
means removing both halves).

## Steps

### Step 1: three per-app pages
Build `/alisio/privacy`, `/fingo/privacy`, `/savely/privacy` from the recipe.
Content per app from Ground truth: what is stored and where, what (if
anything) is transmitted, permissions requested with their real usage strings,
"no accounts / no analytics / no ads / no data sale", children's-policy line,
changes line, contact (the canonical email), lastUpdated = execution date.
Alisio's page absorbs the accurate HealthKit copy (reads HR/energy, writes the
workout to Health, per 5.1.3).
**Verify**: dev curls of the three routes = 200 with h1, en + es (cookie).

### Step 2: slim the shared /privacy
`legal.privacy` becomes website-only: what the site is, the `NEXT_LOCALE`
cookie (named, purpose, expiry, server-set + toggle-set), localStorage theme,
no analytics, no forms, contact. PLUS a prominent "Privacy for our apps"
section linking the four app pages (`/alisio/privacy`, `/fave/privacy`,
`/fingo/privacy`, `/savely/privacy`) — this is the ASC-window mitigation, it
is NOT optional. Update `privacy/page.tsx` JSX to match the new section set
(delete the JSX for removed sections: financialData, geolocation, etc.).
**Verify**: `grep -n "credit card\|shipping\|geolocation\|message boards" messages/en.json` = 0; served /privacy/ mentions NEXT_LOCALE and links the four app pages.

### Step 3: honest /privacy/choices and /terms
Choices: reframe to reality (there is almost no data to exercise rights over;
keep the contact path and the response note). Terms: remove registration
representations and IP-blocking fiction, keep IP/ownership and
limitation-of-liability sections, refresh lastUpdated.
**Verify**: `grep -n "registration" messages/en.json` = 0 in the legal region.

### Step 4: sitemap + e2e
Add the three paths to `sitemap.ts`. New `tests/e2e/legal.spec.ts`: the three
new routes 200 + h1 in both locales; `/privacy/` body contains "NEXT_LOCALE"
(or its visible name) and the four app links; every legal route has
`main#main-content` (regression net for plan 008).
**Verify**: `pnpm test:e2e` all green (12 smoke + support.spec if 007 landed + legal.spec).

## Test plan
`pnpm verify` → `pnpm test:e2e` → manual read-through of all five privacy
surfaces in BOTH languages, checking every factual sentence against Ground
truth → both themes.

## Done criteria
- [ ] 3 new routes live, bilingual, truthful
- [ ] Shared /privacy website-only + apps pointer section
- [ ] Choices/terms fiction removed, dates fresh
- [ ] Boilerplate greps at 0; parity green; e2e green
- [ ] `git status` only in-scope files; README row updated
- [ ] PR description reminds the owner: update ASC privacy URLs the same day
      this deploys (README human checklist #1)

## STOP conditions
- Any claim you cannot ground in this plan's Ground truth (note: Alisio and
  Fingo repos are at ~/Projects/Swift/Alisio and ~/Projects/Swift/Fingo if you
  need to re-verify a fact; if still ambiguous, stop and ask).
- Parity failure outside `legal.*`.
- `sitemap.ts` at drift-check time doesn't contain what plan 007 left there.

## Maintenance notes
- Plan 010 rewrites sitemap wholesale right after; your 3 lines get absorbed.
- When a new app ships, its privacy page follows this same recipe; the shared
  /privacy only gains one link in the apps section.

---

## Landed from 007 that changes this plan (2026-08-20)

Executing 007 spilled into this plan's files. Read this before your drift check.

**All four existing legal pages were edited.** `app/[locale]/privacy/page.tsx`,
`privacy/choices/page.tsx`, `terms/page.tsx` and `fave/privacy/page.tsx` each
hardcoded `data-theme="light"`, so a reader who chose dark on the homepage got
a white flash on arrival. Each now renders `<ThemeInit />`
(`components/theme-init.tsx`, NEW) as the first child of `.ab-root`, the
hardcoded attribute is gone, and the root carries `suppressHydrationWarning`.

Three consequences for you:

1. **Do not delete `<ThemeInit />` or the `suppressHydrationWarning`** while
   trimming sections. The attribute is deliberately absent from JSX so React
   never manages it; putting `data-theme` back in JSX reintroduces the bug.
2. **The three NEW pages you create must render `<ThemeInit />` too**, first
   child of `.ab-root`, or `/alisio/privacy`, `/fingo/privacy` and
   `/savely/privacy` will be the only pinned-light routes left on the site.
3. **`tests/e2e/support.spec.ts` already pins this**: a loop asserts
   `data-theme="dark"` on `/privacy/`, `/terms/` and `/fave/privacy/` when
   `ab_theme=dark`. Add your three routes to that loop rather than writing a
   second copy of it in `legal.spec.ts`.

Line anchors this plan cites inside `privacy/page.tsx` moved by +2 (the import
and the `<ThemeInit />` line). Re-grep rather than trusting them.

Still true and untouched: every `legal.*` dictionary key. 007 did not read or
write that namespace, so the audit findings quoted in "Why this matters" all
still stand.

---

## Landed from 008 that changes this plan (2026-08-20)

008 (PR #58) touched two of your files and three of your keys. Small next to
007's spill, but read it before Step 3.

**The email question is closed.** All five legal contact keys now read
`ivanlorenzana@outlook.com` in both locales, so this plan's "Out of scope:
email values (landed in 008 - reuse them)" line is accurate as written. The
three namespaces you create should carry that same address and no other.

**`privacyChoices.sections.howToExercise.email` lost a baked-in label.** It
used to read `"Email: ivanlorenzanabelli@outlook.com"`: the word `Email: ` was
part of the value, which is precisely why that address had never been a link.
The value is now the bare address. When you trim `privacyChoices` to reality,
**keep it a bare address** - a value with a label inside it cannot be
linkified, and the JSX now interpolates it into ``href={`mailto:${...}`}``.

**Two of your files gained a `mailto` anchor.** `privacy/page.tsx` (contact
block) and `privacy/choices/page.tsx` (`howToExercise` block) now wrap their
address in `<a className="ab-legal-link" href={`mailto:...`}>`, matching what
`terms/page.tsx` and `fave/privacy/page.tsx` already did. If you restructure
those sections, do not regress them to plain text: all five privacy surfaces
are consistent now, and an assertion in your new `legal.spec.ts` is cheap
insurance.

**Line anchors moved again.** On top of 007's +2 from `<ThemeInit />`,
`privacy/page.tsx` gained +2 more and `privacy/choices/page.tsx` +5 from the
anchor wrappers. Re-grep; do not trust any line number this plan cites inside
those two files.

**Your `main id="main-content"` recipe line is now the site-wide rule**, not
just a fave habit. 008 added the id to the four `<main>`s that lacked it
(`/privacy`, `/terms`, `/privacy/choices`, the 404), so every `<main>` in the
tree carries it and the layout skip-link finally works everywhere. Your three
new pages must keep the id, and the Step 4 assertion you already planned is
now a regression net over real code rather than a forward-looking one.
