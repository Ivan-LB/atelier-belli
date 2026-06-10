# Plan 003: Establish a verification baseline (typecheck script, i18n parity check, Playwright smoke)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ace23a0..HEAD -- package.json "app/[locale]/page.tsx" messages/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW — everything added is additive (scripts, devDeps, tests);
  no production code changes.
- **Depends on**: none (cleaner if 001 landed first, so the Playwright devDep
  isn't tangled with the dead-dep removal in lockfile diffs)
- **Category**: tests / dx
- **Planned at**: commit `ace23a0`, 2026-06-10

## Why this matters

This repo has **zero tests, zero CI**, and the production build gates nothing
(`next.config.mjs` sets `typescript.ignoreBuildErrors: true` and
`eslint.ignoreDuringBuilds: true`; Amplify deploys whatever lands on `main`).
The sharpest live risk: next-intl **throws at runtime** on a missing message
key — one key added to `messages/en.json` but not `messages/es.json` crashes
the Spanish homepage in production with no warning at build time. Second risk:
the case modal's hand-rolled focus management (`app/[locale]/page.tsx:296–321`)
is the most intricate client logic in the repo and has broken classes of
regression (focus, Escape, body scroll lock) that only a browser test catches.
After this plan, `pnpm verify` is the one-command answer to "does the site
work", and `pnpm test:e2e` proves the four critical user flows in a real
browser.

## Current state

- `package.json` scripts (lines 5–9): only `dev`, `build`, `start`, `lint`.
  No `typecheck`, no `test`. devDependencies include `typescript ^5.5.3`,
  `eslint ^9.39.4`, `eslint-config-next ^15.2.4`. No `engines` field; no
  `.nvmrc` (planning machine runs Node v25; pick `>=20`).
- `messages/en.json` + `messages/es.json` — 506 lines each, identical top-level
  namespaces (`notFound`, `layout`, `legal`, `home`, `support`). Values include
  arrays of objects (e.g. `support.fingo.faq.items`) and HTML strings consumed
  via `t.raw()` — the parity check must compare **key structure**, not values.
- `app/[locale]/page.tsx` — Client Component homepage:
  - Selected-work rows are `<button className="ab-index-row">` elements
    (verified; clicking one calls `openCase`).
  - Modal close button (lines 775–780): `<button ref={closeBtnRef}
    className="ab-case-close" onClick={closeCase} aria-label={t("modal.close")}>`.
  - Modal container gets class `ab-case-modal open` when open; backdrop is
    `ab-case-backdrop open`. There is **no `role="dialog"`** today — target
    CSS classes in tests, not roles.
  - Focus/Escape effect at lines 305–321: focuses `closeBtnRef` after 50ms,
    closes on `Escape`, restores focus to the triggering element on close,
    locks `document.body.style.overflow`.
  - Theme toggle button: `aria-label={t("theme.toggleAria")}` (line ~374);
    theme is applied as `data-theme="light"|"dark"` on the `.ab-root` element
    and persisted to `localStorage["ab_theme"]`.
- Dev server: `pnpm dev` binds :3000 by default. **The operator often has a
  long-lived dev server on :3000** — the Playwright `webServer` config below
  deliberately uses port 3100 to avoid both collision and the shared-`.next`
  corruption gotcha (`next-build-clobbers-dev-cache`). Note `next dev` and
  Playwright's dev-server here still share `.next` with any other dev server —
  two `next dev` processes on different ports sharing `.next` is tolerated by
  Next (unlike dev+build), but if you see vendor-chunk errors, stop the
  operator's server first.

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Install   | `pnpm install`                   | exit 0              |
| Add devdeps | `pnpm add -D @playwright/test` | exit 0              |
| Browsers  | `pnpm exec playwright install chromium` | exit 0       |
| Typecheck | `pnpm typecheck` (added in Step 1) | exit 0            |
| i18n parity | `pnpm verify:i18n` (added in Step 2) | exit 0, "OK" line |
| E2E       | `pnpm test:e2e` (added in Step 3) | all tests pass    |

## Scope

**In scope**:
- `package.json` (scripts + engines + Playwright devDep), `pnpm-lock.yaml`
- `.nvmrc` (create)
- `scripts/verify-i18n.mjs` (create)
- `playwright.config.ts` (create)
- `tests/e2e/smoke.spec.ts` (create)
- `.gitignore` (add Playwright artifacts)
- `CLAUDE.md` §2 (update the "no typecheck or test script" paragraph)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `next.config.mjs` — leave `ignoreBuildErrors`/`ignoreDuringBuilds` alone;
  they are a documented decision. `pnpm verify` is the hard gate instead.
- Any production source file. If a test fails because of a real bug, report
  the bug — do not patch app code in this plan.
- No CI pipeline (no `.github/workflows/`, no amplify.yml) — the repo has
  none by design today; adding CI is a separate decision for the operator.

## Git workflow

- Branch **from `develop`**: `test/verification-baseline`
- Commits: conventional-ish, e.g. `test: add i18n parity check and Playwright smoke suite`
- **No `Co-Authored-By` or AI signatures.** Stage explicit files only.
- PR to `develop`; human merges.

## Steps

### Step 1: Scripts + engines + .nvmrc

In `package.json`, extend `scripts`:

```json
"typecheck": "tsc --noEmit",
"verify:i18n": "node scripts/verify-i18n.mjs",
"verify": "pnpm typecheck && pnpm lint && pnpm verify:i18n",
"test:e2e": "playwright test"
```

Add at top level: `"engines": { "node": ">=20" }`. Create `.nvmrc` containing `20`.

**Verify**: `pnpm typecheck` → exit 0 (the codebase typechecks clean today).

### Step 2: i18n structural parity script

Create `scripts/verify-i18n.mjs`. Requirements:

- Load `messages/en.json` and `messages/es.json` with `JSON.parse(readFileSync(...))`.
- Recursively collect key paths: for plain objects recurse; for **arrays**,
  compare only array length-compatibility by recording the path with `[]`
  marker and recursing into element 0's structure (the dictionaries use
  parallel arrays of objects, e.g. `support.fingo.faq.items[].q`); for
  primitives record the path as a leaf.
- Diff the two path sets both directions. Print every path missing on either
  side, prefixed `EN-only:` / `ES-only:`.
- Exit 1 with a summary count if any mismatch; exit 0 printing
  `i18n parity OK (<N> leaf keys)` otherwise.
- Plain Node, no dependencies, ESM (`.mjs`).

**Verify**: `pnpm verify:i18n` → exit 0, `i18n parity OK` line (the
dictionaries are in parity at planning time). Then prove it detects breakage:
temporarily delete any key from `messages/es.json`, rerun → exit 1 naming the
path; restore the file (`git checkout -- messages/es.json`) and rerun → OK.

### Step 3: Playwright config + smoke suite

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

Create `playwright.config.ts`:

- `testDir: "./tests/e2e"`, chromium project only, `retries: 0`.
- `use: { baseURL: "http://localhost:3100" }`
- `webServer: { command: "pnpm dev --port 3100", url: "http://localhost:3100/en/", reuseExistingServer: true, timeout: 60_000 }`

Create `tests/e2e/smoke.spec.ts` with these tests (deterministic waits only —
no fixed sleeps except where the app itself has a timed behavior):

1. **`/en and /es render`** — `page.goto("/en/")` → `h1` visible; same for `/es/`.
2. **root redirect honors Accept-Language** — request `/` with `Accept-Language: es`
   via `page.context().request.get("/", ...)` or page navigation → final URL
   contains `/es`.
3. **case modal: open, focus, escape, restore** — goto `/en/`; click the first
   `button.ab-index-row`; expect `.ab-case-modal.open` visible; expect
   `button.ab-case-close` to be the focused element (`toBeFocused()` — allow
   the app's 50ms focus delay by using Playwright's auto-retrying expect);
   press `Escape`; expect `.ab-case-modal.open` count 0; expect the originally
   clicked `button.ab-index-row` `toBeFocused()`.
4. **theme toggle persists** — goto `/en/`; click the theme toggle (selector:
   `button[aria-label]` whose aria-label matches the EN dictionary value for
   `home.theme.toggleAria` — read the literal from `messages/en.json` while
   writing the test and hardcode it); expect `.ab-root` attribute `data-theme`
   to flip; `page.evaluate(() => localStorage.getItem("ab_theme"))` matches.
5. **ES homepage shows all six cases** — goto `/es/`; expect
   `button.ab-index-row` count = 6 (guards the missing-key runtime-crash class
   together with verify:i18n).

Add to `.gitignore`: `test-results/`, `playwright-report/`.

**Verify**: `pnpm test:e2e` → 5 passed (or more if you add extras; none skipped, none flaky on a second run).

### Step 4: Update CLAUDE.md §2

Rewrite the paragraph that currently says there is no typecheck/test script:
document `pnpm typecheck`, `pnpm verify`, `pnpm verify:i18n`, `pnpm test:e2e`
(and that test:e2e boots its own dev server on :3100).

**Verify**: `grep -n "verify:i18n" CLAUDE.md` → at least one match.

## Test plan

The plan IS the test plan. Mutation checks to run before calling it done:
- Break parity (Step 2's temporary deletion) → `verify:i18n` fails. Restore.
- `pnpm test:e2e` twice in a row → identical pass results (no flake).

## Done criteria

- [ ] `pnpm verify` exits 0 and runs typecheck + lint + i18n parity
- [ ] `pnpm test:e2e` → 5/5 pass, twice consecutively
- [ ] `scripts/verify-i18n.mjs` exits 1 on a deliberately broken dictionary (demonstrated, then restored)
- [ ] `.nvmrc` and `engines` exist
- [ ] `git status` shows only in-scope files modified
- [ ] CLAUDE.md §2 updated
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any smoke test fails because of an actual app bug (e.g. focus is NOT
  restored) — that's a finding, not something to paper over with a looser
  assertion. Report exactly which assertion failed and what the observed
  behavior was.
- The selectors in "Current state" don't match the live markup (drift in
  `page.tsx`).
- Playwright's chromium download is blocked in the environment — report;
  do not switch the suite to a different browser automation stack.
- `pnpm dev --port 3100` fails to boot inside the webServer timeout twice.

## Maintenance notes

- Every future plan (002, 004, 005, 006) should run `pnpm verify` +
  `pnpm test:e2e` as its gate once this lands.
- When a case study is added (CLAUDE.md §1 five-step pattern), test 5's count
  must be bumped — note this in the test file as a comment.
- The modal has no `role="dialog"`/`aria-modal` today; tests target CSS
  classes. If proper dialog semantics are added later (good idea — see plan
  006's maintenance notes), migrate the selectors to `getByRole("dialog")`.
- Deferred: wiring `pnpm verify` into a pre-push hook or CI — operator's call.
