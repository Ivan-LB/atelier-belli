import type React from "react"
import type { Metadata, Viewport } from "next"
import { Fraunces, Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getTranslations, getMessages, unstable_setRequestLocale } from "next-intl/server"
import { locales } from "@/i18n"
import { TITLE_TEMPLATE } from "./_route-metadata"
import "../globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

/* Fraunces sets every display heading, so it IS the LCP element — and it used to
   arrive through a 3-hop dependent chain (HTML -> layout.css -> fonts.googleapis
   -> fonts.gstatic) with no preconnect on either cross-origin host: measured
   1410ms to even request the woff2 on a 150ms-RTT connection. next/font
   self-hosts it same-origin, which removes all three hops, and its generated
   size-adjust fallback matches Fraunces' metrics so the swap stops re-wrapping
   the headings. Keep it out of the globals.css @import (the other four families
   still load there). */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
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

/* theme-color used to be a single hardcoded cream value in <head>, so a
   reader in dark mode got a light browser chrome. These two track the OS
   setting. Known gap: the in-page theme toggle does NOT update them, because a
   media-query'd theme-color follows prefers-color-scheme only. Accepted. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#141311" },
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
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
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
