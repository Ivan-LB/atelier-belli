// Renders the share cards in scripts/og/*.html to the PNGs the metadata points at.
// Run with `pnpm og:render`. Needs network for Google Fonts and Playwright's
// Chromium (already installed for the e2e suite).
import { chromium } from "@playwright/test"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "../..")

const CARDS = [
  { src: "home.html", out: "public/og.png" },
  { src: "jugo.html", out: "public/og-jugo.png" },
]

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  for (const card of CARDS) {
    await page.goto(`file://${path.join(here, card.src)}`, { waitUntil: "networkidle" })
    await page.evaluate(() => document.fonts.ready)
    const fontsOk = await page.evaluate(
      () => document.fonts.check('760 40px "Archivo"') && document.fonts.check('400 20px "Atkinson Hyperlegible Next"'),
    )
    if (!fontsOk) throw new Error(`${card.src}: web fonts did not load; refusing to render with a fallback face`)
    const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src))
    if (broken.length) throw new Error(`${card.src}: images failed to load: ${broken.join(", ")}`)
    await page.screenshot({ path: path.join(root, card.out), type: "png" })
    console.log(`wrote ${card.out}`)
  }
} finally {
  await browser.close()
}
