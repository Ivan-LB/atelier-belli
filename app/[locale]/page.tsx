"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

const LANGUAGE_COOKIE = "preferred-language"

type Lang = "en" | "es"
type Theme = "light" | "dark"

type CaseKey =
  | "fingo"
  | "savely"
  | "mezcal"
  | "blip"
  | "briefmark"
  | "pass"
  | "alisio"
  | "vitapath"
  | "arrhythmia"
// Display order of Selected Work (also the deep-link allowlist). This array is
// the single source of order — CASES render maps over it and `num` follows it.
const CASE_KEYS: readonly CaseKey[] = [
  "alisio",
  "pass",
  "fingo",
  "vitapath",
  "arrhythmia",
  "mezcal",
  "briefmark",
  "savely",
  "blip",
]

type CaseAction = {
  label: string
  href: string
  kind: "primary" | "ghost" | "primary disabled"
  ext?: boolean
  icon?: "external" | "help" | "clock"
}

/** Demo media for a case: a captured clip, or a strip of real screenshots. */
type CaseMedia =
  | {
      kind: "video"
      src: string
      poster: string
      w: number
      h: number
      /** `bare` = no device chrome, natural aspect (multi-surface composites). */
      frame: "browser" | "phone" | "bare"
      url?: string
      caption: string
    }
  | {
      kind: "gallery"
      wide?: boolean
      items: Array<{ src: string; w: number; h: number }>
      caption: string
    }

type CaseData = {
  num: string
  kicker: string
  title: { pre: string; it: string }
  desc: React.ReactNode
  meta: Array<[string, string]>
  actions: CaseAction[]
  preview: CaseKey
  /** problem → approach → result. Optional: only the flagship cases carry it. */
  story?: Array<[string, string]>
  highlights?: string[]
  media?: CaseMedia[]
}

const BRAND_LOGO = (
  <svg viewBox="0 0 418 439" xmlns="http://www.w3.org/2000/svg" fill="none">
    <path
      className="ab-dark"
      d="M309.858 65.3296L381.867 107.607L403.76 120.585C407.627 122.898 413.235 126.427 417.139 128.423C417.633 131.95 417.253 144.108 417.256 148.423L417.269 193.468L417.309 345.287C405.284 351.722 392.046 360.015 380.182 366.98L300.245 414.214L273.471 430.048C269.198 432.551 263.079 436.346 258.705 438.43C234.967 424.66 211.315 410.75 187.747 396.692L164.716 383.083C161.148 380.995 154.775 377.573 151.669 375.333L151.688 300.681C151.683 287.418 151.375 272.909 151.795 259.81C153.707 259.175 162.97 253.342 165.129 252.092L197.888 233.216C202.33 230.678 209.779 226.133 214.214 224.04L214.159 296.958C219.224 300.265 226.152 304.008 231.494 307.08C240.771 312.399 250.008 317.794 259.202 323.257C261.764 321.971 264.264 320.538 266.754 319.115C285.234 308.548 303.743 297.821 321.529 286.139C306.959 278.65 290.56 268.254 276.203 259.839C255.75 247.856 234.721 236.232 214.461 224.059C213.92 211.665 214.179 197.915 214.181 185.42L214.197 122.791C221.054 118.226 230.434 112.869 237.637 108.572L282.753 81.6101C291.49 76.4108 301.433 70.8473 309.858 65.3296Z"
    />
    <path
      className="ab-accent"
      d="M309.858 65.3296L381.867 107.607L403.76 120.585C407.627 122.898 413.235 126.427 417.139 128.423C404.352 135.354 391.264 143.371 378.71 150.721L322.099 183.565C322.645 201.011 322.184 220.827 322.177 238.447L322.167 268.865C322.167 273.91 322.184 278.981 322.148 284.029C322.141 285.262 322.171 285.432 321.529 286.139C306.959 278.65 290.56 268.254 276.203 259.839C255.75 247.856 234.721 236.232 214.461 224.059C213.92 211.665 214.179 197.915 214.182 185.42L214.197 122.791C221.054 118.226 230.434 112.869 237.637 108.572L282.754 81.6101C291.49 76.4108 301.433 70.8473 309.858 65.3296Z"
    />
    <path
      className="ab-accent"
      d="M151.795 259.81C153.707 259.175 162.97 253.342 165.129 252.093L197.888 233.216C202.33 230.678 209.779 226.133 214.214 224.041L214.159 296.958L171.5 271.77C167.521 269.389 155.033 261.24 151.795 259.81Z"
    />
    <path
      className="ab-dark"
      d="M176.404 0C179.141 0.852222 197.867 12.5246 201.139 14.4668L268.828 54.3989L151.589 124.157L117.037 144.624C110.186 148.708 101.165 154.448 94.1272 157.877L94.1102 308.139L94.0929 351.974C94.0886 359.243 94.3 367.916 94.0124 375.097L93.5173 375.293C77.1485 366.643 57.9991 354.51 41.7095 344.901L17.4601 330.556C12.0696 327.373 5.05491 323.385 0.130637 319.766C-0.126537 311.512 0.0743604 302.176 0.0799227 293.84L0.107072 246.796L0.140772 104.191L176.404 0Z"
    />
  </svg>
)

const ICONS = {
  external: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4h6v6M10 14L20 4M18 13v6H5V6h6" />
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
} as const

export default function PortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (((params?.locale as string) || "en") === "es" ? "es" : "en") as Lang
  const t = useTranslations("home")

  const [theme, setTheme] = useState<Theme>("light")
  const [hydrated, setHydrated] = useState(false)
  const [openCaseKey, setOpenCaseKey] = useState<CaseKey | null>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)

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
    const param = new URLSearchParams(window.location.search).get("case")
    if (param && (CASE_KEYS as readonly string[]).includes(param)) {
      setOpenCaseKey(param as CaseKey)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem("ab_theme", theme)
    } catch {}
  }, [theme, hydrated])

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  const switchLocale = () => {
    const target: Lang = locale === "es" ? "en" : "es"
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `${LANGUAGE_COOKIE}=${target}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    router.push(`/${target}`)
  }

  // Reveal-on-scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    const nodes = mainRef.current?.querySelectorAll(".ab-reveal") ?? []
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  // Build CASES per language
  const CASES: Record<CaseKey, CaseData> = useMemo(() => {
    // problem → approach → result. The labels are shared; the bodies live per case.
    const storyOf = (key: CaseKey): Array<[string, string]> => [
      [t("cases.storyLabels.problem"), t(`cases.${key}.story.problem`)],
      [t("cases.storyLabels.approach"), t(`cases.${key}.story.approach`)],
      [t("cases.storyLabels.result"), t(`cases.${key}.story.result`)],
    ]

    return {
    alisio: {
      num: "01",
      kicker: "iOS · watchOS · 2026",
      title: {
        pre: "Alisio — ",
        it: t("cases.alisio.titleIt"),
      },
      desc: t.rich("cases.alisio.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS · watchOS"],
        [t("cases.meta.stack"), "SwiftUI · HealthKit · WatchConnectivity"],
        [t("cases.meta.status"), t("cases.alisio.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.alisio.actionPrimary"),
          href: "https://apps.apple.com/mx/app/alisio/id6793006694",
          kind: "primary",
          ext: true,
          icon: "external",
        },
      ],
      preview: "alisio",
      story: storyOf("alisio"),
      highlights: t.raw("cases.alisio.highlights") as string[],
      media: [
        {
          kind: "video",
          src: "/cases/video/alisio-system.mp4",
          poster: "/cases/video/alisio-system-poster.webp",
          w: 1400,
          h: 760,
          frame: "bare",
          caption: t("cases.alisio.mediaCaption"),
        },
        {
          kind: "gallery",
          items: [
            { src: "/cases/gallery/alisio-w1.webp", w: 300, h: 358 },
            { src: "/cases/gallery/alisio-w2.webp", w: 300, h: 358 },
            { src: "/cases/gallery/alisio-w3.webp", w: 300, h: 358 },
            { src: "/cases/gallery/alisio-w4.webp", w: 300, h: 358 },
          ],
          caption: t("cases.alisio.watchCaption"),
        },
      ],
    },
    pass: {
      num: "02",
      kicker: "Backend · Serverless · 2026",
      title: {
        pre: "Pass — ",
        it: t("cases.pass.titleIt"),
      },
      desc: t.rich("cases.pass.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), t("cases.pass.metaPlatform")],
        [t("cases.meta.stack"), "Node.js · AWS Lambda · DynamoDB · PassKit"],
        [t("cases.meta.status"), t("cases.pass.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.pass.actionPrimary"),
          href: "#",
          kind: "primary disabled",
          icon: "clock",
        },
      ],
      preview: "pass",
      story: storyOf("pass"),
      highlights: t.raw("cases.pass.highlights") as string[],
    },
    fingo: {
      num: "03",
      kicker: "iOS · 2025",
      title: {
        pre: "Fingo — ",
        it: t("cases.fingo.titleIt"),
      },
      desc: t.rich("cases.fingo.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 16+"],
        [t("cases.meta.stack"), "SwiftUI · Swift · Core Haptics"],
        [t("cases.meta.status"), t("cases.fingo.metaStatus")],
        [t("cases.meta.year"), "2025"],
      ],
      actions: [
        {
          label: t("cases.fingo.actionPrimary"),
          href: "https://apps.apple.com/mx/app/fingo-group-choice-made-easy/id6747301883",
          kind: "primary",
          ext: true,
          icon: "external",
        },
        {
          label: t("cases.fingo.actionGhost"),
          href: `/${locale}/fingo/support`,
          kind: "ghost",
          icon: "help",
        },
      ],
      preview: "fingo",
    },
    vitapath: {
      num: "04",
      kicker: "System · Healthtech · 2026",
      title: {
        pre: "Vitapath — ",
        it: t("cases.vitapath.titleIt"),
      },
      desc: t.rich("cases.vitapath.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS · Web · Spring"],
        [t("cases.meta.stack"), "SwiftUI · Spring Boot · PostGIS · STOMP"],
        [t("cases.meta.status"), t("cases.vitapath.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.vitapath.actionPrimary"),
          href: "#",
          kind: "primary disabled",
        },
      ],
      preview: "vitapath",
      story: storyOf("vitapath"),
      highlights: t.raw("cases.vitapath.highlights") as string[],
      media: [
        {
          kind: "video",
          src: "/cases/video/vitapath-system.mp4",
          poster: "/cases/video/vitapath-system-poster.webp",
          w: 1600,
          h: 760,
          frame: "bare",
          caption: t("cases.vitapath.mediaCaption"),
        },
        {
          kind: "gallery",
          items: [
            { src: "/cases/gallery/vitapath-p1.webp", w: 420, h: 913 },
            { src: "/cases/gallery/vitapath-p2.webp", w: 420, h: 913 },
            { src: "/cases/gallery/vitapath-p3.webp", w: 420, h: 913 },
          ],
          caption: t("cases.vitapath.galleryCaption"),
        },
      ],
    },
    arrhythmia: {
      num: "05",
      kicker: "Web · ML · 2026",
      title: {
        pre: "Arrhythmia Detector — ",
        it: t("cases.arrhythmia.titleIt"),
      },
      desc: t.rich("cases.arrhythmia.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), t("cases.arrhythmia.metaPlatform")],
        [t("cases.meta.stack"), "Next.js · TypeScript · FastAPI · TanStack Query"],
        [t("cases.meta.status"), t("cases.arrhythmia.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.arrhythmia.actionPrimary"),
          href: "https://github.com/Ivan-LB/arrhythmia-detector-backend",
          kind: "primary",
          ext: true,
          icon: "external",
        },
      ],
      preview: "arrhythmia",
      story: storyOf("arrhythmia"),
      highlights: t.raw("cases.arrhythmia.highlights") as string[],
      media: [
        {
          kind: "video",
          src: "/cases/video/arrhythmia-demo.mp4",
          poster: "/cases/video/arrhythmia-demo-poster.webp",
          w: 1120,
          h: 700,
          frame: "browser",
          url: "arrhythmia-detector",
          caption: t("cases.arrhythmia.mediaCaption"),
        },
        {
          kind: "gallery",
          wide: true,
          items: [
            { src: "/cases/gallery/arrhythmia-01.webp", w: 760, h: 642 },
            { src: "/cases/gallery/arrhythmia-02.webp", w: 760, h: 946 },
          ],
          caption: t("cases.arrhythmia.galleryCaption"),
        },
      ],
    },
    mezcal: {
      num: "06",
      kicker: "Web · E-commerce · 2025",
      title: {
        pre: "Mi Mezcal — ",
        it: "Destilería Lorenzana.",
      },
      desc: t.rich("cases.mezcal.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), t("cases.mezcal.metaPlatform")],
        [t("cases.meta.stack"), "Next.js · TypeScript · Stripe"],
        [t("cases.meta.status"), t("cases.mezcal.metaStatus")],
        [t("cases.meta.year"), "2025"],
      ],
      actions: [
        {
          label: t("cases.mezcal.actionPrimary"),
          href: "https://www.destilerialorenzana.com/",
          kind: "primary",
          ext: true,
          icon: "external",
        },
      ],
      preview: "mezcal",
    },
    briefmark: {
      num: "07",
      kicker: "iOS · AI · 2026",
      title: {
        pre: "Briefmark — ",
        it: t("cases.briefmark.titleIt"),
      },
      desc: t.rich("cases.briefmark.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 26+"],
        [t("cases.meta.stack"), "SwiftUI · Swift · Node · Claude API"],
        [t("cases.meta.status"), t("cases.briefmark.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.briefmark.actionPrimary"),
          href: "#",
          kind: "primary disabled",
          icon: "clock",
        },
      ],
      preview: "briefmark",
    },
    savely: {
      num: "08",
      kicker: "iOS · Fintech · 2026",
      title: {
        pre: "Savely — ",
        it: t("cases.savely.titleIt"),
      },
      desc: t.rich("cases.savely.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 16+"],
        [t("cases.meta.stack"), "SwiftUI · Swift · Banking APIs"],
        [t("cases.meta.status"), t("cases.savely.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.savely.actionPrimary"),
          href: "#",
          kind: "primary disabled",
          icon: "clock",
        },
        {
          label: t("cases.savely.actionGhost"),
          href: `/${locale}/savely/support`,
          kind: "ghost",
          icon: "help",
        },
      ],
      preview: "savely",
    },
    blip: {
      num: "09",
      kicker: "Web · PWA · 2026",
      title: {
        pre: "BLIP — ",
        it: t("cases.blip.titleIt"),
      },
      desc: t.rich("cases.blip.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), t("cases.blip.metaPlatform")],
        [t("cases.meta.stack"), "React · TypeScript · FastAPI · Web Push"],
        [t("cases.meta.status"), t("cases.blip.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.blip.actionPrimary"),
          href: "#",
          kind: "primary disabled",
          icon: "clock",
        },
      ],
      preview: "blip",
    },
    }
  }, [t, locale])

  const openCase = useCallback((key: CaseKey, trigger?: HTMLElement) => {
    lastFocusRef.current = trigger ?? (document.activeElement as HTMLElement | null)
    setOpenCaseKey(key)
    const url = new URL(window.location.href)
    url.searchParams.set("case", key)
    window.history.replaceState(null, "", url)
  }, [])

  const closeCase = useCallback(() => {
    setOpenCaseKey(null)
    const url = new URL(window.location.href)
    url.searchParams.delete("case")
    window.history.replaceState(null, "", url)
  }, [])

  useEffect(() => {
    if (!openCaseKey) {
      document.body.style.overflow = ""
      if (lastFocusRef.current && lastFocusRef.current.focus) lastFocusRef.current.focus()
      return
    }
    document.body.style.overflow = "hidden"
    const t = setTimeout(() => closeBtnRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCase()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener("keydown", onKey)
    }
  }, [openCaseKey, closeCase])

  const activeCase = openCaseKey ? CASES[openCaseKey] : null
  const year = new Date().getFullYear()

  return (
    <div className="ab-root" data-theme={theme} suppressHydrationWarning>
      {/* NAV */}
      <header className="ab-nav" role="banner">
        <div className="ab-wrap ab-nav-inner">
          <a href="#top" className="ab-brand" aria-label="Atelier Belli — home">
            <span className="ab-brand-mark" aria-hidden="true">
              {BRAND_LOGO}
            </span>
            <span>
              <span className="ab-brand-name">Atelier Belli</span>
              <span className="ab-brand-tag">Est. 2023</span>
            </span>
          </a>

          <nav aria-label="Primary">
            <ul className="ab-nav-links">
              <li>
                <a href="#top">{t("nav.home")}</a>
              </li>
              <li>
                <a href="#work">{t("nav.work")}</a>
              </li>
              <li>
                <a href="#stack">Stack</a>
              </li>
              <li>
                <a href="#studio">{t("nav.about")}</a>
              </li>
              <li>
                <a href="#contact">{t("nav.contact")}</a>
              </li>
            </ul>
          </nav>

          <div className="ab-nav-end">
            <button
              className="ab-chip ab-chip-lang"
              onClick={switchLocale}
              aria-label={t("locale.switchAria")}
            >
              <b>{locale === "es" ? "ES" : "EN"}</b>
              <span className="ab-sep" />
              <span className="off">{locale === "es" ? "EN" : "ES"}</span>
            </button>
            <button
              className="ab-theme-toggle"
              onClick={toggleTheme}
              aria-label={t("theme.toggleAria")}
            >
              <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
              <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" ref={mainRef}>
        <span id="top" />

        {/* HERO */}
        <section className="ab-hero" aria-labelledby="hero-heading">
          <div className="ab-wrap">
            <div className="ab-hero-grid">
              <div className="ab-reveal">
                <div className="ab-eyebrow-row">
                  <span className="num-xs">01</span>
                  <span className="ab-smallcaps">{t("hero.eyebrow")}</span>
                </div>
                <h1 id="hero-heading" className="ab-h-title ab-serif">
                  <span>{t("hero.titleLine1")}</span>
                  <br />
                  <span>{t("hero.titleLine2")}</span>
                  <span className="ab-it">{t("hero.titleIt")}</span>
                </h1>
                <p className="ab-h-sub">
                  {t.rich("hero.subtitle", { it: (chunks) => <em>{chunks}</em> })}
                </p>
              </div>

              <aside
                className="ab-reveal"
                aria-label="Colophon"
                style={{ transitionDelay: "120ms" }}
              >
                <div className="ab-colophon">
                  <div className="row">
                    <span className="k">{t("colophon.locationLabel")}</span>
                    <span className="v">Tijuana · BC</span>
                  </div>
                  <hr className="ab-hair" />
                  <div className="row">
                    <span className="k">{t("colophon.statusLabel")}</span>
                    <span className="v avail">
                      <span className="ab-dot" aria-hidden="true" />{" "}
                      <em>{t("colophon.status")}</em>
                    </span>
                  </div>
                  <hr className="ab-hair" />
                  <div className="row">
                    <span className="k">Est.</span>
                    <span className="v">2023 — {t("colophon.ongoing")}</span>
                  </div>
                  <hr className="ab-hair" />
                  <div className="row">
                    <span className="k">{t("colophon.signed")}</span>
                    <span className="v ab-sig">— Ivan Lorenzana</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* VITRINE */}
          <div className="ab-vitrine" aria-label="Showcase">
            <div className="ab-wrap-full" style={{ maxWidth: 1480, margin: "0 auto" }}>
              <div className="ab-vitrine-cap">
                <div>
                  <span className="eye">{t("vitrine.eyebrow")}</span>
                  <h2>
                    <span>{t("vitrine.titlePre")}</span>
                    <em>{t("vitrine.titleIt")}</em>
                  </h2>
                </div>
                <span className="m">
                  {/* "Hover" is meaningless on a touch device, where this is a swipe carousel. */}
                  <span className="on-hover">{t("vitrine.hint")}</span>
                  <span className="on-touch">{t("vitrine.hintTouch")}</span>
                </span>
              </div>

              <div className="ab-phones">
                <div className="ab-phone-slot web-slot" aria-label="Vitapath preview">
                  <div className="ab-vit-web-combo tilt-l" aria-hidden="true">
                    <div className="ab-vit-browser">
                      <div className="bb">
                        <span className="d" />
                        <span className="d" />
                        <span className="d" />
                        <span className="u">◌</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="shot"
                        src="/cases/vitapath-hero.webp"
                        alt=""
                        width={1200}
                        height={750}
                        loading="lazy"
                      />
                    </div>
                    <div className="ab-vit-mini-phone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/cases/gallery/vitapath-p2.webp"
                        alt=""
                        width={420}
                        height={913}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="caption">
                    <span className="n">Vitapath</span>
                    <span className="s">iOS · Web · 2026</span>
                  </div>
                </div>

                <div className="ab-phone-slot center" aria-label="Alisio preview">
                  <div className="ab-phone-img alisio tilt-c" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/cases/alisio-vitrine.webp" alt="" width={600} height={1304} loading="lazy" />
                  </div>
                  <div className="caption">
                    <span className="n">Alisio</span>
                    <span className="s">iOS · watchOS · 2026</span>
                  </div>
                </div>

                <div className="ab-phone-slot web-slot" aria-label="Arrhythmia Detector preview">
                  <div className="ab-vit-web-combo tilt-r" aria-hidden="true">
                    <div className="ab-vit-browser">
                      <div className="bb">
                        <span className="d" />
                        <span className="d" />
                        <span className="d" />
                        <span className="u">◌</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="shot"
                        src="/cases/arrhythmia-hero.webp"
                        alt=""
                        width={900}
                        height={562}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="caption">
                    <span className="n">Arrhythmia Detector</span>
                    <span className="s">Web · ML · 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SELECTED WORK */}
        <section id="work" className="ab-sec" aria-labelledby="work-title">
          <div className="ab-wrap">
            <div className="ab-sec-cap">
              <div>
                <div className="s-eye">
                  <span className="num-xs">02</span>
                  <span className="ab-smallcaps">{t("work.eyebrow")}</span>
                </div>
                <h2 id="work-title" className="s-title">
                  <span>{t("work.titlePre")}</span>
                  <span className="ab-it">{t("work.titleIt")}</span>
                </h2>
              </div>
              <div className="s-meta">{t("work.indexMeta")}</div>
            </div>

            <div className="ab-index-list" role="list">
              {CASE_KEYS.map((key) => {
                const c = CASES[key]
                const indexInfo: Record<
                  CaseKey,
                  { name: { pre: string; it: string }; tag: string; stack: string[]; mshow: string }
                > = {
                  fingo: {
                    name: { pre: "Fingo", it: ` — ${t("cases.fingo.titleIt")}` },
                    tag: t("cases.fingo.tag"),
                    stack: ["iOS", "SwiftUI", "Haptics"],
                    mshow: "iOS · SwiftUI · App Store →",
                  },
                  savely: {
                    name: { pre: "Savely", it: ` — ${t("cases.savely.titleIt")}` },
                    tag: t("cases.savely.tag"),
                    stack: ["iOS", "Fintech", "Banking APIs"],
                    mshow: "iOS · Fintech · In review →",
                  },
                  mezcal: {
                    name: { pre: "Mi Mezcal", it: " — Destilería Lorenzana." },
                    tag: t("cases.mezcal.tag"),
                    stack: ["Web", "E-commerce", "Brand"],
                    mshow: "Web · E-commerce · Live →",
                  },
                  blip: {
                    name: { pre: "BLIP", it: ` — ${t("cases.blip.titleIt")}` },
                    tag: t("cases.blip.tag"),
                    stack: ["React", "PWA", "FastAPI"],
                    mshow: "Web · PWA · FastAPI →",
                  },
                  briefmark: {
                    name: { pre: "Briefmark", it: ` — ${t("cases.briefmark.titleIt")}` },
                    tag: t("cases.briefmark.tag"),
                    stack: ["iOS", "SwiftUI", "Claude API"],
                    mshow: "iOS · AI · SwiftUI →",
                  },
                  pass: {
                    name: { pre: "Pass", it: ` — ${t("cases.pass.titleIt")}` },
                    tag: t("cases.pass.tag"),
                    stack: ["Serverless", "AWS", "PassKit"],
                    mshow: "Backend · AWS · PassKit →",
                  },
                  alisio: {
                    name: { pre: "Alisio", it: ` — ${t("cases.alisio.titleIt")}` },
                    tag: t("cases.alisio.tag"),
                    stack: ["iOS", "watchOS", "HealthKit"],
                    mshow: "iOS · Apple Watch · App Store →",
                  },
                  vitapath: {
                    name: { pre: "Vitapath", it: ` — ${t("cases.vitapath.titleIt")}` },
                    tag: t("cases.vitapath.tag"),
                    stack: ["Spring Boot", "PostGIS", "SwiftUI"],
                    mshow: "iOS · Web · Spring · PostGIS →",
                  },
                  arrhythmia: {
                    name: { pre: "Arrhythmia Detector", it: ` — ${t("cases.arrhythmia.titleIt")}` },
                    tag: t("cases.arrhythmia.tag"),
                    stack: ["Next.js", "FastAPI", "ML"],
                    mshow: "Web · ML · FastAPI →",
                  },
                }
                const { name, tag, stack, mshow } = indexInfo[key]
                return (
                  <button
                    key={key}
                    type="button"
                    className="ab-index-row"
                    onClick={(e) => openCase(key, e.currentTarget)}
                  >
                    <span className="n ab-num">{c.num}</span>
                    <div className="p-main">
                      <div className="p-name">
                        {name.pre}
                        <span className="ab-it">{name.it}</span>
                      </div>
                      <div className="p-tag">{tag}</div>
                      <div className="mshow">{mshow}</div>
                    </div>
                    <div className="p-stack">
                      {stack.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                    <div className="p-plat">{t("work.viewCase")}</div>
                    <div className="arr">→</div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* WORKBENCH */}
        <section id="stack" className="ab-sec" style={{ paddingTop: 0 }} aria-labelledby="wb-title">
          <div className="ab-wrap">
            <div className="ab-workbench ab-reveal">
              <div>
                <div className="s-eye ab-wb-eye">
                  <span className="num-xs">03</span>
                  <span className="ab-smallcaps">{t("workbench.eyebrow")}</span>
                </div>
                <h2 id="wb-title" className="ab-wb-title">
                  <span>{t("workbench.titlePre")}</span>
                  <span className="ab-it">{t("workbench.titleIt")}</span>
                </h2>
                <p className="ab-wb-desc">
                  {t.rich("workbench.desc", { it: (chunks) => <em>{chunks}</em> })}
                </p>
                <a
                  href="https://github.com/Ivan-LB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ab-wb-link"
                  aria-label="GitHub profile"
                >
                  <span className="ab-dot" aria-hidden="true" />
                  <span>
                    <i>github.com/</i>Ivan-LB →
                  </span>
                </a>
              </div>

              <div className="ab-wb-groups">
                <div className="ab-wb-group">
                  <h4>
                    {t("workbench.groups.frontend")}{" "}
                    <span className="gn">i.</span>
                  </h4>
                  <div className="ab-pills">
                    {["SwiftUI", "Swift", "React", "Next.js", "TypeScript", "Tailwind"].map(
                      (p, i) => (
                        <span key={p} className="ab-pill">
                          <span className="pi">{toRoman(i + 1)}.</span>
                          {p}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div className="ab-wb-group">
                  <h4>
                    {t("workbench.groups.backend")}{" "}
                    <span className="gn">ii.</span>
                  </h4>
                  <div className="ab-pills">
                    {["Node", "PostgreSQL", "Supabase", "Vercel", "Edge Functions"].map((p, i) => (
                      <span key={p} className="ab-pill">
                        <span className="pi">{toRoman(i + 1)}.</span>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ab-wb-group">
                  <h4>
                    {t("workbench.groups.craft")} <span className="gn">iii.</span>
                  </h4>
                  <div className="ab-pills">
                    {["Figma", "Xcode", "Claude Code", "Git"].map((p, i) => (
                      <span key={p} className="ab-pill">
                        <span className="pi">{toRoman(i + 1)}.</span>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STUDIO / CTA */}
        <section id="studio" className="ab-cta" aria-labelledby="cta-title">
          <div className="ab-wrap">
            <div className="eye ab-smallcaps">
              — <em>{t("cta.eyebrow")}</em> —
            </div>
            <h2 id="cta-title">
              <span>{t("cta.titlePre")}</span>
              <span className="ab-it">{t("cta.titleIt")}</span>
            </h2>

            <div className="ab-cta-actions" id="contact">
              <a className="ab-btn-mail" href="mailto:ivanlorenzana@outlook.com">
                <span className="lbl">{t("cta.writeTo")}</span>
                <span className="mail">ivanlorenzana@outlook.com</span>
              </a>
              <span />
              <div className="ab-cta-links">
                <span className="s">Atelier Belli</span>
                <span>
                  Tijuana ⇄ <span>{t("cta.worldwide")}</span>
                </span>
                <span>
                  <a href="https://github.com/Ivan-LB" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://www.linkedin.com/in/ivan-lorenzana-belli/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://www.instagram.com/_ivanlb"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="ab-wrap" style={{ marginTop: "clamp(56px, 7vw, 112px)" }}>
            <footer className="ab-colofon-foot" role="contentinfo">
              <div>
                © <span suppressHydrationWarning>{year}</span> — Atelier Belli
              </div>
              <div className="mid">Atelier Belli</div>
              <div className="right">
                <a href={`/${locale}/privacy`}>{t("footer.privacy")}</a>
                &nbsp;·&nbsp;
                <a href={`/${locale}/terms`}>{t("footer.terms")}</a>
              </div>
            </footer>
          </div>
        </section>
      </main>

      {/* CASE MODAL */}
      <div
        className={`ab-case-backdrop${openCaseKey ? " open" : ""}`}
        aria-hidden={openCaseKey ? "false" : "true"}
        onClick={closeCase}
      />
      <div
        className={`ab-case-modal${openCaseKey ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        aria-hidden={openCaseKey ? "false" : "true"}
      >
        <div className="ab-case-head">
          <div className="eye">
            <span className="num">{activeCase?.num ?? "—"}</span>
            <span>{activeCase?.kicker ?? "Case study"}</span>
          </div>
          <button
            ref={closeBtnRef}
            className="ab-case-close"
            onClick={closeCase}
            aria-label={t("modal.close")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
        {activeCase && (
          <div className="ab-case-body">
            <div
              className={`ab-case-preview${["mezcal", "blip", "pass", "vitapath", "arrhythmia"].includes(activeCase.preview) ? " web-preview" : ""}${activeCase.preview === "alisio" ? " tall-preview" : ""}`}
            >
              <CasePreview which={activeCase.preview} />
            </div>
            <div className="ab-case-content">
              <h3 className="ab-case-title" id="case-title">
                {activeCase.title.pre}
                <span className="ab-it">{activeCase.title.it}</span>
              </h3>
              <p className="ab-case-desc">{activeCase.desc}</p>
              <dl className="ab-case-meta">
                {activeCase.meta.map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt>{k}</dt>
                    <dd>
                      {v.split(" · ").map((t) => (
                        <span key={t} className="tag">
                          {t}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="ab-case-actions">
                {activeCase.actions.map((a) => {
                  const Icon = a.icon ? ICONS[a.icon] : null
                  return (
                    <a
                      key={a.label}
                      className={`ab-case-btn ${a.kind}`}
                      href={a.href}
                      target={a.ext ? "_blank" : undefined}
                      rel={a.ext ? "noopener noreferrer" : undefined}
                    >
                      {a.label} {Icon}
                    </a>
                  )
                })}
              </div>
            </div>

            {activeCase.story && (
              <div className="ab-case-story">
                <div className="ab-case-beats">
                  {activeCase.story.map(([label, body]) => (
                    <div key={label}>
                      <h4>{label}</h4>
                      <p>{body}</p>
                    </div>
                  ))}
                </div>
                {activeCase.highlights && activeCase.highlights.length > 0 && (
                  <ul className="ab-case-highlights">
                    {activeCase.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeCase.media?.map((block) => (
              <div className="ab-case-media" key={block.caption}>
                <figure
                  className={
                    block.kind === "gallery" || block.frame === "bare" ? "wide" : undefined
                  }
                >
                  {block.kind === "video" ? (
                    <CaseVideo media={block} />
                  ) : (
                    <CaseGallery media={block} />
                  )}
                  <figcaption>{block.caption}</figcaption>
                </figure>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function toRoman(n: number) {
  const map: Record<number, string> = {
    1: "i",
    2: "ii",
    3: "iii",
    4: "iv",
    5: "v",
    6: "vi",
    7: "vii",
    8: "viii",
    9: "ix",
    10: "x",
  }
  return map[n] ?? String(n)
}

/**
 * Demo clip. `preload="none"` means nothing is fetched until the band scrolls
 * into view, and playback is tied to visibility so an open modal never keeps a
 * hidden video decoding. Reduced motion gets a poster plus real controls
 * instead of autoplay.
 */
function CaseVideo({ media }: { media: Extract<CaseMedia, { kind: "video" }> }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) void el.play().catch(() => {})
          else el.pause()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const video = (
    <video
      ref={ref}
      className={`ab-case-video${media.frame === "phone" ? " portrait" : ""}${media.frame === "bare" ? " bare" : ""}`}
      poster={media.poster}
      width={media.w}
      height={media.h}
      muted
      loop
      playsInline
      preload="none"
      controls={reduced}
    >
      <source src={media.src} type="video/mp4" />
    </video>
  )

  if (media.frame === "phone") {
    return <div className="ab-phone-img">{video}</div>
  }
  if (media.frame === "bare") {
    return video
  }
  return (
    <div className="ab-browser-frame has-shot">
      <div className="ab-browser-bar">
        <span className="bdot" />
        <span className="bdot" />
        <span className="bdot" />
        <span className="url">{media.url}</span>
      </div>
      {video}
    </div>
  )
}

/** Horizontal strip of real captures. Scrollable by pointer, wheel and keyboard. */
function CaseGallery({ media }: { media: Extract<CaseMedia, { kind: "gallery" }> }) {
  return (
    <div
      className={`ab-case-gallery${media.wide ? " wide" : ""}`}
      role="group"
      aria-label={media.caption}
      tabIndex={0}
    >
      {media.items.map((item) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img key={item.src} src={item.src} alt="" width={item.w} height={item.h} loading="lazy" />
      ))}
    </div>
  )
}

function CasePreview({ which }: { which: CaseKey }) {
  if (which === "fingo") {
    return (
      <div className="ab-phone-img fingo" aria-hidden="true" style={{ ["--w" as any]: "280px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fingo-hero.webp" alt="" width={460} height={997} />
      </div>
    )
  }
  if (which === "savely") {
    return (
      <div className="ab-phone-img savely" aria-hidden="true" style={{ ["--w" as any]: "280px" }}>
        <div className="crop">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/savely-hero.webp" alt="" width={660} height={1374} />
        </div>
      </div>
    )
  }
  if (which === "blip") {
    return (
      <div className="ab-browser-frame has-shot" aria-hidden="true">
        <div className="ab-browser-bar">
          <span className="bdot" />
          <span className="bdot" />
          <span className="bdot" />
          <span className="url">BLIP — Radar</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ab-browser-shot" src="/cases/blip-hero.webp" alt="" width={1600} height={1000} loading="lazy" />
      </div>
    )
  }
  if (which === "briefmark") {
    return (
      <div className="ab-phone-img briefmark" aria-hidden="true" style={{ ["--w" as any]: "252px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cases/briefmark-hero.webp" alt="" width={600} height={1304} loading="lazy" />
      </div>
    )
  }
  if (which === "pass") {
    /* A serverless platform has no screen of its own, so the case shows the
       path a pass actually travels: issue, store, push, update in place. */
    return (
      <svg className="ab-arch" viewBox="0 0 460 250" role="img" aria-label="Pass architecture: API Gateway to Lambda to DynamoDB, with an APNs push updating the pass in Apple Wallet">
        <text className="sub" x="4" y="52">POST /generate</text>
        <text className="sub" x="4" y="106">PATCH /update</text>
        <path className="flow" d="M92 48 H118" />
        <path className="flow" d="M92 102 H108 V52 H118" />
        <path className="ah" d="M118 44.5 l7 3.5 -7 3.5 z" />

        <rect className="n" x="126" y="30" width="112" height="36" rx="8" />
        <text className="lbl" x="182" y="52" textAnchor="middle">API Gateway</text>

        <path className="flow" d="M182 66 V88" />
        <path className="ah" d="M178.5 88 l3.5 7 3.5 -7 z" />

        <rect className="n" x="126" y="94" width="112" height="42" rx="8" />
        <text className="lbl" x="182" y="112" textAnchor="middle">Lambda</text>
        <text className="sub" x="182" y="126" textAnchor="middle">PassKit signing</text>

        <path className="flow" d="M182 136 V158" />
        <path className="ah" d="M178.5 158 l3.5 7 3.5 -7 z" />

        <rect className="n" x="126" y="164" width="112" height="42" rx="8" />
        <text className="lbl" x="182" y="182" textAnchor="middle">DynamoDB</text>
        <text className="sub" x="182" y="196" textAnchor="middle">pass state</text>

        <path className="push" d="M238 115 H286" />
        <path className="ah-a" d="M286 111.5 l7 3.5 -7 3.5 z" />
        <text className="pushlbl" x="262" y="105" textAnchor="middle">APNs</text>

        <rect className="card" x="296" y="46" width="152" height="140" rx="12" />
        <rect className="stripe" x="296" y="46" width="152" height="6" rx="3" />
        <text className="lbl" x="312" y="78">Wallet pass</text>
        <path className="flow" d="M312 92 H432" opacity="0.5" />
        <text className="sub" x="312" y="110">MEMBER · 4821</text>
        <path className="flow" d="M312 122 H432" opacity="0.5" />
        <text className="sub" x="312" y="140">STAMPS · 7 / 10</text>
        <path className="flow" d="M312 152 H432" opacity="0.5" />
        <text className="sub" x="312" y="170">updates in place</text>
      </svg>
    )
  }
  if (which === "alisio") {
    return (
      <div className="ab-alisio-combo" aria-hidden="true">
        <div className="ab-phone-img alisio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cases/alisio-hero.webp" alt="" width={953} height={2109} loading="lazy" />
        </div>
        <div className="ab-alisio-watch">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cases/alisio-watch.webp" alt="" width={249} height={293} loading="lazy" />
        </div>
      </div>
    )
  }
  if (which === "arrhythmia") {
    return (
      <div className="ab-browser-frame has-shot" aria-hidden="true">
        <div className="ab-browser-bar">
          <span className="bdot" />
          <span className="bdot" />
          <span className="bdot" />
          <span className="url">arrhythmia-detector</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ab-browser-shot" src="/cases/arrhythmia-hero.webp" alt="" width={900} height={562} loading="lazy" />
      </div>
    )
  }
  if (which === "vitapath") {
    return (
      <div className="ab-browser-frame has-shot" aria-hidden="true">
        <div className="ab-browser-bar">
          <span className="bdot" />
          <span className="bdot" />
          <span className="bdot" />
          <span className="url">vitapath · consola de despacho</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ab-browser-shot" src="/cases/vitapath-hero.webp" alt="" width={1000} height={625} loading="lazy" />
      </div>
    )
  }
  return (
    <div className="ab-browser-frame has-shot" aria-hidden="true">
      <div className="ab-browser-bar">
        <span className="bdot" />
        <span className="bdot" />
        <span className="bdot" />
        <span className="url">destilerialorenzana.com</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ab-browser-shot" src="/cases/mezcal-hero.webp" alt="" width={1600} height={1000} loading="lazy" />
    </div>
  )
}
