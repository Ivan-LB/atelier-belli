"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import type { CaseFilmData, CaseKey, CaseMedia } from "./cases"

export const PLAY_GLYPH = (
  <svg className="ab-play-glyph" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5v13l10.5-6.5z" />
  </svg>
)

/**
 * The case's launch film, as the sheet's hero. It carries sound, so it never
 * plays on its own: the poster sits behind one play button, and
 * `preload="none"` means not a byte is fetched until someone asks. Native
 * controls take over once it starts, because a two-minute film with audio
 * needs a scrubber and a volume. The play() call happens inside the click
 * handler on purpose: Safari refuses an unmuted play() outside a user gesture.
 */
export function CaseFilm({ film, name }: { film: CaseFilmData; name: string }) {
  const t = useTranslations("home")
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [started, setStarted] = useState(false)

  const start = () => {
    const v = videoRef.current
    if (!v) return
    setStarted(true)
    void v.play().catch(() => setStarted(false))
    v.focus({ preventScroll: true })
  }

  return (
    <div className="ab-case-film" data-started={started ? "true" : "false"}>
      <video
        ref={videoRef}
        className="ab-case-film-video"
        poster={film.poster}
        width={1920}
        height={1080}
        preload="none"
        playsInline
        controls={started}
        aria-label={`${name}: ${t("modal.film")}`}
        tabIndex={started ? 0 : -1}
      >
        <source src={film.src} type="video/mp4" />
      </video>
      <button
        type="button"
        className="ab-film-play"
        onClick={start}
        tabIndex={started ? -1 : 0}
        aria-hidden={started ? "true" : undefined}
      >
        <span className="disc">{PLAY_GLYPH}</span>
        <span className="lbl">{t("modal.playFilm")}</span>
      </button>
    </div>
  )
}

/**
 * Demo clip. `preload="none"` means nothing is fetched until the band scrolls
 * into view, and playback is tied to visibility so an open modal never keeps a
 * hidden video decoding. Reduced motion gets a poster plus real controls
 * instead of autoplay.
 */
export function CaseVideo({ media }: { media: Extract<CaseMedia, { kind: "video" }> }) {
  const t = useTranslations("home")
  const ref = useRef<HTMLVideoElement | null>(null)
  const [reduced, setReduced] = useState(false)
  /* WCAG 2.2.2: these clips run 9-17s and loop forever. Autoplaying motion that
     long with no way to stop it is a failure, so the default path gets a real
     toggle. The reduced-motion path already ships native controls. */
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Once the viewer has pressed pause, scrolling must not undo it.
          if (entry.isIntersecting && !paused) void el.play().catch(() => {})
          else el.pause()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      // Turning reduce-motion on mid-session used to leave a clip playing,
      // because this cleanup only disconnected the observer.
      el.pause()
    }
  }, [reduced, paused])

  const toggle = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      void el.play().catch(() => {})
      setPaused(false)
    } else {
      el.pause()
      setPaused(true)
    }
  }

  const video = (
    <video
      ref={ref}
      /* A `bare` composite is as wide as its devices need. The Vitapath one is
         2.3:1 and fills 920px happily; the Alisio one is square, and at 920px it
         would render ~900px tall and push its own caption off the fold. Cap the
         width for anything squarer than 1.4:1 instead of letterboxing it. */
      className={`ab-case-video${media.frame === "phone" ? " portrait" : ""}${
        media.frame === "bare" ? (media.w / media.h < 1.4 ? " bare bare-square" : " bare") : ""
      }`}
      poster={media.poster}
      width={media.w}
      height={media.h}
      /* Under reduced motion this becomes a focusable media widget, and an
         unnamed one is announced as just "video". */
      aria-label={media.caption}
      muted
      loop
      playsInline
      preload="none"
      controls={reduced}
    >
      <source src={media.src} type="video/mp4" />
    </video>
  )

  const framed =
    media.frame === "phone" ? (
      <div className="ab-phone-img">{video}</div>
    ) : media.frame === "bare" ? (
      video
    ) : (
      <div className="ab-browser-frame has-shot">
        <div className="ab-browser-bar">
          <span className="bdot" />
          <span className="bdot" />
          <span className="bdot" />
          <span className="url">{media.url}</span>
        </div>
        {video}
      </div>
    )

  return (
    <div className="ab-case-clip">
      {framed}
      {!reduced && (
        <button
          type="button"
          className="ab-case-clip-toggle"
          onClick={toggle}
          aria-label={paused ? t("modal.playClip") : t("modal.pauseClip")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {paused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h3v14H7zM14 5h3v14h-3z" />}
          </svg>
        </button>
      )}
    </div>
  )
}

/** Horizontal strip of real captures. Scrollable by pointer, wheel and keyboard. */
export function CaseGallery({ media }: { media: Extract<CaseMedia, { kind: "gallery" }> }) {
  const t = useTranslations("home")
  const ref = useRef<HTMLDivElement | null>(null)
  /* Only a strip that actually overflows is worth a tab stop. At desktop widths
     none of them do, so `tabIndex={0}` was a dead stop that landed the user on
     a group they could not scroll. */
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth + 1)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`ab-case-gallery${media.wide ? " wide" : ""}`}
      role="group"
      /* Deliberately NOT media.caption: that string is already the figcaption
         right below, so a screen reader read the same 159-188 char sentence
         twice and then entered a group whose images are all alt="". */
      aria-label={t("modal.galleryAria")}
      tabIndex={scrollable ? 0 : undefined}
    >
      {media.items.map((item) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img key={item.src} src={item.src} alt="" width={item.w} height={item.h} loading="lazy" />
      ))}
    </div>
  )
}

/* The two cases without a film show a still instead. No `useTranslations`:
   every URL bar is a real domain or a lowercase slug, never translated copy. */
export function CasePreview({ which }: { which: CaseKey }) {
  if (which === "briefmark") {
    return (
      <div className="ab-phone-img briefmark" aria-hidden="true" style={{ ["--w" as any]: "280px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cases/briefmark-hero.webp" alt="" width={600} height={1304} loading="lazy" />
      </div>
    )
  }
  return (
    <div className="ab-browser-frame has-shot" aria-hidden="true">
      <div className="ab-browser-bar">
        <span className="bdot" />
        <span className="bdot" />
        <span className="bdot" />
        <span className="url">destilerialorenzana.com</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ab-browser-shot" src="/cases/mezcal-hero.webp" alt="" width={1600} height={1000} loading="lazy" />
    </div>
  )
}
