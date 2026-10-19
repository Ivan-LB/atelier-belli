"use client"

import { useEffect, useRef, useState, type MouseEvent, type MutableRefObject, type PointerEvent } from "react"
import { flushSync } from "react-dom"
import { useTranslations } from "next-intl"

import type { CaseData, CaseKey } from "./cases"
import { CaseFilm, CaseGallery, CaseVideo } from "./case-media"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])'

/* Drag-to-dismiss. Past either threshold the sheet leaves; short of both it
   springs home. Velocity wins over distance, so a flick is enough. */
const DISMISS_DISTANCE_PX = 140
const DISMISS_VELOCITY_PX_MS = 0.55

/** House lights: down while the sheet's film plays, up otherwise. */
type House = "up" | "down"

/** How a close was asked for. A drag already moved the sheet by hand, so it
    leaves from where the finger let go instead of running the Pull. */
export type CloseMode = "pull" | "drag"

const FILM_VIDEO_SELECTOR = "video.ab-case-film-video"
const VT_FILM = "case-film"
const VT_SHEET = "case-sheet"

/** Past the top edge the sheet follows less and less: resistance, not a wall. */
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

/* ── The Pull ───────────────────────────────────────────────────────────────
   Opening a case lifts the clicked poster out of its card and lets it become
   the sheet's film frame while the panel rises under it; closing runs the same
   thing backwards, faster. It needs the View Transitions API and is skipped
   under reduced motion, where the sheet just fades. CSS owns the timings
   (`:root[data-vt]` picks open or close). */

const canPull = () =>
  typeof document.startViewTransition === "function" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches

const setName = (el: Element | null | undefined, name: string) =>
  (el as HTMLElement | null | undefined)?.style.setProperty("view-transition-name", name)
const clearName = (el: Element | null | undefined) =>
  (el as HTMLElement | null | undefined)?.style.removeProperty("view-transition-name")

/** A transition that never finished (a background tab pauses them) can leave a
    name behind, and two elements sharing one aborts the next transition. */
function clearLeftoverNames() {
  document.querySelectorAll('[style*="view-transition-name"]').forEach(clearName)
}

const sheetPanel = () => document.querySelector<HTMLElement>(".ab-case-modal")
const filmFrame = () => document.querySelector<HTMLElement>(".ab-case-modal .ab-sheet-hero > *")

function isOnScreen(el: Element) {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth
}

/** Focus moves inside the update callback, so it lands in the same frame the
    new state is captured instead of after the transition has started. */
function focusCloseButton() {
  document.querySelector<HTMLElement>("button.ab-case-close")?.focus({ preventScroll: true })
}

/* Only the newest transition may tidy up. Starting a second one skips the
   first, whose `finished` then settles after the second has already set its
   own `data-vt` and names; letting it clean up would wipe those mid-flight. */
let latestTransition = 0

function runTransition(phase: "open" | "close", update: () => void, onSwapped: () => void) {
  const root = document.documentElement
  const id = ++latestTransition
  root.dataset.vt = phase
  const done = () => {
    if (id !== latestTransition) return
    clearLeftoverNames()
    delete root.dataset.vt
  }
  const vt = document.startViewTransition(() => {
    update()
    onSwapped()
  })
  vt.finished.then(done, done)
}

/** `from` is the clicked card's poster well (or the reel slide). */
export function pullOpen(from: HTMLElement | null, commit: () => void) {
  if (!from || !canPull()) {
    commit()
    return
  }
  clearLeftoverNames()
  setName(from, VT_FILM)
  runTransition(
    "open",
    () => {
      clearName(from)
      flushSync(commit)
      setName(filmFrame(), VT_FILM)
      setName(sheetPanel(), VT_SHEET)
    },
    focusCloseButton,
  )
}

/** `back` is the poster well the film settles into (the card or reel slide it came from). */
export function pullClose(back: HTMLElement | null, commit: () => void) {
  if (!canPull()) {
    commit()
    return
  }
  clearLeftoverNames()
  const frame = filmFrame()
  const panel = sheetPanel()
  setName(frame, VT_FILM)
  setName(panel, VT_SHEET)
  runTransition(
    "close",
    () => {
      clearName(frame)
      clearName(panel)
      flushSync(commit)
      // A card scrolled out of view has nothing to settle into: the film just
      // leaves with the panel.
      if (back && document.contains(back) && isOnScreen(back)) setName(back, VT_FILM)
    },
    () => {},
  )
}

type Props = {
  openKey: CaseKey | null
  cases: Record<CaseKey, CaseData>
  onClose: (mode?: CloseMode) => void
  lastFocusRef: MutableRefObject<HTMLElement | null>
}

/** Platform and Stack read as plain comma lists; the data keeps " · " so the
    reel caption and the dictionaries stay as they are. */
const asList = (v: string) => v.split(" · ").join(", ")

/** `CaseData.meta` is [platform, stack, status, year]; the sheet reads
    platform, status, stack, year, so the two cheap facts frame the technical one. */
const FACT_ORDER = [0, 2, 1, 3] as const
const LIST_FACTS: ReadonlySet<number> = new Set([0, 1])

/**
 * A case, as a sheet that rises from the bottom edge and leaves the same way.
 * The film leads (every flagship has one); the head names the case and offers
 * its real links; the pitch, the facts and, for flagships, the story and the
 * details follow as plain text.
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
  const [house, setHouse] = useState<House>("up")

  /* House lights follow the film. Media events do not bubble, so the sheet
     listens in the capture phase; only the launch film counts, never the
     silent demo clips further down. */
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    const isFilm = (target: EventTarget | null) =>
      target instanceof HTMLVideoElement && target.matches(FILM_VIDEO_SELECTOR)
    const dim = (e: Event) => {
      if (isFilm(e.target)) setHouse("down")
    }
    const raise = (e: Event) => {
      if (isFilm(e.target)) setHouse("up")
    }
    sheet.addEventListener("play", dim, true)
    sheet.addEventListener("pause", raise, true)
    sheet.addEventListener("ended", raise, true)
    return () => {
      sheet.removeEventListener("play", dim, true)
      sheet.removeEventListener("pause", raise, true)
      sheet.removeEventListener("ended", raise, true)
    }
  }, [])

  useEffect(() => {
    const sheet = sheetRef.current
    setHouse("up")
    if (!openKey) {
      document.body.style.overflow = ""
      if (wasOpenRef.current) {
        wasOpenRef.current = false
        // The body stays mounted through the exit, and a playing film with
        // sound would otherwise keep talking behind a closed sheet.
        sheet?.querySelectorAll("video").forEach((v) => v.pause())
        const target =
          lastFocusRef.current ?? document.querySelector<HTMLElement>("button.ab-index-row")
        target?.focus({ preventScroll: true })
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
    const focusTimer = setTimeout(() => closeBtnRef.current?.focus({ preventScroll: true }), 50)

    // Without this the page behind stays tabbable and aria-modal is a lie.
    const behind = [
      document.querySelector<HTMLElement>("main#main-content"),
      document.querySelector<HTMLElement>("header.ab-nav"),
    ].filter((el): el is HTMLElement => el != null)
    behind.forEach((el) => el.setAttribute("inert", ""))

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // The lights are down for the film: the first Escape stops it, the
        // second closes the sheet.
        const film = sheet?.querySelector<HTMLVideoElement>(FILM_VIDEO_SELECTOR)
        if (film && !film.paused) {
          film.pause()
          return
        }
        onClose()
        return
      }
      if (e.key !== "Tab" || !sheet) return
      // Only stops a person can actually land on: the film's play key leaves
      // the tab order (but not the DOM) once the film has started.
      const nodes = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (n) => n.tabIndex >= 0 && n.getClientRects().length > 0,
      )
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
    if (dismiss) onClose("drag")
  }

  /* While the room is dark, the first tap outside the film only turns the
     lights back on; it never closes anything. */
  const onSheetClick = (e: MouseEvent<HTMLDivElement>) => {
    if (house !== "down") return
    if (!(e.target as HTMLElement).closest(".ab-case-film")) setHouse("up")
  }
  const onBackdropClick = () => (house === "down" ? setHouse("up") : onClose())

  const c = openKey ? cases[openKey] : renderedKey ? cases[renderedKey] : null
  const open = openKey != null

  return (
    <>
      <div
        className={`ab-case-backdrop${open ? " open" : ""}`}
        data-house={house}
        aria-hidden="true"
        onClick={onBackdropClick}
      />
      <div
        ref={sheetRef}
        className={`ab-case-modal${open ? " open" : ""}`}
        data-house={house}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        aria-hidden={open ? "false" : "true"}
        onClick={onSheetClick}
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
            <span className="ab-sheet-kick ab-mono">{c?.facet ?? t("modal.caseStudy")}</span>
            <button ref={closeBtnRef} type="button" className="ab-case-close" onClick={() => onClose()}>
              {t("modal.close")}
            </button>
          </div>

          {c && (
            <article className="ab-sheet-body">
              <div className="ab-sheet-hero">
                {c.film ? (
                  // Keyed: a new case is a new film, so its started state resets.
                  <CaseFilm key={c.film.src} film={c.film} name={c.name} />
                ) : (
                  <div className={`ab-sheet-still${c.poster.portrait ? " portrait" : ""}`}>
                    {/* images.unoptimized is load-bearing on Amplify, so next/image buys nothing. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.poster.src} alt="" width={c.poster.w} height={c.poster.h} />
                  </div>
                )}
              </div>

              <div className="ab-sheet-main">
                <header className="ab-sheet-head">
                  <div>
                    <h2 className="ab-case-title ab-display" id="case-title">
                      {c.name}
                    </h2>
                    <p className="ab-case-it">{c.titleIt}</p>
                  </div>
                  {c.actions.length > 0 && (
                    <div className="ab-keys ab-case-actions">
                      {c.actions.map((a) => (
                        <a
                          key={a.label}
                          className={`ab-key ${a.kind} sm`}
                          href={a.href}
                          target={a.ext ? "_blank" : undefined}
                          rel={a.ext ? "noopener noreferrer" : undefined}
                        >
                          {a.label}
                        </a>
                      ))}
                    </div>
                  )}
                </header>

                <p className="ab-case-lead">
                  {t.rich(`cases.${c.key}.descRich`, { it: (chunks) => <strong>{chunks}</strong> })}
                </p>

                <dl className="ab-sheet-facts">
                  {FACT_ORDER.map((i) => {
                    const [k, v] = c.meta[i]
                    return (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{LIST_FACTS.has(i) ? asList(v) : v}</dd>
                      </div>
                    )
                  })}
                </dl>

                {c.story && (
                  <div className="ab-case-deep">
                    <section aria-labelledby="case-story-h">
                      <h3 id="case-story-h">{t("modal.story")}</h3>
                      <div className="ab-case-beats">
                        {c.story.map(([label, body]) => (
                          <p key={label}>
                            <b>{label}</b> {body}
                          </p>
                        ))}
                      </div>
                    </section>
                    {c.highlights && c.highlights.length > 0 && (
                      <section aria-labelledby="case-detail-h">
                        <h3 id="case-detail-h">{t("modal.detail")}</h3>
                        <ul className="ab-case-highlights">
                          {c.highlights.map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>
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
              </div>
            </article>
          )}
        </div>
      </div>
    </>
  )
}
