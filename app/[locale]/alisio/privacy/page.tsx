"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import ThemeInit from "@/components/theme-init"

export default function AlisioPrivacyPolicyPage() {
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
          <h1 className="ab-legal-title ab-serif">{t("alisioPrivacy.title")}</h1>
          <p className="ab-legal-meta">{t("alisioPrivacy.lastUpdated")}</p>

          <article className="ab-prose">
            <p>{t("alisioPrivacy.intro")}</p>

            <section>
              <h2>{t("alisioPrivacy.sections.collect.heading")}</h2>
              <p>{t("alisioPrivacy.sections.collect.body")}</p>
            </section>

            <section>
              <h2>{t("alisioPrivacy.sections.health.heading")}</h2>
              <p>{t("alisioPrivacy.sections.health.body")}</p>
              <p>{t("alisioPrivacy.sections.health.prompts")}</p>
            </section>

            <section>
              <h2>{t("alisioPrivacy.sections.storage.heading")}</h2>
              <p>{t("alisioPrivacy.sections.storage.body")}</p>
            </section>

            <section>
              <h2>{t("alisioPrivacy.sections.devices.heading")}</h2>
              <p>{t("alisioPrivacy.sections.devices.body")}</p>
            </section>

            <section>
              <h2>{t("alisioPrivacy.sections.account.heading")}</h2>
              <p>{t("alisioPrivacy.sections.account.body")}</p>
            </section>

            <section>
              <h2>{t("alisioPrivacy.sections.deletion.heading")}</h2>
              <p>{t("alisioPrivacy.sections.deletion.body")}</p>
            </section>

            <section>
              <h2>{t("alisioPrivacy.sections.children.heading")}</h2>
              <p>{t("alisioPrivacy.sections.children.body")}</p>
            </section>

            <section>
              <h2>{t("alisioPrivacy.sections.changes.heading")}</h2>
              <p>{t("alisioPrivacy.sections.changes.body")}</p>
            </section>

            <section>
              <h2>{t("alisioPrivacy.sections.contact.heading")}</h2>
              <p>
                <a
                  href={`mailto:${t("alisioPrivacy.sections.contact.email")}`}
                  className="ab-legal-link"
                >
                  {t("alisioPrivacy.sections.contact.email")}
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
