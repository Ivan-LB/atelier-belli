"use client"

import { useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"

export type CaseKey =
  | "scanandtap"
  | "alisio"
  | "savely"
  | "jugo"
  | "fave"
  | "fingo"
  | "vitapath"
  | "arrhythmia"
  | "mezcal"
  | "briefmark"

// Display order of Selected Work (also the deep-link allowlist). This array is
// the single source of order: the index maps over it and `num` follows it.
export const CASE_KEYS: readonly CaseKey[] = [
  "scanandtap",
  "alisio",
  "savely",
  "jugo",
  "fave",
  "fingo",
  "vitapath",
  "arrhythmia",
  "mezcal",
  "briefmark",
]

/** Old keys that shared links may still carry. `pass` was renamed to Stampi,
    and Stampi to Scan&Tap on 2026-10-18; `blip` was retired and falls through
    to "no case". */
export const LEGACY_CASE_KEYS: Record<string, CaseKey> = { pass: "scanandtap", stampi: "scanandtap" }

export type CaseAction = {
  label: string
  href: string
  kind: "primary" | "ghost"
  ext?: boolean
  icon?: "external" | "help" | "shield"
}

/** Demo media for a case: a captured clip, or a strip of real screenshots. */
export type CaseMedia =
  | {
      kind: "video"
      src: string
      poster: string
      w: number
      h: number
      /** `bare` = no device chrome, natural aspect (multi-surface composites). */
      frame: "browser" | "phone" | "bare"
      url?: string
      caption: string
    }
  | {
      kind: "gallery"
      wide?: boolean
      items: Array<{ src: string; w: number; h: number }>
      caption: string
    }

/** A case's launch film: 16:9, with sound, so it only ever plays on request. */
export type CaseFilmData = { src: string; poster: string }

const film = (key: string): CaseFilmData => ({
  src: `/cases/film/${key}.mp4`,
  poster: `/cases/film/${key}-poster.webp`,
})

export const FILMS = {
  // The files still show the old "stampi." wordmark and need a new capture.
  scanandtap: film("stampi"),
  alisio: film("alisio"),
  savely: film("savely"),
  // The /jugo landing already ships this film; one copy serves both pages.
  jugo: { src: "/cases/video/jugo-launch.mp4", poster: "/cases/video/jugo-launch-poster.webp" },
  fave: film("fave"),
  fingo: film("fingo"),
  vitapath: film("vitapath"),
  arrhythmia: film("arrhythmia"),
} satisfies Partial<Record<CaseKey, CaseFilmData>>

/** The showcase reel: shipped products only, each a silent 12s cut of its film. */
export const REEL_KEYS = ["scanandtap", "alisio", "savely", "fave", "fingo", "jugo"] as const
export type ReelKey = (typeof REEL_KEYS)[number]

/** Status kind behind the card's pill: live is unmarked, `pre` (pre-revenue,
    prototype, demo) gets a solid dot, `paused` a ring. The pill's TEXT is
    `cases.<key>.mshowStatus`; this only picks the mark. */
export type CaseStatus = "live" | "pre" | "paused"

/** The 16:9 (or portrait) image a card shows in its poster well. */
export type CasePoster = { src: string; w: number; h: number; portrait?: boolean }

/** Cases without a launch film show a still instead. */
const STILLS = {
  mezcal: { src: "/cases/mezcal-hero.webp", w: 1600, h: 1000 },
  briefmark: { src: "/cases/briefmark-hero.webp", w: 600, h: 1304, portrait: true },
} satisfies Partial<Record<CaseKey, CasePoster>>

/** Film posters are 1280x720 except Jugo's shared launch poster. */
const FILM_POSTER_SIZE: Partial<Record<CaseKey, { w: number; h: number }>> = {
  jugo: { w: 1600, h: 900 },
}

function posterOf(key: CaseKey): CasePoster {
  const still = (STILLS as Partial<Record<CaseKey, CasePoster>>)[key]
  if (still) return still
  const f = (FILMS as Partial<Record<CaseKey, CaseFilmData>>)[key]
  const size = FILM_POSTER_SIZE[key] ?? { w: 1280, h: 720 }
  return { src: f?.poster ?? "", ...size }
}

/** The status mark shared by the cards and the reel caption. */
export function StatusPill({ status, label }: { status: CaseStatus; label: string }) {
  return <span className={`ab-status ${status}`}>{label}</span>
}

export type CaseData = {
  key: CaseKey
  num: string
  /** Display name, e.g. "Scan&Tap". The modal and index append `titleIt`. */
  name: string
  titleIt: string
  tag: string
  year: string
  flagship: boolean
  status: CaseStatus
  /** Pill text (`cases.<key>.mshowStatus`). */
  statusLabel: string
  /** Platform for the reel caption, comma-separated (no middle-dot runs). */
  platformText: string
  poster: CasePoster
  kicker: string
  facet: string
  desc: React.ReactNode
  meta: Array<[string, string]>
  /** Index chips: a strict subset of the Stack row. */
  chips: string[]
  actions: CaseAction[]
  /** problem → approach → result. Flagship cases only, always with highlights. */
  story?: Array<[string, string]>
  highlights?: string[]
  media?: CaseMedia[]
  film?: CaseFilmData
}

type Def = {
  name: string
  year: string
  platform: string | null // literal, or null to read cases.<key>.metaPlatform
  stack: string
  chips: string[]
  actions: Array<Omit<CaseAction, "label"> & { labelKey: string }>
  status: CaseStatus
  flagship?: boolean
  media?: (t: (k: string) => string) => CaseMedia[]
}

const store = (href: string) => ({
  labelKey: "actionPrimary",
  href,
  kind: "primary" as const,
  ext: true,
  icon: "external" as const,
})
const support = (app: string) => ({
  labelKey: "actionGhost",
  href: `/${app}/support`,
  kind: "ghost" as const,
  icon: "help" as const,
})
const privacy = (app: string) => ({
  labelKey: "actionPrivacy",
  href: `/${app}/privacy`,
  kind: "ghost" as const,
  icon: "shield" as const,
})

const DEFS: Record<CaseKey, Def> = {
  scanandtap: {
    name: "Scan&Tap",
    status: "live",
    year: "2026",
    platform: null,
    stack: "Node.js · AWS Lambda · DynamoDB · PassKit",
    chips: ["AWS Lambda", "DynamoDB", "PassKit"],
    actions: [store("https://usescanandtap.com/")],
    flagship: true,
  },
  alisio: {
    name: "Alisio",
    status: "live",
    year: "2026",
    platform: "iOS 17+ · watchOS 10+",
    stack: "SwiftUI · HealthKit · WatchConnectivity",
    chips: ["SwiftUI", "HealthKit", "WatchConnectivity"],
    actions: [
      store("https://apps.apple.com/mx/app/alisio/id6793006694"),
      support("alisio"),
      privacy("alisio"),
    ],
    flagship: true,
    media: (t) => [
      {
        kind: "video",
        src: "/cases/video/alisio-system.mp4",
        poster: "/cases/video/alisio-system-poster.webp",
        w: 740,
        h: 740,
        frame: "bare",
        caption: t("cases.alisio.mediaCaption"),
      },
      {
        kind: "gallery",
        items: [1, 2, 3, 4].map((i) => ({ src: `/cases/gallery/alisio-w${i}.webp`, w: 416, h: 496 })),
        caption: t("cases.alisio.watchCaption"),
      },
    ],
  },
  savely: {
    name: "Savely",
    status: "live",
    year: "2026",
    platform: "iOS 26+",
    stack: "SwiftUI · SwiftData · Vision",
    chips: ["SwiftUI", "SwiftData", "Vision"],
    actions: [
      store("https://apps.apple.com/mx/app/savely-save-with-intention/id6738074836"),
      support("savely"),
      privacy("savely"),
    ],
    flagship: true,
    media: (t) => [
      {
        kind: "gallery",
        items: [1, 2, 3].map((i) => ({ src: `/cases/gallery/savely-p${i}.webp`, w: 420, h: 913 })),
        caption: t("cases.savely.galleryCaption"),
      },
    ],
  },
  jugo: {
    name: "Jugo",
    status: "live",
    year: "2026",
    platform: "macOS 26+",
    stack: "SwiftUI · IOKit · WidgetKit · Sparkle",
    chips: ["SwiftUI", "IOKit", "WidgetKit"],
    // Internal landing, not a store: it carries the download and the film.
    actions: [{ labelKey: "actionPrimary", href: "/jugo", kind: "primary" }],
  },
  fave: {
    name: "Fave",
    status: "live",
    year: "2026",
    platform: "iOS 17+",
    stack: "SwiftUI · SwiftData · CloudKit",
    chips: ["SwiftUI", "SwiftData", "CloudKit"],
    actions: [
      store("https://apps.apple.com/mx/app/fave-your-top-lists/id6799850131"),
      support("fave"),
      privacy("fave"),
    ],
  },
  fingo: {
    name: "Fingo",
    status: "live",
    year: "2025",
    platform: "iOS 26+",
    stack: "SwiftUI · Combine · Core Haptics",
    chips: ["SwiftUI", "Combine", "Core Haptics"],
    actions: [
      store("https://apps.apple.com/mx/app/fingo-group-choice-made-easy/id6747301883"),
      support("fingo"),
      privacy("fingo"),
    ],
  },
  vitapath: {
    name: "Vitapath",
    status: "pre",
    year: "2026",
    platform: "iOS 26+ · iOS 17+ · Web",
    stack: "SwiftUI · Spring Boot · PostGIS · STOMP",
    chips: ["SwiftUI", "Spring Boot", "PostGIS"],
    // Four private repos and nothing hosted: no honest link to offer yet.
    actions: [],
    flagship: true,
    media: (t) => [
      {
        kind: "video",
        src: "/cases/video/vitapath-system.mp4",
        poster: "/cases/video/vitapath-system-poster.webp",
        w: 1740,
        h: 760,
        frame: "bare",
        caption: t("cases.vitapath.mediaCaption"),
      },
      {
        kind: "gallery",
        items: [1, 2, 3].map((i) => ({ src: `/cases/gallery/vitapath-p${i}.webp`, w: 420, h: 913 })),
        caption: t("cases.vitapath.galleryCaption"),
      },
    ],
  },
  arrhythmia: {
    name: "Arrhythmia Detector",
    status: "pre",
    year: "2026",
    platform: null,
    stack: "TensorFlow · FastAPI · Next.js · TypeScript",
    chips: ["TensorFlow", "FastAPI", "Next.js"],
    actions: [store("https://github.com/Ivan-LB/arrhythmia-detector-backend")],
    flagship: true,
    media: (t) => [
      {
        kind: "video",
        src: "/cases/video/arrhythmia-demo.mp4",
        poster: "/cases/video/arrhythmia-demo-poster.webp",
        w: 1120,
        h: 700,
        frame: "browser",
        url: "arrhythmia-detector",
        caption: t("cases.arrhythmia.mediaCaption"),
      },
      {
        kind: "gallery",
        wide: true,
        items: [
          { src: "/cases/gallery/arrhythmia-01.webp", w: 760, h: 642 },
          { src: "/cases/gallery/arrhythmia-02.webp", w: 760, h: 946 },
        ],
        caption: t("cases.arrhythmia.galleryCaption"),
      },
    ],
  },
  mezcal: {
    name: "Destilería Lorenzana",
    status: "live",
    year: "2025",
    platform: null,
    stack: "Next.js · TypeScript · Tailwind",
    chips: ["Next.js", "TypeScript", "Tailwind"],
    actions: [store("https://www.destilerialorenzana.com/")],
  },
  briefmark: {
    name: "Briefmark",
    status: "paused",
    year: "2026",
    platform: "iOS 26.2+",
    stack: "SwiftUI · Node.js · Claude API",
    chips: ["SwiftUI", "Node.js", "Claude API"],
    actions: [],
  },
}

export function useCases(): Record<CaseKey, CaseData> {
  const t = useTranslations("home")

  /* `Platform · Domain`, localized. The kicker appends the year and the mobile
     index line appends the status, so both come from these two keys. */
  const facetOf = useCallback(
    (key: CaseKey) => `${t(`cases.${key}.kickerPlatform`)} · ${t(`cases.${key}.kickerDomain`)}`,
    [t],
  )

  return useMemo(() => {
    const entries = CASE_KEYS.map((key, i): [CaseKey, CaseData] => {
      const d = DEFS[key]
      const k = (field: string) => `cases.${key}.${field}`
      const platform = d.platform ?? t(k("metaPlatform"))
      const data: CaseData = {
        key,
        num: String(i + 1).padStart(2, "0"),
        name: d.name,
        titleIt: t(k("titleIt")),
        tag: t(k("tag")),
        year: d.year,
        flagship: Boolean(d.flagship),
        status: d.status,
        statusLabel: t(k("mshowStatus")),
        platformText: platform.split(" · ").join(", "),
        poster: posterOf(key),
        facet: facetOf(key),
        kicker: `${facetOf(key)} · ${d.year}`,
        desc: t.rich(k("descRich"), { it: (chunks) => <em>{chunks}</em> }),
        meta: [
          [t("cases.meta.platform"), platform],
          [t("cases.meta.stack"), d.stack],
          [t("cases.meta.status"), t(k("metaStatus"))],
          [t("cases.meta.year"), d.year],
        ],
        chips: d.chips,
        actions: d.actions.map(({ labelKey, ...a }) => ({ ...a, label: t(k(labelKey)) })),
        film: (FILMS as Partial<Record<CaseKey, CaseFilmData>>)[key],
        media: d.media?.(t),
      }
      if (d.flagship) {
        data.story = [
          [t("cases.storyLabels.problem"), t(k("story.problem"))],
          [t("cases.storyLabels.approach"), t(k("story.approach"))],
          [t("cases.storyLabels.result"), t(k("story.result"))],
        ]
        data.highlights = t.raw(k("highlights")) as string[]
      }
      return [key, data]
    })
    return Object.fromEntries(entries) as Record<CaseKey, CaseData>
  }, [t, facetOf])
}
