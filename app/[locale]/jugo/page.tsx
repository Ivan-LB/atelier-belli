"use client"

import Link from "next/link"
import { useMemo, type ReactNode } from "react"
import { useTranslations } from "next-intl"

import JugoIsland, { type IslandAlert } from "@/components/jugo-island"
import ThemeInit from "@/components/theme-init"

/* The release lives beside this page as static files (public/jugo/). The appcast
   URL next to it is compiled into every installed copy: never move the folder. */
const DOWNLOAD_HREF = "/jugo/Jugo-1.0.dmg"
const FILM_SRC = "/cases/video/jugo-launch.mp4"
const FILM_POSTER = "/cases/video/jugo-launch-poster.webp"

const it = (chunks: ReactNode) => <em className="ab-it">{chunks}</em>

export default function JugoPage() {
  const t = useTranslations("jugo")
  const tLegal = useTranslations("legal")

  const alerts = useMemo<IslandAlert[]>(
    () => [
      { title: t("demo.chargingTitle"), subtitle: t("demo.chargingSub"), level: 72, tone: "charging" },
      { title: t("demo.fullTitle"), subtitle: t("demo.fullSub"), level: 100, tone: "full" },
      { title: t("demo.lowTitle"), subtitle: t("demo.lowSub"), level: 12, tone: "low" },
    ],
    [t],
  )
  const stats = t.raw("health.stats") as [string, string, string][]
  const details = t.raw("details.items") as string[]
  const faq = t.raw("faq.items") as [string, string][]

  return (
    <div className="ab-root ab-jugo" suppressHydrationWarning>
      <ThemeInit />
      <header className="ab-legal-nav">
        <div className="ab-legal-nav-inner ab-wrap jg-nav">
          <Link href="/" className="ab-legal-back">
            ← {t("nav.back")}
          </Link>
          <a className="jg-nav-download" href={DOWNLOAD_HREF} download>
            <JugoMark />
            {t("nav.download")}
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className="ab-wrap jg-hero" aria-labelledby="jg-title">
          <div className="jg-hero-copy">
            <p className="ab-smallcaps jg-kicker">
              <JugoMark /> {t("hero.kicker")}
            </p>
            <h1 id="jg-title" className="ab-serif jg-title">
              {t.rich("hero.titleRich", { it })}
            </h1>
            <p className="jg-lede">{t("hero.lede")}</p>
            <DownloadButton label={t("hero.downloadCta")} />
            <p className="jg-download-meta">{t("hero.downloadMeta")}</p>
          </div>

          <figure className="jg-demo">
            <JugoIsland alerts={alerts} label={t("demo.aria")} />
            <figcaption>{t("demo.caption")}</figcaption>
          </figure>
        </section>

        {/* The launch film carries its own soundtrack, so unlike the silent case
            clips it gets native controls and never autoplays. */}
        <section className="ab-wrap jg-film" aria-label={t("film.aria")}>
          <figure>
            <video
              src={FILM_SRC}
              poster={FILM_POSTER}
              width={1920}
              height={1080}
              controls
              playsInline
              preload="none"
            />
            <figcaption>{t("film.caption")}</figcaption>
          </figure>
        </section>

        <section className="ab-wrap jg-split" aria-labelledby="jg-devices">
          <div className="jg-split-copy">
            <h2 id="jg-devices" className="ab-serif jg-h2">
              {t.rich("devices.titleRich", { it })}
            </h2>
            <p>{t("devices.body")}</p>
          </div>
          <figure className="jg-capture">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cases/jugo-menu.webp" alt={t("devices.alt")} width={680} height={607} loading="lazy" />
            <figcaption>{t("devices.caption")}</figcaption>
          </figure>
        </section>

        <section className="ab-wrap jg-health" aria-labelledby="jg-health">
          <h2 id="jg-health" className="ab-serif jg-h2">
            {t.rich("health.titleRich", { it })}
          </h2>
          <p className="jg-section-lede">{t("health.body")}</p>
          <dl className="jg-stats">
            {stats.map(([value, unit, note]) => (
              <div key={unit} className="jg-stat">
                <dt>
                  <span className="ab-num jg-stat-value">{value}</span>
                  <span className="jg-stat-unit">{unit}</span>
                </dt>
                <dd>{note}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="ab-wrap jg-details" aria-labelledby="jg-details">
          <h2 id="jg-details" className="ab-serif jg-h2">
            {t.rich("details.titleRich", { it })}
          </h2>
          <ul className="jg-detail-list">
            {details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="ab-wrap jg-privacy" aria-labelledby="jg-privacy">
          <h2 id="jg-privacy" className="ab-serif">
            {t("privacy.title")}
          </h2>
          <p>{t("privacy.body")}</p>
        </section>

        <section className="ab-wrap jg-faq" aria-labelledby="jg-faq">
          <h2 id="jg-faq" className="ab-serif jg-h2">
            {t("faq.title")}
          </h2>
          <div className="jg-faq-list">
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="ab-wrap jg-closing" aria-labelledby="jg-closing">
          <h2 id="jg-closing" className="ab-serif jg-title">
            {t.rich("closing.titleRich", { it })}
          </h2>
          <DownloadButton label={t("hero.downloadCta")} />
          <p className="jg-download-meta">{t("hero.downloadMeta")}</p>
        </section>
      </main>

      <footer className="ab-legal-foot">
        <div className="ab-wrap ab-legal-foot-inner">
          <span>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {t("foot.madeBy")}
          </span>
          <nav className="ab-legal-foot-nav">
            <Link href="/privacy">{tLegal("privacyShortLabel")}</Link>
            <Link href="/terms">{tLegal("termsShortLabel")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

/** The one filled button on the page: juice-green, the app's own icon, and a dark
    label (white on this green would sit near 2:1). Apple's logo is off-limits on
    a self-hosted download, so the app icon does that job. */
function DownloadButton({ label }: { label: string }) {
  return (
    <a className="jg-download" href={DOWNLOAD_HREF} download>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="jg-download-icon" src="/apps/jugo-icon.webp" alt="" width={32} height={32} aria-hidden="true" />
      <span>{label}</span>
    </a>
  )
}

/** Jugo's app icon, small, as a brand cue next to its name. */
function JugoMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="jg-mark" src="/apps/jugo-icon.webp" alt="" width={20} height={20} aria-hidden="true" />
  )
}
