# Plan 005: SEO & shareability — per-locale metadata, hreflang, OG/Twitter cards, sitemap, robots

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ace23a0..HEAD -- "app/[locale]/layout.tsx" messages/ next.config.mjs`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — this plan edits `app/[locale]/layout.tsx`, the documented
  Amplify-sensitive region (gotcha `amplify-client-component-quirk`). An
  Amplify deploy-preview check is mandatory before `main`.
- **Depends on**: plans/003-verification-baseline.md recommended (gates), not blocking
- **Category**: direction / seo
- **Planned at**: commit `ace23a0`, 2026-06-10

## Why this matters

This is a bilingual portfolio whose entire job is to be found and shared, and
it currently has **none** of the discoverability layer (all verified absent at
planning time): no `metadataBase`, no OpenGraph/Twitter tags, no per-locale
title/description, no `hreflang` alternates, no `sitemap.xml`, no `robots.txt`.
Concretely: a link pasted into iMessage/LinkedIn/X renders with no image and
the same English title even for `/es`, and search engines must guess the
EN/ES relationship. The site is `https://atelierbelli.com` (Amplify,
auto-deploy from `main`).

## Current state

- `app/[locale]/layout.tsx:16–24` — the only metadata in the repo:

  ```ts
  export const metadata: Metadata = {
    title: "Atelier Belli — Digital craft, Franco-Italian.",
    description:
      "Atelier Belli is the digital atelier of Ivan Lorenzana — full-stack developer crafting clean iOS apps and the web around them. Fingo, Savely, Mi Mezcal and more.",
    icons: {
      icon: "/AtelierBelli.svg",
      shortcut: "/AtelierBelli.png",
    },
  }
  ```

  Static export — same for both locales. The layout is otherwise a Server
  Component that calls `unstable_setRequestLocale(locale)` (line 43) and wraps
  children in `NextIntlClientProvider` (lines 57–59). **Do not restructure
  any of that** — only the metadata export changes shape.
- `next.config.mjs` sets `trailingSlash: true` — every canonical/sitemap URL
  must end with `/`.
- There is **no root `app/layout.tsx`** — only `app/[locale]/layout.tsx`
  (documented architecture). Metadata routes (`app/robots.ts`,
  `app/sitemap.ts`) do not render through layouts, so they can live at
  `app/` root; if the build objects (see STOP conditions), fall back to
  static `public/robots.txt` + `public/sitemap.xml`.
- `messages/en.json` / `messages/es.json` — `layout` namespace currently holds
  only `skipToContent` (consumed at `layout.tsx:45–46` via
  `getTranslations({ locale, namespace: "layout" })` — this is the exemplar
  pattern to follow for the new meta strings).
- Routes to enumerate in the sitemap (all SSG, both locales, trailing slash):
  `/`, `/privacy/`, `/privacy/choices/`, `/terms/`, `/fingo/support/`,
  `/savely/support/` — i.e. 12 URLs under `/en/...` and `/es/...`.
- i18n conventions (CLAUDE.md §5): every new copy key goes to **both**
  dictionaries; `getTranslations` in Server Components; namespaces are
  top-level (`layout` is the right home for meta strings).

## Commands you will need

| Purpose   | Command                     | Expected on success |
|-----------|-----------------------------|---------------------|
| Typecheck | `pnpm exec tsc --noEmit` (or `pnpm typecheck` if plan 003 landed) | exit 0 |
| Lint      | `pnpm lint`                 | exit 0              |
| i18n parity | `pnpm verify:i18n` (if plan 003 landed) | OK      |
| Build     | `pnpm build`                | exit 0, same route shape + sitemap/robots routes |

⚠️ **Before `pnpm build`**: check `lsof -ti :3000 -sTCP:LISTEN` (gotcha
`next-build-clobbers-dev-cache`) — see plan 001 for the protocol.

## Scope

**In scope**:
- `app/[locale]/layout.tsx` — metadata export → `generateMetadata()`
- `messages/en.json` + `messages/es.json` — new `layout.meta*` keys
- `app/robots.ts`, `app/sitemap.ts` (create)
- `public/og.png` (create — see Step 4's escape hatch)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- The provider/`setRequestLocale` region of layout.tsx (lines 30–63) beyond
  the metadata function itself.
- `middleware.ts` matcher — robots.txt/sitemap.xml are not matched by
  `["/", "/(es|en)/:path*"]`, so they pass through untouched; no change needed.
- Per-case OG images / case deep-link metadata — composes with plan 006,
  deliberately deferred.
- Structured data (JSON-LD) — worthwhile later, not in this plan.

## Git workflow

- Branch **from `develop`**: `feat/seo-discoverability`
- Commits: e.g. `feat: per-locale metadata with hreflang and OG tags`,
  `feat: add sitemap and robots`, `feat: add OG card image`
- **No `Co-Authored-By` or AI signatures.** Stage explicit files only.
- PR to `develop`; human merges; **Amplify preview check required** (Step 6).

## Steps

### Step 1: Dictionary keys

Add to the `layout` namespace in BOTH `messages/en.json` and `messages/es.json`:

- `metaTitle` — EN: keep the existing title string from layout.tsx verbatim.
  ES: a faithful Spanish equivalent (e.g. "Atelier Belli — Artesanía digital,
  franco-italiana." — match the site's existing ES voice; check how `home`
  namespace phrases things).
- `metaDescription` — EN: existing description verbatim; ES: translation in
  the same voice.
- `ogAlt` — EN: "Atelier Belli — portfolio of Ivan Lorenzana"; ES equivalent.

**Verify**: `pnpm verify:i18n` → OK (if available), else
`node -e "JSON.parse(require('fs').readFileSync('messages/en.json'));JSON.parse(require('fs').readFileSync('messages/es.json'));console.log('ok')"` → ok

### Step 2: generateMetadata in layout.tsx

Replace the static `export const metadata` (lines 16–24) with:

```ts
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "layout" })
  return {
    metadataBase: new URL("https://atelierbelli.com"),
    title: t("metaTitle"),
    description: t("metaDescription"),
    icons: { icon: "/AtelierBelli.svg", shortcut: "/AtelierBelli.png" },
    alternates: {
      canonical: `/${locale}/`,
      languages: { en: "/en/", es: "/es/", "x-default": "/en/" },
    },
    openGraph: {
      type: "website",
      siteName: "Atelier Belli",
      locale: locale === "es" ? "es_MX" : "en_US",
      url: `/${locale}/`,
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: { card: "summary_large_image" },
  }
}
```

`getTranslations` is already imported at line 6. Keep `generateStaticParams`
untouched. Note all URLs end with `/` (trailingSlash).

**Verify**: `pnpm exec tsc --noEmit` → exit 0

### Step 3: robots.ts + sitemap.ts

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://atelierbelli.com/sitemap.xml",
  }
}
```

Create `app/sitemap.ts` enumerating the 12 URLs from "Current state"
(`https://atelierbelli.com/{en|es}{path}` with trailing slashes), each entry
with `alternates: { languages: { en: <en url>, es: <es url> } }` so hreflang
also lives in the sitemap. Use a small `const paths = ["", "/privacy", ...]`
loop — no hardcoded 12-entry blob.

**Verify**: `pnpm build` → exit 0 AND output lists `/robots.txt` and
`/sitemap.xml` as routes; then
`pnpm dev` (mind :3000) + `curl -s http://localhost:<port>/sitemap.xml | grep -c "<loc>"` → 12,
`curl -s http://localhost:<port>/robots.txt` → contains `Sitemap:`.

### Step 4: OG card image

Target: `public/og.png`, 1200×630, brand-consistent (cream `#FAF8F3`
background, Atelier Belli mark, name + one-line descriptor — match the
editorial aesthetic; assets available: `public/AtelierBelli.svg`,
`public/AtelierBelli.png`).

Preferred method: screenshot a 1200×630 hand-tuned HTML scratch file (write it
under `/tmp`, NOT in the repo) using any local headless browser available.
**Escape hatch**: if you cannot produce an image you'd defend visually, set
`images: [{ url: "/AtelierBelli.png", ... }]` in Step 2 as an interim, note
"OG image pending human design" in the PR body, and leave `public/og.png` out.
Do not commit a low-effort card the operator hasn't seen — flag it instead.

**Verify** (if created): `sips -g pixelWidth -g pixelHeight public/og.png`
→ 1200 / 630, file ≤ 300KB.

### Step 5: Full gate

`pnpm exec tsc --noEmit && pnpm lint && pnpm build` all exit 0; route table
unchanged except the two new metadata routes. If plan 003 landed:
`pnpm verify && pnpm test:e2e` → all pass.

Then validate the rendered tags:

```bash
pnpm dev &   # mind :3000
curl -s http://localhost:<port>/en/ | grep -o '<meta property="og:[^>]*>' | head
curl -s http://localhost:<port>/es/ | grep -o 'hreflang="[^"]*"' | sort -u
kill %1
```

**Verify**: `/en/` emits og:title/og:image/og:locale `en_US`; `/es/` emits
hreflang `en`, `es`, `x-default`, and its own og:locale `es_MX` + the Spanish
title (proves per-locale metadata actually varies).

### Step 6: Amplify preview (human-in-the-loop)

In the PR body: ask the operator to verify the Amplify deploy preview renders
both locales AND that `view-source` shows the meta tags (Amplify + layout.tsx
changes = mandatory smoke, per CLAUDE.md §6). Suggest they paste the preview
URL into a card validator (opengraph.xyz or similar) for the visual check.

## Test plan

Step 5's curl assertions are the functional tests. If plan 003 landed, add one
Playwright test to `tests/e2e/smoke.spec.ts`: goto `/es/`, assert
`document.title` equals the ES `metaTitle` literal, and `head meta[property=
"og:locale"]` content is `es_MX`. → suite passes.

## Done criteria

- [ ] `/en/` and `/es/` emit different (correctly localized) title/description/og:locale
- [ ] hreflang alternates (en, es, x-default) present on both locales
- [ ] `curl /sitemap.xml` → 12 `<loc>` entries, all with trailing slash; `curl /robots.txt` → references sitemap
- [ ] OG image: `public/og.png` (1200×630) committed OR interim fallback + PR note
- [ ] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` all exit 0
- [ ] PR body contains the Amplify-preview checklist
- [ ] `git status` shows only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The build errors on `app/robots.ts`/`app/sitemap.ts` about a missing root
  layout — switch to the documented fallback (static `public/robots.txt` +
  `public/sitemap.xml` with the same 12 URLs + hreflang via
  `xhtml:link rel="alternate"`), and note the fallback in the PR. If THAT also
  fails, stop.
- `generateMetadata` triggers any next-intl/`react-server` resolution error at
  build — this is the Amplify-sensitive region; do not experiment past one
  documented fix attempt.
- Adding the metadata changes the route table (any route losing `○`/`●`).

## Maintenance notes

- When plan 006 (case deep links) lands, revisit OG: per-case `og:title`/image
  on `?case=` URLs requires server-rendered variants — a follow-up design.
- When a new route ships (e.g. briefmark support), add it to `app/sitemap.ts`'s
  `paths` array — note this in CLAUDE.md §1's "add a case/page" checklists.
- Reviewer: confirm every URL in metadata/sitemap ends with `/`
  (trailingSlash), and that NO change touched the provider region of layout.tsx.
- Deferred: JSON-LD person/portfolio schema; per-locale OG images.
