import { test, expect } from "@playwright/test";

// Every privacy/terms surface on the site. The three per-app pages shipped with
// plan 009; before that, one shared policy claimed the apps collected shipping
// addresses, credit card numbers and continuous geolocation, which contradicted
// the "No se recopilan datos" labels on the live App Store listings.
const APP_PRIVACY_PAGES = ["/alisio/privacy/", "/fingo/privacy/", "/savely/privacy/"];

const ALL_LEGAL_PAGES = [
  "/privacy/",
  "/privacy/choices/",
  "/terms/",
  "/fave/privacy/",
  ...APP_PRIVACY_PAGES,
];

async function spanishPage(browser: import("@playwright/test").Browser) {
  const context = await browser.newContext();
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "es", url: "http://localhost:3100" },
  ]);
  return { context, page: await context.newPage() };
}

// ── The three new routes exist, in both languages ───────────────────────────
// App Store Connect points at these per app, so a 404 here is a store-listing
// defect, not just a broken link.
for (const path of APP_PRIVACY_PAGES) {
  test(`${path} renders an h1 in English by default`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test(`${path} renders Spanish when NEXT_LOCALE=es`, async ({ browser }) => {
    const { context, page } = await spanishPage(browser);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await context.close();
  });
}

// ── The shared /privacy is the bridge to the four app pages ─────────────────
// Until the owner updates the privacy URLs in App Store Connect, the Alisio and
// Fingo listings still resolve here, so this section is the only way those
// readers reach the policy that actually describes their app. Do not remove it.
test("/privacy/ links all four app privacy pages", async ({ page }) => {
  await page.goto("/privacy/");
  for (const href of [
    "/alisio/privacy",
    "/fave/privacy",
    "/fingo/privacy",
    "/savely/privacy",
  ]) {
    // trailingSlash: true, so Next renders these as /alisio/privacy/ and friends.
    await expect(page.locator(`main a[href^="${href}"]`)).toHaveCount(1);
  }
});

// ── The one real practice on the website is disclosed by name ───────────────
test("/privacy/ names the NEXT_LOCALE cookie", async ({ page }) => {
  await page.goto("/privacy/");
  await expect(page.locator("main")).toContainText("NEXT_LOCALE");
});

test("/privacy/ names the NEXT_LOCALE cookie in Spanish too", async ({ browser }) => {
  const { context, page } = await spanishPage(browser);
  await page.goto("/privacy/");
  await expect(page.locator("main")).toContainText("NEXT_LOCALE");
  await context.close();
});

// ── The e-commerce boilerplate is gone ──────────────────────────────────────
// None of the apps has ever taken a payment, shipped anything, or read a
// location; the policy used to say all three.
test("/privacy/ claims no data the site never collects", async ({ page }) => {
  await page.goto("/privacy/");
  const body = (await page.locator("main").innerText()).toLowerCase();
  for (const phrase of ["credit card", "shipping address", "geolocation", "message boards"]) {
    expect(body).not.toContain(phrase);
  }
});

test("/privacy/ claims no data the site never collects, in Spanish", async ({ browser }) => {
  const { context, page } = await spanishPage(browser);
  await page.goto("/privacy/");
  const body = (await page.locator("main").innerText()).toLowerCase();
  for (const phrase of [
    "tarjeta de crédito",
    "dirección de envío",
    "geolocalización",
    "tablones de mensajes",
  ]) {
    expect(body).not.toContain(phrase);
  }
  await context.close();
});

// ── Terms no longer describes machinery this site does not have ─────────────
// There is nothing to register for and no way to block an IP from a static
// site served by a CDN.
test("terms does not promise registration or IP blocking", async ({ page }) => {
  await page.goto("/terms/");
  const body = (await page.locator("main").innerText()).toLowerCase();
  expect(body).not.toContain("registration");
  expect(body).not.toContain("ip address");
});

// ── The skip-link has a target on every legal route (plan 008 net) ──────────
// The layout renders <a href="#main-content"> as the first Tab stop of every
// page; four <main>s shipped without the id and the link silently did nothing.
for (const path of ALL_LEGAL_PAGES) {
  test(`${path} gives the skip-link something to land on`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("main#main-content")).toHaveCount(1);
  });
}

// ── Every legal surface reaches a person the same way (plan 008 net) ────────
// The contact addresses used to be four different values, two of them at a
// domain with no MX record. They are one address now, and each is a link.
for (const path of ALL_LEGAL_PAGES) {
  test(`${path} exposes the contact address as a mailto link`, async ({ page }) => {
    await page.goto(path);
    await expect(
      page.locator('main a[href="mailto:ivanlorenzana@outlook.com"]').first()
    ).toBeVisible();
  });
}
