"use client"

import { useEffect, useRef, useState } from "react"

/* A web port of Jugo's island: the same choreography the macOS app runs, driven by
   the same spring curves (see the --jg-* easings in globals.css, generated from
   SwiftUI's spring(duration:bounce:)).

   Width and height open on separate springs, so the notch stretches sideways first
   and then drops, instead of scaling up like a rectangle. Content arrives a beat
   later in a short stagger. While charging, the ring keeps advancing to a full lap.

   Plays only while on screen (IntersectionObserver + page visibility). Under
   prefers-reduced-motion it holds the first alert open and never loops. */

export type IslandAlert = {
  title: string
  subtitle: string
  level: number
  tone: "charging" | "full" | "low"
}

type Phase = { open: boolean; content: boolean; ringLevel: number; advancing: boolean; nudge: boolean }

const CLOSED: Phase = { open: false, content: false, ringLevel: 0, advancing: false, nudge: false }

/* Milliseconds, mirroring Motion.swift in the app. */
const CONTENT_DELAY = 90
const RING_DELAY = 420
const DWELL = 3000
const COLLAPSE_DELAY = 80
const GAP = 900
const NUDGE_DELAY = 420

// Expanded island geometry, in design pixels (scaled by --u in CSS).
const W = 372
const H = 98
const TOP = 32
const R = 30
const INSET = 3.25
const RR = R - INSET
const RING_PATH =
  `M ${INSET} ${TOP} L ${INSET} ${H - INSET - RR} ` +
  `A ${RR} ${RR} 0 0 0 ${INSET + RR} ${H - INSET} ` +
  `L ${W - INSET - RR} ${H - INSET} ` +
  `A ${RR} ${RR} 0 0 0 ${W - INSET} ${H - INSET - RR} L ${W - INSET} ${TOP}`

export default function JugoIsland({ alerts, label }: { alerts: IslandAlert[]; label: string }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(CLOSED)
  const [playing, setPlaying] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  // Only animate while the stage is actually visible.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let inView = false
    const update = () => setPlaying(inView && document.visibilityState === "visible")
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        update()
      },
      { threshold: 0.35 },
    )
    observer.observe(stage)
    document.addEventListener("visibilitychange", update)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", update)
    }
  }, [])

  useEffect(() => {
    const first = alerts[0]
    if (reduced) {
      setIndex(0)
      setPhase({ open: true, content: true, ringLevel: first.level, advancing: false, nudge: false })
      return
    }
    if (!playing) return

    let cancelled = false
    const timers: number[] = []
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => !cancelled && fn(), ms))

    const run = (i: number) => {
      const alert = alerts[i]
      setIndex(i)
      setPhase({ ...CLOSED, ringLevel: alert.level })
      at(40, () => setPhase((p) => ({ ...p, open: true })))
      at(40 + CONTENT_DELAY, () => setPhase((p) => ({ ...p, content: true })))
      if (alert.tone === "charging") {
        at(40 + RING_DELAY, () => setPhase((p) => ({ ...p, ringLevel: 100, advancing: true })))
      }
      if (alert.tone === "low") {
        at(40 + NUDGE_DELAY, () => setPhase((p) => ({ ...p, nudge: true })))
      }
      at(40 + DWELL, () => setPhase((p) => ({ ...p, content: false })))
      at(40 + DWELL + COLLAPSE_DELAY, () => setPhase((p) => ({ ...p, open: false })))
      at(40 + DWELL + COLLAPSE_DELAY + GAP, () => run((i + 1) % alerts.length))
    }
    run(0)

    return () => {
      cancelled = true
      timers.forEach(window.clearTimeout)
      setPhase(CLOSED)
    }
  }, [alerts, playing, reduced])

  const alert = alerts[index]
  const advanceMs = DWELL - RING_DELAY

  return (
    <div className="jg-stage" ref={stageRef} role="img" aria-label={label}>
      <div className="jg-screen">
        <div className="jg-menubar" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
          <i />
          <i />
        </div>
        <div
          className={`jg-island${phase.open ? " is-open" : ""}${phase.content ? " shows-content" : ""}${phase.nudge ? " is-nudging" : ""}`}
          data-tone={alert.tone}
          aria-hidden="true"
        >
          <svg className="jg-ring" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <path className="track" d={RING_PATH} pathLength={100} />
            <path
              className="level"
              d={RING_PATH}
              pathLength={100}
              style={{
                strokeDashoffset: 100 - phase.ringLevel,
                transitionDuration: phase.advancing ? `${advanceMs}ms` : "0ms",
              }}
            />
          </svg>
          <div className="jg-island-content">
            <BatteryGlyph level={alert.level} charging={alert.tone === "charging"} />
            <div className="jg-island-text">
              <strong>{alert.title}</strong>
              <span>{alert.subtitle}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BatteryGlyph({ level, charging }: { level: number; charging: boolean }) {
  const fill = Math.max(2.5, (26 * level) / 100)
  return (
    <svg className="jg-glyph" viewBox="0 0 44 16" aria-hidden="true">
      {charging && <path className="bolt" d="M4.6 1 1 9h3l-1 6 5-8.4H5L6.8 1z" />}
      <rect className="body" x="11" y="1.25" width="29" height="13.5" rx="4" />
      <rect className="fill" x="12.75" y="3" width={fill} height="10" rx="2.6" />
      <rect className="nub" x="41" y="5.5" width="2" height="5" rx="1" />
    </svg>
  )
}
