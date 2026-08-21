"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LOCALE_COOKIE } from "@/i18n"
import { ThemeIcons } from "@/components/theme-icons"

type Theme = "light" | "dark"

export function NotFoundControls({
  locale,
  otherLocale,
  themeAriaLabel,
  controlsAriaLabel,
}: {
  locale: "en" | "es"
  otherLocale: "en" | "es"
  themeAriaLabel: string
  controlsAriaLabel: string
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

  const goToLocale = (target: "en" | "es") => {
    // Both buttons used to call one unconditional switch, so pressing the
    // language you were already in switched you away from it.
    if (target === locale) return
    // No locale in the URL: the cookie is the language, and refresh re-resolves
    // it through the middleware without leaving the page.
    document.cookie = `${LOCALE_COOKIE}=${target}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
    router.refresh()
  }

  return (
    <div className="ab-nf-controls" role="group" aria-label={controlsAriaLabel}>
      {/* Marked with aria-current, like the nav's segmented control, and named
          by their own visible text: both buttons used to share one aria-label
          ("Cambiar a Español"), so a screen reader heard two identically named
          buttons and neither name contained what it said on screen. Each
          declares its lang so "EN" and "ES" are announced correctly. */}
      <button
        type="button"
        className="ab-nf-ctrl"
        lang="en"
        aria-current={locale === "en" ? "true" : undefined}
        onClick={() => goToLocale("en")}
      >
        EN
      </button>
      <button
        type="button"
        className="ab-nf-ctrl"
        lang="es"
        aria-current={locale === "es" ? "true" : undefined}
        onClick={() => goToLocale("es")}
      >
        ES
      </button>
      <span className="ab-nf-ctrl-sep" aria-hidden="true" />
      {/* The same 34px sun/moon the homepage header uses. This was a text
          button reading "Light"/"Dark", which meant the 404 and the header
          spoke different languages for the same control, and the label had to
          be suppressed from hydration because it depended on client state. The
          icons swap in CSS, so nothing here is state-dependent. */}
      <button
        type="button"
        className="ab-theme-toggle"
        onClick={toggleTheme}
        aria-label={themeAriaLabel}
      >
        <ThemeIcons />
      </button>
    </div>
  )
}
