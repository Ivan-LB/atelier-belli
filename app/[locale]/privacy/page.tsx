"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import ThemeInit from "@/components/theme-init"

/* This page covers the WEBSITE only. Everything an app does lives in that app's
   own policy; the "Privacy for our apps" section below is how a reader who
   arrived from an App Store listing gets there, so it is not optional while
   those listings still point here. */
export default function PrivacyPolicyPage() {
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
          <h1 className="ab-legal-title ab-serif">{t("privacy.title")}</h1>
          <p className="ab-legal-meta">{t("privacy.lastUpdated")}</p>

          <article className="ab-prose">
            <section>
              <h2>{t("privacy.sections.intro.heading")}</h2>
              <p>{t("privacy.sections.intro.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.apps.heading")}</h2>
              <p>{t("privacy.sections.apps.intro")}</p>
              <ul>
                <li>
                  <Link href="/alisio/privacy" className="ab-legal-link">
                    {t("privacy.sections.apps.alisio")}
                  </Link>
                </li>
                <li>
                  <Link href="/fave/privacy" className="ab-legal-link">
                    {t("privacy.sections.apps.fave")}
                  </Link>
                </li>
                <li>
                  <Link href="/fingo/privacy" className="ab-legal-link">
                    {t("privacy.sections.apps.fingo")}
                  </Link>
                </li>
                <li>
                  <Link href="/savely/privacy" className="ab-legal-link">
                    {t("privacy.sections.apps.savely")}
                  </Link>
                </li>
              </ul>
              <p>{t("privacy.sections.apps.note")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.noCollection.heading")}</h2>
              <p>{t("privacy.sections.noCollection.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.cookie.heading")}</h2>
              <p>{t("privacy.sections.cookie.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.theme.heading")}</h2>
              <p>{t("privacy.sections.theme.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.hosting.heading")}</h2>
              <p>{t("privacy.sections.hosting.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.privacyRights.heading")}</h2>
              <p>
                {t("privacy.sections.privacyRights.body")}{" "}
                <Link href="/privacy/choices" className="ab-legal-link">
                  {t("privacy.sections.privacyRights.linkLabel")}
                </Link>
                .
              </p>
            </section>

            <section>
              <h2>{t("privacy.sections.children.heading")}</h2>
              <p>{t("privacy.sections.children.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.changes.heading")}</h2>
              <p>{t("privacy.sections.changes.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.contact.heading")}</h2>
              <p>{t("privacy.sections.contact.body")}</p>
              <p>
                {t("privacy.sections.contact.name")}
                <br />
                <a href={`mailto:${t("privacy.sections.contact.email")}`} className="ab-legal-link">
                  {t("privacy.sections.contact.email")}
                </a>
                <br />
                {t("privacy.sections.contact.address")}
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
