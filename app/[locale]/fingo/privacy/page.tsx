"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import ThemeInit from "@/components/theme-init"

export default function FingoPrivacyPolicyPage() {
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
          <h1 className="ab-legal-title ab-serif">{t("fingoPrivacy.title")}</h1>
          <p className="ab-legal-meta">{t("fingoPrivacy.lastUpdated")}</p>

          <article className="ab-prose">
            <p>{t("fingoPrivacy.intro")}</p>

            <section>
              <h2>{t("fingoPrivacy.sections.collect.heading")}</h2>
              <p>{t("fingoPrivacy.sections.collect.body")}</p>
            </section>

            <section>
              <h2>{t("fingoPrivacy.sections.storage.heading")}</h2>
              <p>{t("fingoPrivacy.sections.storage.body")}</p>
            </section>

            <section>
              <h2>{t("fingoPrivacy.sections.permissions.heading")}</h2>
              <p>{t("fingoPrivacy.sections.permissions.body")}</p>
            </section>

            <section>
              <h2>{t("fingoPrivacy.sections.network.heading")}</h2>
              <p>{t("fingoPrivacy.sections.network.body")}</p>
            </section>

            <section>
              <h2>{t("fingoPrivacy.sections.children.heading")}</h2>
              <p>{t("fingoPrivacy.sections.children.body")}</p>
            </section>

            <section>
              <h2>{t("fingoPrivacy.sections.changes.heading")}</h2>
              <p>{t("fingoPrivacy.sections.changes.body")}</p>
            </section>

            <section>
              <h2>{t("fingoPrivacy.sections.contact.heading")}</h2>
              <p>
                <a
                  href={`mailto:${t("fingoPrivacy.sections.contact.email")}`}
                  className="ab-legal-link"
                >
                  {t("fingoPrivacy.sections.contact.email")}
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
