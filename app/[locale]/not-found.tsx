"use client"

import type React from "react"
import Link from "next/link"
import { AlertTriangleIcon, HomeIcon } from "lucide-react"
import { useTranslations } from "next-intl"

const GradientButton = ({
  href,
  children,
  className,
}: { href: string; children: React.ReactNode; className?: string }) => (
  <Link
    href={href}
    className={`inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out shadow-lg ${className}`}
  >
    {children}
  </Link>
)

export default function NotFound() {
  const t = useTranslations("notFound")

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md w-full">
        <AlertTriangleIcon className="mx-auto h-20 w-20 text-pink-500 mb-6" />

        <h1 className="text-6xl sm:text-7xl font-bold mb-4">
          <span className="text-gradient">404</span>
        </h1>

        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">{t("title")}</h2>

        <p className="text-gray-400 mb-8 text-base sm:text-lg">{t("description")}</p>

        <GradientButton href="/">
          <HomeIcon className="mr-2 h-5 w-5" />
          {t("backHome")}
        </GradientButton>
      </div>
      <footer className="absolute bottom-8 text-center w-full text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Atelier Belli</p>
      </footer>
    </div>
  )
}
