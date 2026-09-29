"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { REEL_KEYS, type CaseData, type CaseKey } from "./cases"

type Props = {
  cases: Record<CaseKey, CaseData>
  onOpen: (key: CaseKey, trigger: HTMLElement) => void
}

const reelSrc = (key: string) => `/cases/reel/${key}.mp4`
const reelPoster = (key: string) => `/cases/reel/${key}-poster.webp`

/**
 * The shipped work, as a reel. One silent 12-second cut of each launch film
 * plays at a time; when it ends the track moves on. The track is native scroll
 * with snap points, so a swipe has the platform's own momentum and can be
 * caught mid-flight; the dots below are the same state seen from a remote.
 *
 * Only the centred slide ever has a video loading. Everything pauses when the
 * section leaves the viewport or the tab is hidden, and reduced motion starts
 * paused on posters, with the same controls to play it by hand.
 */
export function Showcase({ cases, onOpen }: Props) {
  const t = useTranslations("home")
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const fillRefs = useRef<Array<HTMLSpanElement | null>>([])
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [inView, setInView] = useState(false)

  // Reduced motion: start on posters. The control still plays it on request.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false)
  }, [])

  // Which slide is centred. The observer only says *when* to look; the answer
  // is always the slide whose centre is nearest the track's, never "the last
  // one that crossed 60% visible", which on a wide screen can be a neighbour.
  // Rooted on the track, so it follows swipes, wheels and programmatic moves
  // alike without a scroll handler.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const pickNearest = () => {
      const r = track.getBoundingClientRect()
      const mid = r.left + r.width / 2
      let best = 0
      let bestDist = Infinity
      track.querySelectorAll<HTMLElement>(".ab-reel-slide").forEach((el, i) => {
        const s = el.getBoundingClientRect()
        const d = Math.abs(s.left + s.width / 2 - mid)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      setActive(best)
    }
    const io = new IntersectionObserver(pickNearest, {
      root: track,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    })
    track.querySelectorAll(".ab-reel-slide").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 })
    io.observe(section)
    const onVis = () => setInView(document.visibilityState === "visible" && isOnScreen(section))
    document.addEventListener("visibilitychange", onVis)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  const goTo = useCallback((i: number, smooth = true) => {
    const track = trackRef.current
    const slide = track?.querySelectorAll<HTMLElement>(".ab-reel-slide")[i]
    if (!track || !slide) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // Centre to centre, from live rects. `offsetLeft` ignores the track's own
    // scroll, and a receded slide is scaled, but a scale around its centre
    // leaves the centre where it was, so this holds for any slide.
    const s = slide.getBoundingClientRect()
    const r = track.getBoundingClientRect()
    track.scrollTo({
      left: track.scrollLeft + (s.left + s.width / 2) - (r.left + r.width / 2),
      behavior: smooth && !reduced ? "smooth" : "auto",
    })
  }, [])

  // Play the centred clip from the top; every other clip rests on its poster.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active && playing && inView) {
        if (v.preload !== "auto") v.preload = "auto"
        void v.play().catch(() => setPlaying(false))
      } else {
        v.pause()
        if (i !== active) v.currentTime = 0
      }
    })
    fillRefs.current.forEach((f, i) => {
      if (f && i !== active) f.style.transform = "scaleX(0)"
    })
  }, [active, playing, inView])

  // Progress: read the clip's own clock each frame and scale the fill. Only a
  // transform is written, so the dots never trigger layout.
  useEffect(() => {
    if (!playing || !inView) return
    let raf = 0
    const tick = () => {
      const v = videoRefs.current[active]
      const f = fillRefs.current[active]
      if (v && f && v.duration) f.style.transform = `scaleX(${v.currentTime / v.duration})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, playing, inView])

  const onEnded = (i: number) => {
    if (i === active) goTo((active + 1) % REEL_KEYS.length)
  }

  const onSlideClick = (i: number, key: CaseKey, el: HTMLElement) => {
    // A neighbour peeking in from the side comes to the centre first; only
    // the centred piece opens, so a stray tap never lands in the wrong case.
    if (i !== active) goTo(i)
    else onOpen(key, el)
  }

  const total = REEL_KEYS.length

  return (
    <section
      ref={sectionRef}
      className="ab-reel"
      aria-roledescription={t("reel.roleCarousel")}
      aria-labelledby="reel-title"
    >
      <div className="ab-wrap ab-reel-cap">
        <div>
          <span className="eye">{t("vitrine.eyebrow")}</span>
          <h2 id="reel-title">
            <span>{t("vitrine.titlePre")}</span>
            <em>{t("vitrine.titleIt")}</em>
          </h2>
        </div>
        <p className="lede">{t("reel.lede")}</p>
      </div>

      <div ref={trackRef} className="ab-reel-track">
        {REEL_KEYS.map((key, i) => {
          const c = cases[key]
          const isActive = i === active
          return (
            <div
              key={key}
              className="ab-reel-slide"
              data-index={i}
              data-active={isActive ? "true" : "false"}
              role="group"
              aria-roledescription={t("reel.roleSlide")}
              aria-label={t("reel.slideAria", { n: i + 1, total, name: c.name })}
            >
              <button
                type="button"
                className="ab-reel-media"
                onClick={(e) => onSlideClick(i, key, e.currentTarget)}
                aria-label={isActive ? t("vitrine.open", { name: c.name }) : t("reel.goTo", { name: c.name })}
                tabIndex={isActive ? 0 : -1}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el
                  }}
                  src={reelSrc(key)}
                  poster={reelPoster(key)}
                  width={1280}
                  height={720}
                  muted
                  playsInline
                  preload={i === 0 ? "auto" : "none"}
                  onEnded={() => onEnded(i)}
                  aria-hidden="true"
                />
              </button>
              <div className="ab-reel-meta" aria-hidden={isActive ? undefined : "true"}>
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.tag}</p>
                </div>
                <span className="go">
                  {t("work.viewCase")} <span className="arr">→</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="ab-reel-controls">
        <div className="ab-reel-dots" role="group" aria-label={t("reel.dotsAria")}>
          {REEL_KEYS.map((key, i) => (
            <button
              key={key}
              type="button"
              className="ab-reel-dot"
              data-active={i === active ? "true" : "false"}
              aria-label={t("reel.goTo", { name: cases[key].name })}
              aria-current={i === active ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              <span
                className="fill"
                ref={(el) => {
                  fillRefs.current[i] = el
                }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="ab-reel-toggle"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? t("reel.pause") : t("reel.play")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
          </svg>
        </button>
      </div>
    </section>
  )
}

function isOnScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < window.innerHeight
}
