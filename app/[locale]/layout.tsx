import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getTranslations, getMessages, unstable_setRequestLocale } from "next-intl/server"
import { locales } from "@/i18n"
import "../globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang={locale} className={inter.variable}>
      <head>
        <meta name="theme-color" content="#FAF8F3" />
      </head>
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
