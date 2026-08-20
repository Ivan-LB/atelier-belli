"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import ThemeInit from "@/components/theme-init"

export type SupportApp = "fingo" | "savely" | "fave"

export type ContactKind =
  | "email"
  | "bug"
  | "feature"
  | "security"
  | "sync"
  | "artwork"

export type ContactCard = {
  kind: ContactKind
  label: string
  value: string // may contain <em>...</em>
  hint?: string
  href: string
}

export type FaqItem = { q: string; a: string } // a may contain <em> / <a>

/** One true, ageless statement about the app. Rendered as a colophon, not a dashboard. */
export type Fact = { k: string; v: string; ok?: boolean }

export type SupportContent = {
  name: string
  navLabel: string
  footMeta: string

  heroTitle: string // HTML (em supported)
  heroLede: string

  contactTitle: string // HTML
  contactSub: string
  contacts: ContactCard[]

  faqTitle: string // HTML
  faqSub: string
  faq: FaqItem[]

  facts: Fact[]

  ctaTitle: string // HTML
  ctaSub: string
  ctaLabel: string
  ctaHref: string

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
  security: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  sync: (
    <>
      <path d="M7.5 17h9a3.5 3.5 0 0 0 .3-7 5.5 5.5 0 0 0-10.5 1.2A3.4 3.4 0 0 0 7.5 17z" />
      <path d="M12 11v5m-2-2 2 2 2-2" />
    </>
  ),
  artwork: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m3 17 4-4 3 3 4-4 7 7" />
    </>
  ),
}

export default function SupportShell({
  appKey,
  content,
}: {
  appKey: SupportApp
  content: SupportContent
}) {
  // The first contact is the desk itself: rendered large, as the one obvious
  // action. The rest are alternates, listed rather than boxed.
  const [primary, ...alternates] = content.contacts

  return (
    <div className="sup-root" data-app={appKey} suppressHydrationWarning>
      <ThemeInit />
      {/* NAV */}
      <nav className="sup-nav">
        <div className="sup-nav-inner">
          <Link className="sup-back" href="/">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            <span>Atelier Belli</span>
          </Link>
          <div className="sup-nav-app">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="sup-crest"
              src={`/apps/${appKey}-icon.webp`}
              alt=""
              width={26}
              height={26}
              loading="eager"
            />
            <span>{content.navLabel}</span>
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* HERO */}
        <section className="sup-hero">
          <div className="sup-wrap-narrow">
            <div className="sup-mast">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="sup-mast-icon"
                src={`/apps/${appKey}-icon.webp`}
                alt=""
                width={60}
                height={60}
                loading="eager"
              />
              <span className="sup-mast-name">{content.name}</span>
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: content.heroTitle }} />
            <p className="sup-lede">{content.heroLede}</p>
          </div>
        </section>

        {/* CONTACT */}
        <section className="sup-section">
          <div className="sup-wrap-narrow">
            <h2
              className="sup-section-title"
              dangerouslySetInnerHTML={{ __html: content.contactTitle }}
            />
            <p className="sup-section-sub">{content.contactSub}</p>

            {primary ? (
              <a className="sup-desk" href={primary.href}>
                <span className="sup-desk-label">{primary.label}</span>
                <span
                  className="sup-desk-value"
                  dangerouslySetInnerHTML={{ __html: primary.value }}
                />
                {primary.hint ? <span className="sup-desk-hint">{primary.hint}</span> : null}
              </a>
            ) : null}

            {alternates.length ? (
              <ul className="sup-routes">
                {alternates.map((c) => {
                  const external = c.href.startsWith("http")
                  return (
                    <li key={c.label}>
                      <a
                        href={c.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                      >
                        <svg className="sup-route-ico" viewBox="0 0 24 24" aria-hidden="true">
                          {ICON_PATHS[c.kind] ?? ICON_PATHS.email}
                        </svg>
                        <span className="sup-route-text">
                          <span className="sup-route-label">{c.label}</span>
                          {c.hint ? <span className="sup-route-hint">{c.hint}</span> : null}
                        </span>
                        <span className="sup-route-arr" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        </section>

        {/* FAQ */}
        <section className="sup-section">
          <div className="sup-wrap-narrow">
            <h2
              className="sup-section-title"
              dangerouslySetInnerHTML={{ __html: content.faqTitle }}
            />
            <p className="sup-section-sub">{content.faqSub}</p>
            <div className="sup-faq">
              {content.faq.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>
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

        {/* CLOSING: the ask, then the colophon of what is true */}
        <section className="sup-close">
          <div className="sup-wrap-narrow">
            <h2 dangerouslySetInnerHTML={{ __html: content.ctaTitle }} />
            <p className="sup-close-sub">{content.ctaSub}</p>
            <a className="sup-close-mail" href={content.ctaHref}>
              {content.ctaLabel}
            </a>

            <dl className="sup-colophon">
              {content.facts.map((f) => (
                <div key={f.k}>
                  <dt>{f.k}</dt>
                  <dd className={f.ok ? "sup-ok" : undefined}>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="sup-foot">
        <Link href="/">Atelier Belli</Link>
        <span className="sup-sep">·</span>
        <span>{content.footMeta}</span>
        <span className="sup-sep">·</span>
        <Link href="/privacy">{content.privacyLabel}</Link>
        <span className="sup-sep">·</span>
        <Link href="/terms">{content.termsLabel}</Link>
      </footer>
    </div>
  )
}
