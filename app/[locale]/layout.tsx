import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { locales } from "@/i18n"
import "../globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Atelier Belli – Ivan Lorenzana | Software Development & Digital Solutions",
  description:
    "Atelier Belli is the digital studio of Ivan Lorenzana — full-stack developer crafting clean iOS apps and web experiences. Explore Fingo, Savely, Mi Mezcal and more.",
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
  // Await params first (Next.js 15 requirement)
  const { locale } = await params

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  return (
    <html lang={locale} className={inter.variable} style={{ colorScheme: "dark" }}>
      <head>
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="bg-gray-900 text-gray-100 antialiased font-sans">
        {/* Skip-to-main-content link for keyboard / screen-reader users */}
        <a href="#main-content" className="skip-link">
          {locale === "es" ? "Ir al contenido principal" : "Skip to main content"}
        </a>
        {children}
      </body>
    </html>
  )
}
