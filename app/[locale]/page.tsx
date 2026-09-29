"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { LOCALE_COOKIE } from "@/i18n"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeIcons } from "@/components/theme-icons"

import { CASE_KEYS, LEGACY_CASE_KEYS, useCases, type CaseKey } from "./_home/cases"
import { CaseSheet } from "./_home/case-sheet"
import { Showcase } from "./_home/showcase"

type Lang = "en" | "es"
type Theme = "light" | "dark"

const BRAND_LOGO = <BrandLogo />

// Slightly over the .ab-lang-ind transition in globals.css (280ms), so the
// language indicator lands before router.refresh() replaces the node.
const LOCALE_SLIDE_MS = 300

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

        </section>

        {/* SHOWCASE */}
        <Showcase cases={cases} onOpen={openCase} />

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
                const c = cases[key]
                /* Built from the case's own facet, so the index line and the
                   sheet kicker differ only in their last segment: the year
                   there, the status here. */
                const mshow = `${c.facet} · ${t(`cases.${key}.mshowStatus`)} →`
                return (
                  <button
                    key={key}
                    type="button"
                    className="ab-index-row"
                    /* Lets a ?case= deep link find the row this sheet belongs
                       to, so closing restores focus like the click path. */
                    data-case={key}
                    onClick={(e) => openCase(key, e.currentTarget)}
                  >
                    <span className="n ab-num">{c.num}</span>
                    <div className="p-main">
                      <div className="p-name">
                        {c.name}
                        <span className="ab-it"> — {c.titleIt}</span>
                      </div>
                      <div className="p-tag">{c.tag}</div>
                      <div className="mshow">{mshow}</div>
                    </div>
                    <div className="p-stack">
                      {c.chips.map((s) => (
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

      <CaseSheet
        openKey={openCaseKey}
        cases={cases}
        onClose={closeCase}
        lastFocusRef={lastFocusRef}
      />
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
