# Opportunistic improvements

> Picked up after the 2026-04-25 legacy-removal pass. None are urgent;
> each is an optional follow-up. Pick one, scope it, ship it as its own
> PR (do NOT bundle).

The 6-PR pass that just landed (PRs #7, #8, #9, #11, #12, #13, #15) drove
the codebase to a lean baseline: the editorial homepage, the support
shell, the legal trio, and the 404 page are all that ships, with i18n
canonicalised on `useTranslations()` for everything except the support
pages. Items below were noticed in passing during that pass and
deliberately deferred. Each is self-contained and safe to leave alone.

---

## 1. Support pages — migrate CONTENT[locale] to next-intl

**Priority**: Low. **Size**: Large (hundreds of strings, two PRs).
**Risk**: Low for build, Medium for translation review.

### Why

The support pages (`app/[locale]/fingo/support/page.tsx`,
`app/[locale]/savely/support/page.tsx`) are the **only** remaining
locale-switched-by-locale pattern in the source tree. They keep their
full bilingual body in a top-level
`const CONTENT: Record<Lang, SupportContent>` and pick a branch via
`useParams().locale`. Everywhere else in the tree — homepage, legal
trio, 404 — already runs through `useTranslations()`.

Migrating yields three things:

- **Pattern uniformity.** One way to do i18n. New contributors stop
  asking "which pattern do I follow."
- **Dictionary as source of truth.** Translators read `messages/*.json`,
  not TSX files. Copy review stops requiring a code editor.
- **Future-proof for a third support page.** Destilería (the unused
  `data-app="lorenzana"` skin) would land in JSON from day one.

The cost is real: each file carries ~40 strings split across hero,
contact cards, FAQ, status, CTA, and footer chrome. Doubled for two
support apps, doubled again for both locales — that's roughly 320
string moves to review. Not technically hard, but tedious and
error-prone.

### What's in the way

- `SupportShell` renders four fields with `dangerouslySetInnerHTML`:
  `heroTitle`, `contactTitle`, `faqTitle`, `statusTitle`, `ctaTitle`,
  every `contacts[].value`, every `faq[].a`. The HTML is `<em>` for
  emphasis and `<a href='mailto:...'>` for in-answer links — small,
  author-trusted, but real.
- `t.rich(key, { em: chunks => <em>{chunks}</em> })` cleanly replaces
  `<em>` usage. The `<a href='...'>` inside FAQ answers is harder —
  ICU placeholders can wrap a `chunks` callback that emits an `<a>`,
  but each FAQ answer with a different `mailto:` becomes its own
  rich-translation invocation.
- Path of least resistance: keep `dangerouslySetInnerHTML` consuming
  raw HTML from translation **values**, the way the legal pages already
  do for nothing right now. Translators must understand that some
  values contain HTML; the `<a>` and `<em>` tags would round-trip
  through JSON unchanged. Mark such keys with a naming convention
  (suffix `Html`) so it's discoverable.

### Proposed plan

Three phases, two PRs. Suggested order: do **fingo first**, ship,
absorb feedback, then **savely**.

**Phase A — content-i18n-specialist.** Extract every string in
`CONTENT.en` and `CONTENT.es` into `messages/*.json` under a new
top-level namespace. Recommended key tree (flat per section, mirrors
the existing `legal.*` shape):

```
support.fingo.name                         → "Fingo"
support.fingo.crest                        → "F"
support.fingo.navLabel                     → "Fingo · Support"
support.fingo.footMeta                     → "Fingo — Support desk · 2025"

support.fingo.hero.eye                     → "Support · v2.1.0"
support.fingo.hero.titleHtml               → "How can we <em>help?</em>"
support.fingo.hero.lede                    → "Fingo is a tiny app…"

support.fingo.contact.title.html           → "Get in <em>touch.</em>"
support.fingo.contact.sub                  → "…"
support.fingo.contact.cards.email.label    → "Email"
support.fingo.contact.cards.email.value    → "ivanlorenzana@outlook.com"
support.fingo.contact.cards.email.hint     → "Replies within 24h…"
support.fingo.contact.cards.email.href     → "mailto:…"
support.fingo.contact.cards.bug.*          → …
support.fingo.contact.cards.feature.*      → …
support.fingo.contact.cards.docs.*         → …

support.fingo.faq.title.html               → "Questions <em>we hear.</em>"
support.fingo.faq.sub                      → "…"
support.fingo.faq.items.0.q                → "Does Fingo share…"
support.fingo.faq.items.0.aHtml            → "No. Fingo doesn't ship…"
support.fingo.faq.items.{1..4}.*           → …

support.fingo.status.title.html            → "Everything <em>running.</em>"
support.fingo.status.sub                   → "…"
support.fingo.status.rows.0.k              → "Version"
support.fingo.status.rows.0.v              → "2.1.0"
support.fingo.status.rows.{1..3}.*         → …

support.fingo.cta.title.html               → "Still <em>stuck?</em>"
support.fingo.cta.sub                      → "Write to us directly."
support.fingo.cta.label                    → "ivanlorenzana@outlook.com"
support.fingo.cta.href                     → "mailto:…"

support.fingo.sectionLabels.contact        → "01 — Contact"
support.fingo.sectionLabels.faq            → "02 — Frequent questions"
support.fingo.sectionLabels.status         → "03 — Status"

support.fingo.privacyLabel                 → "Privacy"
support.fingo.termsLabel                   → "Terms"
support.fingo.backLabel                    → "Atelier Belli"
```

Note the **`Html` suffix convention** on keys whose value contains
inline HTML markup. This is the discoverability cue for translators
and future maintainers — it's the rule the gotcha
`i18n-pattern-canonical` already nods at ("rich strings… use ICU
placeholder tags") softened to "values can carry literal `<em>` /
`<a>` HTML when the consumer reads them via `dangerouslySetInnerHTML`."

The FAQ items list shape needs a decision. Two acceptable options:

- **Option A — array of objects**, indexed by integer key
  (`support.fingo.faq.items.0.q`). next-intl supports this via
  `t.raw('faq.items')` returning the array, then iterate. Simpler
  consumer code; weaker key-by-key lookup.
- **Option B — flat enumerated keys**
  (`support.fingo.faq.q1`, `support.fingo.faq.a1Html`). More keys but
  clearer intent. Recommend Option A — it matches the existing
  `legal.privacy.sections.dataUse.items` shape.

Same key tree mirrored under `support.savely.*`.

**Phase B — frontend-ui-specialist.** Rewrite each support page to
consume the dictionary. Two implementation paths for `SupportShell`:

- **Path 1 — keep `SupportShell` unchanged, build the `SupportContent`
  shape in the page via `useMemo`.** Smallest blast radius. The page
  becomes:

  ```tsx
  const t = useTranslations("support.fingo")
  const locale = useParams()?.locale === "es" ? "es" : "en"
  const content = useMemo<SupportContent>(() => ({
    name: t("name"),
    crest: t("crest"),
    // …
    contacts: (["email","bug","feature","docs"] as const).map(kind => ({
      kind,
      label: t(`contact.cards.${kind}.label`),
      value: t(`contact.cards.${kind}.value`),
      hint: t(`contact.cards.${kind}.hint`),
      href: t(`contact.cards.${kind}.href`),
    })),
    faq: (t.raw("faq.items") as Array<{q:string;aHtml:string}>)
      .map(({ q, aHtml }) => ({ q, a: aHtml })),
    status: t.raw("status.rows") as StatusItem[],
    // …
  }), [t])
  return <SupportShell appKey="fingo" locale={locale} content={content} />
  ```

  `SupportShell`'s type stays. `dangerouslySetInnerHTML` keeps reading
  the same string fields. Zero changes to `support-shell.tsx`.

- **Path 2 — refactor `SupportShell` to take a translator + locale.**
  Larger diff, more elegant long-term. **Skip** unless someone is
  already touching the shell for an unrelated reason.

Recommend Path 1.

**Phase C — qa-validator.** `pnpm exec tsc --noEmit` + `pnpm build` +
visual smoke on `/en/fingo/support`, `/es/fingo/support`,
`/en/savely/support`, `/es/savely/support`. Verify
`dangerouslySetInnerHTML` still renders `<em>` correctly in hero, FAQ,
contact cards.

### Acceptance

- `grep -nE "const CONTENT" app/\[locale\]/fingo/support app/\[locale\]/savely/support`
  returns zero hits at the top-level (an internal `useMemo` building a
  `SupportContent` is acceptable).
- `messages/en.json` and `messages/es.json` carry full
  `support.fingo.*` and `support.savely.*` namespaces.
- Both locales render identically pre/post-migration. Pixel diff = 0.
- `pnpm exec tsc --noEmit` exits 0.
- `pnpm build` exits 0.

### Gotchas to honor

- `i18n-pattern-canonical` — this IS the gotcha. The migration is what
  the gotcha is asking for. Document the `Html`-suffix convention in
  the PR description.
- `amplify-client-component-quirk` — both support pages are Client
  Components (`"use client"` at the top). The current
  `NextIntlClientProvider` wiring in `app/[locale]/layout.tsx` already
  serves `useTranslations()` to client trees, so no provider change is
  needed. Smoke on Amplify deploy preview anyway, since support pages
  haven't been exercised through the new provider path with this
  volume of keys.
- Ship as **two PRs**, one per app. Each diff will be hundreds of
  lines; reviewing them in one go is unkind.

---

## 2. not-found.tsx — redesign to .ab-root aesthetic

**Priority**: Low. **Size**: Small (one page, ~30 lines of CSS to
delete). **Risk**: Low.

### Why

`app/[locale]/not-found.tsx` is the last consumer of the legacy
purple-orange-pink gradient aesthetic. The component currently uses:

- `bg-gray-900 text-gray-100` — plain dark slate, ignores
  `--ab-bg` / `--ab-fg`.
- `<AlertTriangleIcon className="text-pink-500">` from lucide-react.
- `<span className="text-gradient">404</span>` consuming the
  `.text-gradient` rule in `app/globals.css` (line 90), which is
  `bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600` — a
  visual language nobody else uses.
- A `GradientButton` local component re-implementing the same gradient
  for the home CTA.

This is visually inconsistent with the editorial `.ab-root` homepage
(cream / ink + a single turquoise accent) and with the legal trio
(which already uses `.ab-root` chrome via `.ab-legal-*` / `.ab-prose`
scoped under `.ab-root`). Once the new not-found ships, `.text-gradient`
can be deleted from `globals.css` — it'll have no remaining consumers.

The `notFound` translation keys already exist in
`messages/{en,es}.json` (`title`, `description`, `backHome`) and the
file already calls `useTranslations("notFound")`. The work is purely
visual.

### Claude Design prompt (ready to paste)

```
I'm redesigning a 404 / "not found" page for a small portfolio site
(Atelier Belli, an iOS + web atelier in Tijuana). The current 404 uses
a legacy purple/orange/pink gradient aesthetic that's inconsistent with
the rest of the site, which is editorial and quiet.

I need ONE design, in light AND dark variants. No new tokens — only
existing ones.

TARGET AESTHETIC

The site's homepage uses a ".ab-root" editorial style:
- Light theme: cream background (#FAF8F3), ink-near-black foreground
  (#1A1A1A), one accent — turquoise (#2F8A99). Generous whitespace,
  thin hairline rules instead of boxes, single-column rhythm, no
  illustrations or photos in chrome.
- Dark theme: warm dark cream (#141311), warm-ivory foreground
  (#EDE6D8), brighter turquoise (#56B3C2). Same layout, same rhythm.
- Display serif: Fraunces (variable, with optical-size axis active —
  big sizes use a tighter, more elegant cut). UI sans: Inter.
- Italic accents: a single italic word inside a serif headline is the
  signature emphasis pattern. Used sparingly. Example homepage hero:
  "Apps crafted with intention." — only "intention." is italic.
- Eyebrow microcopy: Inter, small caps OR small uppercase tracked
  letters, a single dot-separator, very short ("Software · Digital
  craft").
- One CTA pattern: a short uppercase tracked label with an arrow,
  pill-shaped, accent-coloured background or a subtle outline. The
  homepage button class is `ab-cta` — small, restrained, never
  shouting.

REFERENCE

Look at the homepage hero + colophon block for visual rhythm:
- Eyebrow (small, mono or sans, tracked) above
- Big serif headline, one or two lines, with a single italic word
- Short serif lede paragraph below, narrow column (~640-720px max
  content width)
- Generous vertical air around the block
- A single accent dot or thin horizontal hairline (not a box, not a
  card) to separate sections
- ONE call-to-action

THE 404 BRIEF

Keep it humble and calm. The voice should be apologetic, not snarky.

- Visual anchor: a big serif numeral OR word. Either "404" rendered in
  Fraunces at display size, or the word "Lost" / "Perdido" in
  Spanish — pick whichever you think reads better. The italic
  signature pattern works here ("Page not <em>found.</em>").
- Underneath, one short sentence explaining the page didn't exist or
  has moved. Already written in the dictionary; consume it as-is.
- ONE primary CTA: a pill-shaped or text-link style button labelled
  "Back to Home" / "Volver al Inicio" pointing at "/". Style it like
  the homepage's `ab-cta` button — accent background, small uppercase
  tracked text, an arrow.
- A small footer line at the bottom: "© [year] Atelier Belli" in
  muted text. Same style as the homepage's footer/colophon.
- Locale toggle and theme toggle are NOT required on the 404 page
  itself — but if you include a thin top nav, mirror the homepage's
  layout (Atelier Belli wordmark left, EN/ES + theme toggle right).
  Acceptable to omit chrome entirely and rely on the user navigating
  back home.
- NO illustrations. NO icons (the existing AlertTriangleIcon goes
  away). NO graphics. Typography is the design.

CONSTRAINTS — DO NOT NEGOTIATE

- Use only existing CSS variables: --ab-bg, --ab-fg, --ab-muted,
  --accent-color, --accent-soft, --accent-deep, --line, --line-2.
  No new tokens.
- The page MUST work under data-theme="light" and data-theme="dark"
  attribute on a wrapping .ab-root element. No light-mode-only and
  no dark-mode-only colours; everything reads from the variables.
- Copy comes from a translation dictionary keyed at notFound.title,
  notFound.description, notFound.backHome. Both English and Spanish
  already exist. Don't redesign the copy.
- No new dependencies. Lucide is fine but the new design probably
  doesn't need an icon at all.
- Single page. No animations beyond what reduced-motion already
  permits (tiny fade-in is fine; do not add scroll-triggered effects
  or anything heavy).

DELIVERABLES

- One Figma frame for the LIGHT variant (1440 wide, ~900 tall).
- One Figma frame for the DARK variant (same dims).
- A short list mapping the design's surfaces to the existing tokens:
  e.g. "page background → --ab-bg, headline colour → --ab-fg, italic
  word colour → --accent-color, CTA bg → --accent-color, CTA fg →
  --ab-bg".
- Optional: a 375-wide mobile variant of the light frame.

That's it. Keep it quiet. Keep it warm. Match the homepage.
```

### Implementation follow-up

Once the design is signed off:

1. Dispatch frontend-ui-specialist with the Figma frame as reference
   and the existing `notFound` keys as the copy contract.
2. New file replaces the body of `app/[locale]/not-found.tsx`. The
   component is already a Client Component using `useTranslations` —
   keep that wiring, swap the JSX + Tailwind classes for the new
   design.
3. Wrap the page in `<div className="ab-root" data-theme="light">` (or
   read the homepage's theme cookie / `prefers-color-scheme` if a
   smarter default is wanted — look at how `app/[locale]/page.tsx`
   handles `useEffect` with `localStorage.getItem("ab_theme")` for
   the existing pattern).
4. Delete `.text-gradient` from `app/globals.css` (lines ~89-92). Run
   `grep -rn "text-gradient" app components` afterwards — should
   return zero hits.
5. Delete the local `GradientButton` helper, the `AlertTriangleIcon`
   and `HomeIcon` imports if the new design omits them.

### Acceptance

- `/en/this-page-does-not-exist` and `/es/this-page-does-not-exist`
  render the new design. Light + dark both look correct.
- `grep -rn "text-gradient" app components` returns 0 hits.
- `grep -rn "from-orange-500\|via-pink-500\|to-purple-600" app components`
  returns 0 hits.
- `pnpm exec tsc --noEmit` exits 0.
- `pnpm build` exits 0.

### Gotchas to honor

- `root-token-scoping` — only `--ab-*` tokens, scoped under
  `.ab-root`. Do not introduce new tokens; do not reach for `--sup-*`.
- `i18n-pattern-canonical` — `useTranslations("notFound")` is already
  in place; keep it.
- `amplify-client-component-quirk` — the page is a Client Component;
  no provider change is involved, so no Amplify-specific risk beyond
  the standard pre-merge smoke.

---

## 3. pnpm lint script

**Priority**: Low. **Size**: Small (one config file or one
package.json line). **Risk**: None.

### Why

`pnpm lint` is wired in `package.json` to run `next lint`, but no
ESLint configuration exists in the repo. Running it today drops the
developer into Next's interactive setup wizard — not a useful
experience. `next.config.mjs` has `eslint.ignoreDuringBuilds: true`
anyway, so build-time lint is already a no-op. The script lies about
what it does.

### Proposed plan

Two acceptable options.

**Option A — configure ESLint properly.** Recommended.

1. `pnpm dlx eslint --init` OR hand-write `.eslintrc.json` with:

   ```json
   {
     "extends": "next/core-web-vitals"
   }
   ```

2. Add `eslint` and `eslint-config-next` to `devDependencies`. (This
   touches `package.json` — go through infra-deploy-specialist; ship
   in its own dep-bump PR per the gotcha
   `dead-deps-removal-dedicated-pr` mentality applied to additions.)
3. Now `pnpm lint` actually checks the tree. Iterate until clean, or
   add minimal `eslint-disable` comments where the existing code
   intentionally violates a rule.

**Option B — drop the script.** Remove the `"lint": "next lint"`
entry from `package.json`. Simpler, smaller diff, but loses the
affordance for future contributors.

Recommend Option A. Note it's a developer-experience improvement, not
a quality gate — the repo already merges with type errors permitted
(`typescript.ignoreBuildErrors: true` in `next.config.mjs`).

### Acceptance

- Option A: `pnpm lint` exits 0 (or with documented warnings) without
  prompting interactively. CI / Amplify never sees lint failures
  because the next.config flag still ignores them at build time;
  the gain is purely local.
- Option B: `pnpm lint` no longer exists.

### Gotchas to honor

- `pnpm-is-package-manager` — use `pnpm dlx`, not `npx`. Use
  `pnpm add -D`, not `npm install --save-dev`.
- `dead-deps-removal-dedicated-pr` (inverse) — if Option A is taken,
  the dep additions ship in a dedicated PR, not bundled with anything
  else.

---

## 4. Stale local branches

**Priority**: Trivial. **Size**: One command. **Risk**: None — all
listed branches were merged to `develop` and their origin counterparts
were auto-cleaned by GitHub.

### Cleanup

```bash
git branch -d \
  chore/claude-code-harness \
  chore/drop-lorenzana-theme \
  chore/fill-legal-placeholders \
  chore/refresh-claude-md-docs \
  chore/remove-orphaned-deps \
  chore/remove-orphaned-next-themes-sonner \
  chore/remove-shadcn-scaffold \
  refactor/i18n-canonical-homepage \
  refactor/legal-pages-editorial-bilingual
```

If `git branch -d` complains that a branch is not fully merged into
`develop`, double-check the branch on GitHub before forcing with
`-D`. The expectation is that all eight resolve cleanly.

This is a local-only chore. No PR, no commit.

---

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
  database, no auth, no cookies beyond `preferred-language` for the
  locale toggle).
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

## 7. develop → main sync (admin)

**Priority**: Trivial. **Size**: One PR (release flavour).
**Risk**: None — `main` is currently behind by docs-only commits.

After the doc-refresh PR (#15) and any other develop-only commits
land, `develop` will be N commits ahead of `main`. None are
runtime-affecting on their own, but Amplify only deploys on push to
`main`, so the gap accumulates.

When convenient (and after at least one runtime-affecting change is
sitting on `develop`), open a release PR `develop` → `main`. PR title
something like `release: 2026-04-25 editorial cleanup`. Body lists
the merged PRs since the last release.

Do not push to `main` directly. Merge through the PR UI; Amplify will
auto-deploy on push.

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
