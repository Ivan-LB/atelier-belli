# Opportunistic improvements

> Originally a backlog from the 2026-04-25 legacy-removal pass. Sections 1-4
> and 7 shipped and were removed from this file on 2026-08-03 — their record
> lives in the PRs they name (#17, #18, #22, #23, #25) and in CLAUDE.md.
> What is left below is what is still genuinely open.


## 5. Legal content review

**Priority**: Medium (legal exposure). **Size**: External — no
engineering work needed. **Risk**: Out of scope for engineering until
counsel responds.

### What to flag

The legal trio (`/[locale]/privacy`, `/[locale]/privacy/choices`,
`/[locale]/terms`) carries boilerplate that was translated faithfully
during the editorial bilingual refactor (PR #12) but never reviewed
by a lawyer. The translation accuracy is good; the underlying
substance is unverified.

- **Generic privacy/terms language**, almost certainly cribbed from a
  template. Not customised to Atelier Belli's actual data flows
  (which today are: a static Next.js site, no analytics, no forms, no
  database, no auth, and exactly one cookie — `NEXT_LOCALE`, set by the
  language toggle and also written by the server on first visit. The
  app-specific `preferred-language` cookie this section used to name was
  removed in PR #45; whatever the policy says about cookies should be
  checked against the current name and against the fact that it is now
  set server-side, not only on user action).
- **Mexican jurisdiction** declared as "the State of Baja California,
  Mexico" in `legal.terms.sections.governingLaw`. Confirm this is the
  jurisdiction the user actually wants to invoke and that it's
  enforceable for a portfolio site with a worldwide audience.
- **Privacy contact email** `ivanlorenzanabelli@outlook.com` appears
  in `legal.privacy.sections.contact.email` and elsewhere. Verify
  deliverability and that this is the user's preferred channel for
  privacy / data-subject requests. Note the terms page lists a
  separate address, `contacto@atelierbelli.com`, which currently is
  not used anywhere else — confirm it exists and that the split
  contact is intentional.
- **App-collection language** mentions things the site does NOT
  actually do today: financial data collection, geolocation tracking,
  user-to-user communication, fulfilment of orders / payments. Either
  remove the inapplicable sections OR keep them as boilerplate
  pre-emptively for future apps (Fingo / Savely / a future
  storefront). Counsel should decide.

### Engineering follow-up

None unless counsel asks for changes. If they do, the work is
content-i18n-specialist territory: edit `messages/{en,es}.json` under
`legal.*`. The page templates (`app/[locale]/privacy/**`,
`app/[locale]/terms/**`) consume the dictionary, so structural
changes (a new section, a renamed key) may need a small JSX edit too,
but pure copy edits are JSON-only.

---

## 6. Recurring dep hygiene

**Priority**: Low (hygiene). **Cadence**: Quarterly, or after any
major refactor. **Risk**: None.

### What to check

The 2026-04 pass found seven orphaned packages in two waves
(`three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion`,
`react-parallax-tilt`, `@types/three`, then `next-themes`, `sonner`).
A periodic audit catches the next wave before it ages into background
noise.

- **`pnpm dlx depcheck`** — flags unused deps and missing imports.
  Read the output critically; depcheck has false positives for
  packages consumed via type-only imports or PostCSS plugins.
- **`pnpm outdated`** — surfaces packages that are major-versions
  behind. Currently relevant: `next-intl` is 3.19.1; the 4.x line is
  out and requires a non-trivial migration (provider shape changed
  slightly). Major bumps go through `infra-deploy-specialist` in
  dedicated PRs.
- **Manual `package.json` skim** after any feature ships. If a feature
  was scoped down or replaced mid-flight, the dep that supported the
  earlier approach is the one most likely orphaned.
- **`grep -rE "from ['\"]<pkg>" app components`** for any package
  suspected of being unused. The repo has no `lib/`, no `hooks/`, and
  no `components/ui/` anymore — those greps cover the full source
  surface.

### Cadence

Add to a personal quarterly checklist or trigger after any large
refactor lands on `develop`. No automation today; the project is
small enough that manual is fine.

### Gotchas to honor

- `dead-deps-removal-dedicated-pr` — every removal is its own PR,
  with the verification checklist (grep, build, dev smoke, named
  commit message).
- `pnpm-is-package-manager` — `pnpm remove <pkg>`, never
  `npm uninstall`.

---

## Appendix — principles

These rules apply to every item above.

- **One PR per item.** The `dead-deps-removal-dedicated-pr` mentality
  generalises: each unit of work is its own diff, with its own commit
  message, its own description, its own review surface. Bundling a
  dep removal with a feature, or a config tweak with a UI redesign,
  defeats `git revert`.
- **Use the orchestrator.** For anything bigger than a typo, run
  `/orch <request>`. The orchestrator reads
  `.claude/protocols/orchestrator.md`, classifies the work, matches
  gotchas, dispatches the right specialist, and then runs QA +
  security + git workflow. The main session does not edit code in an
  orch run.
- **Branch from `develop`, PR against `develop`.** Never push to
  `main` directly. `main` advances only through a release PR or a
  hotfix PR explicitly branched from `main`.
- **Definition of Done holds.** `pnpm exec tsc --noEmit` exits 0,
  `pnpm build` exits 0, visual smoke on `/en/` and `/es/` for any UI
  change, gotcha IDs cited in the PR description, new code uses
  `useTranslations()`. See `.claude/knowledge/common-rules.md`.
- **Gotcha IDs cited above** — `i18n-pattern-canonical`,
  `amplify-client-component-quirk`, `root-token-scoping`,
  `pnpm-is-package-manager`, `dead-deps-removal-dedicated-pr`,
  `google-fonts-hybrid-loading` — are all defined in
  `.claude/knowledge/gotchas.yaml`. Re-read them before starting any
  item; the rules they encode are not optional.
