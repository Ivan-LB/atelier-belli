"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { LOCALE_COOKIE } from "@/i18n"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeIcons } from "@/components/theme-icons"


/* Module scope on purpose: inside the component this would be a new string every
   render, and the modal effect that depends on it would re-run each time. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

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
  | "fave"
  | "vitapath"
  | "arrhythmia"
// Display order of Selected Work (also the deep-link allowlist). This array is
// the single source of order — CASES render maps over it and `num` follows it.
const CASE_KEYS: readonly CaseKey[] = [
  "alisio",
  "savely",
  "fave",
  "pass",
  "fingo",
  "vitapath",
  "arrhythmia",
  "mezcal",
  "briefmark",
  "blip",
]

type CaseAction = {
  label: string
  href: string
  kind: "primary" | "ghost" | "primary disabled"
  ext?: boolean
  icon?: "external" | "help" | "clock" | "shield"
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

const BRAND_LOGO = <BrandLogo />

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
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7 2.6v5.2c0 4.4-3 7.5-7 8.2-4-.7-7-3.8-7-8.2V5.6z" />
      <path d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  ),
} as const

// Slightly over the .ab-lang-ind transition in globals.css (280ms), so the
// language indicator lands before router.refresh() replaces the node.
const LOCALE_SLIDE_MS = 300

export default function PortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (((params?.locale as string) || "en") === "es" ? "es" : "en") as Lang
  const t = useTranslations("home")

  /* `Platform · Domain`, localized. The modal kicker appends the year and the
     mobile index line appends the status, so both are built from these two
     dictionary keys and cannot drift apart into different vocabularies again. */
  const caseFacet = useCallback(
    (key: CaseKey) =>
      `${t(`cases.${key}.kickerPlatform`)} · ${t(`cases.${key}.kickerDomain`)}`,
    [t],
  )

  const [theme, setTheme] = useState<Theme>("light")
  const [hydrated, setHydrated] = useState(false)
  const [openCaseKey, setOpenCaseKey] = useState<CaseKey | null>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  /* The close effect also runs on mount; this tells the two apart so a normal
     page load never has its focus yanked. */
  const wasOpenRef = useRef(false)
  /* Lags `openCaseKey` by design: the modal fades out over 320ms, and nulling the
     case on the same tick collapsed it to a 73px bar reading the English fallback
     "— CASE STUDY" — mid-animation, on /es too. Keeping the last case rendered
     lets the exit play with the real content in the real language. */
  const [renderedCaseKey, setRenderedCaseKey] = useState<CaseKey | null>(null)

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

  // The indicator follows this, not `locale`. router.refresh() is a round trip,
  // and a segmented control that does not move until the response lands reads as
  // if it ignored the click. Cleared once the real locale catches up.
  const [pendingLocale, setPendingLocale] = useState<Lang | null>(null)
  const shownLocale = pendingLocale ?? locale
  useEffect(() => {
    setPendingLocale(null)
  }, [locale])

  const goToLocale = (target: Lang) => {
    // Explicit target rather than a toggle, so pressing the language you are
    // already in is a genuine no-op instead of switching you away from it.
    if (target === shownLocale) return
    setPendingLocale(target)
    // The URL carries no locale any more, so there is nowhere to navigate to:
    // the cookie IS the language, and the middleware re-resolves it on the next
    // request. router.refresh() re-fetches the current route through it, which
    // keeps the user on the page (and the case) they were reading.
    document.cookie = `${LOCALE_COOKIE}=${target}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
    // ...but it also replaces this subtree, indicator included, so a refresh
    // that lands mid-slide leaves the ground teleporting the rest of the way.
    // Measured: the payload arrived ~80ms into a 280ms travel and jumped the
    // remaining 81%. Let the control finish acknowledging the click, then swap
    // the page under it. Reduced motion has no travel to wait for.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.setTimeout(() => router.refresh(), reduced ? 0 : LOCALE_SLIDE_MS)
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
      kicker: `${caseFacet("alisio")} · 2026`,
      title: {
        pre: "Alisio — ",
        it: t("cases.alisio.titleIt"),
      },
      desc: t.rich("cases.alisio.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 17+ · watchOS 10+"],
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
        {
          label: t("cases.alisio.actionPrivacy"),
          href: "/alisio/privacy",
          kind: "ghost",
          icon: "shield",
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
          w: 740,
          h: 740,
          frame: "bare",
          caption: t("cases.alisio.mediaCaption"),
        },
        {
          kind: "gallery",
          items: [
            { src: "/cases/gallery/alisio-w1.webp", w: 416, h: 496 },
            { src: "/cases/gallery/alisio-w2.webp", w: 416, h: 496 },
            { src: "/cases/gallery/alisio-w3.webp", w: 416, h: 496 },
            { src: "/cases/gallery/alisio-w4.webp", w: 416, h: 496 },
          ],
          caption: t("cases.alisio.watchCaption"),
        },
      ],
    },
    fave: {
      num: "03",
      kicker: `${caseFacet("fave")} · 2026`,
      title: {
        pre: "Fave — ",
        it: t("cases.fave.titleIt"),
      },
      desc: t.rich("cases.fave.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 17+"],
        [t("cases.meta.stack"), "SwiftUI · SwiftData · CloudKit"],
        [t("cases.meta.status"), t("cases.fave.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.fave.actionPrimary"),
          href: "#",
          kind: "primary disabled",
          icon: "clock",
        },
        {
          label: t("cases.fave.actionGhost"),
          href: "/fave/support",
          kind: "ghost",
          icon: "help",
        },
        {
          label: t("cases.fave.actionPrivacy"),
          href: "/fave/privacy",
          kind: "ghost",
          icon: "shield",
        },
      ],
      preview: "fave",
    },
    pass: {
      num: "04",
      kicker: `${caseFacet("pass")} · 2026`,
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
      num: "05",
      kicker: `${caseFacet("fingo")} · 2025`,
      title: {
        pre: "Fingo — ",
        it: t("cases.fingo.titleIt"),
      },
      desc: t.rich("cases.fingo.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 26+"],
        [t("cases.meta.stack"), "SwiftUI · Combine · Core Haptics"],
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
          href: "/fingo/support",
          kind: "ghost",
          icon: "help",
        },
        {
          label: t("cases.fingo.actionPrivacy"),
          href: "/fingo/privacy",
          kind: "ghost",
          icon: "shield",
        },
      ],
      preview: "fingo",
    },
    vitapath: {
      num: "06",
      kicker: `${caseFacet("vitapath")} · 2026`,
      title: {
        pre: "Vitapath — ",
        it: t("cases.vitapath.titleIt"),
      },
      desc: t.rich("cases.vitapath.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 17+ · Web"],
        [t("cases.meta.stack"), "SwiftUI · Spring Boot · PostGIS · STOMP"],
        [t("cases.meta.status"), t("cases.vitapath.metaStatus")],
        [t("cases.meta.year"), "2026"],
      ],
      actions: [
        {
          label: t("cases.vitapath.actionPrimary"),
          href: "#",
          kind: "primary disabled",
          icon: "clock",
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
          w: 1740,
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
      num: "07",
      kicker: `${caseFacet("arrhythmia")} · 2026`,
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
      num: "08",
      kicker: `${caseFacet("mezcal")} · 2025`,
      title: {
        pre: "Mi Mezcal — ",
        it: t("cases.mezcal.titleIt"),
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
      num: "09",
      kicker: `${caseFacet("briefmark")} · 2026`,
      title: {
        pre: "Briefmark — ",
        it: t("cases.briefmark.titleIt"),
      },
      desc: t.rich("cases.briefmark.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 26+"],
        [t("cases.meta.stack"), "SwiftUI · Node.js · Claude API"],
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
      num: "02",
      kicker: `${caseFacet("savely")} · 2026`,
      title: {
        pre: "Savely — ",
        it: t("cases.savely.titleIt"),
      },
      desc: t.rich("cases.savely.descRich", { it: (chunks) => <em>{chunks}</em> }),
      meta: [
        [t("cases.meta.platform"), "iOS 26+"],
        [t("cases.meta.stack"), "SwiftUI · SwiftData · Vision"],
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
          href: "/savely/support",
          kind: "ghost",
          icon: "help",
        },
        {
          label: t("cases.savely.actionPrivacy"),
          href: "/savely/privacy",
          kind: "ghost",
          icon: "shield",
        },
      ],
      preview: "savely",
      story: storyOf("savely"),
      highlights: t.raw("cases.savely.highlights") as string[],
      media: [
        {
          kind: "gallery",
          items: [
            { src: "/cases/gallery/savely-p1.webp", w: 420, h: 913 },
            { src: "/cases/gallery/savely-p2.webp", w: 420, h: 913 },
            { src: "/cases/gallery/savely-p3.webp", w: 420, h: 913 },
          ],
          caption: t("cases.savely.galleryCaption"),
        },
      ],
    },
    blip: {
      num: "10",
      kicker: `${caseFacet("blip")} · 2026`,
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
    /* `locale` is gone from the deps: the support hrefs used to be built as
       `/${locale}/fingo/support`, and with the prefix dropped nothing in here
       reads it any more. */
  }, [t, caseFacet])

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
      // Guarded: this effect also runs on mount, and focusing anything there
      // would fight the browser's own restore on a normal page load.
      if (wasOpenRef.current) {
        wasOpenRef.current = false
        // The body stays mounted through the fade (see renderedCaseKey), and an
        // IntersectionObserver only knows geometry — it would happily keep a
        // clip playing behind a hidden modal.
        modalRef.current?.querySelectorAll("video").forEach((v) => v.pause())
        const target =
          lastFocusRef.current ??
          document.querySelector<HTMLElement>("button.ab-index-row")
        target?.focus()
      }
      return
    }
    wasOpenRef.current = true
    setRenderedCaseKey(openCaseKey)
    document.body.style.overflow = "hidden"
    // A ?case= deep link opens the modal without any click, so lastFocusRef is
    // still null and closing used to strand focus on the hidden close button.
    // Seed it with the row this case belongs to: same landing as the click path.
    if (!lastFocusRef.current) {
      lastFocusRef.current = document.querySelector<HTMLElement>(
        `button.ab-index-row[data-case="${openCaseKey}"]`
      )
    }
    const t = setTimeout(() => closeBtnRef.current?.focus(), 50)

    // Without this the page behind stays tabbable: Tab walked out of the dialog
    // on the third press and needed 27 more to get back in, which also made
    // aria-modal="true" a lie. `inert` removes it from tab order AND the a11y tree.
    const behind = [
      mainRef.current,
      document.querySelector<HTMLElement>("header.ab-nav"),
    ].filter((el): el is HTMLElement => el != null)
    behind.forEach((el) => el.setAttribute("inert", ""))

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCase()
        return
      }
      if (e.key !== "Tab" || !modalRef.current) return
      const nodes = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      )
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      const outside = !modalRef.current.contains(active)
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener("keydown", onKey)
      behind.forEach((el) => el.removeAttribute("inert"))
    }
  }, [openCaseKey, closeCase])

  /* What the modal PAINTS. It keeps showing the last case while the dialog fades
     out, so the exit animation no longer collapses the head to a bare fallback.
     `openCaseKey` still drives .open / aria-hidden / the focus trap. */
  const activeCase = openCaseKey
    ? CASES[openCaseKey]
    : renderedCaseKey
      ? CASES[renderedCaseKey]
      : null
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
            {/* Stands in for the primary links below 820px, where they are
                hidden. Same label as the link it replaces, so the two never
                drift apart. */}
            <a className="ab-chip ab-chip-contact" href="#contact">
              {t("nav.contact")}
            </a>
            {/* Two segments in a FIXED en-then-es order. This was one <button>
                that rendered the active language first, so the half you clicked
                moved out from under you, and clicking the language you were
                already in switched you away from it. Both stay buttons through
                the switch so keyboard focus survives the refresh, and each
                carries its own lang so "EN" and "ES" are announced by the right
                voice. The group is what names the control; labelling a button
                "Cambiar a Español" while it reads "ES" put the accessible name
                out of step with the visible one. */}
            <div
              className="ab-chip ab-chip-lang"
              data-active={shownLocale}
              role="group"
              aria-label={t("locale.groupAria")}
            >
              <span className="ab-lang-ind" aria-hidden="true" />
              <button
                type="button"
                lang="en"
                aria-current={shownLocale === "en" ? "true" : undefined}
                onClick={() => goToLocale("en")}
              >
                EN
              </button>
              <span className="ab-sep" aria-hidden="true" />
              <button
                type="button"
                lang="es"
                aria-current={shownLocale === "es" ? "true" : undefined}
                onClick={() => goToLocale("es")}
              >
                ES
              </button>
            </div>
            <button
              className="ab-theme-toggle"
              onClick={toggleTheme}
              aria-label={t("theme.toggleAria")}
            >
              <ThemeIcons />
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
          <div className="ab-vitrine">
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
                <div className="ab-phone-slot web-slot">
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
                        /* Purpose-built crop: the gallery still is 420x913 / 49KB
                           and this slot renders at ~102px CSS. */
                        src="/cases/vitapath-mini.webp"
                        alt=""
                        width={220}
                        height={478}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="caption">
                    <span className="n">Vitapath</span>
                    <span className="s">iOS · Web · 2026</span>
                  </div>
                </div>

                <div className="ab-phone-slot center">
                  <div className="ab-phone-img alisio tilt-c" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/cases/alisio-vitrine.webp" alt="" width={600} height={1304} loading="lazy" />
                  </div>
                  <div className="caption">
                    <span className="n">Alisio</span>
                    <span className="s">iOS · watchOS · 2026</span>
                  </div>
                </div>

                <div className="ab-phone-slot web-slot">
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

            {/* No role="list": the children are <button>, not listitem, which axe
                flags as aria-required-children and some screen readers announce as
                "list, 0 items". The visual list needs no role. */}
            <div className="ab-index-list">
              {CASE_KEYS.map((key) => {
                const c = CASES[key]
                const indexInfo: Record<
                  CaseKey,
                  { name: { pre: string; it: string }; tag: string; stack: string[] }
                > = {
                  fave: {
                    name: { pre: "Fave", it: ` — ${t("cases.fave.titleIt")}` },
                    tag: t("cases.fave.tag"),
                    stack: ["SwiftUI", "SwiftData", "CloudKit"],
                  },
                  fingo: {
                    name: { pre: "Fingo", it: ` — ${t("cases.fingo.titleIt")}` },
                    tag: t("cases.fingo.tag"),
                    stack: ["SwiftUI", "Combine", "Core Haptics"],
                  },
                  savely: {
                    name: { pre: "Savely", it: ` — ${t("cases.savely.titleIt")}` },
                    tag: t("cases.savely.tag"),
                    stack: ["SwiftUI", "SwiftData", "Vision"],
                  },
                  mezcal: {
                    name: { pre: "Mi Mezcal", it: ` — ${t("cases.mezcal.titleIt")}` },
                    tag: t("cases.mezcal.tag"),
                    stack: ["Next.js", "TypeScript", "Stripe"],
                  },
                  blip: {
                    name: { pre: "BLIP", it: ` — ${t("cases.blip.titleIt")}` },
                    tag: t("cases.blip.tag"),
                    stack: ["React", "FastAPI", "Web Push"],
                  },
                  briefmark: {
                    name: { pre: "Briefmark", it: ` — ${t("cases.briefmark.titleIt")}` },
                    tag: t("cases.briefmark.tag"),
                    stack: ["SwiftUI", "Node.js", "Claude API"],
                  },
                  pass: {
                    name: { pre: "Pass", it: ` — ${t("cases.pass.titleIt")}` },
                    tag: t("cases.pass.tag"),
                    stack: ["AWS Lambda", "DynamoDB", "PassKit"],
                  },
                  alisio: {
                    name: { pre: "Alisio", it: ` — ${t("cases.alisio.titleIt")}` },
                    tag: t("cases.alisio.tag"),
                    stack: ["SwiftUI", "HealthKit", "WatchConnectivity"],
                  },
                  vitapath: {
                    name: { pre: "Vitapath", it: ` — ${t("cases.vitapath.titleIt")}` },
                    tag: t("cases.vitapath.tag"),
                    stack: ["SwiftUI", "Spring Boot", "PostGIS"],
                  },
                  arrhythmia: {
                    name: { pre: "Arrhythmia Detector", it: ` — ${t("cases.arrhythmia.titleIt")}` },
                    tag: t("cases.arrhythmia.tag"),
                    stack: ["Next.js", "FastAPI", "TanStack Query"],
                  },
                }
                const { name, tag, stack } = indexInfo[key]
                /* Built from the case's own facet, so the index line and the
                   modal kicker can differ only in their last segment: the year
                   there, the status here. They used to be authored separately
                   and drifted into two different vocabularies. */
                const mshow = `${caseFacet(key)} · ${t(`cases.${key}.mshowStatus`)} →`
                return (
                  <button
                    key={key}
                    type="button"
                    className="ab-index-row"
                    /* Lets a ?case= deep link find the row this modal belongs to,
                       so closing it restores focus the same way the click path does. */
                    data-case={key}
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
                  <h3>
                    {t("workbench.groups.frontend")}{" "}
                    <span className="gn">i.</span>
                  </h3>
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
                  <h3>
                    {t("workbench.groups.backend")}{" "}
                    <span className="gn">ii.</span>
                  </h3>
                  <div className="ab-pills">
                    {["Node.js", "PostgreSQL", "Supabase", "Vercel", "Edge Functions"].map((p, i) => (
                      <span key={p} className="ab-pill">
                        <span className="pi">{toRoman(i + 1)}.</span>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ab-wb-group">
                  <h3>
                    {t("workbench.groups.craft")} <span className="gn">iii.</span>
                  </h3>
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
                <Link href="/privacy">{t("footer.privacy")}</Link>
                &nbsp;·&nbsp;
                <Link href="/terms">{t("footer.terms")}</Link>
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
        ref={modalRef}
        className={`ab-case-modal${openCaseKey ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        aria-hidden={openCaseKey ? "false" : "true"}
      >
        <div className="ab-case-head">
          <div className="eye">
            <span className="num">{activeCase?.num ?? "—"}</span>
            <span>{activeCase?.kicker ?? t("modal.caseStudy")}</span>
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
              className={`ab-case-preview${["mezcal", "blip", "pass", "vitapath", "arrhythmia"].includes(activeCase.preview) ? " web-preview" : ""}${["alisio", "savely", "fave", "fingo", "briefmark"].includes(activeCase.preview) ? " tall-preview" : ""}`}
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
                  // "Code coming soon" / "Private beta" used to be <a href="#">
                  // dimmed to 0.5 with pointer-events:none. That stops the mouse
                  // and nothing else: they stayed in the tab order, announced as
                  // ordinary links, and Enter navigated to "#". A real disabled
                  // button is unfocusable and unactivatable by every input.
                  if (a.kind.includes("disabled")) {
                    return (
                      <button
                        key={a.label}
                        type="button"
                        className={`ab-case-btn ${a.kind}`}
                        disabled
                      >
                        {a.label} {Icon}
                      </button>
                    )
                  }
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
                      {/* h4 is correct here: it sits under the modal's h3 title. */}
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
  const t = useTranslations("home")
  const ref = useRef<HTMLVideoElement | null>(null)
  const [reduced, setReduced] = useState(false)
  /* WCAG 2.2.2: these clips run 9-17s and loop forever. Autoplaying motion that
     long with no way to stop it is a failure, so the default path gets a real
     toggle. The reduced-motion path already ships native controls. */
  const [paused, setPaused] = useState(false)

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
          // Once the viewer has pressed pause, scrolling must not undo it.
          if (entry.isIntersecting && !paused) void el.play().catch(() => {})
          else el.pause()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      // Turning reduce-motion on mid-session used to leave a clip playing,
      // because this cleanup only disconnected the observer.
      el.pause()
    }
  }, [reduced, paused])

  const toggle = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      void el.play().catch(() => {})
      setPaused(false)
    } else {
      el.pause()
      setPaused(true)
    }
  }

  const video = (
    <video
      ref={ref}
      /* A `bare` composite is as wide as its devices need. The Vitapath one is
         2.3:1 and fills 920px happily; the Alisio one is square, and at 920px it
         would render ~900px tall and push its own caption off the fold. Cap the
         width for anything squarer than 1.4:1 instead of letterboxing it. */
      className={`ab-case-video${media.frame === "phone" ? " portrait" : ""}${
        media.frame === "bare" ? (media.w / media.h < 1.4 ? " bare bare-square" : " bare") : ""
      }`}
      poster={media.poster}
      width={media.w}
      height={media.h}
      /* Under reduced motion this becomes a focusable media widget, and an
         unnamed one is announced as just "video". */
      aria-label={media.caption}
      muted
      loop
      playsInline
      preload="none"
      controls={reduced}
    >
      <source src={media.src} type="video/mp4" />
    </video>
  )

  const framed =
    media.frame === "phone" ? (
      <div className="ab-phone-img">{video}</div>
    ) : media.frame === "bare" ? (
      video
    ) : (
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

  return (
    <div className="ab-case-clip">
      {framed}
      {!reduced && (
        <button
          type="button"
          className="ab-case-clip-toggle"
          onClick={toggle}
          aria-label={paused ? t("modal.playClip") : t("modal.pauseClip")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {paused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h3v14H7zM14 5h3v14h-3z" />}
          </svg>
        </button>
      )}
    </div>
  )
}

/** Horizontal strip of real captures. Scrollable by pointer, wheel and keyboard. */
function CaseGallery({ media }: { media: Extract<CaseMedia, { kind: "gallery" }> }) {
  const t = useTranslations("home")
  const ref = useRef<HTMLDivElement | null>(null)
  /* Only a strip that actually overflows is worth a tab stop. At desktop widths
     none of them do, so `tabIndex={0}` was a dead stop that landed the user on
     a group they could not scroll. */
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth + 1)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`ab-case-gallery${media.wide ? " wide" : ""}`}
      role="group"
      /* Deliberately NOT media.caption: that string is already the figcaption
         right below, so a screen reader read the same 159-188 char sentence
         twice and then entered a group whose images are all alt="". */
      aria-label={t("modal.galleryAria")}
      tabIndex={scrollable ? 0 : undefined}
    >
      {media.items.map((item) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img key={item.src} src={item.src} alt="" width={item.w} height={item.h} loading="lazy" />
      ))}
    </div>
  )
}

/* No `useTranslations` here on purpose: every URL bar is now a real domain or a
   lowercase product slug, and a slug is an identifier, not copy to translate. */
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
          <img src="/savely-hero.webp" alt="" width={660} height={1434} />
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
          <span className="url">blip</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ab-browser-shot" src="/cases/blip-hero.webp" alt="" width={960} height={600} loading="lazy" />
      </div>
    )
  }
  if (which === "briefmark") {
    return (
      <div className="ab-phone-img briefmark" aria-hidden="true" style={{ ["--w" as any]: "280px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cases/briefmark-hero.webp" alt="" width={600} height={1304} loading="lazy" />
      </div>
    )
  }
  if (which === "fave") {
    return (
      <div className="ab-phone-img fave" aria-hidden="true" style={{ ["--w" as any]: "280px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cases/fave-hero.webp" alt="" width={600} height={1304} loading="lazy" />
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
          <img src="/cases/alisio-watch.webp" alt="" width={249} height={317} loading="lazy" />
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
          <span className="url">vitapath</span>
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
