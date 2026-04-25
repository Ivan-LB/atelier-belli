"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function PrivacyPolicyPage() {
  const params = useParams()
  const locale = (params?.locale as string) === "es" ? "es" : "en"
  const t = useTranslations("legal")

  const dataUseItems = t.raw("privacy.sections.dataUse.items") as string[]

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
          <h1 className="ab-legal-title ab-serif">{t("privacy.title")}</h1>
          <p className="ab-legal-meta">{t("privacy.lastUpdated")}</p>

          <article className="ab-prose">
            <section>
              <h2>{t("privacy.sections.intro.heading")}</h2>
              <p>{t("privacy.sections.intro.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.dataCollected.heading")}</h2>
              <p>{t("privacy.sections.dataCollected.intro")}</p>
              <p>
                <strong>{t("privacy.sections.dataCollected.personalData.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.personalData.body")}
              </p>
              <p>
                <strong>{t("privacy.sections.dataCollected.derivedData.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.derivedData.body")}
              </p>
              <p>
                <strong>{t("privacy.sections.dataCollected.financialData.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.financialData.body")}
              </p>
              <p>
                <strong>{t("privacy.sections.dataCollected.mobileAppData.label")}</strong>{" "}
                {t("privacy.sections.dataCollected.mobileAppData.intro")}
              </p>
              <ul>
                <li>
                  <strong>{t("privacy.sections.dataCollected.mobileAppData.deviceInfo.label")}</strong>{" "}
                  {t("privacy.sections.dataCollected.mobileAppData.deviceInfo.body")}
                </li>
                <li>
                  <strong>{t("privacy.sections.dataCollected.mobileAppData.geolocation.label")}</strong>{" "}
                  {t("privacy.sections.dataCollected.mobileAppData.geolocation.body")}
                </li>
              </ul>
            </section>

            <section>
              <h2>{t("privacy.sections.dataUse.heading")}</h2>
              <p>{t("privacy.sections.dataUse.intro")}</p>
              <ul>
                {dataUseItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>{t("privacy.sections.dataSecurity.heading")}</h2>
              <p>{t("privacy.sections.dataSecurity.body")}</p>
            </section>

            <section>
              <h2>{t("privacy.sections.privacyRights.heading")}</h2>
              <p>
                {t("privacy.sections.privacyRights.body")}{" "}
                <Link href={`/${locale}/privacy/choices`} className="ab-legal-link">
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
                {t("privacy.sections.contact.email")}
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
            <Link href={`/${locale}/privacy`}>{t("privacyShortLabel")}</Link>
            <Link href={`/${locale}/terms`}>{t("termsShortLabel")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
