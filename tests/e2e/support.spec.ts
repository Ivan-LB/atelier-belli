import { test, expect } from "@playwright/test";

const SUPPORT_PAGES = ["/fingo/support/", "/savely/support/", "/fave/support/"];

// ── /fave/support exists in both languages ──────────────────────────────────
// App Store Connect requires a Support URL at submission, and Fave is
// pre-submission — this route is what that field will point at.
test("/fave/support/ renders an h1 in English by default", async ({ page }) => {
  const response = await page.goto("/fave/support/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("/fave/support/ renders Spanish when NEXT_LOCALE=es", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "es", url: "http://localhost:3100" },
  ]);
  const page = await context.newPage();
  await page.goto("/fave/support/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await context.close();
});

// ── No support page promises a destination that does not exist ──────────────
// Both shipped pages carried a "Help centre" card pointing at href="#", i.e. a
// card advertising guides that were never written.
for (const path of SUPPORT_PAGES) {
  test(`${path} has no dead links`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
  });
}

// ── Savely describes the app that actually shipped ──────────────────────────
// The page used to describe a fictional banking app (bank connections via
// "regulated aggregators"). The real Savely is local-only with no network
// reachable at all, and it is what Apple reads from the App Store listing.
test("savely support says nothing about banks", async ({ page }) => {
  await page.goto("/savely/support/");
  const body = (await page.locator("body").innerText()).toLowerCase();
  expect(body).not.toContain("bank");
  expect(body).not.toContain("aggregator");
});

test("savely support in Spanish says nothing about banks", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "es", url: "http://localhost:3100" },
  ]);
  const page = await context.newPage();
  await page.goto("/savely/support/");
  const body = (await page.locator("body").innerText()).toLowerCase();
  expect(body).not.toContain("banc");
  expect(body).not.toContain("agregador");
  await context.close();
});

// ── Fingo does not promise purchases it has never had ───────────────────────
// The FAQ told users to go to "Settings → About → Restore Purchases". Fingo
// has no StoreKit, no purchases, and no settings screen at all.
test("fingo support does not promise a restore-purchases flow", async ({ page }) => {
  await page.goto("/fingo/support/");
  const body = (await page.locator("body").innerText()).toLowerCase();
  expect(body).not.toContain("restore purchases");
});

// ── The shell's own links are unprefixed ────────────────────────────────────
// Since localePrefix: "never" the canonical URLs carry no locale; the four
// shell links used to ride the legacy /en/... redirect.
test("support shell links to unprefixed routes", async ({ page }) => {
  await page.goto("/fave/support/");
  // trailingSlash: true, so Next serves these as /privacy/ and /terms/.
  await expect(page.locator('footer.sup-foot a[href^="/privacy"]')).toHaveCount(1);
  await expect(page.locator('footer.sup-foot a[href^="/terms"]')).toHaveCount(1);
  await expect(page.locator('a[href^="/en/"], a[href^="/es/"]')).toHaveCount(0);
});

// ── The crest is the app's real icon, not a letter in a box ─────────────────
// Extracted from each app's own iOS asset catalog, so a broken path would
// silently regress the page to an invisible <img>.
for (const [path, app] of [
  ["/fingo/support/", "fingo"],
  ["/savely/support/", "savely"],
  ["/fave/support/", "fave"],
] as const) {
  test(`${path} renders the real ${app} app icon`, async ({ page }) => {
    await page.goto(path);
    const icon = page.locator(".sup-mast-icon");
    await expect(icon).toHaveAttribute("src", `/apps/${app}-icon.webp`);
    // naturalWidth is 0 when the asset failed to load.
    await expect
      .poll(() => icon.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  });
}

// ── No tracked-caps eyebrows or 01/02/03 section numbers ───────────────────
test("support pages carry no eyebrow or section-number chrome", async ({ page }) => {
  await page.goto("/savely/support/");
  await expect(page.locator(".sup-eyebrow, .sup-section-eye, .sup-faq-n")).toHaveCount(0);
  const body = await page.locator("main").innerText();
  expect(body).not.toMatch(/\b0[123]\s+[—–-]\s+/);
});

// ── The theme choice follows you off the homepage ──────────────────────────
// Support and legal pages used to be pinned to data-theme="light", so picking
// dark on the homepage and following a Support link flashed white.
for (const path of [
  "/fave/support/",
  "/savely/support/",
  "/fingo/support/",
  "/privacy/",
  "/terms/",
  "/fave/privacy/",
]) {
  test(`${path} inherits the dark theme chosen on the homepage`, async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => localStorage.setItem("ab_theme", "dark"));
    const page = await context.newPage();
    await page.goto(path);
    const root = page.locator(".sup-root, .ab-root").first();
    await expect(root).toHaveAttribute("data-theme", "dark");
    await context.close();
  });
}

// ── Fave's card links to the privacy page that exists ──────────────────────
test("the fave case offers both its support and privacy pages", async ({ page }) => {
  await page.goto("/?case=fave");
  const modal = page.locator(".ab-case-modal.open");
  await expect(modal).toBeVisible();
  await expect(modal.locator('a[href="/fave/support"]')).toHaveCount(1);
  await expect(modal.locator('a[href="/fave/privacy"]')).toHaveCount(1);
});
