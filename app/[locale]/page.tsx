"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { LOCALE_COOKIE } from "@/i18n"
import { ThemeIcons } from "@/components/theme-icons"
import ThemeInit from "@/components/theme-init"

import {
  CASE_KEYS,
  LEGACY_CASE_KEYS,
  StatusPill,
  useCases,
  type CaseData,
  type CaseKey,
} from "./_home/cases"
import { CaseSheet, pullClose, pullOpen, type CloseMode } from "./_home/case-sheet"
import { Showcase } from "./_home/showcase"

type Lang = "en" | "es"
type Theme = "light" | "dark"
type SectionId = "hero" | "reel" | "work" | "biz" | "contact"
type KeyDef = { href: string; label: string; kind: "primary" | "ghost"; external?: boolean }

// Slightly over the .ab-lang-ind transition in globals.css (280ms), so the
// language indicator lands before router.refresh() replaces the node.
const LOCALE_SLIDE_MS = 300

/* Section order depends on the language, and it lives here rather than in the
   dictionaries because it is layout, not copy: English leads with the work,
   Spanish leads with the business lane. The nav links follow the same order. */
const SECTION_ORDER: Record<Lang, readonly SectionId[]> = {
  en: ["hero", "reel", "work", "biz", "contact"],
  es: ["hero", "biz", "reel", "work", "contact"],
}
const NAV_SECTIONS = ["work", "biz", "contact"] as const

/* WhatsApp number for wa.me links: digits only, with country code. While it is
   null, NO WhatsApp key renders anywhere and the Spanish hero's primary key
   reads "Escríbeme" and goes to #contact. Never ship a made-up wa.me link. */
const WHATSAPP_NUMBER: string | null = null

const EMAIL = "ivanlorenzana@outlook.com"

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Ivan-LB" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ivan-lorenzana-belli/" },
  { label: "Instagram", href: "https://www.instagram.com/_ivanlb" },
] as const

/* The poster a case grows from (and settles back into): a card's well, or
   the reel slide itself. */
const posterOf = (host: HTMLElement | null) =>
  host?.closest<HTMLElement>(".ab-card")?.querySelector<HTMLElement>(".ab-well") ?? host

function Keys({ keys }: { keys: KeyDef[] }) {
  return (
    <div className="ab-keys">
      {keys.map((k) => (
        <a
          key={`${k.kind}-${k.href}`}
          className={`ab-key ${k.kind}`}
          href={k.href}
          {...(k.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {k.label}
        </a>
      ))}
    </div>
  )
}

/* One object per project. The heading's button stretches over the whole card
   (`::after { inset: 0 }`), so the case name is its accessible name while the
   tag, status and stack stay readable. It keeps `ab-index-row` and `data-case`
   because the sheet's focus-return logic and the e2e suite look them up. */
function CaseCard({
  c,
  small,
  headingLevel = 3,
  onOpen,
}: {
  c: CaseData
  small?: boolean
  /** h4 under the "More projects" h3, so the outline tells the two tiers apart. */
  headingLevel?: 3 | 4
  onOpen: (key: CaseKey, trigger: HTMLElement) => void
}) {
  const p = c.poster
  const Heading = headingLevel === 4 ? "h4" : "h3"
  return (
    <article className={`ab-card${small ? " sm" : ""}`}>
      <span className={`ab-well${p.portrait ? " portrait" : ""}`}>
        {/* images.unoptimized is load-bearing on Amplify, so next/image buys nothing. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} alt="" width={p.w} height={p.h} loading="lazy" decoding="async" />
      </span>
      <div className="ab-plate">
        <div className="ab-card-head">
          <Heading className="ab-card-name ab-display">
            <button
              type="button"
              className="ab-index-row"
              aria-haspopup="dialog"
              data-case={c.key}
              onClick={(e) => onOpen(c.key, e.currentTarget)}
            >
              {c.name}
            </button>
          </Heading>
          <span className="ab-card-year ab-mono">{c.year}</span>
        </div>
        <p className="ab-card-tag">{c.tag}</p>
        <div className="ab-card-foot">
          <StatusPill status={c.status} label={c.statusLabel} />
          {!small &&
            c.chips.map((chip) => (
              <span key={chip} className="ab-chip-stack ab-mono">
                {chip}
              </span>
            ))}
        </div>
      </div>
    </article>
  )
}

export default function PortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (((params?.locale as string) || "en") === "es" ? "es" : "en") as Lang
  const t = useTranslations("home")
  const cases = useCases()

  const [theme, setTheme] = useState<Theme>("light")
  const [hydrated, setHydrated] = useState(false)
  const [openCaseKey, setOpenCaseKey] = useState<CaseKey | null>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Light is the default. A saved choice wins; the OS preference does not.
    let initial: Theme = "light"
    try {
      const saved = localStorage.getItem("ab_theme")
      if (saved === "light" || saved === "dark") initial = saved
    } catch {}
    setTheme(initial)
    setHydrated(true)
  }, [])

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("case")
    const param = raw ? (LEGACY_CASE_KEYS[raw] ?? raw) : null
    if (param && (CASE_KEYS as readonly string[]).includes(param)) {
      setOpenCaseKey(param as CaseKey)
      if (param !== raw) {
        const url = new URL(window.location.href)
        url.searchParams.set("case", param)
        window.history.replaceState(null, "", url)
      }
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

  const openCase = useCallback((key: CaseKey, trigger?: HTMLElement) => {
    lastFocusRef.current = trigger ?? (document.activeElement as HTMLElement | null)
    // The Pull runs only when there is a poster to lift; deep links and
    // reduced motion fall through to a plain state change.
    pullOpen(trigger ? posterOf(trigger) : null, () => {
      setOpenCaseKey(key)
      const url = new URL(window.location.href)
      url.searchParams.set("case", key)
      window.history.replaceState(null, "", url)
    })
  }, [])

  const closeCase = useCallback((mode: CloseMode = "pull") => {
    const commit = () => {
      setOpenCaseKey(null)
      const url = new URL(window.location.href)
      url.searchParams.delete("case")
      window.history.replaceState(null, "", url)
    }
    // A drag has already moved the sheet by hand; it leaves from where the
    // finger let go instead of replaying the Pull.
    if (mode === "drag") commit()
    else pullClose(posterOf(lastFocusRef.current), commit)
  }, [])

  const year = new Date().getFullYear()
  const waHref = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : null

  const navLabels: Record<(typeof NAV_SECTIONS)[number], string> = {
    work: t("nav.work"),
    biz: t("biz.title"),
    contact: t("nav.contact"),
  }
  const navSections = SECTION_ORDER[locale].filter((id): id is (typeof NAV_SECTIONS)[number] =>
    (NAV_SECTIONS as readonly string[]).includes(id),
  )

  // Spanish has no hero keys: the business lane sits right under the hero and
  // owns the action, and two identical button pairs on one screen read as a
  // duplicate (owner decision, 2026-10-18). English leads to the work instead.
  const heroKeys: KeyDef[] =
    locale === "es"
      ? []
      : [
          { href: "#work", label: t("hero.ctaWork"), kind: "primary" },
          { href: "#contact", label: t("hero.ctaEmail"), kind: "ghost" },
        ]

  const whatsappBiz: KeyDef[] = waHref
    ? [{ href: waHref, label: t("biz.ctaWhatsApp"), kind: "ghost", external: true }]
    : []
  const emailBiz: KeyDef = { href: "#contact", label: t("biz.ctaEmail"), kind: "primary" }
  // Spanish leads with WhatsApp; with no number the email key is the only one,
  // so it stays the primary.
  const bizKeys: KeyDef[] =
    locale === "es" && waHref
      ? [{ ...whatsappBiz[0], kind: "primary" }, { ...emailBiz, kind: "ghost" }]
      : [emailBiz, ...whatsappBiz]

  const flagship = CASE_KEYS.map((k) => cases[k]).filter((c) => c.flagship)
  const compact = CASE_KEYS.map((k) => cases[k]).filter((c) => !c.flagship)

  const sections: Record<Exclude<SectionId, "reel">, React.ReactNode> = {
    hero: (
      <section key="hero" className="ab-hero" aria-labelledby="hero-heading">
        <div className="ab-wrap ab-hero-in">
          <h1 id="hero-heading" className="ab-hero-title ab-display">
            {t("hero.title")}
          </h1>
          <p className="ab-hero-sub">{t.rich("hero.sub", { b: (chunks) => <b>{chunks}</b> })}</p>
          {heroKeys.length > 0 && <Keys keys={heroKeys} />}
        </div>
      </section>
    ),
    work: (
      <section key="work" id="work" className="ab-sec" aria-labelledby="work-title">
        <div className="ab-wrap">
          <h2 id="work-title" className="ab-h2 ab-display">
            {t("work.title")}
          </h2>
          <ul className="ab-grid-f" role="list">
            {flagship.map((c, i) => (
              <li key={c.key} className={i === flagship.length - 1 ? "wide" : undefined}>
                <CaseCard c={c} onOpen={openCase} />
              </li>
            ))}
          </ul>
          <h3 className="ab-subh">{t("work.moreTitle")}</h3>
          <ul className="ab-grid-c" role="list">
            {compact.map((c) => (
              <li key={c.key}>
                <CaseCard c={c} small headingLevel={4} onOpen={openCase} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    ),
    biz: (
      <section key="biz" id="biz" className="ab-sec" aria-labelledby="biz-title">
        <div className="ab-wrap">
          <div className="ab-biz">
            <h2 id="biz-title" className="ab-h2 ab-display">
              {t("biz.title")}
            </h2>
            <div>
              <p>{t("biz.body")}</p>
              <Keys keys={bizKeys} />
            </div>
          </div>
        </div>
      </section>
    ),
    contact: (
      <section key="contact" id="contact" className="ab-sec ab-contact" aria-labelledby="contact-title">
        <div className="ab-wrap">
          <h2 id="contact-title" className="ab-h2 ab-display">
            {t("contact.title")}
          </h2>
          <a className="ab-contact-mail ab-display" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          {waHref && (
            <Keys keys={[{ href: waHref, label: t("contact.whatsapp"), kind: "ghost", external: true }]} />
          )}
        </div>
      </section>
    ),
  }

  return (
    <div className="ab-root" data-theme={theme} suppressHydrationWarning>
      {/* Paints a saved dark choice before first paint, like every other root.
          React leaves the attribute alone during hydration (suppressHydrationWarning)
          and the effect above then syncs `theme` to the same value. */}
      <ThemeInit />
      {/* NAV */}
      <header className="ab-nav" role="banner">
        <div className="ab-wrap ab-nav-inner">
          <a href="#top" className="ab-brand ab-display">
            Atelier Belli
          </a>

          <nav aria-label="Primary">
            <ul className="ab-nav-links">
              {navSections.map((id) => (
                <li key={id}>
                  <a href={`#${id}`}>{navLabels[id]}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ab-nav-end">
            {/* Stands in for the primary links below 820px, where they are
                hidden. Same label as the link it replaces, so the two never
                drift apart. */}
            <a className="ab-chip-contact ab-key ghost sm" href="#contact">
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
              className="ab-chip-lang"
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

      <main id="main-content">
        <span id="top" />

        {SECTION_ORDER[locale].map((id) =>
          id === "reel" ? (
            <Showcase key="reel" cases={cases} onOpen={openCase} />
          ) : (
            sections[id]
          ),
        )}

        {/* Inside <main> on purpose: the case sheet sets `inert` on main and the
            header, and a footer outside both would stay reachable behind it. */}
        <footer className="ab-wrap ab-foot" role="contentinfo">
          <Link href="/privacy">{t("footer.privacy")}</Link>
          <Link href="/terms">{t("footer.terms")}</Link>
          {SOCIAL_LINKS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
          <span className="copy">
            © <span suppressHydrationWarning>{year}</span> Atelier Belli
          </span>
        </footer>
      </main>

      <CaseSheet
        openKey={openCaseKey}
        cases={cases}
        onClose={closeCase}
        lastFocusRef={lastFocusRef}
      />
    </div>
  )
}
