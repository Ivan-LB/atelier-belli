import type React from "react"
import type { Metadata, Viewport } from "next"
import { Archivo, Atkinson_Hyperlegible_Next, Fraunces, Inter, Martian_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getTranslations, getMessages, unstable_setRequestLocale } from "next-intl/server"
import { locales } from "@/i18n"
import { TITLE_TEMPLATE } from "./_route-metadata"
import "../globals.css"

/* Three faces carry the "objects" identity. All load through next/font so they
   are self-hosted same-origin (no fonts.googleapis hop) and get a metric-matched
   fallback, which is what keeps the swap from re-wrapping headings.

   - Archivo (axis wdth) is the display face and the LCP element. The page sets it
     at font-variation-settings "wdth" 118, weight 760, so the wdth axis has to be
     in the file. Preloaded.
   - Atkinson Hyperlegible Next is the text face (body, nav, buttons). Preloaded.
   - Martian Mono (axis wdth, used at 90) is for facts, chips and years only, so it
     is not preloaded. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
})

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-atkinson",
})

const martianMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: false,
  variable: "--font-martian",
})

/* Legacy faces, kept ONLY because the support skins read them: Fave's skin sets
   its display type with var(--font-fraunces), and the support pages fall back to
   var(--font-inter). Neither is on the homepage critical path any more, so
   neither is preloaded. Do not point new work at them. */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "layout" })
  return {
    metadataBase: new URL("https://atelierbelli.com"),
    title: {
      default: t("metaTitle"),
      // Sub-route layouts build their own absolute titles from this same
      // template (see _route-metadata.ts for why they do not just inherit it).
      template: TITLE_TEMPLATE,
    },
    description: t("metaDescription"),
    icons: {
      icon: "/AtelierBelli.svg",
      shortcut: "/AtelierBelli.png",
      // iOS home-screen saves. /apple-touch-icon.png is also the path iOS
      // probes by convention when no link tag is present, so it lives in
      // public/ at the root rather than under app/.
      apple: "/apple-touch-icon.png",
    },
    // No `alternates` here on purpose, for two separate reasons.
    // 1. hreflang: with `localePrefix: "never"` the Spanish version has no URL
    //    of its own, so language alternates would point at routes that 404.
    // 2. canonical: this metadata is inherited by EVERY route under the layout.
    //    It used to hard-code the homepage, so /privacy, /terms and both
    //    support pages each declared the homepage as their canonical — telling
    //    crawlers they were duplicates of it. With no tag, each page is its own
    //    canonical, which is what we want. Only add one back per-route.
    openGraph: {
      type: "website",
      siteName: "Atelier Belli",
      locale: locale === "es" ? "es_MX" : "en_US",
      // Resolved against metadataBase. Per-route layouts set their own; this
      // is og:url only, NOT a canonical link (see the note above).
      url: "/",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: { card: "summary_large_image" },
  }
}

/* theme-color tracks the OS setting, not the in-page choice, because a
   media-query'd theme-color follows prefers-color-scheme only. Known gap, accepted:
   the site defaults to light regardless of the OS, so a dark-OS reader who has not
   toggled still sees light content under dark browser chrome. The values are the
   --ab-bg ground of each theme. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8e7e2" },
    { media: "(prefers-color-scheme: dark)", color: "#151619" },
  ],
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as any)) {
    notFound()
  }

  unstable_setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: "layout" })
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${archivo.variable} ${atkinson.variable} ${martianMono.variable} ${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased font-sans">
        <a href="#main-content" className="skip-link">
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
