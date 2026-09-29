"use client"

import { useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"

export type CaseKey =
  | "stampi"
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
  "stampi",
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

/** Old keys that shared links may still carry. `pass` was renamed to Stampi;
    `blip` was retired and falls through to "no case". */
export const LEGACY_CASE_KEYS: Record<string, CaseKey> = { pass: "stampi" }

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
  stampi: film("stampi"),
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
export const REEL_KEYS = ["stampi", "alisio", "savely", "fave", "fingo", "jugo"] as const
export type ReelKey = (typeof REEL_KEYS)[number]

export type CaseData = {
  num: string
  /** Display name, e.g. "Stampi". The modal and index append `titleIt`. */
  name: string
  titleIt: string
  tag: string
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
  stampi: {
    name: "Stampi",
    year: "2026",
    platform: null,
    stack: "Node.js · AWS Lambda · DynamoDB · PassKit",
    chips: ["AWS Lambda", "DynamoDB", "PassKit"],
    actions: [store("https://stampi.atelierbelli.com/")],
    flagship: true,
  },
  alisio: {
    name: "Alisio",
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
    year: "2026",
    platform: "macOS 26+",
    stack: "SwiftUI · IOKit · WidgetKit · Sparkle",
    chips: ["SwiftUI", "IOKit", "WidgetKit"],
    // Internal landing, not a store: it carries the download and the film.
    actions: [{ labelKey: "actionPrimary", href: "/jugo", kind: "primary" }],
  },
  fave: {
    name: "Fave",
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
    year: "2025",
    platform: null,
    stack: "Next.js · TypeScript · Tailwind",
    chips: ["Next.js", "TypeScript", "Tailwind"],
    actions: [store("https://www.destilerialorenzana.com/")],
  },
  briefmark: {
    name: "Briefmark",
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
      const data: CaseData = {
        num: String(i + 1).padStart(2, "0"),
        name: d.name,
        titleIt: t(k("titleIt")),
        tag: t(k("tag")),
        facet: facetOf(key),
        kicker: `${facetOf(key)} · ${d.year}`,
        desc: t.rich(k("descRich"), { it: (chunks) => <em>{chunks}</em> }),
        meta: [
          [t("cases.meta.platform"), d.platform ?? t(k("metaPlatform"))],
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
