"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"

const LANGUAGE_COOKIE = "preferred-language"

type Lang = "en" | "es"
type Theme = "light" | "dark"

type CaseKey = "fingo" | "savely" | "mezcal"

type CaseAction = {
  label: string
  href: string
  kind: "primary" | "ghost" | "primary disabled"
  ext?: boolean
  icon?: "external" | "help" | "clock"
}

type CaseData = {
  num: string
  kicker: string
  title: { pre: string; it: string }
  desc: React.ReactNode
  meta: Array<[string, string]>
  actions: CaseAction[]
  preview: CaseKey
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
  const isSpanish = locale === "es"

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
    if (!hydrated) return
    try {
      localStorage.setItem("ab_theme", theme)
    } catch {}
  }, [theme, hydrated])

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  const switchLocale = () => {
    const target: Lang = isSpanish ? "en" : "es"
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `${LANGUAGE_COOKIE}=${target}; expires=${expires.toUTCString()}; path=/`
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
  const CASES: Record<CaseKey, CaseData> = {
    fingo: {
      num: "01",
      kicker: isSpanish ? "iOS · 2025" : "iOS · 2025",
      title: {
        pre: "Fingo — ",
        it: isSpanish ? "decisiones en grupo, fácil." : "group choice, made easy.",
      },
      desc: isSpanish ? (
        <>
          Una app de iOS para decidir en grupo al instante — ruletas, monedas, flechas giratorias,
          toque-para-elegir. Totalmente personalizable, con <em>háptics</em> que hacen que cada
          elección se sienta intencional. Construida con SwiftUI.
        </>
      ) : (
        <>
          An iOS app for making group decisions instantly — wheels, coins, spinning arrows,
          tap-to-choose. Fully customizable, with <em>haptics</em> that make each pick feel
          deliberate. Built with SwiftUI.
        </>
      ),
      meta: isSpanish
        ? [
            ["Plataforma", "iOS 16+"],
            ["Stack", "SwiftUI · Swift · Core Haptics"],
            ["Estado", "Disponible en App Store"],
            ["Año", "2025"],
          ]
        : [
            ["Platform", "iOS 16+"],
            ["Stack", "SwiftUI · Swift · Core Haptics"],
            ["Status", "Live on the App Store"],
            ["Year", "2025"],
          ],
      actions: [
        {
          label: isSpanish ? "Ver en App Store" : "View on App Store",
          href: "https://apps.apple.com/mx/app/fingo-group-choice-made-easy/id6747301883",
          kind: "primary",
          ext: true,
          icon: "external",
        },
        {
          label: isSpanish ? "Soporte" : "Support",
          href: `/${locale}/fingo/support`,
          kind: "ghost",
          icon: "help",
        },
      ],
      preview: "fingo",
    },
    savely: {
      num: "02",
      kicker: isSpanish ? "iOS · Fintech · 2026" : "iOS · Fintech · 2026",
      title: {
        pre: "Savely — ",
        it: isSpanish ? "finanzas personales, en calma." : "personal finance, quietly.",
      },
      desc: isSpanish ? (
        <>
          Un asistente financiero tranquilo. Rastrea gastos, ahorra con metas, recibe alertas
          inteligentes antes de que las cosas se salgan. Seguridad bancaria, interfaz{" "}
          <em>silenciosa</em>. Construida con SwiftUI y APIs bancarias seguras.
        </>
      ) : (
        <>
          A calm financial assistant. Track spending, save with goals, get smart alerts before
          things slip. Bank-grade security, <em>quiet</em> interface. Built with SwiftUI and secure
          banking APIs.
        </>
      ),
      meta: isSpanish
        ? [
            ["Plataforma", "iOS 16+"],
            ["Stack", "SwiftUI · Swift · APIs bancarias"],
            ["Estado", "En revisión · Próximamente"],
            ["Año", "2026"],
          ]
        : [
            ["Platform", "iOS 16+"],
            ["Stack", "SwiftUI · Swift · Banking APIs"],
            ["Status", "In review · App Store soon"],
            ["Year", "2026"],
          ],
      actions: [
        {
          label: isSpanish ? "Próximamente" : "Coming soon",
          href: "#",
          kind: "primary disabled",
          icon: "clock",
        },
        {
          label: isSpanish ? "Soporte" : "Support",
          href: `/${locale}/savely/support`,
          kind: "ghost",
          icon: "help",
        },
      ],
      preview: "savely",
    },
    mezcal: {
      num: "03",
      kicker: isSpanish ? "Web · E-commerce · 2025" : "Web · E-commerce · 2025",
      title: {
        pre: "Mi Mezcal — ",
        it: "Destilería Lorenzana.",
      },
      desc: isSpanish ? (
        <>
          Tienda e historia para una marca de mezcal artesanal de Oaxaca. Un sitio editorial y
          tranquilo construido para vender — variedades, origen, pedidos directos.{" "}
          <em>Hecho a mano</em> de la marca al checkout.
        </>
      ) : (
        <>
          Storefront and story for an artisanal mezcal brand out of Oaxaca. A quiet, editorial site
          built to sell — varieties, origin, direct orders. <em>Hand-built</em> from brand to
          checkout.
        </>
      ),
      meta: isSpanish
        ? [
            ["Plataforma", "Web · Responsiva"],
            ["Stack", "Next.js · TypeScript · Stripe"],
            ["Estado", "En vivo"],
            ["Año", "2025"],
          ]
        : [
            ["Platform", "Web · Responsive"],
            ["Stack", "Next.js · TypeScript · Stripe"],
            ["Status", "Live"],
            ["Year", "2025"],
          ],
      actions: [
        {
          label: isSpanish ? "Visitar sitio" : "Visit site",
          href: "https://www.destilerialorenzana.com/",
          kind: "primary",
          ext: true,
          icon: "external",
        },
      ],
      preview: "mezcal",
    },
  }

  const openCase = useCallback((key: CaseKey, trigger?: HTMLElement) => {
    lastFocusRef.current = trigger ?? (document.activeElement as HTMLElement | null)
    setOpenCaseKey(key)
  }, [])

  const closeCase = useCallback(() => {
    setOpenCaseKey(null)
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
                <a href="#top">{isSpanish ? "Inicio" : "Home"}</a>
              </li>
              <li>
                <a href="#work">{isSpanish ? "Proyectos" : "Work"}</a>
              </li>
              <li>
                <a href="#stack">Stack</a>
              </li>
              <li>
                <a href="#studio">{isSpanish ? "Sobre mí" : "About"}</a>
              </li>
              <li>
                <a href="#contact">{isSpanish ? "Contacto" : "Contact"}</a>
              </li>
            </ul>
          </nav>

          <div className="ab-nav-end">
            <button
              className="ab-chip ab-chip-lang"
              onClick={switchLocale}
              aria-label={isSpanish ? "Switch to English" : "Cambiar a Español"}
            >
              <b>{isSpanish ? "ES" : "EN"}</b>
              <span className="ab-sep" />
              <span className="off">{isSpanish ? "EN" : "ES"}</span>
            </button>
            <button
              className="ab-theme-toggle"
              onClick={toggleTheme}
              aria-label={isSpanish ? "Cambiar tema" : "Toggle theme"}
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
                  <span className="ab-smallcaps">
                    {isSpanish ? "Software · Oficio digital" : "Software · Digital craft"}
                  </span>
                </div>
                <h1 id="hero-heading" className="ab-h-title ab-serif">
                  {isSpanish ? (
                    <>
                      <span>Apps hechas</span>
                      <br />
                      <span>con </span>
                      <span className="ab-it">intención.</span>
                    </>
                  ) : (
                    <>
                      <span>Apps crafted</span>
                      <br />
                      <span>with </span>
                      <span className="ab-it">intention.</span>
                    </>
                  )}
                </h1>
                <p className="ab-h-sub">
                  {isSpanish ? (
                    <>
                      Un pequeño <em>atelier</em> de software — precisión franco-italiana, forma
                      minimalista, código escrito a mano. Diseño y construyo apps de iOS y la web
                      que las acompaña.
                    </>
                  ) : (
                    <>
                      A small <em>atelier</em> for software — Franco-Italian precision, minimalist
                      form, and code written by hand. I design and build iOS apps and the web
                      around them.
                    </>
                  )}
                </p>
              </div>

              <aside
                className="ab-reveal"
                aria-label="Colophon"
                style={{ transitionDelay: "120ms" }}
              >
                <div className="ab-colophon">
                  <div className="row">
                    <span className="k">{isSpanish ? "Ubicación" : "Location"}</span>
                    <span className="v">Tijuana · BC</span>
                  </div>
                  <hr className="ab-hair" />
                  <div className="row">
                    <span className="k">{isSpanish ? "Estado" : "Status"}</span>
                    <span className="v avail">
                      <span className="ab-dot" aria-hidden="true" />{" "}
                      <em>
                        {isSpanish ? "Disponible para encargos" : "Available for commissions"}
                      </em>
                    </span>
                  </div>
                  <hr className="ab-hair" />
                  <div className="row">
                    <span className="k">Est.</span>
                    <span className="v">2023 — {isSpanish ? "En curso" : "Ongoing"}</span>
                  </div>
                  <hr className="ab-hair" />
                  <div className="row">
                    <span className="k">{isSpanish ? "Firmado" : "Signed"}</span>
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
                  <span className="eye">{isSpanish ? "Vitrina — 2025" : "Showcase — 2025"}</span>
                  <h2>
                    <span>{isSpanish ? "Tres piezas " : "Three recent "}</span>
                    <em>{isSpanish ? "recientes." : "pieces."}</em>
                  </h2>
                </div>
                <span className="m">
                  {isSpanish ? "— Pasa el cursor para enfocar" : "— Hover to focus"}
                </span>
              </div>

              <div className="ab-phones">
                <div className="ab-phone-slot" aria-label="Fingo preview">
                  <div className="ab-phone-img fingo tilt-l" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/fingo-hero.webp" alt="" loading="lazy" />
                  </div>
                  <div className="caption">
                    <span className="n">Fingo</span>
                    <span className="s">iOS · 2024</span>
                  </div>
                </div>

                <div className="ab-phone-slot center" aria-label="Savely preview">
                  <div className="ab-phone-img savely tilt-c" aria-hidden="true">
                    <div className="crop">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/savely-hero.png" alt="" loading="lazy" />
                    </div>
                  </div>
                  <div className="caption">
                    <span className="n">Savely</span>
                    <span className="s">iOS · 2025</span>
                  </div>
                </div>

                <div className="ab-phone-slot web-slot" aria-label="Destilería Lorenzana preview">
                  <div className="ab-vit-browser tilt-r" aria-hidden="true">
                    <div className="bb">
                      <span className="d" />
                      <span className="d" />
                      <span className="d" />
                      <span className="u">◌</span>
                    </div>
                    <div className="scr">
                      <div className="nav-strip">
                        <b>Destilería Lorenzana</b>
                        <span className="links">
                          <span>Origen</span>
                          <span>Tienda</span>
                          <span>ES · EN</span>
                        </span>
                      </div>
                      <div className="txt">
                        <div className="eyel">Edición 2025</div>
                        <h4>
                          Mi Mezcal,
                          <br />
                          espadín&nbsp;puro.
                        </h4>
                        <div className="sub">Destilado en ollas de barro. Oaxaca.</div>
                        <div className="buttons">
                          <b className="f">Comprar · $780</b>
                          <b className="g">Historia</b>
                        </div>
                      </div>
                      <div className="bottle-col">
                        <div className="ab-vit-bottle">
                          <div className="neck" />
                          <div className="shld" />
                          <div className="bod" />
                          <div className="lbl">
                            <span className="tt">Espadín</span>
                            <span className="ln" />
                            <span className="ds">
                              Artesanal
                              <br />
                              Oaxaca · 46°
                            </span>
                            <span className="yr">MMXXV</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="caption">
                    <span className="n">Destilería Lorenzana</span>
                    <span className="s">Web · 2025</span>
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
                  <span className="ab-smallcaps">{isSpanish ? "La obra" : "The work"}</span>
                </div>
                <h2 id="work-title" className="s-title">
                  <span>{isSpanish ? "Obra " : "Selected "}</span>
                  <span className="ab-it">{isSpanish ? "selecta." : "work."}</span>
                </h2>
              </div>
              <div className="s-meta">
                {isSpanish ? "Índice — 2023 / 2026" : "Index — 2023 / 2026"}
              </div>
            </div>

            <div className="ab-index-list" role="list">
              {(Object.keys(CASES) as CaseKey[]).map((key) => {
                const c = CASES[key]
                const name =
                  key === "fingo"
                    ? { pre: "Fingo", it: isSpanish ? " — decisiones en grupo, fácil." : " — group choice, made easy." }
                    : key === "savely"
                      ? { pre: "Savely", it: isSpanish ? " — finanzas personales, en calma." : " — personal finance, quietly." }
                      : { pre: "Mi Mezcal", it: " — Destilería Lorenzana." }
                const tag =
                  key === "fingo"
                    ? isSpanish
                      ? "Ruletas, monedas, háptics — decisiones de un toque."
                      : "Wheels, coins, haptics — decisions in a tap."
                    : key === "savely"
                      ? isSpanish
                        ? "Balance, presupuesto, alertas — un asistente financiero tranquilo."
                        : "Balance, budgets, alerts — a calm financial assistant."
                      : isSpanish
                        ? "Una marca de mezcal artesanal — tienda e historia."
                        : "An artisanal mezcal brand — storefront and story."
                const stack =
                  key === "fingo"
                    ? ["iOS", "SwiftUI", "Haptics"]
                    : key === "savely"
                      ? ["iOS", "Fintech", "Banking APIs"]
                      : ["Web", "E-commerce", "Brand"]
                const mshow =
                  key === "fingo"
                    ? "iOS · SwiftUI · App Store →"
                    : key === "savely"
                      ? "iOS · Fintech · In review →"
                      : "Web · E-commerce · Live →"
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
                    <div className="p-plat">{isSpanish ? "Ver proyecto" : "View case"}</div>
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
                  <span className="ab-smallcaps">
                    {isSpanish ? "El taller" : "The workbench"}
                  </span>
                </div>
                <h2 id="wb-title" className="ab-wb-title">
                  <span>{isSpanish ? "Herramientas del " : "Tools of the "}</span>
                  <span className="ab-it">{isSpanish ? "oficio." : "trade."}</span>
                </h2>
                <p className="ab-wb-desc">
                  {isSpanish ? (
                    <>
                      Un conjunto pequeño y opinado. Swift y SwiftUI para el teléfono;{" "}
                      <em>Next.js</em> y TypeScript para la web; Postgres para lo que debe durar.
                      Figma, Xcode, Claude Code — el banco se mantiene limpio.
                    </>
                  ) : (
                    <>
                      A small, opinionated set. Swift and SwiftUI for the phone; <em>Next.js</em>{" "}
                      and TypeScript for the web; Postgres for things that must last. Figma, Xcode,
                      Claude Code — the bench stays tidy.
                    </>
                  )}
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
                    {isSpanish ? "Frontend & Móvil" : "Frontend & Mobile"}{" "}
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
                    {isSpanish ? "Backend & Infra" : "Backend & Infra"}{" "}
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
                    {isSpanish ? "Oficio" : "Craft"} <span className="gn">iii.</span>
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
              — <em>{isSpanish ? "Encargos abiertos" : "Commissions open"}</em> —
            </div>
            <h2 id="cta-title">
              <span>{isSpanish ? "Hagamos algo " : "Let's build something "}</span>
              <span className="ab-it">{isSpanish ? "bien hecho." : "well-made."}</span>
            </h2>

            <div className="ab-cta-actions" id="contact">
              <a className="ab-btn-mail" href="mailto:ivanlorenzana@outlook.com">
                <span className="lbl">{isSpanish ? "Escribe a" : "Write to"}</span>
                <span className="mail">ivanlorenzana@outlook.com</span>
              </a>
              <span />
              <div className="ab-cta-links">
                <span className="s">Atelier Belli</span>
                <span>
                  Tijuana ⇄ <span>{isSpanish ? "Todo el mundo" : "Worldwide"}</span>
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
                <a href={`/${locale}/privacy`}>{isSpanish ? "Privacidad" : "Privacy"}</a>
                &nbsp;·&nbsp;
                <a href={`/${locale}/terms`}>{isSpanish ? "Términos" : "Terms"}</a>
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
            aria-label={isSpanish ? "Cerrar" : "Close"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
        {activeCase && (
          <div className="ab-case-body">
            <div
              className={`ab-case-preview${activeCase.preview === "mezcal" ? " web-preview" : ""}`}
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

function CasePreview({ which }: { which: CaseKey }) {
  if (which === "fingo") {
    return (
      <div className="ab-phone-img fingo" aria-hidden="true" style={{ ["--w" as any]: "280px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fingo-hero.webp" alt="" />
      </div>
    )
  }
  if (which === "savely") {
    return (
      <div className="ab-phone-img savely" aria-hidden="true" style={{ ["--w" as any]: "280px" }}>
        <div className="crop">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/savely-hero.png" alt="" />
        </div>
      </div>
    )
  }
  return (
    <div className="ab-browser-frame">
      <div className="ab-browser-bar">
        <span className="bdot" />
        <span className="bdot" />
        <span className="bdot" />
        <span className="url">destilerialorenzana.com</span>
      </div>
      <div className="ab-mez-site">
        <span className="ms-eye">Destilería Lorenzana · Oaxaca</span>
        <h3>Mi Mezcal — Espadín.</h3>
        <div className="ms-row">
          <div className="mini-bottle" />
          <div>
            <p>Artesanal. 46°. Cosecha limitada. Destilado en olla de cobre, embotellado a mano.</p>
            <div className="ms-cta">
              <b>Pedir ahora</b>
              <b>Nuestra historia</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
