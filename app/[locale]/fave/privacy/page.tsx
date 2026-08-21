"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import ThemeInit from "@/components/theme-init"

export default function FavePrivacyPolicyPage() {
  const t = useTranslations("legal")

  return (
    <div className="ab-root" suppressHydrationWarning>
      <ThemeInit />
      <header className="ab-legal-nav">
        <div className="ab-legal-nav-inner ab-wrap">
          <Link href="/" className="ab-legal-back">
            ← {t("back")}
          </Link>
        </div>
      </header>

      <main id="main-content" className="ab-legal-main">
        <div className="ab-wrap ab-legal-content">
          <h1 className="ab-legal-title ab-serif">{t("favePrivacy.title")}</h1>
          <p className="ab-legal-meta">{t("favePrivacy.lastUpdated")}</p>

          <article className="ab-prose">
            <p>{t("favePrivacy.intro")}</p>

            <section>
              <h2>{t("favePrivacy.sections.collect.heading")}</h2>
              <p>{t("favePrivacy.sections.collect.body")}</p>
            </section>

            <section>
              <h2>{t("favePrivacy.sections.dataLocation.heading")}</h2>
              <p>{t("favePrivacy.sections.dataLocation.body")}</p>
            </section>

            <section>
              <h2>{t("favePrivacy.sections.artwork.heading")}</h2>
              <p>{t("favePrivacy.sections.artwork.tmdb")}</p>
              <p>{t("favePrivacy.sections.artwork.openLibrary")}</p>
            </section>

            <section>
              <h2>{t("favePrivacy.sections.children.heading")}</h2>
              <p>{t("favePrivacy.sections.children.body")}</p>
            </section>

            <section>
              <h2>{t("favePrivacy.sections.changes.heading")}</h2>
              <p>{t("favePrivacy.sections.changes.body")}</p>
            </section>

            <section>
              <h2>{t("favePrivacy.sections.contact.heading")}</h2>
              <p>
                <a
                  href={`mailto:${t("favePrivacy.sections.contact.email")}`}
                  className="ab-legal-link"
                >
                  {t("favePrivacy.sections.contact.email")}
                </a>
              </p>
            </section>
          </article>
        </div>
      </main>

      <footer className="ab-legal-foot">
        <div className="ab-wrap ab-legal-foot-inner">
          <span>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Atelier Belli —{" "}
            {t("allRightsReserved")}
          </span>
          <nav className="ab-legal-foot-nav">
            <Link href="/privacy">{t("privacyShortLabel")}</Link>
            <Link href="/terms">{t("termsShortLabel")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
