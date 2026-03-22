"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { GlobeIcon, XIcon } from "lucide-react"

const LANGUAGE_COOKIE = "preferred-language"

const strings = {
  en: {
    title: "Choose your language",
    description: "Select your preferred language to continue",
    english: "English",
    spanish: "Español",
  },
  es: {
    title: "Elige tu idioma",
    description: "Selecciona tu idioma preferido para continuar",
    english: "English",
    spanish: "Español",
  },
}

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const locale = (pathname.split("/")[1] === "en" ? "en" : "es") as "en" | "es"
  const s = strings[locale]

  // Ref to first focusable element inside modal (for focus trap)
  const firstButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

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

  // Move focus into modal when it opens; restore to trigger button on close
  useEffect(() => {
    if (isOpen) {
      // Focus the first option (or close button if available)
      const target = hasSelectedLanguage ? closeButtonRef.current : firstButtonRef.current
      target?.focus()
    }
  }, [isOpen, hasSelectedLanguage])

  // Keyboard handler: Escape closes, Tab traps focus inside modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && hasSelectedLanguage) {
        closeSelector()
        return
      }

      if (e.key === "Tab") {
        // Collect all focusable elements inside the modal
        const modal = document.getElementById("language-modal")
        if (!modal) return
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, hasSelectedLanguage])

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
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-110"
        aria-label="Change language"
      >
        <GlobeIcon className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Language selector modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={hasSelectedLanguage ? closeSelector : undefined}
            role="dialog"
            aria-modal="true"
            aria-label={s.title}
          >
            <motion.div
              id="language-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700"
              style={{ overscrollBehavior: "contain" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gradient">{s.title}</h2>
                {hasSelectedLanguage && (
                  <button
                    ref={closeButtonRef}
                    onClick={closeSelector}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close language selector"
                  >
                    <XIcon className="w-6 h-6" aria-hidden="true" />
                  </button>
                )}
              </div>

              <p className="text-gray-300 mb-8 text-center">{s.description}</p>

              <div className="space-y-4">
                <button
                  ref={firstButtonRef}
                  onClick={() => selectLanguage("en")}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl" aria-hidden="true">🇺🇸</span>
                  <span className="font-semibold">{s.english}</span>
                </button>

                <button
                  onClick={() => selectLanguage("es")}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl" aria-hidden="true">🇪🇸</span>
                  <span className="font-semibold">{s.spanish}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
