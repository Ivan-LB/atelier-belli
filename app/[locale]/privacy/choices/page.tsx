"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function PrivacyChoicesPage() {
  const params = useParams()
  const locale = (params?.locale as string) === "es" ? "es" : "en"
  const t = useTranslations("legal")

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
          <h1 className="ab-legal-title ab-serif">{t("privacyChoices.title")}</h1>

          <article className="ab-prose">
            <p>{t("privacyChoices.intro")}</p>

            <section>
              <h2>{t("privacyChoices.sections.access.heading")}</h2>
              <p>{t("privacyChoices.sections.access.body")}</p>
            </section>

            <section>
              <h2>{t("privacyChoices.sections.correction.heading")}</h2>
              <p>{t("privacyChoices.sections.correction.body")}</p>
            </section>

            <section>
              <h2>{t("privacyChoices.sections.deletion.heading")}</h2>
              <p>{t("privacyChoices.sections.deletion.body")}</p>
            </section>

            <section>
              <h2>{t("privacyChoices.sections.objection.heading")}</h2>
              <p>{t("privacyChoices.sections.objection.body")}</p>
            </section>

            <section>
              <h2>{t("privacyChoices.sections.restriction.heading")}</h2>
              <p>{t("privacyChoices.sections.restriction.body")}</p>
            </section>

            <section>
              <h2>{t("privacyChoices.sections.portability.heading")}</h2>
              <p>{t("privacyChoices.sections.portability.body")}</p>
            </section>

            <section>
              <h2>{t("privacyChoices.sections.howToExercise.heading")}</h2>
              <p>{t("privacyChoices.sections.howToExercise.contactIntro")}</p>
              <p>
                {t("privacyChoices.sections.howToExercise.name")}
                <br />
                {t("privacyChoices.sections.howToExercise.email")}
              </p>
              <p>{t("privacyChoices.sections.howToExercise.responseNote")}</p>
              <p>{t("privacyChoices.sections.howToExercise.disclaimer")}</p>
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
