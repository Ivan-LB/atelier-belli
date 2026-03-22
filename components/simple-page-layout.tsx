"use client"

import Link from "next/link"
import type React from "react"
import { ArrowLeftIcon } from "lucide-react"
import { useParams } from "next/navigation"

const strings = {
  en: {
    back: "Back to Home",
    rights: "All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
  },
  es: {
    back: "Volver al Inicio",
    rights: "Todos los derechos reservados.",
    privacy: "Política de Privacidad",
    terms: "Términos y Condiciones",
  },
}

export default function SimplePageLayout({
  title,
  children,
  showBackButton = true,
}: {
  title: string
  children: React.ReactNode
  showBackButton?: boolean
}) {
  const params = useParams()
  const locale = ((params?.locale as string) || "es") as "en" | "es"
  const s = strings[locale]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="py-4 bg-gray-800/50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">{title}</h1>
          {showBackButton && (
            <Link
              href={`/${locale}#inicio`}
              className="text-sm text-pink-400 hover:text-pink-300 flex items-center transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1.5" aria-hidden="true" />
              {s.back}
            </Link>
          )}
        </div>
      </header>
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-sm sm:prose-base prose-h2:text-gradient prose-h2:font-semibold prose-a:text-pink-400 hover:prose-a:text-pink-300">
          {children}
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 text-center mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Atelier Belli. {s.rights}
          </p>
          <div className="mt-1 space-x-3">
            <Link href={`/${locale}/privacy`} className="text-xs hover:text-pink-300 transition-colors">
              {s.privacy}
            </Link>
            <Link href={`/${locale}/terms`} className="text-xs hover:text-pink-300 transition-colors">
              {s.terms}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
