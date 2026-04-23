"use client"

import Link from "next/link"
import type { ReactNode } from "react"

export type SupportApp = "fingo" | "savely" | "lorenzana"

export type ContactKind =
  | "email"
  | "bug"
  | "feature"
  | "docs"
  | "bank"
  | "security"
  | "twitter"
  | "order"
  | "wholesale"
  | "visit"

export type ContactCard = {
  kind: ContactKind
  label: string
  value: string // may contain <em>...</em>
  hint?: string
  href: string
}

export type FaqItem = { q: string; a: string } // a may contain <em> / <a>

export type StatusItem = { k: string; v: string; ok?: boolean }

export type SupportContent = {
  name: string
  crest: string
  navLabel: string
  footMeta: string

  heroEye: string
  heroTitle: string // HTML (em supported)
  heroLede: string

  contactTitle: string // HTML
  contactSub: string
  contacts: ContactCard[]

  faqTitle: string // HTML
  faqSub: string
  faq: FaqItem[]

  statusTitle: string // HTML
  statusSub: string
  status: StatusItem[]

  ctaTitle: string // HTML
  ctaSub: string
  ctaLabel: string
  ctaHref: string

  sectionLabels: {
    contact: string // "01 — Contact"
    faq: string // "02 — Frequent questions"
    status: string // "03 — Status"
  }

  privacyLabel: string
  termsLabel: string
  backLabel: string
}

const ICON_PATHS: Record<ContactKind, ReactNode> = {
  email: (
    <>
      <path d="M3 7.5l8.3 5.4a1.2 1.2 0 0 0 1.4 0L21 7.5" />
      <rect x="3" y="5" width="18" height="14" rx="2" />
    </>
  ),
  bug: (
    <>
      <path d="M9 4l1.5 2h3L15 4" />
      <rect x="7" y="7" width="10" height="12" rx="5" />
      <path d="M7 11H4M7 15H4M17 11h3M17 15h3" />
    </>
  ),
  feature: <path d="M12 3l2.4 6.2L21 10l-5 4 1.4 7-5.4-3.3L6.6 21 8 14l-5-4 6.6-.8z" />,
  twitter: <path d="M4 5l7 9-7 7h2.2l5.8-5.7L16 21h4l-7.4-9.6L19 5h-2.2l-5 4.9L9 5z" />,
  bank: <path d="M3 20h18M5 20V10m4 10V10m6 10V10m4 10V10M3 10h18L12 3z" />,
  security: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  docs: (
    <>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v4h4M10 13h6M10 17h6M10 9h3" />
    </>
  ),
  order: (
    <>
      <path d="M3 4h3l2 12h12" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
      <path d="M8 8h12l-1 6H9" />
    </>
  ),
  wholesale: (
    <>
      <path d="M3 9l9-5 9 5-9 5zM3 9v8l9 5 9-5V9" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  visit: (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
}

export default function SupportShell({
  appKey,
  locale,
  content,
}: {
  appKey: SupportApp
  locale: string
  content: SupportContent
}) {
  return (
    <div className="sup-root" data-app={appKey}>
      {/* NAV */}
      <nav className="sup-nav">
        <div className="sup-nav-inner">
          <Link className="sup-back" href={`/${locale}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            <span>Atelier Belli</span>
          </Link>
          <div className="sup-nav-app">
            <span className="sup-crest" aria-hidden="true">
              {content.crest}
            </span>
            <span>{content.navLabel}</span>
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* HERO */}
        <section className="sup-hero">
          <div className="sup-wrap-narrow">
            <div className="sup-eyebrow">
              <span className="sup-eye-dot" aria-hidden="true" />
              <span>{content.heroEye}</span>
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: content.heroTitle }} />
            <p className="sup-lede">{content.heroLede}</p>
          </div>
        </section>

        {/* CONTACT */}
        <section className="sup-section">
          <div className="sup-wrap">
            <header className="sup-section-head">
              <span className="sup-section-eye">{content.sectionLabels.contact}</span>
              <div>
                <h2
                  className="sup-section-title"
                  dangerouslySetInnerHTML={{ __html: content.contactTitle }}
                />
                <p className="sup-section-sub">{content.contactSub}</p>
              </div>
            </header>
            <div className="sup-contact-grid">
              {content.contacts.map((c) => {
                const external = c.href.startsWith("http")
                return (
                  <a
                    key={c.label}
                    className="sup-card"
                    href={c.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                  >
                    <div className="sup-ico">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        {ICON_PATHS[c.kind] ?? ICON_PATHS.email}
                      </svg>
                    </div>
                    <p className="sup-k">{c.label}</p>
                    <p className="sup-v" dangerouslySetInnerHTML={{ __html: c.value }} />
                    {c.hint ? <p className="sup-hint">{c.hint}</p> : null}
                    <span className="sup-arr" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="sup-section">
          <div className="sup-wrap">
            <header className="sup-section-head">
              <span className="sup-section-eye">{content.sectionLabels.faq}</span>
              <div>
                <h2
                  className="sup-section-title"
                  dangerouslySetInnerHTML={{ __html: content.faqTitle }}
                />
                <p className="sup-section-sub">{content.faqSub}</p>
              </div>
            </header>
            <div className="sup-faq">
              {content.faq.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>
                    <span className="sup-faq-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="sup-faq-q">{f.q}</span>
                    <span className="sup-faq-tog" aria-hidden="true">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <div className="sup-faq-a" dangerouslySetInnerHTML={{ __html: f.a }} />
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* STATUS */}
        <section className="sup-section">
          <div className="sup-wrap">
            <header className="sup-section-head">
              <span className="sup-section-eye">{content.sectionLabels.status}</span>
              <div>
                <h2
                  className="sup-section-title"
                  dangerouslySetInnerHTML={{ __html: content.statusTitle }}
                />
                <p className="sup-section-sub">{content.statusSub}</p>
              </div>
            </header>
            <div className="sup-status-row">
              {content.status.map((s) => (
                <div key={s.k} className="sup-status-cell">
                  <p className="sup-k">{s.k}</p>
                  <p className={`sup-v${s.ok ? " sup-ok" : ""}`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="sup-cta">
          <div className="sup-wrap-narrow">
            <h2 dangerouslySetInnerHTML={{ __html: content.ctaTitle }} />
            <p className="sup-sub">{content.ctaSub}</p>
            <a className="sup-btn-pill" href={content.ctaHref}>
              <span className="sup-pill-dot" aria-hidden="true" />
              <span>{content.ctaLabel}</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="sup-foot">
        <Link href={`/${locale}`}>Atelier Belli</Link>
        <span className="sup-sep">·</span>
        <span>{content.footMeta}</span>
        <span className="sup-sep">·</span>
        <Link href={`/${locale}/privacy`}>{content.privacyLabel}</Link>
        <span className="sup-sep">·</span>
        <Link href={`/${locale}/terms`}>{content.termsLabel}</Link>
      </footer>
    </div>
  )
}
