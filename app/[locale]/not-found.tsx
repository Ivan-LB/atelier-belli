import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"
import { NotFoundControls } from "./_not-found-controls"

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
        <Link href={`/${locale}`} className="ab-nf-mark" aria-label="Atelier Belli — Home">
          <svg
            viewBox="0 0 418 439"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="ab-nf-mark-svg"
          >
            <path
              fill="currentColor"
              d="M309.858 65.3296L381.867 107.607L403.76 120.585C407.627 122.898 413.235 126.427 417.139 128.423C404.352 135.354 391.264 143.371 378.71 150.721L322.099 183.565C322.645 201.011 322.184 220.827 322.177 238.447L322.167 268.865C322.167 273.91 322.184 278.981 322.148 284.029C322.141 285.262 322.171 285.432 321.529 286.139C306.959 278.65 290.56 268.254 276.203 259.839C255.75 247.856 234.721 236.232 214.461 224.059C213.92 211.665 214.179 197.915 214.182 185.42L214.197 122.791C221.054 118.226 230.434 112.869 237.637 108.572L282.754 81.6101C291.49 76.4108 301.433 70.8473 309.858 65.3296Z"
            />
            <path
              fill="#56B3C2"
              d="M176.404 0C179.141 0.852222 197.867 12.5246 201.139 14.4668L268.828 54.3989L151.589 124.157L117.037 144.624C110.186 148.708 101.165 154.448 94.1272 157.877L94.1102 308.139L94.0929 351.974C94.0886 359.243 94.3 367.916 94.0124 375.097L93.5173 375.293C77.1485 366.643 57.9991 354.51 41.7095 344.901L17.4601 330.556C12.0696 327.373 5.05491 323.385 0.130637 319.766C-0.126537 311.512 0.0743604 302.176 0.0799227 293.84L0.107072 246.796L0.140772 104.191L176.404 0Z"
            />
          </svg>
          <span className="ab-nf-name">
            Atelier <em>Belli</em>
          </span>
        </Link>

        <NotFoundControls
          locale={locale}
          otherLocale={otherLocale}
          themeLightLabel={t("themeToggleLight")}
          themeDarkLabel={t("themeToggleDark")}
          themeAriaLabel={t("themeToggleAria")}
          localeAriaLabel={t("localeSwitchAria")}
        />
      </nav>

      <main className="ab-nf-main">
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

          <Link href={`/${locale}`} className="ab-nf-cta">
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
