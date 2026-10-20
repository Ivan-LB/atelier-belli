// Renders the share cards in scripts/og/*.html to the PNGs the metadata points at.
// Run with `pnpm og:render`. Needs network for Google Fonts and Playwright's
// Chromium (already installed for the e2e suite).
import { chromium } from "@playwright/test"
import { writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "../..")

const CARDS = [
  { src: "home.html", out: "public/og.png" },
  { src: "jugo.html", out: "public/og-jugo.png" },
]

// Every face the cards set text in, at a weight they use.
const FACES = ['760 40px "Archivo"', '400 20px "Atkinson Hyperlegible Next"', '700 20px "Atkinson Hyperlegible Next"']

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  const shots = []
  for (const card of CARDS) {
    await page.goto(`file://${path.join(here, card.src)}`, { waitUntil: "networkidle" })
    // document.fonts.check() passes vacuously when no @font-face matches (the
    // Google Fonts stylesheet never arrived), so load each face and require a
    // real, loaded match.
    const missing = await page.evaluate(async (faces) => {
      const failed = []
      for (const spec of faces) {
        const matched = await document.fonts.load(spec)
        if (!matched.length || matched.some((face) => face.status !== "loaded")) failed.push(spec)
      }
      return failed
    }, FACES)
    if (missing.length) throw new Error(`${card.src}: web fonts did not load (${missing.join(", ")}); refusing to render with a fallback face`)
    const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src))
    if (broken.length) throw new Error(`${card.src}: images failed to load: ${broken.join(", ")}`)
    shots.push({ out: card.out, png: await page.screenshot({ type: "png" }) })
  }
  // Written only once every card has rendered, so a failure never leaves a
  // fresh card next to a stale one.
  for (const shot of shots) {
    await writeFile(path.join(root, shot.out), shot.png)
    console.log(`wrote ${shot.out}`)
  }
} finally {
  await browser.close()
}
