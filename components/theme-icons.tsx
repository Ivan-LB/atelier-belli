/**
 * The sun/moon pair for the theme toggle, shared by the homepage header and the
 * 404 controls so the two cannot drift the way the brand mark did. Which one is
 * visible is decided in CSS by `.ab-root[data-theme]`, not by React state, so
 * this renders identically on the server and after hydration.
 */
export function ThemeIcons() {
  return (
    <>
      <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </>
  )
}
