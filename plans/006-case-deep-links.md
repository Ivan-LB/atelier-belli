# Plan 006: Shareable case-study deep links (`/{locale}/?case=<key>`)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ace23a0..HEAD -- "app/[locale]/page.tsx"`
> If `page.tsx` changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED — touches the modal open/close path; needs the E2E suite as a
  safety net.
- **Depends on**: plans/003-verification-baseline.md (the suite this plan
  extends; do not execute before it)
- **Category**: direction / feature
- **Planned at**: commit `ace23a0`, 2026-06-10

## Why this matters

The portfolio's six case studies (fingo, savely, mezcal, blip, briefmark,
pass) open in a modal whose state lives only in React — `openCase()`/
`closeCase()` never touch the URL. The owner cannot send anyone a link to a
specific case ("mira el case de BLIP"), reloading closes the modal, and
Back closes the page instead of the modal. The repo's own pattern rules
(URL-as-state for shareable state) say this belongs in the URL. After this
plan, `https://atelierbelli.com/en/?case=blip` opens the homepage with the
BLIP modal open, the URL stays in sync as modals open/close, and Back/Forward
behave sanely.

## Current state

All in `app/[locale]/page.tsx` (a `"use client"` component):

- Case keys (line 12): `type CaseKey = "fingo" | "savely" | "mezcal" | "blip" | "briefmark" | "pass"`
- Modal state + handlers (lines 296–303):

  ```ts
  const openCase = useCallback((key: CaseKey, trigger?: HTMLElement) => {
    lastFocusRef.current = trigger ?? (document.activeElement as HTMLElement | null)
    setOpenCaseKey(key)
  }, [])

  const closeCase = useCallback(() => {
    setOpenCaseKey(null)
  }, [])
  ```

- Focus/Escape/scroll-lock effect: lines 305–321 (keys off `openCaseKey`).
- The component already uses `useRouter`/`useParams` from `next/navigation`
  and has several mount effects (theme bootstrap at 86–97 is the exemplar
  pattern for a mount-time browser-API read).
- `next.config.mjs` sets `trailingSlash: true` — canonical URLs look like
  `/en/?case=blip`.
- **Why NOT `useSearchParams()`**: in a fully SSG'd client page, Next requires
  a `<Suspense>` boundary around any `useSearchParams()` consumer and bails
  the static shell out to client rendering at that boundary. Reading
  `window.location.search` in a mount effect + writing via
  `history.replaceState` keeps the page fully static and adds zero framework
  coupling. This is a deliberate decision — do not "modernize" it to
  `useSearchParams`.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Typecheck | `pnpm typecheck`   | exit 0              |
| Lint      | `pnpm lint`        | exit 0              |
| E2E       | `pnpm test:e2e`    | all pass (incl. 2 new) |
| Build     | `pnpm build`       | exit 0, route shape unchanged (⚠️ dev-server check first — gotcha `next-build-clobbers-dev-cache`) |

## Scope

**In scope**:
- `app/[locale]/page.tsx` — the modal state region only
- `tests/e2e/smoke.spec.ts` (or a new `tests/e2e/deep-link.spec.ts`)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Per-case routes (`/en/work/blip`) — rejected for now: the case content is
  modal-shaped and SSG'd into the homepage; new routes would mean a content
  restructure. Query-param is the right size today.
- Per-case OG metadata — needs server-rendered variants; follow-up after
  plan 005 (see its maintenance notes).
- The CASES record, CasePreview, dictionaries — no content changes.
- `components/support-shell.tsx`, any other route.

## Git workflow

- Branch **from `develop`**: `feat/case-deep-links`
- Commit: `feat: shareable deep links for case studies via ?case= param`
- **No `Co-Authored-By` or AI signatures.** Stage explicit files only.
- PR to `develop`; human merges.

## Steps

### Step 1: Open-from-URL on mount

In `page.tsx`, add a constant near the `CaseKey` type:

```ts
const CASE_KEYS: readonly CaseKey[] = ["fingo", "savely", "mezcal", "blip", "briefmark", "pass"]
```

Add a mount effect (place it after the theme-bootstrap effect, matching its
style):

```ts
useEffect(() => {
  const param = new URLSearchParams(window.location.search).get("case")
  if (param && (CASE_KEYS as readonly string[]).includes(param)) {
    setOpenCaseKey(param as CaseKey)
  }
}, [])
```

Note: it sets state directly instead of calling `openCase()` — there is no
trigger element on a fresh load, and `lastFocusRef` staying null is handled by
the existing close path (line 308 guards with `if (lastFocusRef.current ...)`).

**Verify**: `pnpm typecheck` → exit 0; manually: `pnpm dev` (mind :3000),
open `http://localhost:<port>/en/?case=blip` → BLIP modal is open on load.

### Step 2: Sync URL on open/close

Extend the two handlers (keep their `useCallback` shape):

```ts
const openCase = useCallback((key: CaseKey, trigger?: HTMLElement) => {
  lastFocusRef.current = trigger ?? (document.activeElement as HTMLElement | null)
  setOpenCaseKey(key)
  const url = new URL(window.location.href)
  url.searchParams.set("case", key)
  window.history.replaceState(null, "", url)
}, [])

const closeCase = useCallback(() => {
  setOpenCaseKey(null)
  const url = new URL(window.location.href)
  url.searchParams.delete("case")
  window.history.replaceState(null, "", url)
}, [])
```

`replaceState` (not `pushState`) is deliberate as the default: it keeps
Back/Forward semantics simple (Back never lands on a half-open modal state)
while still making the address bar copyable at any moment. The locale switch
(`router.push(`/${target}`)` at line 113) naturally drops the param — acceptable;
do not try to carry it across locales in this plan.

**Verify**: in the dev browser — open a case → address bar shows `?case=<key>`;
press Escape → param gone; copy the URL mid-open into a new tab → same modal opens.

### Step 3: E2E coverage

Add two tests (model them on the existing modal test from plan 003):

1. **deep link opens the right case** — `page.goto("/en/?case=blip")` →
   `.ab-case-modal.open` visible AND contains text `BLIP`; press Escape →
   modal closes AND `page.url()` no longer contains `case=`.
2. **opening a case writes the param** — goto `/en/`; click the first
   `button.ab-index-row`; expect `page.url()` to contain `?case=fingo`;
   press Escape; expect no `case=` in URL.
3. Negative: `page.goto("/en/?case=notreal")` → no `.ab-case-modal.open`
   (invalid keys ignored, no crash).

**Verify**: `pnpm test:e2e` → all pass, twice consecutively.

### Step 4: Full gate

`pnpm verify && pnpm test:e2e && pnpm build` (dev-server check first) — all
green; build route shape unchanged (the page must remain `●` SSG — if it turns
`ƒ`, a server hook crept in; STOP).

## Test plan

Step 3's three tests are the regression net; the existing modal
focus/escape/restore test from plan 003 must keep passing untouched — it
proves the handler changes didn't break the a11y behavior.

## Done criteria

- [ ] `/en/?case=blip` (fresh load) opens the BLIP modal; invalid keys are ignored silently
- [ ] Opening/closing modals syncs the `case` param via replaceState
- [ ] All E2E pass twice consecutively, including the 3 new tests
- [ ] `pnpm verify` exits 0; `pnpm build` exits 0 with `/[locale]` still static
- [ ] `git status` shows only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `openCase`/`closeCase` no longer match the "Current state" excerpts (drift).
- The build marks `/[locale]` as `ƒ (Dynamic)` after your changes.
- The plan-003 focus-restore test starts failing — the handler edit broke the
  a11y path; do not weaken the test.
- You feel the need to add `useSearchParams`, a Suspense boundary, or a new
  route — all explicitly rejected above.

## Maintenance notes

- Plan 005's per-case OG follow-up builds on this param; whoever does it
  should consider promoting `?case=` to real subpaths at that point.
- When a 7th case ships, `CASE_KEYS` must be extended alongside the `CaseKey`
  union — add this to the 5-step "add a case" checklist in CLAUDE.md §1
  (make that edit part of this plan's PR).
- Reviewer: check Escape-close, backdrop-click-close, AND the close button all
  go through `closeCase` (they do today — verify no other `setOpenCaseKey(null)`
  call sites exist: `grep -n "setOpenCaseKey" app/\[locale\]/page.tsx`).
- The modal still lacks `role="dialog"`/`aria-modal` — orthogonal a11y gap
  worth a future micro-PR; tests target CSS classes until then.
