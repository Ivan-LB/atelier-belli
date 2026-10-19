import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"
import { NotFoundControls } from "./_not-found-controls"
import { BrandLogo } from "@/components/brand-logo"

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("ab_theme");if(t!=="light"&&t!=="dark"){t="light";}var r=document.currentScript&&document.currentScript.parentElement;if(r&&r.classList.contains("ab-root")){r.setAttribute("data-theme",t);}}catch(e){}})();`

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
          {/* The homepage nav's own wordmark classes, so the two cannot drift. */}
          <span className="ab-brand ab-display">Atelier Belli</span>
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
          <p className="ab-nf-eye">{t("eye")}</p>

          <h1 className="ab-nf-display" aria-label="404">
            <span aria-hidden="true">4</span>
            <span aria-hidden="true" className="ab-nf-zero">
              0
            </span>
            <span aria-hidden="true">4</span>
          </h1>

          <h2 className="ab-nf-title">{t("title")}</h2>

          <p className="ab-nf-desc">{t("description")}</p>

          {/* The homepage's own amber key: the one thing on this page you can press. */}
          <Link href="/" className="ab-key primary">
            {t("backHome")}
          </Link>
        </div>
      </main>

      <footer className="ab-nf-foot">
        <span>© {year} Atelier Belli</span>
        <span>{t("footerMeta")}</span>
      </footer>
    </div>
  )
}
