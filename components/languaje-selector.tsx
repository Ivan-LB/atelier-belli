"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { GlobeIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"

const LANGUAGE_COOKIE = "preferred-language"

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("languageSelector")

  useEffect(() => {
    // Check if user has already selected a language
    const savedLanguage = document.cookie
      .split("; ")
      .find((row) => row.startsWith(LANGUAGE_COOKIE))
      ?.split("=")[1]

    if (!savedLanguage) {
      // Show language selector after a short delay
      const timer = setTimeout(() => {
        setHasSelectedLanguage(false)
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const selectLanguage = (locale: "en" | "es") => {
    // Save preference in cookie (expires in 1 year)
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `${LANGUAGE_COOKIE}=${locale}; expires=${expires.toUTCString()}; path=/`

    // Navigate to the selected locale
    const currentPath = pathname.replace(/^\/[a-z]{2}/, "") || "/"
    router.push(`/${locale}${currentPath}`)

    setIsOpen(false)
    setHasSelectedLanguage(true)
  }

  const openSelector = () => setIsOpen(true)
  const closeSelector = () => setIsOpen(false)

  return (
    <>
      {/* Floating language button */}
      <button
        onClick={openSelector}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Change language"
      >
        <GlobeIcon className="w-5 h-5" />
      </button>

      {/* Language selector modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={closeSelector}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gradient">{t("title")}</h2>
                {hasSelectedLanguage && (
                  <button onClick={closeSelector} className="text-gray-400 hover:text-white transition-colors">
                    <XIcon className="w-6 h-6" />
                  </button>
                )}
              </div>

              <p className="text-gray-300 mb-8 text-center">{t("description")}</p>

              <div className="space-y-4">
                <button
                  onClick={() => selectLanguage("en")}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl">🇺🇸</span>
                  <span className="font-semibold">{t("english")}</span>
                </button>

                <button
                  onClick={() => selectLanguage("es")}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl">🇪🇸</span>
                  <span className="font-semibold">{t("spanish")}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
