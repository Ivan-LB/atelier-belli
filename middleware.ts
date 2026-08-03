import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "@/i18n"

export default createMiddleware({
  locales: [...locales],
  defaultLocale,

  // The locale never appears in the URL: /privacy serves English or Spanish
  // depending on the NEXT_LOCALE cookie, and next-intl rewrites internally onto
  // the app/[locale]/* tree. The [locale] segment still exists on disk — it is
  // simply never visible, so `useParams().locale` keeps working.
  localePrefix: "never",
})

export const config = {
  // With no prefix in the URL, every page path has to reach the middleware —
  // the old `/(es|en)/:path*` matcher would never match anything again.
  // Excluded: Next internals, the image optimizer, /api, and any path with a
  // file extension (everything under public/), none of which need a locale.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)"],
}
