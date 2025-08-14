import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { locales } from "@/i18n"
import "../globals.css"

export const metadata: Metadata = {
  title: "Atelier Belli - Software Development",
  description: "Software development and digital solutions",
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
    <html lang={locale}>
      <body className="bg-gray-900 text-gray-100 antialiased">{children}</body>
    </html>
  )
}
