"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

type Theme = "light" | "dark"
type Lang = "en" | "es"

const LANGUAGE_COOKIE = "preferred-language"

export default function NotFound() {
  const params = useParams()
  const router = useRouter()
  const locale = (((params?.locale as string) || "en") === "es" ? "es" : "en") as Lang
  const t = useTranslations("notFound")

  const [theme, setTheme] = useState<Theme>("light")
  const [hydrated, setHydrated] = useState(false)

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
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem("ab_theme", theme)
    } catch {}
  }, [theme, hydrated])

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"))

  const switchLocale = () => {
    const target: Lang = locale === "es" ? "en" : "es"
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `${LANGUAGE_COOKIE}=${target}; expires=${expires.toUTCString()}; path=/`
    router.push(`/${target}`)
  }

  const themeLabel = theme === "dark" ? t("themeToggleLight") : t("themeToggleDark")

  return (
    <div className="ab-root ab-nf-root" data-theme={theme}>
      <nav className="ab-nf-nav" aria-label="Atelier Belli">
        <Link href={`/${locale}`} className="ab-nf-mark" aria-label="Atelier Belli — Home">
          <svg
            viewBox="0 0 418 439"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="ab-nf-mark-svg"
          >
            <path
              fill="currentColor"
              d="M309.858 65.3296L381.867 107.607L403.76 120.585C407.627 122.898 413.235 126.427 417.139 128.423C404.352 135.354 391.264 143.371 378.71 150.721L322.099 183.565C322.645 201.011 322.184 220.827 322.177 238.447L322.167 268.865C322.167 273.91 322.184 278.981 322.148 284.029C322.141 285.262 322.171 285.432 321.529 286.139C306.959 278.65 290.56 268.254 276.203 259.839C255.75 247.856 234.721 236.232 214.461 224.059C213.92 211.665 214.179 197.915 214.182 185.42L214.197 122.791C221.054 118.226 230.434 112.869 237.637 108.572L282.754 81.6101C291.49 76.4108 301.433 70.8473 309.858 65.3296Z"
            />
            <path
              fill="#56B3C2"
              d="M176.404 0C179.141 0.852222 197.867 12.5246 201.139 14.4668L268.828 54.3989L151.589 124.157L117.037 144.624C110.186 148.708 101.165 154.448 94.1272 157.877L94.1102 308.139L94.0929 351.974C94.0886 359.243 94.3 367.916 94.0124 375.097L93.5173 375.293C77.1485 366.643 57.9991 354.51 41.7095 344.901L17.4601 330.556C12.0696 327.373 5.05491 323.385 0.130637 319.766C-0.126537 311.512 0.0743604 302.176 0.0799227 293.84L0.107072 246.796L0.140772 104.191L176.404 0Z"
            />
          </svg>
          <span className="ab-nf-name">
            Atelier <em>Belli</em>
          </span>
        </Link>

        <div className="ab-nf-controls" role="group" aria-label="Site controls">
          <button
            type="button"
            className={`ab-nf-ctrl${locale === "en" ? " is-active" : ""}`}
            aria-pressed={locale === "en"}
            aria-label={t("localeSwitchAria")}
            onClick={switchLocale}
          >
            EN
          </button>
          <button
            type="button"
            className={`ab-nf-ctrl${locale === "es" ? " is-active" : ""}`}
            aria-pressed={locale === "es"}
            aria-label={t("localeSwitchAria")}
            onClick={switchLocale}
          >
            ES
          </button>
          <span className="ab-nf-ctrl-sep" aria-hidden="true" />
          <button
            type="button"
            className="ab-nf-ctrl"
            onClick={toggleTheme}
            aria-label={t("themeToggleAria")}
          >
            {themeLabel}
          </button>
        </div>
      </nav>

      <main className="ab-nf-main">
        <div className="ab-nf-stage">
          <div className="ab-nf-eye">
            <span className="ab-nf-eye-dot" aria-hidden="true" />
            <span>{t("eye")}</span>
          </div>

          <h1 className="ab-nf-display" aria-label="404">
            <span aria-hidden="true">4</span>
            <span aria-hidden="true" className="ab-nf-it">
              0
            </span>
            <span aria-hidden="true">4</span>
          </h1>

          <h2 className="ab-nf-title">
            {t("titlePre")}
            <em>{t("titleIt")}</em>
          </h2>

          <p className="ab-nf-desc">{t("description")}</p>

          <Link href={`/${locale}`} className="ab-nf-cta">
            <span>{t("backHome")}</span>
            <span className="ab-nf-cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </main>

      <footer className="ab-nf-foot">
        <span className="ab-nf-copy">© {new Date().getFullYear()} Atelier Belli</span>
        <span className="ab-nf-meta">
          <em>Tijuana</em> — {t("footerMeta")}
        </span>
      </footer>
    </div>
  )
}
