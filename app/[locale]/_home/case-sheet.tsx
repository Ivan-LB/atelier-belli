"use client"

import { useEffect, useRef, useState, type MutableRefObject, type PointerEvent } from "react"
import { useTranslations } from "next-intl"

import type { CaseData, CaseKey } from "./cases"
import { CaseFilm, CaseGallery, CasePreview, CaseVideo } from "./case-media"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])'

/* Drag-to-dismiss. Past either threshold the sheet leaves; short of both it
   springs home. Velocity wins over distance, so a flick is enough. */
const DISMISS_DISTANCE_PX = 140
const DISMISS_VELOCITY_PX_MS = 0.55

const ICONS = {
  external: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4h6v6M10 14L20 4M18 13v6H5V6h6" />
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7 2.6v5.2c0 4.4-3 7.5-7 8.2-4-.7-7-3.8-7-8.2V5.6z" />
      <path d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  ),
} as const

/** Past the top edge the sheet follows less and less: resistance, not a wall. */
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

type Props = {
  openKey: CaseKey | null
  cases: Record<CaseKey, CaseData>
  onClose: () => void
  lastFocusRef: MutableRefObject<HTMLElement | null>
}

/**
 * A case, as a sheet that rises from the bottom edge and leaves the same way.
 * The film leads, because every flagship now has one; the facts sit beside the
 * pitch as plain text instead of a field of pills; the long read follows.
 */
export function CaseSheet({ openKey, cases, onClose, lastFocusRef }: Props) {
  const t = useTranslations("home")
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const wasOpenRef = useRef(false)
  /* Origin, the last sample and its velocity (px/ms). Velocity comes from the
     last move only, so a flick after a slow drag still reads as a flick. */
  const dragRef = useRef<{ y0: number; y: number; t: number; dy: number; v: number } | null>(null)
  /* Lags `openKey` on purpose: the sheet keeps painting the last case through
     its exit instead of collapsing mid-animation to an empty frame. */
  const [renderedKey, setRenderedKey] = useState<CaseKey | null>(null)

  useEffect(() => {
    const sheet = sheetRef.current
    if (!openKey) {
      document.body.style.overflow = ""
      if (wasOpenRef.current) {
        wasOpenRef.current = false
        // The body stays mounted through the exit, and a playing film with
        // sound would otherwise keep talking behind a closed sheet.
        sheet?.querySelectorAll("video").forEach((v) => v.pause())
        const target =
          lastFocusRef.current ?? document.querySelector<HTMLElement>("button.ab-index-row")
        target?.focus()
      }
      return
    }
    wasOpenRef.current = true
    setRenderedKey(openKey)
    scrollRef.current?.scrollTo({ top: 0 })
    document.body.style.overflow = "hidden"
    // A ?case= deep link opens without a click; seed the return target with
    // the case's own row so closing lands where the click path would.
    if (!lastFocusRef.current) {
      lastFocusRef.current = document.querySelector<HTMLElement>(
        `button.ab-index-row[data-case="${openKey}"]`,
      )
    }
    const focusTimer = setTimeout(() => closeBtnRef.current?.focus(), 50)

    // Without this the page behind stays tabbable and aria-modal is a lie.
    const behind = [
      document.querySelector<HTMLElement>("main#main-content"),
      document.querySelector<HTMLElement>("header.ab-nav"),
    ].filter((el): el is HTMLElement => el != null)
    behind.forEach((el) => el.setAttribute("inert", ""))

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key !== "Tab" || !sheet) return
      const nodes = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      const outside = !sheet.contains(active)
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener("keydown", onKey)
      behind.forEach((el) => el.removeAttribute("inert"))
    }
  }, [openKey, onClose, lastFocusRef])

  /* ── Drag the bar to dismiss: 1:1 while held, velocity decides on release ── */
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return
    dragRef.current = { y0: e.clientY, y: e.clientY, t: performance.now(), dy: 0, v: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    sheetRef.current?.classList.add("dragging")
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const sheet = sheetRef.current
    if (!drag || !sheet) return
    const raw = e.clientY - drag.y0
    const dy = raw >= 0 ? raw : rubberband(raw, sheet.clientHeight)
    const now = performance.now()
    drag.v = (e.clientY - drag.y) / Math.max(1, now - drag.t)
    drag.y = e.clientY
    drag.t = now
    drag.dy = dy
    // Direct style write, not a CSS variable: a variable on the sheet would
    // restyle every descendant on every pointer move.
    sheet.style.transform = `translate3d(0, ${dy}px, 0)`
  }
  const endDrag = () => {
    const drag = dragRef.current
    const sheet = sheetRef.current
    dragRef.current = null
    if (!drag || !sheet) return
    sheet.classList.remove("dragging")
    const dismiss = drag.dy > DISMISS_DISTANCE_PX || drag.v > DISMISS_VELOCITY_PX_MS
    // Clearing the inline transform hands the motion back to the CSS
    // transition, which starts from where the finger left the sheet.
    sheet.style.transform = ""
    if (dismiss) onClose()
  }

  const c = openKey ? cases[openKey] : renderedKey ? cases[renderedKey] : null
  const open = openKey != null

  return (
    <>
      <div
        className={`ab-case-backdrop${open ? " open" : ""}`}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`ab-case-modal${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        aria-hidden={open ? "false" : "true"}
      >
        <div ref={scrollRef} className="ab-sheet-scroll">
          <div
            className="ab-sheet-bar"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <span className="ab-sheet-grabber" aria-hidden="true" />
            <div className="eye">
              <span className="num">{c?.num ?? "00"}</span>
              <span>{c?.kicker ?? t("modal.caseStudy")}</span>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              className="ab-case-close"
              onClick={onClose}
              aria-label={t("modal.close")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>

          {c && (
            <article className="ab-sheet-body">
              <div className="ab-sheet-hero">
                {c.film ? (
                  // Keyed: a new case is a new film, so its started state resets.
                  <CaseFilm key={c.film.src} film={c.film} name={c.name} />
                ) : (
                  <div className="ab-sheet-still">
                    <CasePreview which={(openKey ?? renderedKey) as CaseKey} />
                  </div>
                )}
              </div>

              <header className="ab-sheet-head">
                <div className="ab-sheet-pitch">
                  <h3 className="ab-case-title" id="case-title">
                    {c.name} —<span className="ab-it"> {c.titleIt}</span>
                  </h3>
                  <p className="ab-case-desc">{c.desc}</p>
                  {c.actions.length > 0 && (
                    <div className="ab-case-actions">
                      {c.actions.map((a) => (
                        <a
                          key={a.label}
                          className={`ab-case-btn ${a.kind}`}
                          href={a.href}
                          target={a.ext ? "_blank" : undefined}
                          rel={a.ext ? "noopener noreferrer" : undefined}
                        >
                          {a.label} {a.icon ? ICONS[a.icon] : null}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <dl className="ab-sheet-facts">
                  {c.meta.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </header>

              {c.story && (
                <section className="ab-case-story" aria-label={t("modal.story")}>
                  <div className="ab-case-beats">
                    {c.story.map(([label, body]) => (
                      <div key={label}>
                        <h4>{label}</h4>
                        <p>{body}</p>
                      </div>
                    ))}
                  </div>
                  {c.highlights && c.highlights.length > 0 && (
                    <ul className="ab-case-highlights">
                      {c.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {c.media?.map((block) => (
                <div className="ab-case-media" key={block.caption}>
                  <figure
                    className={block.kind === "gallery" || block.frame === "bare" ? "wide" : undefined}
                  >
                    {block.kind === "video" ? <CaseVideo media={block} /> : <CaseGallery media={block} />}
                    <figcaption>{block.caption}</figcaption>
                  </figure>
                </div>
              ))}
            </article>
          )}
        </div>
      </div>
    </>
  )
}
