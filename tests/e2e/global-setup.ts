/**
 * Compiles every route once, one at a time, before any worker starts.
 *
 * `next dev` compiles a route on its first request and rewrites
 * `.next/prerender-manifest.json` each time. The suite runs several workers in
 * parallel against a cold server, so many routes were compiled at once and their
 * writes to that manifest interleaved. A short write that lands over a longer one
 * leaves the old tail behind, the file stops being valid JSON, and from then on
 * every route that calls generateStaticParams answered "Internal Server Error"
 * (97 of 111 tests failed that way, with no assertion at fault).
 *
 * Warming the routes serially keeps the writes ordered. This is test
 * infrastructure only; the app is unchanged.
 */
const BASE_URL = "http://localhost:3100"

// app/sitemap.ts routes, plus a path that matches nothing so the catch-all
// (app/[locale]/[...rest]) and the 404 are compiled too.
const WARM_PATHS = [
  "/",
  "/privacy/",
  "/privacy/choices/",
  "/terms/",
  "/alisio/privacy/",
  "/alisio/support/",
  "/fave/privacy/",
  "/fave/support/",
  "/fingo/privacy/",
  "/fingo/support/",
  "/jugo/",
  "/savely/privacy/",
  "/savely/support/",
  "/sitemap.xml",
  "/this-route-does-not-exist/",
]

export default async function globalSetup(): Promise<void> {
  for (const path of WARM_PATHS) {
    const response = await fetch(`${BASE_URL}${path}`, { redirect: "follow" })
    // Only 5xx matters here: the 404 path is expected to answer 404.
    if (response.status >= 500) {
      throw new Error(`Warm-up request for ${path} answered ${response.status}`)
    }
    await response.arrayBuffer()
  }
}
