"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import ThemeInit from "@/components/theme-init"

export default function SavelyPrivacyPolicyPage() {
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
          <h1 className="ab-legal-title ab-serif">{t("savelyPrivacy.title")}</h1>
          <p className="ab-legal-meta">{t("savelyPrivacy.lastUpdated")}</p>

          <article className="ab-prose">
            <p>{t("savelyPrivacy.intro")}</p>

            <section>
              <h2>{t("savelyPrivacy.sections.collect.heading")}</h2>
              <p>{t("savelyPrivacy.sections.collect.body")}</p>
            </section>

            <section>
              <h2>{t("savelyPrivacy.sections.storage.heading")}</h2>
              <p>{t("savelyPrivacy.sections.storage.body")}</p>
            </section>

            <section>
              <h2>{t("savelyPrivacy.sections.receipts.heading")}</h2>
              <p>{t("savelyPrivacy.sections.receipts.body")}</p>
            </section>

            <section>
              <h2>{t("savelyPrivacy.sections.reminders.heading")}</h2>
              <p>{t("savelyPrivacy.sections.reminders.body")}</p>
            </section>

            <section>
              <h2>{t("savelyPrivacy.sections.network.heading")}</h2>
              <p>{t("savelyPrivacy.sections.network.body")}</p>
            </section>

            <section>
              <h2>{t("savelyPrivacy.sections.deletion.heading")}</h2>
              <p>{t("savelyPrivacy.sections.deletion.body")}</p>
            </section>

            <section>
              <h2>{t("savelyPrivacy.sections.children.heading")}</h2>
              <p>{t("savelyPrivacy.sections.children.body")}</p>
            </section>

            <section>
              <h2>{t("savelyPrivacy.sections.changes.heading")}</h2>
              <p>{t("savelyPrivacy.sections.changes.body")}</p>
            </section>

            <section>
              <h2>{t("savelyPrivacy.sections.contact.heading")}</h2>
              <p>
                <a
                  href={`mailto:${t("savelyPrivacy.sections.contact.email")}`}
                  className="ab-legal-link"
                >
                  {t("savelyPrivacy.sections.contact.email")}
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
