"use client"

import { useEffect, useRef } from "react"

/* Runs during HTML parse, before first paint, so a reader who chose dark on the
   homepage never sees this page flash white. It sets the attribute on its own
   parent element, which is deliberately NOT given `data-theme` in JSX: React
   then never manages that attribute and there is no hydration mismatch to lose. */
const SCRIPT = `(function(){try{var t=localStorage.getItem("ab_theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var s=document.currentScript,r=s&&s.parentElement;if(r){r.setAttribute("data-theme",t);}}catch(e){}})();`

/**
 * Mirrors the homepage's `ab_theme` choice onto whatever root it is rendered
 * inside (`.ab-root` or `.sup-root`). Render it as the FIRST child of that root.
 *
 * The inline script covers a hard load. The effect covers a client-side
 * navigation, where React inserts the script node without executing it.
 */
export default function ThemeInit() {
  const ref = useRef<HTMLScriptElement>(null)

  useEffect(() => {
    const root = ref.current?.parentElement
    if (!root) return
    let theme = "light"
    try {
      const saved = localStorage.getItem("ab_theme")
      theme =
        saved === "light" || saved === "dark"
          ? saved
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
    } catch {
      theme = "light"
    }
    root.setAttribute("data-theme", theme)
  }, [])

  return <script ref={ref} dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
