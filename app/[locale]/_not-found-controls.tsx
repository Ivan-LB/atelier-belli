"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const LANGUAGE_COOKIE = "preferred-language"

type Theme = "light" | "dark"

export function NotFoundControls({
  locale,
  otherLocale,
  themeLightLabel,
  themeDarkLabel,
  themeAriaLabel,
  localeAriaLabel,
}: {
  locale: "en" | "es"
  otherLocale: "en" | "es"
  themeLightLabel: string
  themeDarkLabel: string
  themeAriaLabel: string
  localeAriaLabel: string
}) {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    let initial: Theme
    try {
      const saved = localStorage.getItem("ab_theme") as Theme | null
      if (saved === "light" || saved === "dark") initial = saved
      else initial = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    } catch {
      initial = "light"
    }
    setTheme(initial)
  }, [])

  useEffect(() => {
    if (theme === null) return
    const root = document.querySelector<HTMLElement>(".ab-nf-root.ab-root")
    if (root) root.setAttribute("data-theme", theme)
    try {
      localStorage.setItem("ab_theme", theme)
    } catch {}
  }, [theme])

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"))

  const switchLocale = () => {
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `${LANGUAGE_COOKIE}=${otherLocale}; expires=${expires.toUTCString()}; path=/`
    router.push(`/${otherLocale}`)
  }

  const themeLabel = theme === "dark" ? themeLightLabel : themeDarkLabel

  return (
    <div className="ab-nf-controls" role="group" aria-label="Site controls">
      <button
        type="button"
        className={`ab-nf-ctrl${locale === "en" ? " is-active" : ""}`}
        aria-pressed={locale === "en"}
        aria-label={localeAriaLabel}
        onClick={switchLocale}
      >
        EN
      </button>
      <button
        type="button"
        className={`ab-nf-ctrl${locale === "es" ? " is-active" : ""}`}
        aria-pressed={locale === "es"}
        aria-label={localeAriaLabel}
        onClick={switchLocale}
      >
        ES
      </button>
      <span className="ab-nf-ctrl-sep" aria-hidden="true" />
      <button
        type="button"
        className="ab-nf-ctrl"
        onClick={toggleTheme}
        aria-label={themeAriaLabel}
        suppressHydrationWarning
      >
        {themeLabel}
      </button>
    </div>
  )
}
