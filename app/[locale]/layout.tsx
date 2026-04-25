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

export const metadata: Metadata = {
  title: "Atelier Belli — Digital craft, Franco-Italian.",
  description:
    "Atelier Belli is the digital atelier of Ivan Lorenzana — full-stack developer crafting clean iOS apps and the web around them. Fingo, Savely, Mi Mezcal and more.",
  icons: {
    icon: "/AtelierBelli.svg",
    shortcut: "/AtelierBelli.png",
  },
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
