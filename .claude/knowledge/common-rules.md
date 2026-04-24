# Common rules

Every agent reads this file at the start of every invocation. These rules are
non-negotiable; individual agent docs may add more, but cannot relax these.

## Definition of Done (all 5 must hold)

1. **Typecheck clean.** `pnpm exec tsc --noEmit` exits 0. There is no
   `pnpm typecheck` script in this repo; invoke tsc directly.
2. **Build clean.** `pnpm build` exits 0. Warnings are acceptable iff
   pre-existing; new warnings block merge.
3. **Visual smoke (UI changes only).** Load `/en/` AND `/es/` in `pnpm dev`;
   sanity-check the affected route. For homepage changes also toggle light /
   dark via the nav theme button.
4. **Gotcha honored.** If any trigger in `.claude/knowledge/gotchas.yaml`
   matches the diff, the PR description names the gotcha ID and explains how
   the change respects it (or justifies the exception).
5. **i18n canonical.** New code uses `useTranslations()` from `next-intl`. Do
   not introduce new `const isSpanish = locale === 'es'` flags. See gotcha
   `i18n-pattern-canonical`.

## Git discipline

- Branch from `develop` (default) or from `main` (hotfix only). Name
  branches `<type>/<short-slug>`.
- PRs target `develop` by default. Only hotfixes and release PRs target
  `main`.
- Amplify auto-deploys on every push to `main`. Treat `main` as
  production; do not push directly to it.
- Stage files by name: `git add path/to/file`. Never `git add -A` or
  `git add .`.
- Never `git push --force` to `main`. Never `git commit --no-verify`. Never
  `git commit --amend` on a commit already pushed to a shared branch.
- PRs are never auto-merged. A human clicks merge.
- Commit messages follow the style already in the log: short imperative
  subject, body explains why when non-obvious.

## Actions you must NOT take without explicit user agreement

- `pnpm install <pkg>` or `pnpm add <pkg>` — no new runtime deps.
- `pnpm remove <pkg>` — deletions happen in a dedicated PR, not as a side
  effect.
- `amplify publish`, `amplify deploy`, or any Amplify CLI command —
  deployment is the user's to trigger.
- Editing `.env*` files or committing them.
- Merging any PR.
- Touching `app/[locale]/layout.tsx` to reintroduce `NextIntlClientProvider`
  without first consulting gotcha `amplify-client-component-quirk`.
- Removing `images.unoptimized: true` from `next.config.mjs` without
  reproducing the Amplify image-load regression first.

## When in doubt

Ask the user. A 20-second clarification beats an hour of wrong work. Short
well-framed questions are welcome; wall-of-text clarification requests are
not. One question at a time; name the load-bearing ambiguity explicitly.
