import type { MetadataRoute } from "next"

const BASE = "https://atelierbelli.com"
const paths = [
  "",
  "/privacy",
  "/privacy/choices",
  "/terms",
  "/alisio/privacy",
  "/fave/privacy",
  "/fave/support",
  "/fingo/privacy",
  "/fingo/support",
  "/savely/privacy",
  "/savely/support",
]

const locales = ["en", "es"] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}${path}/`,
      alternates: {
        languages: {
          en: `${BASE}/en${path}/`,
          es: `${BASE}/es${path}/`,
        },
      },
    }))
  )
}
