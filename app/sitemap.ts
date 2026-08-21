import type { MetadataRoute } from "next"

const BASE = "https://atelierbelli.com"

/* One entry per route, with no locale prefix.
 *
 * `localePrefix: "never"` (PR #45) means /privacy serves English or Spanish
 * off the NEXT_LOCALE cookie, so /en/privacy and /es/privacy are redirects —
 * this file used to emit both of them for all 11 routes and not one real URL.
 * The hreflang alternates it also carried went the same way: Spanish has no
 * address of its own to point a crawler at. Do not reintroduce either; see the
 * comment in app/[locale]/layout.tsx for why that removal was deliberate. */
const paths = [
  "",
  "/privacy",
  "/privacy/choices",
  "/terms",
  "/alisio/privacy",
  "/fave/privacy",
  "/fave/support",
  "/fingo/privacy",
  "/fingo/support",
  "/savely/privacy",
  "/savely/support",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({ url: `${BASE}${path}/` }))
}
