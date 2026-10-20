import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export const SITE_NAME = "Atelier Belli"

/** The dash here is structural punctuation in a format string, not copy. */
export const TITLE_TEMPLATE = `%s — ${SITE_NAME}`

type RouteParams = { params: Promise<{ locale: string }> }

type OgImage = {
  /** Public path of a 1200x630 card rendered by `pnpm og:render`. */
  url: string
  /** Key for the card's alt text, in the same namespace as the title. */
  altKey: string
}

type RouteMeta = {
  /** URL path as it is actually served: no locale prefix, trailing slash. */
  path: string
  /** Dictionary namespace holding the keys below. */
  namespace: string
  titleKey: string
  descriptionKey: string
  /** A route's own share card. Omitted, the route shares the site's /og.png. */
  ogImage?: OgImage
}

const OG_SIZE = { width: 1200, height: 630 }

/**
 * Builds the `generateMetadata` export for one sub-route.
 *
 * Every page under `app/[locale]` is `"use client"` (line 1), and a client
 * component cannot export `generateMetadata` — so each segment gets a thin
 * SERVER `layout.tsx` whose only jobs are to call this and pass `children`
 * through. Without them all eleven routes served the homepage's title and
 * description, including the pages App Review opens.
 *
 * The locale is handed to `getTranslations` explicitly rather than read from
 * next-intl's request store: that is what keeps these segments prerenderable
 * (the build table must stay ● SSG everywhere except the catch-all).
 *
 * Titles are emitted as `title.absolute`, already carrying the site name,
 * rather than as a bare string leaning on the root layout's `title.template`.
 * That is deliberate: Next resolves a bare-string title against the nearest
 * ancestor template and then STOPS passing that template down, so the moment
 * one segment with a title gained a child route (/privacy -> /privacy/choices)
 * the child silently rendered "User Privacy Choices" with no site name. Being
 * absolute here makes every route correct on its own and keeps the next nested
 * route from reintroducing the same bug.
 */
export function routeMetadata({ path, namespace, titleKey, descriptionKey, ogImage }: RouteMeta) {
  return async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
    const { locale } = await params
    const [t, tLayout] = await Promise.all([
      getTranslations({ locale, namespace }),
      getTranslations({ locale, namespace: "layout" }),
    ])

    const title = t(titleKey)
    const description = t(descriptionKey)
    const image = ogImage
      ? { url: ogImage.url, alt: t(ogImage.altKey) }
      : { url: "/og.png", alt: tLayout("ogAlt") }

    return {
      title: { absolute: TITLE_TEMPLATE.replace("%s", title) },
      description,
      /* Next REPLACES a parent's `openGraph` wholesale as soon as a child
         defines one, so siteName / locale / images have to be restated here or
         every sub-route's share card loses its image. Still no `alternates`:
         see the note in app/[locale]/layout.tsx for why that stays removed. */
      openGraph: {
        type: "website",
        siteName: "Atelier Belli",
        locale: locale === "es" ? "es_MX" : "en_US",
        url: path,
        title,
        description,
        images: [{ ...image, ...OG_SIZE }],
      },
    }
  }
}
