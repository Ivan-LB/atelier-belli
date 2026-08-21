import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"
import { NotFoundControls } from "./_not-found-controls"
import { BrandLogo } from "@/components/brand-logo"

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("ab_theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var r=document.currentScript&&document.currentScript.parentElement;if(r&&r.classList.contains("ab-root")){r.setAttribute("data-theme",t);}}catch(e){}})();`

export default async function NotFound() {
  const locale = (await getLocale()) === "es" ? "es" : "en"
  const t = await getTranslations("notFound")
  const otherLocale = locale === "es" ? "en" : "es"
  const year = new Date().getFullYear()

  return (
    <div className="ab-root ab-nf-root" data-theme="light">
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <nav className="ab-nf-nav" aria-label="Atelier Belli">
        <Link href="/" className="ab-nf-mark" aria-label="Atelier Belli — Home">
          <BrandLogo className="ab-nf-mark-svg" />
          <span className="ab-nf-name">
            Atelier <em>Belli</em>
          </span>
        </Link>

        <NotFoundControls
          locale={locale}
          otherLocale={otherLocale}
          themeAriaLabel={t("themeToggleAria")}
          controlsAriaLabel={t("controlsAria")}
        />
      </nav>

      <main id="main-content" className="ab-nf-main">
        <div className="ab-nf-stage">
          <div className="ab-nf-eye">
            <span className="ab-nf-eye-dot" aria-hidden="true" />
            <span>{t("eye")}</span>
          </div>

          <h1 className="ab-nf-display" aria-label="404">
            <span aria-hidden="true">4</span>
            <span aria-hidden="true" className="ab-nf-it">
              0
            </span>
            <span aria-hidden="true">4</span>
          </h1>

          <h2 className="ab-nf-title">
            {t("titlePre")}
            <em>{t("titleIt")}</em>
          </h2>

          <p className="ab-nf-desc">{t("description")}</p>

          <Link href="/" className="ab-nf-cta">
            <span>{t("backHome")}</span>
            <span className="ab-nf-cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </main>

      <footer className="ab-nf-foot">
        <span className="ab-nf-copy">© {year} Atelier Belli</span>
        <span className="ab-nf-meta">
          <em>Tijuana</em> — {t("footerMeta")}
        </span>
      </footer>
    </div>
  )
}
