# Plan 008: One contact email + legal-surface link hygiene

> **Executor instructions**: work through the steps in order, run every
> verification command, honor the STOP conditions. Update your row in
> `plans/README.md` when done. Repo rules: branch from `develop`, PR to
> `develop`, **no AI signatures**, stage explicit files only, pnpm only,
> never `pnpm build` while a dev server holds :3000.

> **Drift check (run first)**:
> `git diff --stat 07a1f02..origin/develop -- messages/ "app/[locale]/privacy" "app/[locale]/terms" "app/[locale]/not-found.tsx"`
> Re-verify the line anchors below if anything moved. Run `pnpm verify:i18n`
> and note the live count (338 at planning). If plan 009 already landed (legal
> namespaces rewritten), the email keys may have moved — grep, don't trust
> line numbers.

## Status

- **Priority**: P1 — two of the site's legal mailtos bounce, and one of them is
  on `/fave/privacy`, the page App Store Connect will hold as Fave's privacy
  URL.
- **Effort**: S
- **Risk**: LOW (string values + one attribute + a mailto wrapper)
- **Depends on**: nothing. Parallel-safe with plan 007 (zero file overlap).
- **Category**: content-truth / a11y
- **Planned at**: commit `07a1f02`, 2026-08-19

## Why this matters

Measured 2026-08-19: `dig MX atelierbelli.com` (system resolver AND 8.8.8.8)
returns empty — the domain cannot receive mail; its A records are CloudFront.
Yet the site renders live mailtos to `contacto@atelierbelli.com` (Terms §9,
`messages/en.json:222`) and `ivan@atelierbelli.com` (Fave privacy,
`messages/en.json:133`). A third address `ivanlorenzanabelli@outlook.com`
(note the extra "belli" — likely a typo of the real one) appears at
`en.json:100/:143/:169`. The homepage and support pages use the real, working
`ivanlorenzana@outlook.com`. Four addresses total, two of which bounce and one
of which is probably a typo.

**Owner decision (2026-08-19): `ivanlorenzana@outlook.com` everywhere.**

Also in this hygiene pass:
- The layout's skip-link targets `#main-content` (`app/[locale]/layout.tsx:92`)
  but only `/fave/privacy` has that id (`fave/privacy/page.tsx:19`). On
  `/privacy` (:24), `/terms` (:24), `/privacy/choices` (:22) and the 404
  (`not-found.tsx:49`) the `<main>` lacks the id: the skip-link is dead there.
- `/privacy` renders its contact email as PLAIN TEXT (`privacy/page.tsx:112`)
  while `/terms` (:81-83) and `/fave/privacy` (:56-61) wrap it in
  `mailto` + `.ab-legal-link`. Same for `privacy/choices/page.tsx:64-65`.

## Current state — verify it yourself

```bash
grep -rn "ivanlorenzanabelli@outlook\|ivan@atelierbelli\|contacto@atelierbelli" messages/
# Expected: 10 hits (5 keys × 2 locales)
dig +short MX atelierbelli.com
# Expected: empty
grep -c 'id="main-content"' app/[locale]/privacy/page.tsx app/[locale]/terms/page.tsx app/[locale]/privacy/choices/page.tsx app/[locale]/not-found.tsx
# Expected: 0 for all four
```

## Scope

**In scope:** `messages/en.json`, `messages/es.json` (email values only);
`app/[locale]/privacy/page.tsx`; `app/[locale]/privacy/choices/page.tsx`;
`app/[locale]/terms/page.tsx` (only if its main lacks the id — the mailto there
is already correct); `app/[locale]/not-found.tsx` (id attribute ONLY);
`plans/README.md` (status row).

**Out of scope:** every other legal copy change (plan 009 rewrites those
namespaces — do not "improve" wording while you are in the file), support
namespaces (already on the canonical address), `components/support-shell.tsx`
(plan 007's file).

## Steps

### Step 1: one address
Replace all five email keys (both locales) with `ivanlorenzana@outlook.com`.
**Verify**: `grep -rn "ivanlorenzanabelli@outlook\|ivan@atelierbelli\|contacto@atelierbelli" messages/ app/` = 0; `pnpm verify:i18n` passes.

### Step 2: clickable everywhere
Wrap the plain-text emails at `privacy/page.tsx:112` and
`privacy/choices/page.tsx:64-65` in the exact treatment from
`terms/page.tsx:81-83`: `<a className="ab-legal-link" href={\`mailto:${...}\`}>`.
**Verify**: served HTML of `/privacy/` and `/privacy/choices/` contains
`mailto:ivanlorenzana@outlook.com`.

### Step 3: revive the skip-link
Add `id="main-content"` to the `<main>` element of `/privacy`, `/terms`,
`/privacy/choices` and the 404 (`not-found.tsx:49`). Attribute only — change
NOTHING else in not-found.tsx: the catch-all + Server-404 shape is
Amplify-verified (PR #18) and structurally sensitive.
**Verify**: `grep -c 'id="main-content"'` on the four files = 1 each; on a dev
server, Tab once on /privacy and activate the skip link — focus lands in main.

## Test plan
`pnpm verify` → `pnpm test:e2e` (the existing suite asserts
`main#main-content` gets `inert` while the case modal is open,
`smoke.spec.ts:75-76` — homepage already had the id; your change must not
break it) → manual skip-link check on one legal page.

## Done criteria
- [ ] One address, ten grep hits → zero for the old three
- [ ] Emails clickable on all legal surfaces
- [ ] `id="main-content"` on the four mains; skip-link works
- [ ] `pnpm verify` + `pnpm test:e2e` green; `git status` only in-scope files
- [ ] README row updated

## STOP conditions
- Any of the five email keys turns out to render somewhere other than a
  contact block (grep its key name across app/ first).
- The not-found.tsx edit wants to be more than an attribute.
- Parity failure outside the email keys.

## Maintenance notes
If the owner later configures MX for atelierbelli.com (e.g. iCloud custom
domain), swapping the address back is this same 10-hit grep. Keep it one key
family; do not scatter new addresses.
