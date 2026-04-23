# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start dev server (port 3000)
pnpm build    # Production build
pnpm start    # Run production server
pnpm lint     # Run Next.js linter
```

> Uses **pnpm** as package manager. There are no tests configured.

## Architecture

**Next.js 15 App Router** portfolio site with full i18n support (English/Spanish).

### Routing

All routes live under `app/[locale]/`. The `middleware.ts` intercepts `/` and `/(es|en)/:path*` to redirect based on a cookie or browser language. Supported locales are defined in `i18n.ts`.

```
/           → redirects to /en or /es
/[locale]/  → main portfolio page (page.tsx)
/[locale]/fingo    → Fingo app showcase
/[locale]/privacy  → Privacy policy
/[locale]/terms    → Terms of service
```

`generateStaticParams()` in `app/[locale]/layout.tsx` pre-renders both locales at build time.

### i18n

- Translation strings live in `messages/en.json` and `messages/es.json`
- Use `useTranslations()` hook from `next-intl` inside client components
- The `LanguageSelector` component (`components/languaje-selector.tsx`) persists locale in a cookie and navigates via `useRouter`

### Styling

- Tailwind CSS utility-first; dark mode is class-based
- Custom CSS classes (`.text-gradient`, `.glow-card`, `.nav-link-underline`) are defined in `app/globals.css`
- shadcn/ui components live in `components/ui/` — add new ones with `pnpm dlx shadcn@latest add <component>`
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge) for conditional class merging

### Key Libraries

| Purpose | Library |
|---|---|
| Animations | Framer Motion |
| 3D graphics | Three.js + React Three Fiber + Drei |
| 3D tilt effect | react-parallax-tilt |
| Forms + validation | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | Sonner |

### Component Patterns

- `app/[locale]/page.tsx` is a large `"use client"` component — it contains most of the homepage content including inline sub-components like `GradientButton`
- `components/hero-background.tsx` contains Three.js/R3F scene — keep 3D logic isolated here
- `components/simple-page-layout.tsx` is a reusable wrapper for secondary pages (fingo, privacy, terms)

### Build Notes

`next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`, so type errors won't fail CI. Fix them anyway.
