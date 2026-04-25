"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function TermsAndConditionsPage() {
  const params = useParams()
  const locale = (params?.locale as string) === "es" ? "es" : "en"
  const t = useTranslations("legal")

  const userRepItems = t.raw("terms.sections.userRepresentations.items") as string[]

  return (
    <div className="ab-root" data-theme="light">
      <header className="ab-legal-nav">
        <div className="ab-legal-nav-inner ab-wrap">
          <Link href={`/${locale}`} className="ab-legal-back">
            ← {t("back")}
          </Link>
        </div>
      </header>

      <main className="ab-legal-main">
        <div className="ab-wrap ab-legal-content">
          <h1 className="ab-legal-title ab-serif">{t("terms.title")}</h1>
          <p className="ab-legal-meta">{t("terms.lastUpdated")}</p>

          <article className="ab-prose">
            <section>
              <h2>{t("terms.sections.acceptance.heading")}</h2>
              <p>{t("terms.sections.acceptance.body")}</p>
            </section>

            <section>
              <h2>{t("terms.sections.intellectualProperty.heading")}</h2>
              <p>{t("terms.sections.intellectualProperty.body")}</p>
            </section>

            <section>
              <h2>{t("terms.sections.userRepresentations.heading")}</h2>
              <p>{t("terms.sections.userRepresentations.intro")}</p>
              <ul>
                {userRepItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>{t("terms.sections.prohibitedActivities.heading")}</h2>
              <p>{t("terms.sections.prohibitedActivities.body")}</p>
            </section>

            <section>
              <h2>{t("terms.sections.termination.heading")}</h2>
              <p>{t("terms.sections.termination.body")}</p>
            </section>

            <section>
              <h2>{t("terms.sections.governingLaw.heading")}</h2>
              <p>{t("terms.sections.governingLaw.body")}</p>
            </section>

            <section>
              <h2>{t("terms.sections.limitationOfLiability.heading")}</h2>
              <p>{t("terms.sections.limitationOfLiability.body")}</p>
            </section>

            <section>
              <h2>{t("terms.sections.changes.heading")}</h2>
              <p>{t("terms.sections.changes.body")}</p>
            </section>

            <section>
              <h2>{t("terms.sections.contact.heading")}</h2>
              <p>{t("terms.sections.contact.body")}</p>
              <p>
                {t("terms.sections.contact.name")}
                <br />
                <a href={`mailto:${t("terms.sections.contact.email")}`} className="ab-legal-link">
                  {t("terms.sections.contact.email")}
                </a>
                <br />
                {t("terms.sections.contact.address")}
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
            <Link href={`/${locale}/privacy`}>{t("privacyShortLabel")}</Link>
            <Link href={`/${locale}/terms`}>{t("termsShortLabel")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
