import { test, expect } from "@playwright/test";

/**
 * Head + sitemap coverage (plan 010).
 *
 * legal.spec.ts and support.spec.ts assert bodies and routing; neither looks at
 * <head>, so nothing here overlaps them. Two regressions this suite exists to
 * catch:
 *
 *  1. The sitemap used to emit `${BASE}/${locale}${path}/` for en+es, so all 22
 *     <loc> values were 307 redirects and not one real URL appeared in it.
 *  2. The root layout was the only metadata export in the tree, so every legal
 *     and support page presented as the homepage, including the pages App
 *     Review opens.
 */

// The canonical route list, exactly as app/sitemap.ts emits it.
const ROUTES = [
  "/",
  "/privacy/",
  "/privacy/choices/",
  "/terms/",
  "/alisio/privacy/",
  "/fave/privacy/",
  "/fave/support/",
  "/fingo/privacy/",
  "/fingo/support/",
  "/savely/privacy/",
  "/savely/support/",
];

const SUB_ROUTES = ROUTES.filter((path) => path !== "/");

const SITE_NAME = "Atelier Belli";

async function spanishPage(browser: import("@playwright/test").Browser) {
  const context = await browser.newContext();
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "es", url: "http://localhost:3100" },
  ]);
  return { context, page: await context.newPage() };
}

/* Selectors are NOT scoped to <head>. The dev server streams metadata into the
   body and React hoists it into <head> only at hydration, so a `head meta[...]`
   locator races the hydration boundary and times out on a cold-compiled route.
   An unscoped selector is correct before and after the hoist, and in the
   production build where Next emits the tags in <head> to begin with. */
function metaContent(page: import("@playwright/test").Page, name: string) {
  return page.locator(`meta[name="${name}"]`).first().getAttribute("content");
}

// ── Sitemap ─────────────────────────────────────────────────────────────────

test("sitemap lists exactly the 11 canonical routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);

  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  expect(locs).toHaveLength(ROUTES.length);
  expect(new Set(locs).size).toBe(ROUTES.length);
  expect(locs.sort()).toEqual(
    ROUTES.map((path) => `https://atelierbelli.com${path}`).sort()
  );
});

test("sitemap contains no locale-prefixed URL and no hreflang alternates", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();

  // localePrefix is "never" (PR #45): /en/* and /es/* only ever redirect.
  expect(xml).not.toMatch(/atelierbelli\.com\/(en|es)\//);
  // Alternates were removed by design; Spanish has no URL of its own.
  expect(xml).not.toContain("xhtml:link");
  expect(xml).not.toContain("hreflang");
});

// ── Per-route titles and descriptions ───────────────────────────────────────

test("the homepage keeps the bare site name as its title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(SITE_NAME);
});

for (const path of SUB_ROUTES) {
  test(`${path} has its own title and description`, async ({ page }) => {
    await page.goto(path);

    const title = await page.title();
    expect(title).not.toBe(SITE_NAME);
    // The root layout's template appends the site name to each bare title.
    expect(title.endsWith(`— ${SITE_NAME}`)).toBe(true);
    expect(title.replace(`— ${SITE_NAME}`, "").trim().length).toBeGreaterThan(0);

    const description = await metaContent(page, "description");
    expect(description).toBeTruthy();
    expect((description ?? "").length).toBeGreaterThan(50);
  });
}

test("every route's title is distinct", async ({ page }) => {
  const titles: string[] = [];
  for (const path of ROUTES) {
    await page.goto(path);
    titles.push(await page.title());
  }
  expect(new Set(titles).size).toBe(ROUTES.length);
});

test("descriptions are localized, not just the titles", async ({ page, browser }) => {
  await page.goto("/savely/privacy/");
  const en = await metaContent(page, "description");
  expect(en).toContain("Savely tracks your money");

  const { context, page: esPage } = await spanishPage(browser);
  await esPage.goto("/savely/privacy/");
  const es = await metaContent(esPage, "description");
  await context.close();

  // The Spanish copy for this route, not the English fallback leaking through.
  expect(es).toContain("Savely registra tu dinero");
  expect(es).not.toBe(en);
});

test("the shared /privacy description describes the website, not the apps", async ({
  page,
}) => {
  // /privacy became website-only in plan 009. Its scope is the NEXT_LOCALE
  // cookie, the ab_theme entry and hosting — never what an app collects.
  await page.goto("/privacy/");
  const description = (await metaContent(page, "description")) ?? "";
  expect(description).toContain("cookie");
  expect(description).not.toMatch(/\b(Alisio|Fave|Fingo|Savely)\b/);
});

// ── Icons and theme colour ──────────────────────────────────────────────────

test("favicon.ico is served and is a real .ico", async ({ request }) => {
  const response = await request.get("/favicon.ico");
  expect(response.status()).toBe(200);

  // ICO magic number: 00 00 01 00, then a little-endian image count.
  const body = await response.body();
  expect([...body.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
  expect(body.readUInt16LE(4)).toBeGreaterThan(1);
});

test("apple-touch-icon is linked and served", async ({ page, request }) => {
  await page.goto("/");
  const href = await page
    .locator('link[rel="apple-touch-icon"]')
    .first()
    .getAttribute("href");
  expect(href).toBe("/apple-touch-icon.png");

  const response = await request.get("/apple-touch-icon.png");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("theme-color is a light/dark pair rather than one hardcoded value", async ({
  page,
}) => {
  await page.goto("/");
  const tags = page.locator('meta[name="theme-color"]');
  await expect(tags).toHaveCount(2);

  const media = await tags.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("media"))
  );
  expect(media).toContain("(prefers-color-scheme: light)");
  expect(media).toContain("(prefers-color-scheme: dark)");
});

// ── Alternates stay removed ─────────────────────────────────────────────────

test("no route emits hreflang or a canonical link", async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  }
});
