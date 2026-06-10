# Plan 004: Purge orphaned vitrine CSS, convert savely-hero to WebP, cookie hygiene

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ace23a0..HEAD -- app/globals.css "app/[locale]/page.tsx" "app/[locale]/_not-found-controls.tsx" public/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. globals.css line numbers below WILL
> shift if anything landed above line 808 — re-locate by the quoted selectors,
> not by line number.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (visual verification is easier if plan 003's Playwright
  is available, but manual screenshots suffice)
- **Category**: tech-debt / perf
- **Planned at**: commit `ace23a0`, 2026-06-10

## Why this matters

Commit `0e269f2` replaced the vitrine's hand-drawn Destilería Lorenzana mock
(fake browser interior + CSS-drawn mezcal bottle) with a real screenshot combo,
orphaning ~195 lines of CSS that still ship to every visitor on every route.
Separately, `public/savely-hero.png` is a 245KB PNG whose sibling
(`fingo-hero.webp`) is 16KB — with `images.unoptimized: true` (load-bearing
for Amplify) nothing downstream compresses it, so the format on disk is the
format on the wire. Finally, the locale cookie is written without `SameSite`,
and two never-referenced placeholder images sit in `public/`. All four are
small, zero-behavior-change cleanups that fit one PR.

## Current state

- `app/globals.css` — the orphaned block runs from the selector
  **`.ab-vit-browser .scr {`** (line 808 at planning time) through the end of
  the **`.ab-vit-bottle .lbl .yr { ... }`** rule (closing brace on line ~1002),
  immediately before the `/* SELECTED WORK */` comment (line 1003). It contains
  every rule whose selector includes: `.scr`, `.nav-strip`, `.txt`, `.eyel`,
  `.sub`, `.buttons`, `.bottle-col`, `.ab-vit-bottle` (plus `.neck`, `.shld`,
  `.bod`, `.lbl`, `.tt`, `.ln`, `.ds`, `.yr` descendants).
  **Verified at planning time**: `grep -n "\"scr\"\|nav-strip\|bottle-col\|ab-vit-bottle" "app/[locale]/page.tsx"`
  → zero matches (the markup is gone).
  **Must survive**: `.ab-vit-browser` itself, `.ab-vit-browser .bb` (+ `.d`,
  `.u`), `.ab-vit-browser .shot`, `.ab-vit-web-combo`, `.ab-vit-mini-phone` —
  these are the live combo.
- `public/savely-hero.png` — 251,354 bytes, 660×1374. Referenced in exactly
  two places in `app/[locale]/page.tsx`, both as
  `<img src="/savely-hero.png" alt="" width={660} height={1374} ...>`
  (vitrine, line ~474; case-modal preview, line ~886). The CSS for its frame
  (`.ab-phone-img.savely`, `globals.css:632–651`) references no image URL —
  only the two `<img>` tags change.
- Cookie writes (2 sites, identical pattern):
  - `app/[locale]/page.tsx:112`
  - `app/[locale]/_not-found-controls.tsx:54` (same line shape)
  ```ts
  document.cookie = `${LANGUAGE_COOKIE}=${target}; expires=${expires.toUTCString()}; path=/`
  ```
- `public/placeholder-user.jpg` and `public/placeholder.svg` — v0-scaffold
  leftovers; `grep -rn "placeholder-user\|placeholder.svg" app components` →
  zero matches (verified at planning time).

## Commands you will need

| Purpose   | Command                     | Expected on success |
|-----------|-----------------------------|---------------------|
| Typecheck | `pnpm exec tsc --noEmit`    | exit 0              |
| Lint      | `pnpm lint`                 | exit 0              |
| WebP encode | `cwebp -q 82 public/savely-hero.png -o public/savely-hero.webp` | "Output: ..." ≤ ~90KB |
| Dev smoke | `pnpm dev` (mind port 3000) | routes 200          |
| E2E (if plan 003 landed) | `pnpm test:e2e` | all pass     |

`cwebp` is installed at `/opt/homebrew/bin/cwebp` on the operator's machine.
If absent in your environment, STOP (do not substitute a different encoder
without reporting first).

## Scope

**In scope**:
- `app/globals.css` (delete the orphan block only)
- `app/[locale]/page.tsx` (two `src` strings + two cookie lines — nothing else)
- `app/[locale]/_not-found-controls.tsx` (one cookie line)
- `public/savely-hero.webp` (create), `public/savely-hero.png` (delete)
- `public/placeholder-user.jpg`, `public/placeholder.svg` (delete)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `.ab-mez-site` rules in globals.css — **still alive**: the briefmark and
  pass case previews use them as styled placeholders until real images land
  (HANDOFF.md). Do not delete.
- `public/fingo-hero.webp`, `public/cases/*` — already optimized.
- The savely `width={660} height={1374}` attributes — explicit dimensions are
  load-bearing (see CLAUDE.md §1, the Savely-collapse incident `5f8e600`).
- Adding `Secure` to the cookie — deliberately omitted: Safari drops `Secure`
  cookies set over `http://localhost`, which would silently break local-dev
  locale switching. `SameSite=Lax` only.

## Git workflow

- Branch **from `develop`**: `chore/css-asset-cleanup`
- Suggested commits (separate, in this order):
  1. `chore: remove orphaned vitrine mock CSS`
  2. `perf: convert savely hero to webp`
  3. `fix: add SameSite=Lax to locale cookie`
  4. `chore: drop unreferenced v0 placeholder images`
- **No `Co-Authored-By` or AI signatures.** Stage explicit files only.
- PR to `develop`; human merges.

## Steps

### Step 1: Delete the orphaned CSS block

In `app/globals.css`, locate `.ab-vit-browser .scr {` and delete everything
from that line through the closing `}` of `.ab-vit-bottle .lbl .yr` (the rule
immediately preceding the `/* SELECTED WORK */` comment). ~195 lines.

**Verify**:
```bash
grep -cn "\.scr\b\|nav-strip\|bottle-col\|ab-vit-bottle" app/globals.css   # → 0
grep -cn "ab-vit-web-combo\|ab-vit-mini-phone\|\.shot" app/globals.css     # → >0 (live combo intact)
grep -cn "ab-mez-site" app/globals.css                                     # → >0 (still alive, untouched)
```

### Step 2: Convert savely hero to WebP

```bash
cwebp -q 82 public/savely-hero.png -o public/savely-hero.webp
```

Then in `app/[locale]/page.tsx` change both `src="/savely-hero.png"` to
`src="/savely-hero.webp"` (two occurrences — vitrine and modal preview; keep
every other attribute identical). Then `rm public/savely-hero.png`.

**Verify**:
```bash
ls -la public/savely-hero.webp                      # exists, ≤ ~90KB
grep -rn "savely-hero.png" app components           # → 0 matches
grep -c "savely-hero.webp" "app/[locale]/page.tsx"  # → 2
```

### Step 3: Cookie SameSite

In both `app/[locale]/page.tsx:112` and `app/[locale]/_not-found-controls.tsx:54`,
append `; SameSite=Lax` inside the template string:

```ts
document.cookie = `${LANGUAGE_COOKIE}=${target}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
```

**Verify**: `grep -rn "SameSite=Lax" app | wc -l` → 2

### Step 4: Remove placeholder assets

```bash
grep -rn "placeholder-user\|placeholder\.svg" app components   # must be 0 first
rm public/placeholder-user.jpg public/placeholder.svg
```

**Verify**: `ls public/` no longer lists either file.

### Step 5: Full gate + visual check

```bash
pnpm exec tsc --noEmit && pnpm lint
```

Boot a dev server (⚠️ if :3000 is already listening — the operator's server —
it will pick another port; read the log) and visually confirm, in BOTH
`data-theme="light"` and `"dark"` on `/en/`:
1. Vitrine third piece (Destilería combo: browser + mini phone) renders intact.
2. Savely phone renders in the vitrine AND in case modal 02 (now webp).
3. Briefmark (05) and Pass (06) modals still show their dark styled
   placeholders (proves `.ab-mez-site` survived).
4. Locale toggle still switches EN↔ES and persists after reload (cookie works
   with the new attribute).

If plan 003 landed: `pnpm test:e2e` → all pass.

## Test plan

Steps 1–4 each carry their own grep verification; Step 5 is the behavioral
pass. No new automated tests required — but if plan 003's suite exists, run it
and report results in the PR body.

## Done criteria

- [ ] All Step 1–4 grep verifications pass exactly as specified
- [ ] `pnpm exec tsc --noEmit` and `pnpm lint` exit 0
- [ ] Step 5 visual checklist confirmed (note results per item in the PR body)
- [ ] `git status` shows only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The grep in Step 1 finds `.scr`/`bottle` class usage in any `.tsx` file —
  markup drift; the block is not fully orphaned anymore.
- `cwebp` produces a file >120KB or visibly degraded (compare by eye at 2×
  zoom) — report instead of shipping a worse image or silently raising `-q`.
- The vitrine or any modal renders visually broken after Step 1 — the deleted
  range was wrong; restore `git checkout -- app/globals.css` and report the
  selector that was still live.
- Locale switching stops persisting after Step 3 in any browser you can test.

## Maintenance notes

- When real briefmark/pass images land (HANDOFF.md pending item), `.ab-mez-site`
  and its descendants become the NEXT orphaned block — same treatment, future
  plan.
- Reviewer: the globals.css diff must be pure deletion; the page.tsx diff must
  be exactly 2 src strings + 1 cookie line; `_not-found-controls.tsx` exactly
  1 cookie line.
- Deferred: `Secure` cookie attribute (Safari local-dev tradeoff, documented
  above); splitting globals.css by route scope (audited, judged not worth the
  churn today).
